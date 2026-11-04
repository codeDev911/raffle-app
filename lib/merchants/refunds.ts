// Refund arithmetic and rules for Merchant Connect tickets. Pure: no database, no HTTP, so the
// numbers a merchant sees can be tested independently of the ledger.
import type { MerchantCampaign, MerchantRefundEvent } from "./types"

/**
 * The published merchant terms: a refunded ticket comes back minus the card/wallet charge already
 * paid on it — 2.9% plus Rs 30 per ticket. Quoted on /merchants and in CHATBOT_KNOWLEDGE.md §12,
 * so changing it here means changing both.
 */
export const GATEWAY_RATE = 0.029
export const GATEWAY_FIXED_PKR = 30

export interface RefundSplit {
  /** PKR billed for the ticket in the first place. */
  gross: number
  /** PKR the processor kept. Never returned to the merchant, because PakRaffle already paid it. */
  gatewayCost: number
  /** PKR that comes back to the merchant. */
  net: number
}

/**
 * Splits a ticket price into what can honestly be returned.
 *
 * The fixed Rs 30 is not recoverable on very small tickets, so the deduction is capped at the gross:
 * a merchant is never credited a negative amount, and never credited more than they paid.
 */
export function refundSplit(grossAmount: number): RefundSplit {
  const gross = Math.max(0, Math.round(Number(grossAmount) || 0))
  if (gross === 0) return { gross: 0, gatewayCost: 0, net: 0 }
  const gatewayCost = Math.min(gross, Math.round(gross * GATEWAY_RATE) + GATEWAY_FIXED_PKR)
  return { gross, gatewayCost, net: gross - gatewayCost }
}

/**
 * "Up to the moment the draw runs" is the published cutoff — after that the ticket decided a
 * winner and withdrawing it would rewrite the result.
 */
export function drawHasRun(campaign: Pick<MerchantCampaign, "status" | "drawnAt">): boolean {
  return campaign.status === "COMPLETED" || Boolean(campaign.drawnAt)
}

/** Shopify's own status values that mean the order came back financially. */
const REFUNDED_STATUSES = new Set(["refunded", "partially_refunded"])

/** True when an order payload says the money was reversed, from any topic spelling. */
export function orderLooksRefunded(order: { financialStatus?: string | null; cancelled?: boolean }): boolean {
  const status = String(order.financialStatus || "").trim().toLowerCase()
  return REFUNDED_STATUSES.has(status) || status === "voided" || Boolean(order.cancelled)
}

const MAX_EVENTS = 40

/** Appends one readable step to the merchant-facing trail, oldest first. */
export function appendEvent(events: MerchantRefundEvent[] | null | undefined, event: MerchantRefundEvent): MerchantRefundEvent[] {
  const trail = Array.isArray(events) ? events.slice() : []
  trail.push(event)
  return trail.slice(-MAX_EVENTS)
}

/** Human "Rs 1,234" — whole PKR everywhere in Merchant Connect. */
export function formatPkr(amount: number): string {
  return `Rs ${Math.round(Number(amount) || 0).toLocaleString("en-PK")}`
}

/** Status wording used by both the merchant dashboard and the admin queue. */
export const REFUND_STATUS_LABELS: Record<string, string> = {
  CREDITED: "Credited to your next invoice",
  REQUESTED: "Requested — waiting for PakRaffle",
  APPROVED: "Approved — payout scheduled",
  PAID: "Paid out",
  REJECTED: "Not approved",
}
