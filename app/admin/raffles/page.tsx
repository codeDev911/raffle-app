import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Plus, Search, Edit, Trophy, Calendar, Users, DollarSign } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import { DeleteRaffleButton } from "@/components/delete-raffle-button"
import { unstable_noStore as noStore } from "next/cache"
import { RafflesClientView } from "./RafflesClientView"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function getRaffles() {
  noStore()
  return await prisma.raffle.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      entries: true,
      _count: {
        select: { entries: true },
      },
    },
  })
}

export default async function AdminRafflesPage() {
  const raffles = await getRaffles()

  const formattedRaffles = raffles.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    image: r.image,
    price: r.price,
    realPrice: r.realPrice,
    totalEntries: r.totalEntries,
    currentEntries: r.currentEntries,
    status: r.status,
    category: r.category,
    endDate: r.endDate.toISOString(),
    createdAt: r.createdAt.toISOString(),
    totalRevenue: r.entries.reduce((sum, e) => sum + e.totalCost, 0),
    entriesCount: r._count.entries,
  }))

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Raffles Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage live campaigns, inventory, ticket caps & draw status
          </p>
        </div>

        <Button asChild className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs min-h-[40px]">
          <Link href="/admin/raffles/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Raffle
          </Link>
        </Button>
      </div>

      {/* Interactive client filter and cards grid */}
      <RafflesClientView initialRaffles={formattedRaffles} />
    </div>
  )
}
