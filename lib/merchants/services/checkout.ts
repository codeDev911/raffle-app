// Hosted checkout for merchant payments (Safepay).
//
// What this module guarantees, in order of importance:
//  1. Amounts come from our own records (campaign price × open tickets), never from the client.
//  2. A redirect or a webhook only *triggers* a re-read: the Safepay reporter API decides whether
//     money arrived, and the reported amount must match the figure we billed to the paisa.
//  3. Settlement is idempotent end to end (ticket-derived payment ids, conditional updates), so a
//     webhook racing the browser redirect can only settle once.
//  4. An abandoned session cannot lock a ticket forever: past its lifetime it is released and the
//     ticket becomes payable again.
import { prisma, type Payment } from "@/lib/prisma"
import { getMerchantDb } from "../db"
import { toEntryDTO } from "../dto"
import { MerchantError, conflict, notFound } from "../errors"
import {
  createSafepayCheckout,
  fetchSafepayTracker,
  isSafepayConfigured,
  SafepayError,
  safepaySettings,
  type SafepayTrackerSnapshot,
} from "../safepay"
import type { MerchantCampaign, MerchantEntry, MerchantInvoice, MerchantStore } from "../types"
import {
  entryAmountPaisa,
  entryCampaign,
  entryPaymentTransactionId,
  ENTRY_PAYMENT_KIND,
  openGatewaySession,
  releaseMerchantPayment,
  settleEntryViaGateway,
  settleMerchantPayment,
  reopenFailedEntry,
  type GatewayCapture,
} from "./entry-payments"

/** How long a checkout session may sit unpaid before the ticket is released again. */
const SESSION_TTL_MS = 30 * 60 * 1000

const OPEN_ENTRY_STATUSES = ["ISSUED", "INVOICED"]

export type CheckoutOutcome = "paid" | "pending" | "failed" | "mismatch" | "unknown"

export interface CheckoutStartResult {
  checkoutUrl: string
  tracker: string
  environment: string
  /** Whole PKR, for the dashboard. */
  amount: number
  /** Paisa, the amount handed to Safepay and verified on capture. */
  amountPaisa: number
  paymentId?: string | null
  invoiceId?: string | null
}

export interface CheckoutSyncResult {
  status: CheckoutOutcome
  tracker: string
  /** Raw Safepay tracker state, for logs and support. */
  gatewayState?: string
  entryId?: string | null
  invoiceId?: string | null
  invoiceStatus?: string | null
  entry?: ReturnType<typeof toEntryDTO> | null
  settled?: number
  /** Amount Safepay reports for the session, in paisa — set when it differs from what we billed. */
  amountPaisa?: number | null
  reason?: string
}

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, any>) : {}
}

function requireGateway() {
  if (!isSafepayConfigured()) {
    throw new MerchantError(
      "Card and wallet checkout is not available right now. Pay by bank transfer instead.",
      503,
      "GATEWAY_UNAVAILABLE",
    )
  }
}

const baseOf = (baseUrl: string) => baseUrl.replace(/\/+$/, "")

function callbackUrls(baseUrl: string, scope: "entry" | "invoice") {
  const base = `${baseOf(baseUrl)}/api/payments/safepay/callback`
  return {
    redirectUrl: `${base}?ref=${scope}`,
    cancelUrl: `${base}?ref=${scope}&cancelled=1`,
  }
}

/** Gateway failures must read like a payment problem, not like an internal crash. */
async function gatewayCall<T>(what: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run()
  } catch (err) {
    if (err instanceof MerchantError) throw err
    console.error(`[MerchantConnect] Safepay ${what} failed:`, err)
    if (err instanceof SafepayError && err.rejected) {
      // We sent something Safepay refuses. Retrying cannot help, so the merchant is told to get in
      // touch instead of burning attempts on a checkout that will never open.
      throw new MerchantError(
        "The payment gateway refused this checkout. Please contact support.",
        502,
        "GATEWAY_REJECTED",
      )
    }
    throw new MerchantError("We could not reach the payment gateway. Please try again.", 502, "GATEWAY_ERROR")
  }
}

function sessionStartedAt(record: { metadata?: any; createdAt?: any; updatedAt?: any }): number | null {
  const gateway = asRecord(asRecord(record.metadata).gateway)
  const raw = gateway.startedAt || gateway.createdAt || record.createdAt || record.updatedAt
  const when = raw ? new Date(raw).getTime() : NaN
  return Number.isNaN(when) ? null : when
}

function isExpired(startedAt: number | null): boolean {
  return startedAt !== null && Date.now() - startedAt > SESSION_TTL_MS
}

/**
 * A second click must not open a second tracker: the merchant may still be paying in another tab,
 * and a tracker we stopped pointing at could never be matched when the money lands. While a
 * session for the same amount is live, hand it back untouched.
 */
async function liveEntrySession(entry: MerchantEntry, amountPaisa: number): Promise<CheckoutStartResult | null> {
  const row = await prisma.payment.findFirst({
    where: { transactionId: entryPaymentTransactionId(entry.ticketNumber), method: "SAFEPAY", status: "PENDING" },
  })
  if (!row) return null

  const gateway = asRecord(asRecord(row.metadata).gateway)
  const checkoutUrl = typeof gateway.checkoutUrl === "string" ? gateway.checkoutUrl : ""
  const billedPaisa = typeof gateway.amountPaisa === "number" ? gateway.amountPaisa : row.amount
  // A price change invalidates the open session: hand out a new one at the current amount instead.
  if (!checkoutUrl || !row.gatewayRef || billedPaisa !== amountPaisa) return null
  if (isExpired(sessionStartedAt({ metadata: row.metadata, createdAt: row.createdAt }))) return null

  return {
    checkoutUrl,
    tracker: row.gatewayRef,
    environment: safepaySettings()?.environment ?? "sandbox",
    amount: amountPaisa / 100,
    amountPaisa,
    paymentId: row.id,
  }
}

/** Same rule for batches: re-open the live session instead of stranding its tracker. */
function liveInvoiceSession(invoice: MerchantInvoice, amountPaisa: number): CheckoutStartResult | null {
  if (!invoice.checkoutUrl || !invoice.gatewayRef || invoice.gatewayAmount !== amountPaisa) return null
  if (isExpired(sessionStartedAt({ createdAt: invoice.createdAt, updatedAt: invoice.updatedAt }))) return null

  return {
    checkoutUrl: invoice.checkoutUrl,
    tracker: invoice.gatewayRef,
    environment: safepaySettings()?.environment ?? "sandbox",
    amount: amountPaisa / 100,
    amountPaisa,
    invoiceId: invoice.id,
  }
}

// ───────────────────────── starting a session ─────────────────────────

/**
 * Opens a hosted checkout for a single ticket. The ticket is locked (INVOICED) while the session
 * is live, exactly like a submitted transfer, so the same ticket cannot be paid twice in parallel.
 */
export async function startEntryCheckout(
  store: MerchantStore,
  entryId: string,
  opts: { baseUrl: string },
): Promise<CheckoutStartResult> {
  requireGateway()
  const db = await getMerchantDb()

  const entry: MerchantEntry | null = await db.merchantEntry.findUnique({ where: { id: entryId } })
  if (!entry || entry.storeId !== store.id) throw notFound("Entry")
  if (entry.isTest) throw new MerchantError("Simulator tickets are never billed", 400, "TEST_ENTRY")
  if (entry.status === "PAID") throw conflict("This ticket is already confirmed")
  if (entry.status === "CANCELLED") throw conflict("This ticket was voided")
  if (entry.invoiceId) throw conflict("This ticket is on a batch invoice — settle the invoice instead")

  // A rejected transfer is payable again; a still-live session simply gets a fresh tracker.
  if (entry.status === "INVOICED") await reopenFailedEntry(entry)

  const { campaign, raffleName } = await entryCampaign(entry)
  if (campaign.status === "COMPLETED") throw conflict("This campaign's draw has already been run")

  const amountPaisa = entryAmountPaisa(campaign)
  const live = await liveEntrySession(entry, amountPaisa)
  if (live) return live

  const urls = callbackUrls(opts.baseUrl, "entry")

  const session = await gatewayCall("session setup", () =>
    createSafepayCheckout({
      amountPaisa,
      orderId: entry.ticketNumber,
      redirectUrl: urls.redirectUrl,
      cancelUrl: urls.cancelUrl,
    }),
  )

  const payment = await openGatewaySession(
    store,
    entry,
    campaign,
    { tracker: session.tracker, amountPaisa, currency: session.currency, checkoutUrl: session.checkoutUrl },
    raffleName,
  )
  await db.merchantEntry.updateMany({ where: { id: entry.id, status: "ISSUED" }, data: { status: "INVOICED" } })

  return {
    checkoutUrl: session.checkoutUrl,
    tracker: session.tracker,
    environment: session.environment,
    amount: amountPaisa / 100,
    amountPaisa,
    paymentId: payment.id,
  }
}

/**
 * Opens one hosted checkout for a whole batch. A single payment covers every open ticket, and each
 * ticket still gets its own ledger row on capture, so refunds stay per-customer.
 */
export async function startInvoiceCheckout(
  store: MerchantStore,
  invoiceId: string,
  opts: { baseUrl: string },
): Promise<CheckoutStartResult> {
  requireGateway()
  const db = await getMerchantDb()

  const invoice: MerchantInvoice | null = await db.merchantInvoice.findFirst({
    where: { id: invoiceId, storeId: store.id },
  })
  if (!invoice) throw notFound("Invoice")
  if (invoice.status === "PAID") throw conflict("This invoice has already been settled")
  if (invoice.status !== "PENDING" && invoice.status !== "UNDER_REVIEW") {
    throw conflict("This invoice is not awaiting payment")
  }

  const entries: MerchantEntry[] = await db.merchantEntry.findMany({
    where: { invoiceId: invoice.id, status: { in: OPEN_ENTRY_STATUSES } },
  })
  if (entries.length === 0) {
    throw new MerchantError("This invoice has no open tickets left to settle", 400, "NOTHING_TO_SETTLE")
  }

  const campaign: MerchantCampaign | null = await db.merchantCampaign.findUnique({ where: { id: invoice.campaignId } })
  if (!campaign) throw notFound("Campaign")

  const amountPaisa = entryAmountPaisa(campaign) * entries.length
  const live = liveInvoiceSession(invoice, amountPaisa)
  if (live) return live

  const urls = callbackUrls(opts.baseUrl, "invoice")

  const session = await gatewayCall("session setup", () =>
    createSafepayCheckout({
      amountPaisa,
      orderId: invoice.invoiceNumber,
      redirectUrl: urls.redirectUrl,
      cancelUrl: urls.cancelUrl,
    }),
  )

  await db.merchantInvoice.update({
    where: { id: invoice.id },
    data: {
      paymentMethod: "SAFEPAY",
      gatewayRef: session.tracker,
      gatewayAmount: amountPaisa,
      checkoutUrl: session.checkoutUrl,
    },
  })

  return {
    checkoutUrl: session.checkoutUrl,
    tracker: session.tracker,
    environment: session.environment,
    amount: amountPaisa / 100,
    amountPaisa,
    invoiceId: invoice.id,
  }
}

// ───────────────────────── resolving the outcome ─────────────────────────

async function findEntryPayment(trackers: string[]): Promise<Payment | null> {
  const rows: Payment[] = await prisma.payment.findMany({ where: { gatewayRef: { in: trackers }, method: "SAFEPAY" } })
  return rows.find((row) => asRecord(row.metadata).kind === ENTRY_PAYMENT_KIND) ?? null
}

async function findInvoice(trackers: string[]): Promise<MerchantInvoice | null> {
  const db = await getMerchantDb()
  return db.merchantInvoice.findFirst({ where: { gatewayRef: { in: trackers } } })
}

/**
 * Re-reads a checkout session and applies the outcome. Safe to call any number of times from any
 * entry point (browser redirect, webhook, dashboard recheck) — the tracker is the only input.
 */
export async function syncTracker(tracker: string): Promise<CheckoutSyncResult> {
  const requested = String(tracker || "").trim()
  if (!requested) return { status: "unknown", tracker: requested, reason: "missing_tracker" }

  const snapshot = await gatewayCall("tracker lookup", () => fetchSafepayTracker(requested))
  const trackers = Array.from(new Set([requested, snapshot.tracker]))

  const invoice = await findInvoice(trackers)
  if (invoice) return syncInvoiceSession(invoice, snapshot)

  const payment = await findEntryPayment(trackers)
  if (payment) return syncEntrySession(payment, snapshot)

  return { status: "unknown", tracker: snapshot.tracker, gatewayState: snapshot.state, reason: "no_matching_session" }
}

function capturedBy(snapshot: SafepayTrackerSnapshot): GatewayCapture {
  return {
    provider: "safepay",
    tracker: snapshot.tracker,
    amountPaisa: Number(snapshot.amountPaisa || 0),
    currency: String(snapshot.currency || ""),
    reference: snapshot.reference,
    paidAt: new Date().toISOString(),
  }
}

async function syncEntrySession(payment: Payment, snapshot: SafepayTrackerSnapshot): Promise<CheckoutSyncResult> {
  const metadata = asRecord(payment.metadata)
  const entryId = typeof metadata.merchantEntryId === "string" ? metadata.merchantEntryId : null
  const base = { tracker: snapshot.tracker, gatewayState: snapshot.state, entryId }

  if (snapshot.outcome === "pending") {
    if (!isExpired(sessionStartedAt({ metadata, createdAt: payment.createdAt }))) {
      return { ...base, status: "pending" }
    }
    // Unpaid past its lifetime: hand the ticket back instead of leaving it locked.
    const released = await releaseExpiredSession(payment, snapshot)
    return { ...base, status: "failed", reason: "session_expired", entry: released }
  }

  if (snapshot.outcome === "failed") {
    const now = new Date().toISOString()
    await prisma.payment.updateMany({
      where: { id: payment.id, status: { in: ["PENDING", "PROCESSING"] } },
      data: {
        status: "FAILED",
        metadata: { ...metadata, gateway: { ...asRecord(metadata.gateway), lastState: snapshot.state, failedAt: now } },
      },
    })
    const released = await releaseMerchantPayment(payment.id)
    return { ...base, status: "failed", reason: released.reason, entry: released.entry ?? null }
  }

  // Money arrived. A replay of an already-settled session stays a no-op.
  if (payment.status === "COMPLETED") {
    const settlement = await settleMerchantPayment(payment.id)
    return {
      ...base,
      status: "paid",
      entry: settlement.entry ?? null,
      settled: settlement.settled ? 1 : 0,
      reason: settlement.settled ? undefined : settlement.reason,
    }
  }

  const expected = { amount: Number(payment.amount || 0), currency: String(payment.currency || "PKR") }
  const mismatch = amountMismatch(snapshot, expected)
  if (mismatch) return { ...base, status: "mismatch", reason: mismatch, amountPaisa: snapshot.amountPaisa }

  const db = await getMerchantDb()
  const entry: MerchantEntry | null = entryId ? await db.merchantEntry.findUnique({ where: { id: entryId } }) : null
  if (!entry) return { ...base, status: "unknown", reason: "entry_missing" }
  const store: MerchantStore | null = await db.merchantStore.findUnique({ where: { id: entry.storeId } })
  if (!store) throw notFound("Store")
  const { campaign, raffleName } = await entryCampaign(entry)

  const { settlement, captured } = await settleEntryViaGateway(store, entry, campaign, { raffleName }, capturedBy(snapshot))
  return {
    ...base,
    status: "paid",
    entry: settlement.entry ?? toEntryDTO(entry),
    settled: settlement.settled ? 1 : 0,
    reason: captured ? undefined : "already_captured",
  }
}

async function syncInvoiceSession(
  invoice: MerchantInvoice,
  snapshot: SafepayTrackerSnapshot,
): Promise<CheckoutSyncResult> {
  const db = await getMerchantDb()
  const base = { tracker: snapshot.tracker, gatewayState: snapshot.state, invoiceId: invoice.id }

  if (invoice.status === "PAID") {
    return { ...base, status: "paid", invoiceStatus: "PAID", settled: 0, reason: "already_paid" }
  }

  if (snapshot.outcome === "pending") {
    if (!isExpired(sessionStartedAt({ createdAt: invoice.createdAt, updatedAt: invoice.updatedAt }))) {
      return { ...base, status: "pending", invoiceStatus: invoice.status }
    }
    await db.merchantInvoice.update({ where: { id: invoice.id }, data: { checkoutUrl: null } })
    return { ...base, status: "failed", invoiceStatus: invoice.status, reason: "session_expired" }
  }

  if (snapshot.outcome === "failed") {
    await db.merchantInvoice.update({ where: { id: invoice.id }, data: { checkoutUrl: null } })
    return { ...base, status: "failed", invoiceStatus: invoice.status, reason: "gateway_failed" }
  }

  // Money arrived: verify the figure we asked for before touching a single ticket.
  const expected = Number(invoice.gatewayAmount || 0)
  if (!expected) return { ...base, status: "mismatch", reason: "no_expected_amount", amountPaisa: snapshot.amountPaisa }
  const mismatch = amountMismatch(snapshot, {
    amount: expected,
    currency: safepaySettings()?.currency || "PKR",
  })
  if (mismatch) return { ...base, status: "mismatch", reason: mismatch, amountPaisa: snapshot.amountPaisa }

  const entries: MerchantEntry[] = await db.merchantEntry.findMany({
    where: { invoiceId: invoice.id, status: { in: OPEN_ENTRY_STATUSES } },
  })
  if (entries.length === 0) {
    return { ...base, status: "paid", invoiceStatus: invoice.status, settled: 0, reason: "nothing_open" }
  }

  const campaign: MerchantCampaign | null = await db.merchantCampaign.findUnique({ where: { id: invoice.campaignId } })
  if (!campaign) throw notFound("Campaign")
  const store: MerchantStore | null = await db.merchantStore.findUnique({ where: { id: invoice.storeId } })
  if (!store) throw notFound("Store")

  const required = entryAmountPaisa(campaign) * entries.length
  if (Number(snapshot.amountPaisa || 0) < required) {
    // Underpaid (a cancellation changed the batch after the session opened): never settle partially.
    return { ...base, status: "mismatch", reason: "underpaid", amountPaisa: snapshot.amountPaisa }
  }

  const capture = capturedBy(snapshot)
  const { raffleName } = await entryCampaign(entries[0])
  let settled = 0
  for (const entry of entries) {
    const result = await settleEntryViaGateway(
      store,
      entry,
      campaign,
      { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber, raffleName },
      capture,
    )
    if (result.settlement.settled) settled++
  }

  const fresh: MerchantInvoice | null = await db.merchantInvoice.findUnique({ where: { id: invoice.id } })
  // The session is spent: never offer "continue payment" on a batch that already settled.
  if (fresh?.checkoutUrl) await db.merchantInvoice.update({ where: { id: invoice.id }, data: { checkoutUrl: null } })
  const extraPaisa = Number(snapshot.amountPaisa || 0) - required

  return {
    ...base,
    status: "paid",
    invoiceStatus: fresh?.status ?? "PAID",
    settled,
    amountPaisa: snapshot.amountPaisa,
    reason: extraPaisa > 0 ? "overpaid" : undefined,
  }
}

function amountMismatch(
  snapshot: SafepayTrackerSnapshot,
  expected: { amount: number; currency: string },
): string | null {
  if (snapshot.amountPaisa === null) return "amount_unavailable"
  if (snapshot.amountPaisa !== expected.amount) return "amount_mismatch"
  if (snapshot.currency && expected.currency && snapshot.currency !== expected.currency) return "currency_mismatch"
  return null
}

async function releaseExpiredSession(payment: Payment, snapshot: SafepayTrackerSnapshot) {
  const metadata = asRecord(payment.metadata)
  await prisma.payment.updateMany({
    where: { id: payment.id, status: { in: ["PENDING", "PROCESSING"] } },
    data: {
      status: "CANCELLED",
      metadata: { ...metadata, gateway: { ...asRecord(metadata.gateway), lastState: snapshot.state, expiredAt: new Date().toISOString() } },
    },
  })
  const released = await releaseMerchantPayment(payment.id)
  return released.entry ?? null
}

// ───────────────────────── dashboard recheck ─────────────────────────

/**
 * Re-checks every checkout session this store still has open. The dashboard calls this after the
 * redirect and while a session is pending, so a lost webhook can never hide a paid ticket.
 */
export async function syncStoreCheckouts(store: MerchantStore) {
  const db = await getMerchantDb()
  const invoices: MerchantInvoice[] = await db.merchantInvoice.findMany({
    where: { storeId: store.id, status: { in: ["PENDING", "UNDER_REVIEW"] } },
  })
  const payments: Payment[] = await prisma.payment.findMany({ where: { method: "SAFEPAY", status: "PENDING" }, take: 100 })

  const trackers = new Set<string>()
  for (const invoice of invoices) {
    if (invoice.gatewayRef) trackers.add(invoice.gatewayRef)
  }
  for (const payment of payments) {
    const metadata = asRecord(payment.metadata)
    if (metadata.storeId === store.id && typeof payment.gatewayRef === "string") trackers.add(payment.gatewayRef)
  }

  const results: CheckoutSyncResult[] = []
  for (const tracker of trackers) {
    try {
      results.push(await syncTracker(tracker))
    } catch (err) {
      console.error("[MerchantConnect] checkout recheck failed:", err)
      results.push({ status: "unknown", tracker, reason: "gateway_unreachable" })
    }
  }

  return {
    checked: results.length,
    paid: results.filter((r) => r.status === "paid").length,
    pending: results.filter((r) => r.status === "pending").length,
    failed: results.filter((r) => r.status === "failed").length,
    mismatch: results.filter((r) => r.status === "mismatch").length,
    results,
  }
}
