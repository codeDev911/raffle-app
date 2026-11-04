import { Metadata } from "next"
import ClientSide from "./ClientSide"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getMerchantDb } from "@/lib/merchants/db"
import { describeRule } from "@/lib/merchants/rules"
import type { MerchantCampaign, MerchantStore } from "@/lib/merchants/types"

type Props = {
  params: { id: string }
}

async function getRaffle(id: string) {
  try {
    // Try exact ID match
    let raffle = await prisma.raffle.findUnique({
      where: { id },
      include: {
        winners: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
          },
        },
        entries: {
          select: {
            userId: true,
            id: true,
            totalCost: true,
          },
        },
        _count: {
          select: { entries: true },
        },
      },
    })

    // If numeric id provided (e.g. "1"), try "raffle-1"
    if (!raffle && !isNaN(Number(id))) {
      raffle = await prisma.raffle.findUnique({
        where: { id: `raffle-${id}` },
        include: {
          winners: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                },
              },
            },
          },
          entries: {
            select: {
              userId: true,
              id: true,
              totalCost: true,
            },
          },
          _count: {
            select: { entries: true },
          },
        },
      })
    }

    // Fallback: if not found, find the first available raffle so user doesn't hit a broken screen
    if (!raffle) {
      raffle = await prisma.raffle.findFirst({
        include: {
          winners: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                },
              },
            },
          },
          entries: {
            select: {
              userId: true,
              id: true,
              totalCost: true,
            },
          },
          _count: {
            select: { entries: true },
          },
        },
      })
    }

    return raffle
  } catch (err) {
    console.error("Error retrieving raffle:", err)
    return null
  }
}

export type RelatedDraw = {
  id: string
  title: string
  description: string
  image: string | null
  category: string
  price: number
  realPrice: number
  totalEntries: number
  currentEntries: number
  endDate: string
  featured: boolean
}

/** Three other live draws, so a visitor who is not convinced still has somewhere to go. */
async function getRelatedDraws(raffleId: string): Promise<RelatedDraw[]> {
  type Row = Omit<RelatedDraw, "endDate"> & { endDate: Date | string | null }

  try {
    const rows = (await prisma.raffle.findMany({
      where: { id: { not: raffleId }, status: "ACTIVE" },
      orderBy: [{ featured: "desc" }, { endDate: "asc" }],
      take: 3,
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        category: true,
        price: true,
        realPrice: true,
        totalEntries: true,
        currentEntries: true,
        endDate: true,
        featured: true,
      },
    })) as Row[]

    return rows.map((row) => ({
      ...row,
      endDate: row.endDate ? new Date(row.endDate).toISOString() : new Date().toISOString(),
    }))
  } catch (err) {
    console.error("Error retrieving related raffles:", err)
    return []
  }
}

export type PartnerStore = {
  id: string
  name: string
  /** Bare shop domain (mystore.myshopify.com) — the card links to it and pulls its logo from there. */
  domain: string
  /** Logo the merchant set in their dashboard; null falls back to the store's own favicon. */
  logoUrl: string | null
  campaignTitle: string
  /** The store's own qualifying rule in shopper words, e.g. "Spend Rs. 5,000+". */
  ruleSummary: string
  ticketsMinted: number
}

/**
 * Stores whose Merchant Connect campaign feeds this exact draw. Their shoppers earn a ticket free
 * with a qualifying order — they never buy one here — so the shopper needs to find the store, not
 * the checkout. Only a campaign that can still mint a ticket is listed, and any merchant-data failure
 * returns an empty list rather than breaking the raffle page.
 */
async function getPartnerStores(raffleId: string): Promise<PartnerStore[]> {
  try {
    const db = await getMerchantDb()
    const campaigns = (await db.merchantCampaign.findMany({ where: { raffleId } })) as MerchantCampaign[]

    const mintable = campaigns.filter((campaign) => {
      // PAUSED stopped handing out tickets, and PENDING_INVOICE / DRAW_READY / COMPLETED mean the
      // campaign is spent — advertising those would send a shopper to a store that no longer enters.
      if (campaign.status !== "ACTIVE") return false
      if (new Date(campaign.endDate).getTime() <= Date.now()) return false
      return !campaign.maxEntries || campaign.currentEntries < campaign.maxEntries
    })
    if (mintable.length === 0) return []

    const storeIds = Array.from(new Set(mintable.map((c) => c.storeId)))
    const stores = (await db.merchantStore.findMany({ where: { id: { in: storeIds } } })) as MerchantStore[]
    const openStores = new Map(stores.filter((s) => s.status === "ACTIVE").map((s) => [s.id, s]))

    const byStore = new Map<string, PartnerStore>()
    for (const campaign of mintable) {
      const store = openStores.get(campaign.storeId)
      // A suspended store or a store without a domain we can link to is dropped, and two campaigns
      // on one store would otherwise render the same card twice.
      if (!store || !store.storeUrl || byStore.has(store.id)) continue
      byStore.set(store.id, {
        id: store.id,
        name: store.name,
        logoUrl: store.logoUrl ?? null,
        domain: String(store.storeUrl || "")
          .trim()
          .replace(/^https?:\/\//i, "")
          .replace(/[/?#].*$/, ""),
        campaignTitle: campaign.title,
        ruleSummary: describeRule(campaign),
        ticketsMinted: campaign.currentEntries,
      })
    }

    return Array.from(byStore.values()).sort(
      (a, b) => b.ticketsMinted - a.ticketsMinted || a.name.localeCompare(b.name),
    )
  } catch (err) {
    console.error("Error retrieving participating stores:", err)
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const raffle = await getRaffle(params.id)

  if (!raffle) {
    return {
      title: "Raffle Details | PakRaffle",
      description: "View raffle details and enter to win on PakRaffle.",
    }
  }

  const title = `${raffle.title || "Raffle Details"} | PakRaffle`
  const description = raffle.description || "Enter this exciting raffle on PakRaffle!"
  const image = raffle.image || raffle.gallery?.[0] || "/placeholder.jpg"
  const url = `https://pakraffle.com/raffles/${params.id}`

  return {
    title,
    description,
    keywords: ["raffles", "giveaways", "win prizes", "PakRaffle"],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: raffle.title || "PakRaffle Giveaway",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function RaffleDetailPage({ params }: { params: { id: string } }) {
  const raffle = await getRaffle(params.id)

  if (!raffle) {
    notFound()
  }

  const related = await getRelatedDraws(raffle.id)
  const stores = await getPartnerStores(raffle.id)

  const formattedRaffle = {
    ...raffle,
    entries: raffle.entries || [],
    gallery: raffle.gallery || [],
    specifications: raffle.specifications || [],
    rules: raffle.rules || [],
    endDate: raffle.endDate ? new Date(raffle.endDate).toISOString() : new Date().toISOString(),
  }

  return <ClientSide raffle={formattedRaffle as any} related={related} stores={stores} />
}