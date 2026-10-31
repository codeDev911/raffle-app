import { prisma } from "@/lib/prisma"
import { JsonLd } from "@/components/marketing/kit"
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

  return categories.map((c: any) => c.category)
}

export const metadata = {
  title: "Live Lucky Draws & Raffles in Pakistan — Win iPhone, Motorbikes, Cash | PakRaffle",
  description:
    "Browse every active raffle on PakRaffle — win iPhones, Honda motorbikes, gadgets and cash prizes from just Rs. 150 per ticket. 100% target-ticket draws, live-streamed and publicly audited across Pakistan.",
  keywords: [
    "lucky draw Pakistan",
    "online raffle Pakistan",
    "win iPhone lucky draw",
    "motorbike raffle Pakistan",
    "raffle tickets Pakistan online",
    "Prize draws Pakistan",
    "PakRaffle raffles",
    "live lucky draw results",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://pakraffle.com/raffles",
  },
  openGraph: {
    title: "Live Lucky Draws & Raffles in Pakistan — Win iPhone, Motorbikes, Cash | PakRaffle",
    description:
      "Join Pakistan's most transparent lucky draw platform. Verified live-streamed draws, guaranteed prize delivery, tickets from Rs. 150.",
    url: "https://pakraffle.com/raffles",
    siteName: "PakRaffle",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Lucky Draws & Raffles in Pakistan | PakRaffle",
    description: "Win iPhones, motorbikes, gadgets and cash — draws live-streamed and publicly audited. Tickets from Rs. 150.",
  },
}

export default async function RafflesPage({
  searchParams,
}: {
  searchParams?: { category?: string; status?: string; search?: string }
}) {
  const [raffles, categories] = await Promise.all([getRaffles(searchParams), getCategories()])

  // Normalize dates to ISO strings for serialization to client component
  const serializedRaffles = raffles.map((r: any) => ({
    ...r,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    endDate: r.endDate ? new Date(r.endDate).toISOString() : new Date().toISOString(),
  }))

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "PakRaffle",
            url: "https://pakraffle.com",
            inLanguage: "en-PK",
            publisher: { "@id": "https://pakraffle.com/#organization" },
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://pakraffle.com/#organization",
            name: "PakRaffle",
            url: "https://pakraffle.com",
            description: "Pakistan's verified digital lucky draw platform with 100% target-ticket draws and live-streamed winner selection.",
            areaServed: "PK",
            foundingLocation: { "@type": "Place", name: "Pakistan" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://pakraffle.com" },
              { "@type": "ListItem", position: 2, name: "Raffles", item: "https://pakraffle.com/raffles" },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Active Lucky Draws & Raffles in Pakistan",
            itemListElement: raffles.map((r: any, i: number) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://pakraffle.com/raffles/${r.id}`,
              name: r.title,
            })),
          },
        ]}
      />
      <RafflesClient
        initialRaffles={serializedRaffles as any}
        categories={categories}
      />
    </>
  )
}
