// Order ingestion pipeline: Shopify webhook -> HMAC verification -> rule engine ->
// atomic, idempotent ticket minting (one entry per order per campaign).
import { getMerchantDb, type MerchantDb } from "../db"
import { toEntryDTO } from "../dto"
import { MerchantError, isUniqueViolation, notFound, unauthorized } from "../errors"
import { evaluateOrder, type RuleEvaluation } from "../rules"
import {
  CANCEL_TOPICS,
  MINT_TOPICS,
  buildMockShopifyOrder,
  extractCancelledOrderId,
  normalizeShopifyOrder,
  signShopifyPayload,
  verifyShopifyHmac,
} from "../shopify"
import type {
  IngestOutcome,
  MerchantCampaign,
  MerchantEntry,
  MerchantEntryStatus,
  MerchantStore,
  NormalizedOrder,
} from "../types"
import { generateTicketNumber, normalizePhone } from "../utils"
import { simulateOrderSchema } from "../validators"
import { findStoreByDomain, getStoreById } from "./stores"

const TEST_ORDER_PREFIX = "TEST-"
const MAX_TICKET_ATTEMPTS = 5

export interface IngestOptions {
  /** Simulator traffic: flagged, never billed, never counted against caps, never drawn. */
  isTest?: boolean
}

// ───────────────────────── minting ─────────────────────────

async function mintEntry(
  db: MerchantDb,
  store: MerchantStore,
  campaign: MerchantCampaign,
  order: NormalizedOrder,
  evaluation: RuleEvaluation,
  isTest: boolean,
): Promise<IngestOutcome> {
  const orderKey = isTest ? `${TEST_ORDER_PREFIX}${order.orderId}` : order.orderId
  const base = { campaignId: campaign.id, campaignTitle: campaign.title }

  for (let attempt = 0; attempt < MAX_TICKET_ATTEMPTS; attempt++) {
    const ticketNumber = generateTicketNumber()
    try {
      return await db.$transaction(async (tx: MerchantDb): Promise<IngestOutcome> => {
        const existing: MerchantEntry | null = await tx.merchantEntry.findFirst({
          where: { campaignId: campaign.id, shopifyOrderId: orderKey },
        })
        if (existing) {
          return { ...base, result: "DUPLICATE", ticketNumber: existing.ticketNumber, entryId: existing.id }
        }

        if (isTest) {
          const fresh: MerchantCampaign | null = await tx.merchantCampaign.findUnique({ where: { id: campaign.id } })
          if (!fresh || fresh.status !== "ACTIVE") return { ...base, result: "REJECTED", reason: "Campaign is not active" }
          if (fresh.maxEntries && fresh.currentEntries >= fresh.maxEntries) {
            return { ...base, result: "CAP_REACHED", reason: `Entry cap of ${fresh.maxEntries} reached` }
          }
        } else {
          // Atomic reserve: the conditional increment is the concurrency gate for caps and
          // for campaigns that are being invoiced/paused at the same moment.
          const where: Record<string, unknown> = { id: campaign.id, status: "ACTIVE" }
          if (campaign.maxEntries) where.currentEntries = { lt: campaign.maxEntries }
          const { count } = await tx.merchantCampaign.updateMany({
            where,
            data: { currentEntries: { increment: 1 } },
          })
          if (count === 0) {
            return { ...base, result: "CAP_REACHED", reason: "Entry cap reached or campaign no longer accepting entries" }
          }
        }

        const entry: MerchantEntry = await tx.merchantEntry.create({
          data: {
            campaignId: campaign.id,
            storeId: store.id,
            shopifyOrderId: orderKey,
            orderName: order.orderName ?? null,
            customerName: order.customerName,
            customerEmail: order.customerEmail ?? null,
            customerPhone: order.customerPhone ?? null,
            phoneNormalized: normalizePhone(order.customerPhone),
            ticketNumber,
            orderAmount: Math.round(evaluation.amount),
            itemCount: evaluation.itemCount,
            isTest,
            status: "ISSUED",
          },
        })
        return { ...base, result: "ISSUED", ticketNumber: entry.ticketNumber, entryId: entry.id }
      })
    } catch (err) {
      if (!isUniqueViolation(err)) throw err
      // Either a concurrent delivery of the same order won the race (idempotent duplicate),
      // or the random ticket number collided (retry with a fresh one).
      const winner: MerchantEntry | null = await db.merchantEntry.findFirst({
        where: { campaignId: campaign.id, shopifyOrderId: orderKey },
      })
      if (winner) return { ...base, result: "DUPLICATE", ticketNumber: winner.ticketNumber, entryId: winner.id }
    }
  }
  throw new MerchantError("Could not allocate a unique ticket number. Please retry.", 503, "TICKET_ALLOCATION_FAILED")
}

/** Evaluates an order against every active campaign of the store and mints qualifying entries. */
export async function ingestOrder(
  store: MerchantStore,
  order: NormalizedOrder,
  options: IngestOptions = {},
): Promise<IngestOutcome[]> {
  if (!order.orderId) throw new MerchantError("Order payload is missing an id", 400, "INVALID_ORDER")
  const db = await getMerchantDb()
  const isTest = Boolean(options.isTest)
  const campaigns: MerchantCampaign[] = await db.merchantCampaign.findMany({
    where: { storeId: store.id, status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
  })

  const outcomes: IngestOutcome[] = []
  for (const campaign of campaigns) {
    const base = { campaignId: campaign.id, campaignTitle: campaign.title }
    const evaluation = evaluateOrder(campaign, order)
    if (!evaluation.qualified) {
      outcomes.push({ ...base, result: "REJECTED", reason: evaluation.reason || "Order does not qualify" })
      continue
    }
    if (!isTest && campaign.maxEntries && campaign.currentEntries >= campaign.maxEntries) {
      outcomes.push({ ...base, result: "CAP_REACHED", reason: `Entry cap of ${campaign.maxEntries} reached` })
      continue
    }
    outcomes.push(await mintEntry(db, store, campaign, order, evaluation, isTest))
  }
  return outcomes
}

// ───────────────────────── cancellations ─────────────────────────

export interface CancelResult {
  cancelled: number
  locked: number
}

/**
 * Voids tickets for a cancelled/refunded order. Entries already on a submitted or paid
 * invoice are locked (the merchant has settled them) and stay valid.
 */
export async function cancelOrderEntries(store: MerchantStore, shopifyOrderId: string, reason: string): Promise<CancelResult> {
  const db = await getMerchantDb()
  const candidates: MerchantEntry[] = await db.merchantEntry.findMany({
    where: { storeId: store.id, shopifyOrderId, status: { in: ["ISSUED", "INVOICED"] } },
  })

  const result: CancelResult = { cancelled: 0, locked: 0 }
  for (const candidate of candidates) {
    const outcome = await db.$transaction(async (tx: MerchantDb): Promise<"cancelled" | "locked" | "skipped"> => {
      const entry: MerchantEntry | null = await tx.merchantEntry.findUnique({ where: { id: candidate.id } })
      if (!entry || (entry.status !== "ISSUED" && entry.status !== "INVOICED")) return "skipped"

      if (entry.status === "INVOICED" && entry.invoiceId) {
        const invoice = await tx.merchantInvoice.findUnique({ where: { id: entry.invoiceId } })
        if (!invoice) return "skipped"
        const { count } = await tx.merchantInvoice.updateMany({
          where: { id: invoice.id, status: "PENDING" },
          data: { totalEntries: { decrement: 1 }, amountDue: { decrement: invoice.unitPrice } },
        })
        if (count === 0) return "locked"
      }

      const { count } = await tx.merchantEntry.updateMany({
        where: { id: entry.id, status: entry.status as MerchantEntryStatus },
        data: { status: "CANCELLED", cancelledReason: reason, invoiceId: null },
      })
      if (count === 0) return "skipped"

      if (!entry.isTest) {
        await tx.merchantCampaign.updateMany({
          where: { id: entry.campaignId, currentEntries: { gt: 0 } },
          data: { currentEntries: { decrement: 1 } },
        })
      }
      return "cancelled"
    })
    if (outcome === "cancelled") result.cancelled++
    if (outcome === "locked") result.locked++
  }
  return result
}

// ───────────────────────── webhook entry point ─────────────────────────

export interface WebhookInput {
  rawBody: string
  topic: string | null
  shopDomain: string | null
  hmac: string | null
  storeId?: string | null
}

export interface WebhookResult {
  topic: string
  action: "minted" | "cancelled" | "ignored"
  message: string
  outcomes?: IngestOutcome[]
  cancellation?: CancelResult
}

async function processWebhook(input: WebhookInput, options: IngestOptions): Promise<WebhookResult> {
  const store = input.shopDomain
    ? await findStoreByDomain(input.shopDomain)
    : input.storeId
      ? await getStoreById(input.storeId)
      : null
  if (!store) throw notFound("Connected store")

  // Authenticate before revealing anything about the store or the payload.
  if (!verifyShopifyHmac(input.rawBody, input.hmac, store.webhookSecret)) {
    throw unauthorized("Invalid webhook signature")
  }

  const topic = String(input.topic || "").trim().toLowerCase()
  if (store.status !== "ACTIVE") {
    return { topic, action: "ignored", message: "Store is paused on PakRaffle" }
  }

  let payload: any
  try {
    payload = JSON.parse(input.rawBody)
  } catch {
    throw new MerchantError("Webhook body is not valid JSON", 400, "INVALID_JSON")
  }

  if (MINT_TOPICS.has(topic)) {
    const order = normalizeShopifyOrder(payload)
    if (topic === "orders/updated" && !order.fulfilled) {
      return { topic, action: "ignored", message: "Order not fulfilled yet" }
    }
    const outcomes = await ingestOrder(store, order, options)
    const issued = outcomes.filter((o) => o.result === "ISSUED").length
    return {
      topic,
      action: "minted",
      message:
        outcomes.length === 0
          ? "No active campaigns for this store"
          : `${issued} ticket${issued === 1 ? "" : "s"} issued across ${outcomes.length} campaign${outcomes.length === 1 ? "" : "s"}`,
      outcomes,
    }
  }

  if (CANCEL_TOPICS.has(topic)) {
    const orderId = extractCancelledOrderId(topic, payload)
    if (!orderId) return { topic, action: "ignored", message: "Payload has no order id" }
    const cancellation = await cancelOrderEntries(store, orderId, topic === "refunds/create" ? "Order refunded" : "Order cancelled")
    return { topic, action: "cancelled", message: `${cancellation.cancelled} ticket(s) voided`, cancellation }
  }

  return { topic, action: "ignored", message: `Topic "${topic || "unknown"}" is not handled` }
}

/** Public entry point for real Shopify deliveries (test mode can never be enabled from HTTP). */
export function processShopifyWebhook(input: WebhookInput): Promise<WebhookResult> {
  return processWebhook(input, { isTest: false })
}

// ───────────────────────── simulator ─────────────────────────

/**
 * Builds a realistic Shopify payload, signs it with the store's real webhook secret and
 * runs it through the exact same pipeline as production deliveries (flagged as test).
 */
export async function simulateOrder(store: MerchantStore, input: unknown) {
  const data = simulateOrderSchema.parse(input)
  const payload = buildMockShopifyOrder({ ...data, customerEmail: data.customerEmail || undefined })
  const rawBody = JSON.stringify(payload)
  const headers = {
    "X-Shopify-Topic": "orders/fulfilled",
    "X-Shopify-Shop-Domain": store.storeUrl,
    "X-Shopify-Hmac-Sha256": signShopifyPayload(rawBody, store.webhookSecret),
  }
  const result = await processWebhook(
    { rawBody, topic: headers["X-Shopify-Topic"], shopDomain: store.storeUrl, hmac: headers["X-Shopify-Hmac-Sha256"] },
    { isTest: true },
  )
  return { payload, headers, result }
}

export async function clearTestEntries(store: MerchantStore) {
  const db = await getMerchantDb()
  const { count } = await db.merchantEntry.deleteMany({ where: { storeId: store.id, isTest: true } })
  return count as number
}

// ───────────────────────── entry ledger ─────────────────────────

export async function listEntries(
  store: MerchantStore,
  filters: { campaignId?: string | null; status?: string | null; search?: string | null; includeTest?: boolean; take?: number },
) {
  const db = await getMerchantDb()
  const where: Record<string, any> = { storeId: store.id }
  if (filters.campaignId) where.campaignId = filters.campaignId
  if (filters.status && ["ISSUED", "INVOICED", "PAID", "CANCELLED"].includes(filters.status)) where.status = filters.status
  if (!filters.includeTest) where.isTest = false
  const search = filters.search?.trim()
  if (search) {
    where.OR = [
      { ticketNumber: { contains: search, mode: "insensitive" } },
      { shopifyOrderId: { contains: search, mode: "insensitive" } },
      { orderName: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { customerPhone: { contains: search, mode: "insensitive" } },
    ]
  }

  const take = Math.min(500, Math.max(1, filters.take ?? 200))
  const [entries, total] = await Promise.all([
    db.merchantEntry.findMany({ where, orderBy: { createdAt: "desc" }, take }),
    db.merchantEntry.count({ where }),
  ])
  return { entries: (entries as MerchantEntry[]).map(toEntryDTO), total }
}
