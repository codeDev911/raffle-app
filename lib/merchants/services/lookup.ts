// Public ticket lookup for shoppers: by ticket number, Shopify order id / number, or phone.
import { prisma } from "@/lib/prisma"
import { getMerchantDb } from "../db"
import { toPublicTicketDTO } from "../dto"
import { MerchantError } from "../errors"
import type { MerchantCampaign, MerchantEntry, MerchantStore } from "../types"
import { normalizePhone } from "../utils"
import { entryPaymentTransactionId } from "./entry-payments"
import { getPrizeMap } from "./prizes"

/**
 * Per-ticket payment rows, so the lookup can tell "store hasn't paid yet" apart from
 * "paid, waiting for PakRaffle to confirm". Missing rows simply mean nothing was submitted.
 */
async function paymentStatuses(entries: MerchantEntry[]): Promise<Map<string, string>> {
  const ids = entries.map((entry) => entryPaymentTransactionId(entry.ticketNumber))
  const map = new Map<string, string>()
  if (ids.length === 0) return map
  try {
    const payments = await prisma.payment.findMany({ where: { transactionId: { in: ids } } })
    for (const payment of payments) {
      if (payment.transactionId) map.set(payment.transactionId, payment.status)
    }
  } catch (err) {
    console.warn("[MerchantConnect] payment lookup failed, relying on ticket status:", err)
  }
  return map
}

export async function lookupTickets(rawQuery: string) {
  const q = String(rawQuery || "").trim()
  if (q.length < 4 || q.length > 64) {
    throw new MerchantError("Enter your order number, ticket number or phone number", 400, "INVALID_QUERY")
  }

  const or: Record<string, unknown>[] = [
    { ticketNumber: q.toUpperCase() },
    { shopifyOrderId: q },
    { orderName: q.startsWith("#") ? q : `#${q}` },
  ]
  const phone = normalizePhone(q)
  if (phone && /^[+\d\s-]+$/.test(q)) or.push({ phoneNormalized: phone })

  const db = await getMerchantDb()
  const entries: MerchantEntry[] = await db.merchantEntry.findMany({
    where: { isTest: false, OR: or },
    orderBy: { createdAt: "desc" },
    take: 20,
  })
  if (entries.length === 0) return []

  const [campaigns, stores] = (await Promise.all([
    db.merchantCampaign.findMany({ where: { id: { in: Array.from(new Set(entries.map((e) => e.campaignId))) } } }),
    db.merchantStore.findMany({ where: { id: { in: Array.from(new Set(entries.map((e) => e.storeId))) } } }),
  ])) as [MerchantCampaign[], MerchantStore[]]

  const campaignById = new Map(campaigns.map((c) => [c.id, c]))
  const storeById = new Map(stores.map((s) => [s.id, s]))
  const prizes = await getPrizeMap(campaigns.map((c) => c.raffleId))
  const payments = await paymentStatuses(entries)

  return entries.map((entry) => {
    const campaign = campaignById.get(entry.campaignId) ?? null
    return toPublicTicketDTO(entry, {
      storeName: storeById.get(entry.storeId)?.name ?? "Partner Store",
      campaign,
      prize: campaign?.raffleId ? prizes.get(campaign.raffleId) ?? null : null,
      paymentStatus: payments.get(entryPaymentTransactionId(entry.ticketNumber)) ?? null,
    })
  })
}
