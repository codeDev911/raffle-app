// Campaign builder: create, list and lifecycle controls for merchant lucky-draw campaigns.
import { MERCHANT_ENTRY_FEE_PKR } from "../config"
import { getMerchantDb } from "../db"
import { toCampaignDTO } from "../dto"
import { MerchantError, conflict, notFound } from "../errors"
import { validateRuleConfig } from "../rules"
import type { MerchantCampaign, MerchantStore } from "../types"
import { createCampaignSchema, updateCampaignSchema } from "../validators"
import { getActivePrize, getPrizeMap } from "./prizes"

const MAX_OPEN_CAMPAIGNS = 10

export async function getOwnedCampaign(storeId: string, campaignId: string): Promise<MerchantCampaign> {
  const db = await getMerchantDb()
  const campaign = await db.merchantCampaign.findFirst({ where: { id: campaignId, storeId } })
  if (!campaign) throw notFound("Campaign")
  return campaign
}

/** Attaches prize info and billing counters to a list of campaigns. */
export async function decorateCampaigns(campaigns: MerchantCampaign[]) {
  const db = await getMerchantDb()
  const [prizes, counters] = await Promise.all([
    getPrizeMap(campaigns.map((c) => c.raffleId)),
    Promise.all(
      campaigns.map(async (c) => {
        const [billable, test] = await Promise.all([
          db.merchantEntry.count({ where: { campaignId: c.id, status: "ISSUED", isTest: false } }),
          db.merchantEntry.count({ where: { campaignId: c.id, isTest: true } }),
        ])
        return { billable, test }
      }),
    ),
  ])

  return campaigns.map((c, i) =>
    toCampaignDTO(c, {
      prize: c.raffleId ? prizes.get(c.raffleId) ?? null : null,
      billableEntries: counters[i].billable,
      testEntries: counters[i].test,
    }),
  )
}

export async function listCampaigns(storeId: string) {
  const db = await getMerchantDb()
  const campaigns: MerchantCampaign[] = await db.merchantCampaign.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  })
  return decorateCampaigns(campaigns)
}

export async function createCampaign(store: MerchantStore, input: unknown) {
  if (store.status !== "ACTIVE") throw new MerchantError("Your store is paused. Contact PakRaffle support.", 403, "STORE_PAUSED")

  const data = createCampaignSchema.parse(input)
  const ruleError = validateRuleConfig(data)
  if (ruleError) throw new MerchantError(ruleError, 400, "INVALID_RULE")

  const now = new Date()
  const startDate = data.startDate ?? now
  if (data.endDate.getTime() <= now.getTime()) throw new MerchantError("End date must be in the future")
  if (data.endDate.getTime() <= startDate.getTime()) throw new MerchantError("End date must be after the start date")

  if (data.raffleId) {
    const prize = await getActivePrize(data.raffleId)
    if (!prize) throw new MerchantError("Selected prize is no longer available", 400, "INVALID_PRIZE")
  }

  const db = await getMerchantDb()
  const open = await db.merchantCampaign.count({ where: { storeId: store.id, status: { in: ["ACTIVE", "PAUSED"] } } })
  if (open >= MAX_OPEN_CAMPAIGNS) {
    throw conflict(`You can run up to ${MAX_OPEN_CAMPAIGNS} open campaigns at a time. Invoice or close one first.`)
  }

  const needsQty = data.ruleType === "MIN_QUANTITY" || data.ruleType === "MIN_QUANTITY_AND_AMOUNT"
  const needsAmt = data.ruleType === "MIN_AMOUNT" || data.ruleType === "MIN_QUANTITY_AND_AMOUNT"

  const campaign: MerchantCampaign = await db.merchantCampaign.create({
    data: {
      storeId: store.id,
      raffleId: data.raffleId,
      title: data.title,
      ruleType: data.ruleType,
      minQuantity: needsQty ? data.minQuantity : null,
      minAmount: needsAmt ? data.minAmount : null,
      productFilters: data.productFilters,
      // Platform fee is locked at creation so later price changes never alter running campaigns.
      ticketPrice: MERCHANT_ENTRY_FEE_PKR,
      maxEntries: data.maxEntries ?? null,
      startDate,
      endDate: data.endDate,
    },
  })
  const [dto] = await decorateCampaigns([campaign])
  return dto
}

export async function updateCampaign(store: MerchantStore, campaignId: string, input: unknown) {
  const data = updateCampaignSchema.parse(input)
  const campaign = await getOwnedCampaign(store.id, campaignId)
  const db = await getMerchantDb()
  const editable = campaign.status === "ACTIVE" || campaign.status === "PAUSED"

  // Validate everything first so a request never half-applies.
  const patch: Record<string, unknown> = {}
  if (data.title !== undefined) {
    if (campaign.status === "COMPLETED") throw conflict("Completed campaigns cannot be edited")
    patch.title = data.title
  }
  if (data.endDate !== undefined) {
    if (!editable) throw conflict("End date can only be changed while the campaign is open")
    if (data.endDate.getTime() <= Date.now()) throw new MerchantError("End date must be in the future")
    patch.endDate = data.endDate
  }
  if (data.maxEntries !== undefined) {
    if (!editable) throw conflict("Entry cap can only be changed while the campaign is open")
    if (data.maxEntries !== null && data.maxEntries < campaign.currentEntries) {
      throw new MerchantError(`Cap cannot be lower than the ${campaign.currentEntries} entries already issued`)
    }
    patch.maxEntries = data.maxEntries
  }

  if (data.action === "pause" && campaign.status !== "ACTIVE") throw conflict("Only active campaigns can be paused")
  if (data.action === "resume") {
    if (campaign.status !== "PAUSED") throw conflict("Only paused campaigns can be resumed")
    if (store.status !== "ACTIVE") throw new MerchantError("Your store is paused. Contact PakRaffle support.", 403, "STORE_PAUSED")
    if (new Date(campaign.endDate).getTime() <= Date.now() && !patch.endDate) {
      throw new MerchantError("Campaign has ended. Extend the end date before resuming.")
    }
  }

  if (Object.keys(patch).length > 0) {
    await db.merchantCampaign.update({ where: { id: campaign.id }, data: patch })
  }

  if (data.action) {
    // Conditional transition guards against a concurrent invoice/close changing the status.
    const [from, to] = data.action === "pause" ? ["ACTIVE", "PAUSED"] : ["PAUSED", "ACTIVE"]
    const { count } = await db.merchantCampaign.updateMany({ where: { id: campaign.id, status: from }, data: { status: to } })
    if (count === 0) throw conflict(`Campaign could not be ${data.action}d — its status just changed`)
  }

  const fresh = await getOwnedCampaign(store.id, campaign.id)
  const [dto] = await decorateCampaigns([fresh])
  return dto
}
