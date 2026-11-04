// Shopify webhook topics: one source of truth for the pipeline, the wizard and the dashboard.
//
// Shopify has two names for every event. The Admin dropdown shows a friendly label
// ("Order creation"), while the API — and the X-Shopify-Topic header on every delivery —
// uses a topic path ("orders/create"). Merchants read the dropdown, support reads the raw
// header, so both are shown side by side and every plausible spelling is accepted below.

export interface WebhookTopic {
  /** Exact topic Shopify stores and sends in X-Shopify-Topic. */
  topic: string
  /** What the Shopify Admin webhook dropdown calls the same event. */
  adminLabel: string
  /** What the delivery does in PakRaffle. */
  purpose: string
  /** Skip-able at setup: order creation already mints the ticket. */
  required: boolean
}

export const WEBHOOK_TOPICS: WebhookTopic[] = [
  {
    topic: "orders/create",
    adminLabel: "Order creation",
    purpose: "Mints the ticket and fires the congratulations popup before fulfilment.",
    required: true,
  },
  {
    topic: "orders/cancelled",
    adminLabel: "Order cancellation",
    purpose: "Voids the ticket when a shopper cancels the order.",
    required: true,
  },
  {
    topic: "refunds/create",
    adminLabel: "Refund creation",
    purpose: "Voids the ticket when the order is refunded — unbilled, or turned into credit if you already paid for it.",
    required: true,
  },
  {
    // The safety net: a return refunded through Shopify's returns flow, a partial refund, or a
    // refund recorded by another app can arrive only as an order update. Without this topic the
    // ticket stays billed and the merchant sees nothing.
    topic: "orders/updated",
    adminLabel: "Order update",
    purpose: "Catches refunds and returns that arrive as an order change, so the ticket is voided and credited.",
    required: true,
  },
  {
    topic: "orders/fulfilled",
    adminLabel: "Order fulfillment",
    purpose: "Optional: mints on fulfilled orders for stores that bill after shipping.",
    required: false,
  },
]

export const MINT_TOPICS = new Set(["orders/create", "orders/paid", "orders/fulfilled", "orders/updated"])
export const CANCEL_TOPICS = new Set(["orders/cancelled", "refunds/create"])

/**
 * Spellings that mean the same event. Shopify itself always sends the canonical topic, but
 * hand-written webhooks, older admin screens and curl tests use labels or singular paths —
 * none of them should silently drop a ticket.
 */
const TOPIC_ALIASES: Record<string, string> = {
  "orders/creation": "orders/create",
  "orders/created": "orders/create",
  "order/create": "orders/create",
  "order/creation": "orders/create",
  "order/created": "orders/create",
  "order/cancel": "orders/cancelled",
  "order/cancellation": "orders/cancelled",
  "order/canceled": "orders/cancelled",
  "orders/cancel": "orders/cancelled",
  "orders/cancellation": "orders/cancelled",
  "orders/canceled": "orders/cancelled",
  "order/fulfillment": "orders/fulfilled",
  "order/fulfilled": "orders/fulfilled",
  "orders/fulfillment": "orders/fulfilled",
  "refund/create": "refunds/create",
  "refund/created": "refunds/create",
  "refunds/created": "refunds/create",
  "order/refund": "refunds/create",
  "orders/refunded": "refunds/create",
  "orders/update": "orders/updated",
  "order/update": "orders/updated",
  "order/updated": "orders/updated",
  // returns/* is deliberately not aliased: a Return payload carries no order id (only the Return
  // GID and line-item deltas), so it cannot be matched to a ticket here. The money movement that
  // follows a return always arrives as refunds/create or an order update — which is also the
  // merchant's instruction for a return handled at the counter: record it in Shopify, and the
  // webhook does the void, the refund and the credit.
}

/** Maps any accepted spelling onto the canonical topic, lowercased and trimmed. */
export function canonicalTopic(topic: string | null | undefined): string {
  const clean = String(topic || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
  const withoutHeaderName = clean.replace(/^x-shopify-topic:/, "")
  return TOPIC_ALIASES[withoutHeaderName] ?? withoutHeaderName
}

/** Flat list of canonical topics, in setup order. */
export const WEBHOOK_TOPIC_NAMES = WEBHOOK_TOPICS.map((entry) => entry.topic)
