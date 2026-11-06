// Campaign builder: create, list and lifecycle controls for merchant lucky-draw campaigns.
import { merchantTicketPrice } from "../config"
import { getMerchantDb } from "../db"
import { toCampaignDTO } from "../dto"
import { MerchantError, conflict, notFound } from "../errors"
import { validateRuleConfig } from "../rules"
import type { MerchantCampaign, MerchantStore } from "../types"
import { createCampaignSchema, updateCampaignSchema, updateCreativeSchema } from "../validators"
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

  // A linked raffle is billed at its own ticket price; campaigns without a prize fall back
  // to the flat platform fee.
  let raffleTicketPrice: number | null = null
  if (data.raffleId) {
    const prize = await getActivePrize(data.raffleId)
    if (!prize) throw new MerchantError("Selected prize is no longer available", 400, "INVALID_PRIZE")
    raffleTicketPrice = prize.ticketPricePkr
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
      // Price is snapshotted at creation so later raffle or fee changes never alter running campaigns.
      ticketPrice: merchantTicketPrice(raffleTicketPrice),
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

/**
 * Saves the storefront creative (banner + popup images, and the surfaces each may appear on).
 *
 * A field missing from the request means "leave it alone", so the cross-field rules are judged on
 * the merged state rather than on a half-filled payload — otherwise a dashboard that only sends the
 * toggles it touched would reject its own stored image.
 */
export async function updateCampaignCreative(store: MerchantStore, campaignId: string, input: unknown) {
  const data = updateCreativeSchema.parse(input)
  const campaign = await getOwnedCampaign(store.id, campaignId)
  if (campaign.status === "COMPLETED") {
    throw conflict("This campaign has drawn its winner, so its storefront creative is locked")
  }

  const pick = <T>(next: T | undefined, stored: T) => (next === undefined ? stored : next)
  const merged = {
    bannerUrl: pick(data.bannerUrl, campaign.bannerUrl ?? null),
    popupUrl: pick(data.popupUrl, campaign.popupUrl ?? null),
    pageSlug: pick(data.pageSlug, campaign.pageSlug ?? null),
    ctaUrl: pick(data.ctaUrl, campaign.ctaUrl ?? null),
    showBannerHome: pick(data.showBannerHome, Boolean(campaign.showBannerHome)),
    showPopupHome: pick(data.showPopupHome, Boolean(campaign.showPopupHome)),
    showBannerProduct: pick(data.showBannerProduct, Boolean(campaign.showBannerProduct)),
    showPopupProduct: pick(data.showPopupProduct, Boolean(campaign.showPopupProduct)),
    showCustomPage: pick(data.showCustomPage, Boolean(campaign.showCustomPage)),
  }

  // An enabled placement with no image would paint an empty box on the shopper's screen, which is
  // worse than painting nothing at all — so refuse it here instead of rendering a hole.
  const bannerOn = merged.showBannerHome || merged.showBannerProduct
  const popupOn = merged.showPopupHome || merged.showPopupProduct
  const customOn = merged.showCustomPage
  if (bannerOn && !merged.bannerUrl) throw new MerchantError("Upload the banner image before switching the banner on")
  if (popupOn && !merged.popupUrl) throw new MerchantError("Upload the square popup image before switching the popup on")
  if (customOn && !merged.pageSlug) throw new MerchantError("Enter the page name (the part after /pages/) for the custom page")
  if (customOn && !merged.bannerUrl && !merged.popupUrl) {
    throw new MerchantError("Upload at least one image before switching the custom page on")
  }

  const db = await getMerchantDb()
  await db.merchantCampaign.update({ where: { id: campaign.id }, data: merged })

  const fresh = await getOwnedCampaign(store.id, campaign.id)
  const [dto] = await decorateCampaigns([fresh])
  return dto
}
