// Campaign qualification rule engine.
// Pure functions with no server dependencies so the dashboard can reuse
// describeRule() on the client and the simulator preview matches the backend exactly.
import type { MerchantCampaign, MerchantRuleType, NormalizedLineItem, NormalizedOrder } from "./types"

type RuleCampaign = Pick<
  MerchantCampaign,
  "ruleType" | "minQuantity" | "minAmount" | "productFilters" | "status" | "startDate" | "endDate"
>

export interface RuleEvaluation {
  qualified: boolean
  reason?: string
  itemCount: number
  amount: number // PKR (qualifying subtotal, decimals preserved)
}

const BLOCKED_FINANCIAL_STATUSES = new Set(["refunded", "voided"])

function lineItemMatches(item: NormalizedLineItem, filters: string[]): boolean {
  const title = item.title.toLowerCase()
  const exactKeys = [item.sku, item.productId, item.variantId]
    .filter(Boolean)
    .map((v) => String(v).toLowerCase())

  return filters.some((raw) => {
    const token = raw.trim().toLowerCase()
    if (!token) return false
    return exactKeys.includes(token) || title.includes(token)
  })
}

export function cleanFilters(filters?: string[] | null): string[] {
  return (filters || []).map((f) => String(f).trim()).filter(Boolean)
}

/** Returns only the line items that count toward the campaign (all items when no filters set). */
export function qualifyingLineItems(order: NormalizedOrder, filters?: string[] | null): NormalizedLineItem[] {
  const active = cleanFilters(filters)
  if (active.length === 0) return order.lineItems
  return order.lineItems.filter((item) => lineItemMatches(item, active))
}

export interface EvaluateOptions {
  /**
   * orders/create fires before Shopify marks the order fulfilled. The shopper still needs the
   * congratulations at that moment, so creation-triggered evaluations skip the fulfilment gate.
   * Defaults to true (fulfilment-based mints).
   */
  requireFulfilled?: boolean
}

export function evaluateOrder(
  campaign: RuleCampaign,
  order: NormalizedOrder,
  now = new Date(),
  options: EvaluateOptions = {},
): RuleEvaluation {
  const filters = cleanFilters(campaign.productFilters)
  const items = qualifyingLineItems(order, filters)
  const itemCount = items.reduce((sum, i) => sum + Math.max(0, i.quantity || 0), 0)
  const amount =
    filters.length > 0
      ? items.reduce((sum, i) => sum + Math.max(0, i.quantity || 0) * Math.max(0, i.unitPrice || 0), 0)
      : Math.max(0, order.subtotal || 0)

  const reject = (reason: string): RuleEvaluation => ({ qualified: false, reason, itemCount, amount })

  if (order.cancelled) return reject("Order is cancelled")
  if (options.requireFulfilled !== false && !order.fulfilled) return reject("Order is not fulfilled / shipped yet")
  if (order.financialStatus && BLOCKED_FINANCIAL_STATUSES.has(order.financialStatus.toLowerCase())) {
    return reject(`Order payment is ${order.financialStatus.toLowerCase()}`)
  }

  if (campaign.status !== "ACTIVE") return reject(`Campaign is ${campaign.status.toLowerCase().replace(/_/g, " ")}`)
  if (now < new Date(campaign.startDate)) return reject("Campaign has not started yet")
  if (now > new Date(campaign.endDate)) return reject("Campaign has ended")

  if (filters.length > 0 && itemCount === 0) return reject("No qualifying products in this order")

  const minQty = campaign.minQuantity ?? 0
  const minAmt = campaign.minAmount ?? 0
  const needsQty = campaign.ruleType === "MIN_QUANTITY" || campaign.ruleType === "MIN_QUANTITY_AND_AMOUNT"
  const needsAmt = campaign.ruleType === "MIN_AMOUNT" || campaign.ruleType === "MIN_QUANTITY_AND_AMOUNT"

  if (needsQty && itemCount < minQty) {
    return reject(`Needs ${minQty}+ qualifying items (order has ${itemCount})`)
  }
  if (needsAmt && amount < minAmt) {
    return reject(`Needs Rs. ${minAmt.toLocaleString("en-PK")}+ subtotal (order is Rs. ${Math.round(amount).toLocaleString("en-PK")})`)
  }

  return { qualified: true, itemCount, amount }
}

export function describeRule(campaign: {
  ruleType: MerchantRuleType
  minQuantity?: number | null
  minAmount?: number | null
  productFilters?: string[] | null
}): string {
  const qty = campaign.minQuantity ?? 0
  const amt = (campaign.minAmount ?? 0).toLocaleString("en-PK")
  const filters = cleanFilters(campaign.productFilters)
  const scope = filters.length > 0 ? ` from ${filters.join(", ")}` : ""

  switch (campaign.ruleType) {
    case "ALL_ORDERS":
      return filters.length > 0 ? `Any order containing ${filters.join(", ")}` : "Every fulfilled order"
    case "MIN_QUANTITY":
      return `Buy ${qty}+ items${scope}`
    case "MIN_AMOUNT":
      return `Spend Rs. ${amt}+${scope}`
    case "MIN_QUANTITY_AND_AMOUNT":
      return `Buy ${qty}+ items and spend Rs. ${amt}+${scope}`
    default:
      return "Custom rule"
  }
}

/** Validates rule configuration; returns an error message or null. */
export function validateRuleConfig(input: {
  ruleType: string
  minQuantity?: number | null
  minAmount?: number | null
}): string | null {
  const needsQty = input.ruleType === "MIN_QUANTITY" || input.ruleType === "MIN_QUANTITY_AND_AMOUNT"
  const needsAmt = input.ruleType === "MIN_AMOUNT" || input.ruleType === "MIN_QUANTITY_AND_AMOUNT"
  if (needsQty && (!input.minQuantity || input.minQuantity < 1)) return "Minimum quantity must be at least 1"
  if (needsAmt && (!input.minAmount || input.minAmount < 1)) return "Minimum order value must be at least Rs. 1"
  return null
}
