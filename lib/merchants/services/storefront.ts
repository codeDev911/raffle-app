// Public storefront API used by the Shopify widget (cart eligibility banner + claim popup).
// No merchant credentials are involved: everything is scoped by the store id baked into the
// script tag, and only non-sensitive, shopper-facing fields are returned.
import { getMerchantDb } from "../db"
import { cleanFilters, describeRule, evaluateOrder } from "../rules"
import type { MerchantCampaign, MerchantEntry, NormalizedLineItem, NormalizedOrder } from "../types"
import { getPrizeMap } from "./prizes"
import { getStoreById } from "./stores"

export interface CartInput {
  items: NormalizedLineItem[]
  itemCount: number
  amount: number
}

export interface StorefrontCampaign {
  id: string
  title: string
  ruleType: string
  ruleSummary: string
  minQuantity: number | null
  minAmount: number | null
  hasProductFilters: boolean
  prize: { title: string; image: string | null } | null
  drawDate: Date | null
}

export interface StorefrontStatus {
  store: { name: string }
  cart: { itemCount: number; amount: number }
  eligible: boolean
  campaign: StorefrontCampaign | null
  missingItems: number
  missingAmount: number
}

/** Defensive parsing: this endpoint is public and called from arbitrary cart pages. */
export function parseCartInput(body: any): CartInput {
  const rawItems = Array.isArray(body?.items) ? body.items.slice(0, 60) : []
  const items: NormalizedLineItem[] = rawItems.map((item: any) => ({
    title: String(item?.title ?? "Item").slice(0, 200),
    sku: item?.sku ? String(item.sku).slice(0, 100) : null,
    productId: item?.productId ? String(item.productId).slice(0, 64) : null,
    variantId: item?.variantId ? String(item.variantId).slice(0, 64) : null,
    quantity: Math.max(0, Math.min(10_000, Math.round(Number(item?.quantity) || 0))),
    unitPrice: Math.max(0, Number(item?.unitPrice) || 0),
  }))
  if (items.length === 0) {
    // Without line items the quantity is taken at face value: the widget always sends both,
    // but a degraded call must not claim eligibility.
    return { items, itemCount: 0, amount: 0 }
  }
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const sampled = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const amount = Math.max(0, Number(body?.amount) || sampled)
  return { items, itemCount, amount }
}

function campaignView(campaign: MerchantCampaign, prize: { title: string; image: string | null } | null): StorefrontCampaign {
  return {
    id: campaign.id,
    title: campaign.title,
    ruleType: campaign.ruleType,
    ruleSummary: describeRule(campaign),
    minQuantity: campaign.minQuantity ?? null,
    minAmount: campaign.minAmount ?? null,
    hasProductFilters: cleanFilters(campaign.productFilters).length > 0,
    prize,
    drawDate: campaign.endDate ? new Date(campaign.endDate) : null,
  }
}

/**
 * Evaluates the shopper's live cart against every running campaign and returns the one the
 * cart is (or is closest to) qualifying for. The order is evaluated with fulfilment bypassed
 * because the order does not exist yet.
 */
export async function getStorefrontStatus(storeId: string, cart: CartInput): Promise<StorefrontStatus | null> {
  const store = await getStoreById(storeId)
  if (!store || store.status !== "ACTIVE") return null

  const db = await getMerchantDb()
  const campaigns: MerchantCampaign[] = await db.merchantCampaign.findMany({
    where: { storeId, status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
  })
  const prizeMap = await getPrizeMap(campaigns.map((c) => c.raffleId))
  const prizeFor = (campaign: MerchantCampaign) => {
    const prize = campaign.raffleId ? prizeMap.get(campaign.raffleId) : null
    return prize ? { title: prize.title, image: prize.image } : null
  }

  const base: StorefrontStatus = {
    store: { name: store.name },
    cart: { itemCount: cart.itemCount, amount: Math.round(cart.amount) },
    eligible: false,
    campaign: null,
    missingItems: 0,
    missingAmount: 0,
  }
  if (campaigns.length === 0) return base

  const now = new Date()
  const asOrder: NormalizedOrder = {
    orderId: "cart",
    customerName: "Cart",
    subtotal: cart.amount,
    lineItems: cart.items,
    cancelled: false,
    fulfilled: true, // bypasses the fulfilment gate; the cart is not an order yet
    financialStatus: null,
  }

  let closest: { campaign: MerchantCampaign; missingItems: number; missingAmount: number; distance: number } | null = null

  for (const campaign of campaigns) {
    // Cap and date windows are part of "will this cart earn an entry", so use the real engine.
    const evaluation = evaluateOrder(campaign, asOrder, now, { requireFulfilled: false })
    if (evaluation.qualified) {
      return { ...base, eligible: true, campaign: campaignView(campaign, prizeFor(campaign)) }
    }

    const needsQty = campaign.ruleType === "MIN_QUANTITY" || campaign.ruleType === "MIN_QUANTITY_AND_AMOUNT"
    const needsAmt = campaign.ruleType === "MIN_AMOUNT" || campaign.ruleType === "MIN_QUANTITY_AND_AMOUNT"
    if (!needsQty && !needsAmt) continue // ALL_ORDERS that did not qualify is paused/ended/capped

    const missingItems = needsQty ? Math.max(0, (campaign.minQuantity ?? 0) - evaluation.itemCount) : 0
    const missingAmount = needsAmt ? Math.max(0, (campaign.minAmount ?? 0) - evaluation.amount) : 0
    const distance = missingItems + (missingAmount > 0 ? 1 : 0)
    if (!closest || distance < closest.distance) closest = { campaign, missingItems, missingAmount, distance }
  }

  if (!closest) return base
  return {
    ...base,
    campaign: campaignView(closest.campaign, prizeFor(closest.campaign)),
    missingItems: closest.missingItems,
    missingAmount: Math.ceil(closest.missingAmount),
  }
}

export interface StorefrontClaim {
  ticketNumber: string
  orderName: string | null
  campaignTitle: string
  prize: { title: string; image: string | null } | null
  drawDate: Date | null
  issuedAt: Date
  status: string
}

/**
 * Looks up the tickets minted for the browser nonce stamped on the cart. The shopper's own
 * browser is the only holder of the token, so no personal data is ever exposed here.
 */
export async function getStorefrontClaims(storeId: string, token: string): Promise<StorefrontClaim[]> {
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(token)) return []
  const store = await getStoreById(storeId)
  if (!store) return []

  const db = await getMerchantDb()
  const entries: MerchantEntry[] = await db.merchantEntry.findMany({
    where: { storeId, claimToken: token, isTest: false, status: { in: ["ISSUED", "INVOICED", "PAID"] } },
    orderBy: { createdAt: "desc" },
    take: 5,
  })
  if (entries.length === 0) return []

  const campaignIds = Array.from(new Set(entries.map((entry) => entry.campaignId)))
  const campaigns: MerchantCampaign[] = await db.merchantCampaign.findMany({ where: { id: { in: campaignIds } } })
  const campaignMap = new Map(campaigns.map((campaign) => [campaign.id, campaign]))
  const prizeMap = await getPrizeMap(campaigns.map((campaign) => campaign.raffleId))

  return entries.map((entry) => {
    const campaign = campaignMap.get(entry.campaignId)
    const prize = campaign?.raffleId ? prizeMap.get(campaign.raffleId) : null
    return {
      ticketNumber: entry.ticketNumber,
      orderName: entry.orderName ?? null,
      campaignTitle: campaign?.title ?? "Lucky Draw",
      prize: prize ? { title: prize.title, image: prize.image } : null,
      drawDate: campaign?.endDate ? new Date(campaign.endDate) : null,
      issuedAt: entry.createdAt,
      status: entry.status,
    }
  })
}
