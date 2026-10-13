import { prisma } from "@/lib/prisma"
import { RafflesClient } from "./RafflesClient"

async function getRaffles(searchParams?: {
  category?: string
  status?: string
  search?: string
}) {
  const where: any = {}

  if (searchParams?.category && searchParams.category !== "all") {
    where.category = searchParams.category
  }

  if (searchParams?.status && searchParams.status !== "all") {
    where.status = searchParams.status.toUpperCase()
  }

  if (searchParams?.search) {
    where.OR = [
      { title: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
    ]
  }

  return await prisma.raffle.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { entries: true },
      },
    },
  })
}

async function getCategories() {
  const categories = await prisma.raffle.groupBy({
    by: ["category"],
  })

  return categories.map((c) => c.category)
}

export const metadata = {
  title: "All Lucky Draws & Raffles - PakRaffle",
  description: "Join Pakistan’s most transparent lucky draw platform. Win iPhones, motorbikes, gadgets, and cash grand prizes starting from Rs. 150.",
  keywords: ["PakRaffle", "raffles", "win prizes", "iPhone draw", "online lucky draw Pakistan", "lucky draw"],
  robots: "index, follow",
  openGraph: {
    title: "All Lucky Draws & Raffles - PakRaffle",
    description: "Don't miss our ongoing lucky draws with verified public live streaming!",
    url: "https://pakraffle.com/raffles",
    siteName: "PakRaffle",
    type: "website",
  },
}

export default async function RafflesPage({
  searchParams,
}: {
  searchParams?: { category?: string; status?: string; search?: string }
}) {
  const [raffles, categories] = await Promise.all([getRaffles(searchParams), getCategories()])

  // Normalize dates to ISO strings for serialization to client component
  const serializedRaffles = raffles.map((r) => ({
    ...r,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    endDate: r.endDate ? new Date(r.endDate).toISOString() : new Date().toISOString(),
  }))

  return (
    <RafflesClient
      initialRaffles={serializedRaffles as any}
      categories={categories}
    />
  )
}
