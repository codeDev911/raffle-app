// Returns, cancellations and refunds for Merchant Connect tickets.
//
// Before this module, a Shopify refund arriving for a ticket whose batch was already submitted or
// paid was counted as "locked" and dropped: nothing was created, nothing was shown. Everything the
// merchant needs is here instead — the ticket is voided, the money is quantified, and three
// timestamps record when Shopify's event happened, when we received it, and when PakRaffle acted.
import { getMerchantDb, type MerchantDb } from "../db"
import { toRefundDTO } from "../dto"
import { conflict, notFound } from "../errors"
import { appendEvent, drawHasRun, refundSplit } from "../refunds"
import type { MerchantCampaign, MerchantEntry, MerchantInvoice, MerchantRefundRequest, MerchantStore } from "../types"
import { voidEntryPayment, type EntryPaymentVoid } from "./entry-payments"

/** What triggered the void, in the merchant's own words plus Shopify's timestamps. */
export interface VoidTrigger {
  topic: string
  reason: string
  /** Shopify's own event time, read from the payload when it carries one. */
  shopifyEventAt?: Date | null
}

export interface VoidOutcome {
  voided: number
  credited: number
  /** Shopify told us twice, or the ticket was already cancelled. */
  alreadyVoided: number
  /** The draw already ran, so the ticket could not be withdrawn without rewriting the result. */
  deferred: number
  /** Confirmed ticket payments flipped to REFUNDED — the ledger stops saying "Paid". */
  refundedPayments: number
  /** Raffle entries withdrawn from the draw by those reversals. */
  withdrawnEntries: number
  requests: ReturnType<typeof toRefundDTO>[]
}

type PerEntry = "voided" | "credited" | "already" | "deferred" | "skipped"

/**
 * Voids every live ticket for a Shopify order and, when the batch had already been billed,
 * raises a credit for it. One call per webhook delivery; safe to re-run for the same order.
 */
export async function voidOrCreditOrder(store: MerchantStore, shopifyOrderId: string, trigger: VoidTrigger): Promise<VoidOutcome> {
  const db = await getMerchantDb()
  const candidates: MerchantEntry[] = await db.merchantEntry.findMany({
    where: { storeId: store.id, shopifyOrderId, status: { in: ["ISSUED", "INVOICED", "PAID"] } },
  })

  const outcome: VoidOutcome = { voided: 0, credited: 0, alreadyVoided: 0, deferred: 0, refundedPayments: 0, withdrawnEntries: 0, requests: [] }
  const voidedRows: MerchantEntry[] = []
  /** entryId -> its credit row, so the money step below can stamp the reversal on the trail. */
  const credited = new Map<string, MerchantRefundRequest>()
  const noMoney: EntryPaymentVoid = { found: false, refunded: false, withdrawn: 0 }

  // Shopify re-delivers webhooks, and a second delivery of a refund we already processed has to read
  // as "already voided" rather than "nothing happened" — that message is what the merchant and the
  // desk actually see. Without this branch the cancelled ticket is filtered out above and the
  // delivery looks like it was ignored.
  if (!candidates.length) {
    const already: MerchantEntry[] = await db.merchantEntry.findMany({
      where: { storeId: store.id, shopifyOrderId, status: "CANCELLED" },
    })
    outcome.alreadyVoided = already.length
    // A ticket voided before its payment was reversed (an older build, or a manual cancel) is healed
    // on the next delivery, so the ledger cannot stay stuck on "Paid" with the shopper still drawn.
    for (const row of already) {
      const money = await voidEntryPayment(row).catch(() => noMoney)
      if (money.refunded) {
        outcome.refundedPayments++
        outcome.withdrawnEntries += money.withdrawn
      }
    }
    return outcome
  }

  for (const candidate of candidates) {
    const result = await db.$transaction(async (tx: MerchantDb): Promise<{ kind: PerEntry; request?: MerchantRefundRequest }> => {
      const entry: MerchantEntry | null = await tx.merchantEntry.findUnique({ where: { id: candidate.id } })
      if (!entry || entry.status === "CANCELLED") return { kind: "already" }

      const campaign: MerchantCampaign | null = await tx.merchantCampaign.findUnique({ where: { id: entry.campaignId } })
      if (!campaign) return { kind: "skipped" }

      // The published cutoff: a ticket that already decided a winner stays in the result.
      if (drawHasRun(campaign)) return { kind: "deferred" }

      const invoice: MerchantInvoice | null = entry.invoiceId ? await tx.merchantInvoice.findUnique({ where: { id: entry.invoiceId } }) : null
      // Billed once the batch left PENDING: money has been asked for, so a void needs money back.
      let billed = entry.status === "PAID" || (invoice ? invoice.status !== "PENDING" : false)
      const gross = invoice?.unitPrice ?? campaign.ticketPrice

      if (invoice && invoice.status === "PENDING") {
        const { count } = await tx.merchantInvoice.updateMany({
          where: { id: invoice.id, status: "PENDING" },
          data: { totalEntries: { decrement: 1 }, amountDue: { decrement: invoice.unitPrice } },
        })
        // The batch was submitted or paid while this transaction was open. Re-read it rather than
        // dropping the ticket: a race must never end in the silent "locked" this flow replaced.
        if (count === 0) {
          const fresh: MerchantInvoice | null = await tx.merchantInvoice.findUnique({ where: { id: invoice.id } })
          if (fresh && fresh.status !== "PENDING") billed = true
        }
      }

      const { count } = await tx.merchantEntry.updateMany({
        where: { id: entry.id, status: entry.status },
        data: { status: "CANCELLED", cancelledReason: trigger.reason, invoiceId: null },
      })
      if (count === 0) return { kind: "already" }

      if (!entry.isTest) {
        await tx.merchantCampaign.updateMany({
          where: { id: entry.campaignId, currentEntries: { gt: 0 } },
          data: { currentEntries: { decrement: 1 } },
        })
      }

      if (!billed) return { kind: "voided" }

      const now = new Date()
      const split = refundSplit(gross)
      const request: MerchantRefundRequest = await tx.merchantRefundRequest.create({
        data: {
          storeId: store.id,
          campaignId: entry.campaignId,
          entryId: entry.id,
          ticketNumber: entry.ticketNumber,
          shopifyOrderId: entry.shopifyOrderId,
          orderName: entry.orderName ?? null,
          invoiceId: invoice?.id ?? null,
          grossAmount: split.gross,
          gatewayCost: split.gatewayCost,
          netAmount: split.net,
          reason: trigger.reason,
          source: "WEBHOOK",
          settlement: "CREDIT",
          // Credits need no human: they are applied to the merchant's next invoice automatically.
          status: "CREDITED",
          triggerTopic: trigger.topic,
          shopifyEventAt: trigger.shopifyEventAt ?? null,
          receivedAt: now,
          actionedAt: now,
          events: [
            {
              at: (trigger.shopifyEventAt ?? now).toISOString(),
              kind: "detected",
              label: `Shopify reported: ${trigger.reason}`,
              detail: `Topic ${trigger.topic}`,
            },
            { at: now.toISOString(), kind: "voided", label: "Ticket voided by PakRaffle", detail: `Received ${now.toISOString()}` },
            {
              at: now.toISOString(),
              kind: "credited",
              label: `Credit of Rs ${split.net} raised for your next invoice`,
              detail: split.gatewayCost ? `Rs ${split.gatewayCost} processor charge (2.9% + Rs 30) already paid, so it is not refundable.` : null,
            },
          ],
        },
      })
      return { kind: "credited", request }
    })

    if (result.kind === "voided" || result.kind === "credited") {
      outcome.voided++
      voidedRows.push(candidate)
    }
    if (result.kind === "credited") {
      outcome.credited++
      if (result.request) credited.set(candidate.id, result.request)
    }
    if (result.kind === "already") outcome.alreadyVoided++
    if (result.kind === "deferred") outcome.deferred++
  }

  for (const row of voidedRows) {
    // The money must follow the ticket: an unconfirmed transfer is cancelled so the desk can never
    // confirm it, and a transfer PakRaffle already confirmed is refunded — which withdraws the
    // shopper's raffle entry and puts the raffle's counter back, so a returned order never leaves a
    // paid-looking ticket that still counts in the draw.
    const money = await voidEntryPayment(row).catch(() => noMoney)
    if (!money.refunded) continue

    outcome.refundedPayments++
    outcome.withdrawnEntries += money.withdrawn

    const held = credited.get(row.id)
    if (!held) continue
    const stamped: MerchantRefundRequest = await db.merchantRefundRequest.update({
      where: { id: held.id },
      data: {
        events: appendEvent(held.events, {
          at: new Date().toISOString(),
          kind: "reversed",
          label: `Payment of Rs ${held.grossAmount} marked refunded`,
          detail:
            money.withdrawn > 0
              ? `${money.withdrawn} raffle entr${money.withdrawn === 1 ? "y" : "ies"} withdrawn from the draw — this ticket no longer counts.`
              : "The customer held no raffle entry for this ticket, so nothing had to be withdrawn.",
        }),
      },
    })
    credited.set(row.id, stamped)
  }

  outcome.requests = Array.from(credited.values()).map((row) => toRefundDTO(row, store))
  return outcome
}

/** Credits waiting to be spent, already spent, and payouts the desk has to action. */
export async function refundSummary(store: MerchantStore) {
  const db = await getMerchantDb()
  const rows: MerchantRefundRequest[] = await db.merchantRefundRequest.findMany({ where: { storeId: store.id } })
  const sum = (pick: (r: MerchantRefundRequest) => boolean) => rows.filter(pick).reduce((n, r) => n + r.netAmount, 0)

  return {
    creditsAvailable: sum((r) => r.settlement === "CREDIT" && r.status === "CREDITED" && !r.creditInvoiceId),
    /** How many separate returns that credit came from — merchants think in orders, not totals. */
    creditCount: rows.filter((r) => r.settlement === "CREDIT" && r.status === "CREDITED" && !r.creditInvoiceId).length,
    creditsApplied: sum((r) => r.settlement === "CREDIT" && Boolean(r.creditInvoiceId)),
    payoutWaiting: sum((r) => r.settlement === "PAYOUT" && (r.status === "REQUESTED" || r.status === "APPROVED")),
    paidOut: sum((r) => r.status === "PAID"),
    countAwaitingStaff: rows.filter((r) => r.status === "REQUESTED" || r.status === "APPROVED").length,
    total: rows.length,
  }
}

export async function listRefundRequests(store: MerchantStore, filters: { status?: string | null; take?: number } = {}) {
  const db = await getMerchantDb()
  const where: Record<string, any> = { storeId: store.id }
  if (filters.status) where.status = filters.status
  const rows: MerchantRefundRequest[] = await db.merchantRefundRequest.findMany({
    where,
    orderBy: { receivedAt: "desc" },
    take: Math.min(300, Math.max(1, filters.take ?? 150)),
  })
  return { requests: rows.map((row) => toRefundDTO(row, store)), ...(await refundSummary(store)) }
}

/**
 * Applies whole credits to a freshly raised invoice, inside the same transaction that creates it.
 * A credit bigger than this bill is left whole for the next one rather than split, so every invoice
 * line stays reconcilable against a single ticket.
 */
export async function applyCreditsToInvoice(tx: MerchantDb, store: MerchantStore, invoice: MerchantInvoice) {
  const pool: MerchantRefundRequest[] = await tx.merchantRefundRequest.findMany({
    where: { storeId: store.id, settlement: "CREDIT", status: "CREDITED", creditInvoiceId: null },
    orderBy: { receivedAt: "asc" },
  })

  let remaining = invoice.amountDue
  let applied = 0
  const used: MerchantRefundRequest[] = []
  for (const credit of pool) {
    if (credit.netAmount <= 0 || credit.netAmount > remaining) continue
    remaining -= credit.netAmount
    applied += credit.netAmount
    used.push(credit)
  }
  if (!used.length) return { applied: 0, count: 0, invoice }

  const now = new Date()
  for (const credit of used) {
    await tx.merchantRefundRequest.update({
      where: { id: credit.id },
      data: {
        creditInvoiceId: invoice.id,
        events: appendEvent(credit.events, {
          at: now.toISOString(),
          kind: "credited",
          label: `Applied to invoice ${invoice.invoiceNumber}`,
          detail: `Rs ${credit.netAmount} deducted from this batch.`,
        }),
      },
    })
  }
  const updated: MerchantInvoice = await tx.merchantInvoice.update({
    where: { id: invoice.id },
    data: { creditApplied: applied, amountDue: remaining },
  })
  return { applied, count: used.length, invoice: updated }
}

/**
 * Switch an unspent refund between credit and payout. Once a credit has been applied to a batch it
 * is spent and cannot move; once staff have approved a payout the merchant is not allowed to pull it
 * back into a credit either, or the approval would no longer describe what happened.
 */
export async function changeRefundSettlement(store: MerchantStore, id: string, settlement: "CREDIT" | "PAYOUT") {
  const db = await getMerchantDb()
  const request: MerchantRefundRequest | null = await db.merchantRefundRequest.findFirst({ where: { id, storeId: store.id } })
  if (!request) throw notFound("Refund request")
  if (request.creditInvoiceId) throw conflict("This credit has already been applied to an invoice")
  if (request.settlement === settlement) return toRefundDTO(request, store)
  if (settlement === "PAYOUT" && !String(store.payoutDetails || "").trim()) {
    throw conflict("Add your Raast ID or bank account under Settings first — a payout needs somewhere to go")
  }
  if (settlement === "CREDIT" && request.status !== "REQUESTED") {
    throw conflict("This payout is already in the desk's queue and cannot be turned back into a credit")
  }

  const now = new Date()
  const updated: MerchantRefundRequest = await db.merchantRefundRequest.update({
    where: { id },
    data: {
      settlement,
      status: settlement === "PAYOUT" ? "REQUESTED" : "CREDITED",
      events: appendEvent(request.events, {
        at: now.toISOString(),
        kind: settlement === "PAYOUT" ? "requested" : "credited",
        label: settlement === "PAYOUT" ? "Changed to a payout request" : "Changed back to a credit on your next invoice",
        detail: settlement === "PAYOUT" ? "Needs PakRaffle approval before the money moves." : null,
      }),
    },
  })
  return toRefundDTO(updated, store)
}

// ───────────────────────── staff side ─────────────────────────

export async function listRefundsForAdmin(filters: { status?: string | null; storeId?: string | null; take?: number } = {}) {
  const db = await getMerchantDb()
  const where: Record<string, any> = {}
  if (filters.status) where.status = filters.status
  if (filters.storeId) where.storeId = filters.storeId
  const rows: MerchantRefundRequest[] = await db.merchantRefundRequest.findMany({
    where,
    orderBy: { receivedAt: "desc" },
    take: Math.min(500, Math.max(1, filters.take ?? 200)),
  })
  const stores: MerchantStore[] = await db.merchantStore.findMany({ where: { id: { in: Array.from(new Set(rows.map((r) => r.storeId))) } } })
  const byId = new Map(stores.map((s) => [s.id, s]))
  return rows.map((row) => toRefundDTO(row, byId.get(row.storeId) ?? null))
}

/** Credits settle themselves; only payouts, rejections and "money sent" need a human decision. */
export async function decideRefund(id: string, action: "APPROVE" | "REJECT" | "PAID", staff: string, note?: string) {
  const db = await getMerchantDb()
  const request: MerchantRefundRequest | null = await db.merchantRefundRequest.findUnique({ where: { id } })
  if (!request) throw notFound("Refund request")
  if (request.status === "PAID") throw conflict("This payout has already been marked paid")
  if (action === "APPROVE" && request.settlement !== "PAYOUT") throw conflict("Credits settle automatically — there is nothing to approve")

  const now = new Date()
  const kindByAction = { APPROVE: "approved", REJECT: "rejected", PAID: "paid" } as const
  const next =
    action === "APPROVE" ? "APPROVED" : action === "REJECT" ? "REJECTED" : "PAID"
  const label =
    action === "APPROVE" ? "Payout approved by PakRaffle" : action === "REJECT" ? "Refund not approved" : "Payout transferred"

  const updated: MerchantRefundRequest = await db.merchantRefundRequest.update({
    where: { id },
    data: {
      status: next,
      decidedAt: now,
      decidedBy: staff,
      settledAt: action === "PAID" ? now : request.settledAt,
      note: note ? `${request.note ? request.note + "\n" : ""}PakRaffle: ${note}` : request.note,
      events: appendEvent(request.events, { at: now.toISOString(), kind: kindByAction[action], label, detail: note || null }),
    },
  })

  const store: MerchantStore | null = await db.merchantStore.findUnique({ where: { id: request.storeId } })
  return toRefundDTO(updated, store)
}
