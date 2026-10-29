// Per-ticket settlement.
//
// Every merchant ticket is billed to the *customer who placed the Shopify order*, not to the
// store: paying opens a normal PakRaffle `Payment` (PENDING) under that customer's account, so
// it appears in /admin/payments like any retail purchase. When an admin confirms it there, the
// ticket is marked PAID and — for campaigns connected to a PakRaffle raffle — the customer gets
// a real raffle entry. Merchant Connect therefore has no verifier of its own.
import { isUsingRealDatabase, prisma, type Payment } from "@/lib/prisma"
import { getMerchantDb } from "../db"
import { toEntryDTO, type PrizeSummary } from "../dto"
import { MerchantError, conflict, isUniqueViolation, notFound } from "../errors"
import type {
  MerchantCampaign,
  MerchantEntry,
  MerchantInvoice,
  MerchantPaymentMethod,
  MerchantStore,
} from "../types"
import { normalizePhone } from "../utils"
import { submitPaymentSchema } from "../validators"
import { getPrizeMap } from "./prizes"

export const ENTRY_PAYMENT_KIND = "merchant_entry"

const OPEN_STATUSES = ["ISSUED", "INVOICED"]
const CUSTOMER_EMAIL_DOMAIN = "customers.pakraffle.pk"

// Shopify customers never sign in with a password. A syntactically valid bcrypt string keeps
// hashing on every attempt while never matching any supplied password.
const CUSTOMER_PASSWORD_PLACEHOLDER = `$2a$12$${"0".repeat(53)}`

export interface EntrySettlementInput {
  paymentMethod: MerchantPaymentMethod
  transactionRef: string
  paymentProof: string
}

/** One payment record per ticket: also the idempotency key, so a replayed call can't double-bill. */
export function entryPaymentTransactionId(ticketNumber: string): string {
  return `MCH-${ticketNumber}`
}

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, any>) : {}
}

// ───────────────────────── customer linkage ─────────────────────────

/** Stable, login-less PakRaffle account for the person behind a Shopify order. */
function customerEmails(entry: MerchantEntry): string[] {
  const emails: string[] = []
  const declared = entry.customerEmail?.trim().toLowerCase()
  if (declared) emails.push(declared)
  const phone = entry.phoneNormalized || normalizePhone(entry.customerPhone)
  if (phone) emails.push(`merchant-${phone}@${CUSTOMER_EMAIL_DOMAIN}`)
  emails.push(`merchant-${entry.ticketNumber.toLowerCase()}@${CUSTOMER_EMAIL_DOMAIN}`)
  return Array.from(new Set(emails))
}

async function ensureCustomerUser(entry: MerchantEntry): Promise<string> {
  const emails = customerEmails(entry)
  for (const email of emails) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return existing.id as string
  }

  for (const email of emails) {
    try {
      const created = await prisma.user.create({
        data: {
          email,
          name: entry.customerName,
          phone: entry.customerPhone ?? null,
          password: CUSTOMER_PASSWORD_PLACEHOLDER,
        },
      })
      return created.id as string
    } catch (err) {
      if (!isUniqueViolation(err)) throw err
      // A concurrent payment created the account first — reuse it.
      const raced = await prisma.user.findUnique({ where: { email } })
      if (raced) return raced.id as string
    }
  }
  throw new MerchantError("Could not link this order to a customer account", 500, "CUSTOMER_LINK_FAILED")
}

// ───────────────────────── payment ledger ─────────────────────────

interface PaymentLinkage {
  invoiceId?: string | null
  invoiceNumber?: string | null
  raffleName: string
}

/**
 * Creates (or re-arms) the PakRaffle payment for one ticket. Idempotent: the ticket number
 * derives the unique transaction id, so retries and re-submissions never create duplicates.
 */
async function openEntryPayment(
  store: MerchantStore,
  entry: MerchantEntry,
  campaign: MerchantCampaign,
  data: EntrySettlementInput,
  linkage: PaymentLinkage,
): Promise<Payment> {
  const userId = await ensureCustomerUser(entry)
  // Campaign prices are whole PKR; payments and raffle entries are stored in paisa.
  const amount = Math.max(1, Math.round(campaign.ticketPrice)) * 100
  const transactionId = entryPaymentTransactionId(entry.ticketNumber)
  const metadata = {
    kind: ENTRY_PAYMENT_KIND,
    merchantEntryId: entry.id,
    campaignId: campaign.id,
    campaignTitle: campaign.title,
    storeId: store.id,
    storeName: store.name,
    orderName: entry.orderName ?? `#${entry.shopifyOrderId}`,
    shopifyOrderId: entry.shopifyOrderId,
    ticketNumber: entry.ticketNumber,
    raffleId: campaign.raffleId ?? null,
    raffleName: linkage.raffleName,
    customerName: entry.customerName,
    customerPhone: entry.customerPhone ?? null,
    transactionRef: data.transactionRef,
    receiptUrl: data.paymentProof,
    quantity: 1,
    invoiceId: linkage.invoiceId ?? null,
    invoiceNumber: linkage.invoiceNumber ?? null,
  }

  const existing: Payment | null = await prisma.payment.findFirst({ where: { transactionId } })
  if (existing) {
    if (existing.status === "COMPLETED") {
      throw conflict(`Ticket ${entry.ticketNumber} is already settled`)
    }
    return prisma.payment.update({
      where: { id: existing.id },
      data: {
        userId,
        amount,
        method: data.paymentMethod,
        status: "PENDING",
        gatewayRef: data.transactionRef,
        metadata,
      },
    })
  }

  return prisma.payment.create({
    data: {
      userId,
      amount,
      currency: "PKR",
      method: data.paymentMethod,
      status: "PENDING",
      transactionId,
      gatewayRef: data.transactionRef,
      metadata,
    },
  })
}

async function loadCampaign(campaignId: string): Promise<MerchantCampaign> {
  const db = await getMerchantDb()
  const campaign: MerchantCampaign | null = await db.merchantCampaign.findUnique({ where: { id: campaignId } })
  if (!campaign) throw notFound("Campaign")
  return campaign
}

async function raffleLabel(campaign: MerchantCampaign): Promise<string> {
  if (!campaign.raffleId) return campaign.title
  const prizes = await getPrizeMap([campaign.raffleId])
  const prize: PrizeSummary | null = prizes.get(campaign.raffleId) ?? null
  return prize?.title || campaign.title
}

/**
 * Pays for a single ticket. The ticket moves to INVOICED (= "payment submitted, awaiting
 * PakRaffle confirmation") and the merchant can no longer edit it.
 */
export async function payEntry(store: MerchantStore, entryId: string, input: unknown) {
  const data = submitPaymentSchema.parse(input)
  const db = await getMerchantDb()

  const entry: MerchantEntry | null = await db.merchantEntry.findUnique({ where: { id: entryId } })
  if (!entry || entry.storeId !== store.id) throw notFound("Entry")
  if (entry.isTest) throw new MerchantError("Simulator tickets are never billed", 400, "TEST_ENTRY")
  if (entry.status === "PAID") throw conflict("This ticket is already confirmed")
  if (entry.status === "CANCELLED") throw conflict("This ticket was voided")
  if (entry.invoiceId) throw conflict("This ticket is on a batch invoice — settle the invoice instead")

  const campaign = await loadCampaign(entry.campaignId)
  if (campaign.status === "COMPLETED") throw conflict("This campaign's draw has already been run")

  const payment = await openEntryPayment(store, entry, campaign, data, { raffleName: await raffleLabel(campaign) })
  await db.merchantEntry.updateMany({ where: { id: entry.id, status: "ISSUED" }, data: { status: "INVOICED" } })

  const fresh: MerchantEntry = await db.merchantEntry.findUnique({ where: { id: entry.id } })
  return {
    entry: toEntryDTO(fresh),
    payment: {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      method: payment.method,
      transactionId: payment.transactionId ?? null,
      transactionRef: data.transactionRef,
      receiptUrl: data.paymentProof,
    },
  }
}

/** Batch settlement: one payment per customer so each ticket can be confirmed on its own. */
export async function settleInvoiceEntries(
  store: MerchantStore,
  invoice: MerchantInvoice,
  campaign: MerchantCampaign | null,
  entries: MerchantEntry[],
  data: EntrySettlementInput,
) {
  const raffleName = campaign ? await raffleLabel(campaign) : invoice.invoiceNumber
  const payments: Payment[] = []
  for (const entry of entries) {
    const target = campaign && campaign.id === entry.campaignId ? campaign : await loadCampaign(entry.campaignId)
    payments.push(
      await openEntryPayment(store, entry, target, data, {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        raffleName,
      }),
    )
  }
  return payments
}

/** Cancelling/refunding an order must not leave a confirmable payment behind. */
export async function voidOpenEntryPayment(entry: MerchantEntry): Promise<boolean> {
  const transactionId = entryPaymentTransactionId(entry.ticketNumber)
  const existing: Payment | null = await prisma.payment.findFirst({ where: { transactionId } })
  if (!existing || !["PENDING", "PROCESSING"].includes(existing.status)) return false
  await prisma.payment.update({ where: { id: existing.id }, data: { status: "CANCELLED" } })
  return true
}

// ───────────────────────── admin confirmation ─────────────────────────

export interface SettlementResult {
  settled: boolean
  reason?: string
  entry?: ReturnType<typeof toEntryDTO>
  raffleEntryId?: string | null
  invoicePaid?: boolean
  campaignStatus?: string | null
}

/**
 * Runs when an admin marks a merchant payment COMPLETED in /admin/payments.
 *
 * Safe to call more than once: every step is conditional, so a retried confirmation never
 * duplicates a raffle entry or re-closes an invoice.
 */
export async function settleMerchantPayment(paymentId: string): Promise<SettlementResult> {
  const payment: Payment | null = await prisma.payment.findUnique({ where: { id: paymentId } })
  if (!payment) throw notFound("Payment")

  const metadata = asRecord(payment.metadata)
  if (metadata.kind !== ENTRY_PAYMENT_KIND || typeof metadata.merchantEntryId !== "string") {
    return { settled: false, reason: "not_a_merchant_payment" }
  }

  const db = await getMerchantDb()
  const entry: MerchantEntry | null = await db.merchantEntry.findUnique({ where: { id: metadata.merchantEntryId } })
  if (!entry) return { settled: false, reason: "entry_missing" }
  if (entry.status === "CANCELLED") return { settled: false, reason: "entry_cancelled" }

  const campaign: MerchantCampaign | null = await db.merchantCampaign.findUnique({ where: { id: entry.campaignId } })

  // 1. The ticket is now a confirmed entry.
  if (entry.status !== "PAID") {
    await db.merchantEntry.updateMany({
      where: { id: entry.id, status: { in: OPEN_STATUSES } },
      data: { status: "PAID" },
    })
  }

  // 2. Give the Shopify customer a real raffle entry (only when the campaign targets a raffle).
  let raffleEntryId: string | null = typeof metadata.raffleEntryId === "string" ? metadata.raffleEntryId : null
  if (!raffleEntryId && campaign?.raffleId) {
    const ours: Array<{ id: string }> = await prisma.entry.findMany({ where: { paymentId: payment.id } })
    if (ours.length > 0) {
      raffleEntryId = ours[0].id
    } else {
      const created = await prisma.entry.create({
        data: {
          userId: payment.userId,
          raffleId: campaign.raffleId,
          quantity: 1,
          totalCost: payment.amount,
          paymentId: payment.id,
        },
      })
      raffleEntryId = created.id
      // The in-memory mock bumps the counter inside entry.create; PostgreSQL does not.
      if (isUsingRealDatabase()) {
        await prisma.raffle.update({
          where: { id: campaign.raffleId },
          data: { currentEntries: { increment: 1 } },
        })
      }
    }
  }

  // 3. Remember what was settled so a retry is a no-op.
  if (!metadata.settledAt || (metadata.raffleEntryId ?? null) !== raffleEntryId) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { metadata: { ...metadata, settledAt: new Date().toISOString(), raffleEntryId } },
    })
  }

  // 4. Close the batch invoice once its last ticket is confirmed.
  let invoicePaid = false
  if (entry.invoiceId) {
    const remaining: number = await db.merchantEntry.count({
      where: { invoiceId: entry.invoiceId, status: { in: OPEN_STATUSES } },
    })
    if (remaining === 0) {
      const { count } = await db.merchantInvoice.updateMany({
        where: { id: entry.invoiceId, status: { in: ["PENDING", "UNDER_REVIEW"] } },
        data: { status: "PAID", paidAt: new Date() },
      })
      invoicePaid = count > 0
    }
  }

  // 5. A campaign that is no longer accepting entries becomes draw-ready once everything is paid.
  //    Closeable means invoiced, paused, or simply past its end date (minting stops either way).
  let campaignStatus = campaign?.status ?? null
  if (campaign && campaign.status !== "COMPLETED") {
    const unpaid: number = await db.merchantEntry.count({
      where: { campaignId: campaign.id, status: { in: OPEN_STATUSES }, isTest: false },
    })
    const ended = new Date(campaign.endDate).getTime() < Date.now()
    const closable = ended
      ? ["PENDING_INVOICE", "PAUSED", "ACTIVE"]
      : ["PENDING_INVOICE", "PAUSED"]
    if (unpaid === 0) {
      const { count } = await db.merchantCampaign.updateMany({
        where: { id: campaign.id, status: { in: closable } },
        data: { status: "DRAW_READY" },
      })
      if (count > 0) campaignStatus = "DRAW_READY"
    }
  }

  const fresh: MerchantEntry = await db.merchantEntry.findUnique({ where: { id: entry.id } })
  return { settled: true, entry: toEntryDTO(fresh), raffleEntryId, invoicePaid, campaignStatus }
}
