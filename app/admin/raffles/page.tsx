import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Gift, Plus, Search, Edit, Trophy, Calendar, Users, DollarSign } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import { DeleteRaffleButton } from "@/components/delete-raffle-button"

async function getRaffles() {
  return await prisma.raffle.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { entries: true },
      },
    },
  })
}

export default async function AdminRafflesPage() {
  const raffles = await getRaffles()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Raffles Management</h1>
          <p className="text-gray-600 mt-2">Manage all your raffle items and track their performance</p>
        </div>
        <Button asChild className="bg-red-500 hover:bg-red-600 text-white rounded-2xl">
          <Link href="/admin/raffles/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Raffle
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search raffles..." className="pl-10 rounded-2xl" />
              </div>
            </div>
            <div className="flex gap-2">
              {["All", "Active", "Completed", "Draft"].map((status) => (
                <Button key={status} variant="outline" className="rounded-2xl">
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Raffles Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {raffles.map((raffle) => {
          const revenue = (raffle.price * raffle.currentEntries) / 100
          return (
            <Card key={raffle.id} className="rounded-2xl shadow-lg border-0 overflow-hidden">
              <div className="flex">
                <div className="w-1/3">
                  <Image
                    src={raffle.image || "/placeholder.svg?height=200&width=300"}
                    alt={raffle.title}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Link href={`/admin/raffles/${raffle.id}`} className="hover:text-green-600 transition-colors">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:underline">{raffle.title}</h3>
                      </Link>
                      <p className="text-gray-600 text-sm">{raffle.description}</p>
                    </div>
                    <Badge
                      className={`rounded-2xl ${
                        raffle.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : raffle.status === "COMPLETED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {raffle.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-600">Price per entry</p>
                        <p className="font-semibold">{formatCurrency(raffle.price)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600">Entries</p>
                        <p className="font-semibold">
                          {raffle.currentEntries}/{raffle.totalEntries}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-600">Revenue</p>
                        <p className="font-semibold text-green-600">₹{revenue.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-600">End Date</p>
                        <p className="font-semibold">{formatDate(new Date(raffle.endDate))}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(raffle.currentEntries / raffle.totalEntries) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex space-x-2">
                      <Button asChild variant="outline" size="sm" className="rounded-2xl">
                        <Link href={`/admin/raffles/${raffle.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteRaffleButton raffleId={raffle.id} />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {raffles.length === 0 && (
        <Card className="rounded-2xl shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No raffles found</h3>
            <p className="text-gray-600 mb-6">Create your first raffle to get started</p>
            <Button asChild className="bg-red-500 hover:bg-red-600 text-white rounded-2xl">
              <Link href="/admin/raffles/create">
                <Plus className="mr-2 h-4 w-4" />
                Create New Raffle
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
