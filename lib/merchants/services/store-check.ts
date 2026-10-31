// Public "shop & win" checker: a shopper types a store domain, we report the lucky-draw
// campaigns that store runs and hand back a UTM-tagged link into the shop.
// Only shopper-facing fields leave this module — no credentials, contacts or billing terms.
import { getMerchantDb } from "../db"
import { MerchantError } from "../errors"
import { describeRule } from "../rules"
import type { MerchantCampaign } from "../types"
import { isValidStoreDomain, normalizeStoreDomain } from "../utils"
import { getPrizeMap } from "./prizes"
import { findStoreByDomain } from "./stores"

/** Traffic source stamped on every storefront link this page produces. */
export const UTM_SOURCE = "pakraffle.com"

export type StoreCampaignState = "live" | "paused" | "full" | "drawing" | "ended"

export interface StoreCampaignCheck {
  id: string
  title: string
  ruleSummary: string
  state: StoreCampaignState
  isAccepting: boolean
  entriesIssued: number
  entryCap: number | null
  startedAt: string
  closesAt: string
  prize: {
    title: string
    image: string | null
    category: string | null
    valuePkr: number
    drawDate: string | null
  } | null
  /** https://<store>/?utm_source=pakraffle.com&utm_campaign=<slug> */
  shopUrl: string
}

const iso = (value: Date | string) => new Date(value).toISOString()

/** "Free entry · spend Rs. 5,000+" -> "free-entry-spend-rs-5-000", readable in any analytics tool. */
export function campaignSlug(campaign: { id: string; title: string }): string {
  const slug = String(campaign.title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 44)
  return slug || campaign.id.slice(0, 8)
}

/** The redirect shoppers click: the store's own storefront, tagged with the campaign. */
export function trackedShopUrl(domain: string, slug: string): string {
  const params = new URLSearchParams({ utm_source: UTM_SOURCE, utm_campaign: slug })
  return `https://${domain}/?${params.toString()}`
}

function stateOf(campaign: MerchantCampaign, storeActive: boolean, now: number): StoreCampaignState {
  if (campaign.status === "DRAW_READY") return "drawing"
  if (campaign.status === "COMPLETED") return "ended"
  if (new Date(campaign.endDate).getTime() < now) return "ended"
  if (!storeActive || campaign.status !== "ACTIVE") return "paused"
  if (campaign.maxEntries && campaign.currentEntries >= campaign.maxEntries) return "full"
  return "live"
}

const RANK: Record<StoreCampaignState, number> = { live: 0, drawing: 1, full: 2, paused: 3, ended: 4 }

export async function checkStoreCampaigns(rawDomain: string) {
  const domain = normalizeStoreDomain(rawDomain)
  if (!domain || !isValidStoreDomain(domain)) {
    throw new MerchantError("Enter a store domain, like yourstore.myshopify.com", 400, "INVALID_DOMAIN")
  }

  const store = await findStoreByDomain(domain)
  if (!store) return { found: false as const, domain }

  const db = await getMerchantDb()
  const rows: MerchantCampaign[] = await db.merchantCampaign.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
  })
  const prizes = await getPrizeMap(rows.map((campaign) => campaign.raffleId))
  const now = Date.now()
  const storeActive = store.status === "ACTIVE"

  const decorated = rows
    // A campaign mid-invoice is an internal state; it is not a shopper-facing offer.
    .filter((campaign) => campaign.status !== "PENDING_INVOICE")
    .map((campaign): Omit<StoreCampaignCheck, "shopUrl"> => {
      const state = stateOf(campaign, storeActive, now)
      const prize = campaign.raffleId ? prizes.get(campaign.raffleId) ?? null : null
      return {
        id: campaign.id,
        title: campaign.title,
        ruleSummary: describeRule(campaign),
        state,
        isAccepting: state === "live" && (!campaign.maxEntries || campaign.currentEntries < campaign.maxEntries),
        entriesIssued: campaign.currentEntries,
        entryCap: campaign.maxEntries ?? null,
        startedAt: iso(campaign.startDate),
        closesAt: iso(campaign.endDate),
        prize: prize
          ? {
              title: prize.title,
              image: prize.image,
              category: prize.category,
              valuePkr: prize.prizeValuePkr,
              drawDate: prize.endDate ? iso(prize.endDate) : null,
            }
          : null,
      }
    })
    .sort((a, b) => RANK[a.state] - RANK[b.state] || new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime())

  // Slugs stay readable in analytics, but two campaigns can share a title — suffix the repeats
  // so a store can still tell which draw a visit came from.
  const used = new Set<string>()
  const campaigns: StoreCampaignCheck[] = decorated.slice(0, 12).map((campaign) => {
    const base = campaignSlug(campaign)
    let slug = base
    for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`
    used.add(slug)
    return { ...campaign, shopUrl: trackedShopUrl(store.storeUrl, slug) }
  })

  return {
    found: true as const,
    domain: store.storeUrl,
    store: {
      name: store.name,
      domain: store.storeUrl,
      status: store.status,
      siteUrl: `https://${store.storeUrl}`,
      campaignCount: decorated.length,
      liveCampaigns: decorated.filter((campaign) => campaign.state === "live").length,
    },
    campaigns,
  }
}
