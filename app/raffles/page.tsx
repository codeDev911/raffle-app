import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Clock, Star, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"

async function getRaffles(searchParams: {
  category?: string
  status?: string
  search?: string
}) {
  const where: any = {}

  if (searchParams.category && searchParams.category !== "all") {
    where.category = searchParams.category
  }

  if (searchParams.status && searchParams.status !== "all") {
    where.status = searchParams.status.toUpperCase()
  }

  if (searchParams.search) {
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
    where: { status: "ACTIVE" },
  })

  return categories.map((c) => c.category)
}

export default async function RafflesPage({
  searchParams,
}: {
  searchParams: { category?: string; status?: string; search?: string }
}) {
  const [raffles, categories] = await Promise.all([getRaffles(searchParams), getCategories()])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Raffles</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose from our amazing collection of prizes and start winning today!
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search raffles..." className="pl-10 rounded-2xl border-gray-200" />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-full md:w-48 rounded-2xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-48 rounded-2xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="ending">Ending Soon</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Raffles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {raffles.map((raffle) => {
            const timeLeft = new Date(raffle.endDate).getTime() - new Date().getTime()
            const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24))

            return (
              <Card
                key={raffle.id}
                className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg rounded-2xl overflow-hidden"
              >
                <div className="relative">
                  <Image
                    src={raffle.image || "/placeholder.svg?height=300&width=400"}
                    alt={raffle.title}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {raffle.featured && (
                    <Badge className="absolute top-4 left-4 bg-green-500 text-white rounded-2xl">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <Badge className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 rounded-2xl">
                    {raffle.category}
                  </Badge>
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl px-3 py-1">
                    <div className="flex items-center text-sm font-medium">
                      <Clock className="w-3 h-3 mr-1 text-green-500" />
                      {daysLeft > 0 ? `${daysLeft} days` : "Ending soon"}
                    </div>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold">{raffle.title}</CardTitle>
                  <CardDescription className="text-gray-600">{raffle.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-green-500">{formatCurrency(raffle.price)}</div>
                    <div className="text-sm text-gray-500">per entry</div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button asChild className="w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl py-6">
                    <Link href={`/raffles/${raffle.id}`}>
                      <Trophy className="mr-2 h-4 w-4" />
                      Enter Raffle
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {raffles.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No raffles found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
