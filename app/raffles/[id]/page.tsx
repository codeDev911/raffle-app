import { Metadata } from "next"
import ClientSide from "./ClientSide"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

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

  const formattedRaffle = {
    ...raffle,
    entries: raffle.entries || [],
    gallery: raffle.gallery || [],
    specifications: raffle.specifications || [],
    rules: raffle.rules || [],
    endDate: raffle.endDate ? new Date(raffle.endDate).toISOString() : new Date().toISOString(),
  }

  return <ClientSide raffle={formattedRaffle as any} related={related} />
}