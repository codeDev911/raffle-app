import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Calendar, MapPin, CheckCircle, Star } from "lucide-react"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"

async function getWinners() {
  return await prisma.winner.findMany({
    include: {
      user: {
        select: {
          name: true,
          city: true,
        },
      },
      raffle: {
        select: {
          title: true,
        },
      },
    },
    orderBy: { drawnAt: "desc" },
  })
}

async function getStats() {
  const [totalWinners, totalPrizeValue, citiesCount] = await Promise.all([
    prisma.winner.count(),
    prisma.winner.aggregate({
      _sum: { prizeValue: true },
    }),
    prisma.user.groupBy({
      by: ["city"],
      where: {
        city: { not: null },
        winners: { some: {} },
      },
    }),
  ])

  return {
    totalWinners,
    totalPrizeValue: totalPrizeValue._sum.prizeValue || 0,
    citiesCount: citiesCount.length,
    happyFamilies: Math.floor(totalWinners * 0.85), // Estimate
  }
}

export default async function WinnersPage() {
  const [winners, stats] = await Promise.all([getWinners(), getStats()])

  const statsData = [
    { label: "Total Winners", value: stats.totalWinners.toLocaleString(), icon: Trophy },
    { label: "Prizes Delivered", value: formatCurrency(stats.totalPrizeValue), icon: CheckCircle },
    { label: "Cities Covered", value: `${stats.citiesCount}+`, icon: MapPin },
    { label: "Happy Families", value: `${stats.happyFamilies.toLocaleString()}+`, icon: Star },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Happy Winners</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real people, real prizes, real deliveries. See the proof of our commitment to transparency and fairness.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {statsData.map((stat, index) => (
            <Card key={index} className="text-center rounded-2xl shadow-lg border-0 bg-white">
              <CardContent className="p-6">
                <div className="bg-green-100 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Winners */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Winners</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {winners
              .filter((winner) => winner.featured)
              .map((winner) => (
                <Card key={winner.id} className="rounded-2xl shadow-xl border-0 overflow-hidden">
                  <div className="relative">
                    <Image
                      src={winner.proofImage || "/placeholder.svg?height=400&width=600"}
                      alt={`${winner.user.name} with ${winner.raffle.title}`}
                      width={600}
                      height={400}
                      className="w-full h-64 object-cover"
                    />
                    <Badge className="absolute top-4 left-4 bg-green-500 text-white rounded-2xl">
                      <Star className="w-3 h-3 mr-1" />
                      Featured Winner
                    </Badge>
                    {winner.verified && (
                      <Badge className="absolute top-4 right-4 bg-blue-500 text-white rounded-2xl">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Image
                        src="/placeholder.svg?height=80&width=80"
                        alt={winner.user.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-2xl object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{winner.user.name}</h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {winner.user.city}
                        </div>
                        <div className="flex items-center text-gray-600 mb-3">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(new Date(winner.drawnAt))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-500">{formatCurrency(winner.prizeValue)}</div>
                        <div className="text-sm text-gray-500">Prize Value</div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-2xl mt-4">
                      <h4 className="font-semibold text-green-800 mb-2">Won: {winner.raffle.title}</h4>
                      {winner.testimonial && <p className="text-green-700 italic">"{winner.testimonial}"</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* All Winners Grid */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Recent Winners</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {winners
              .filter((winner) => !winner.featured)
              .map((winner) => (
                <Card
                  key={winner.id}
                  className="rounded-2xl shadow-lg border-0 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative">
                    <Image
                      src={winner.proofImage || "/placeholder.svg?height=250&width=400"}
                      alt={`${winner.user.name} with ${winner.raffle.title}`}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover"
                    />
                    {winner.verified && (
                      <Badge className="absolute top-4 right-4 bg-blue-500 text-white rounded-2xl">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Image
                        src="/placeholder.svg?height=50&width=50"
                        alt={winner.user.name}
                        width={50}
                        height={50}
                        className="w-12 h-12 rounded-2xl object-cover"
                      />
                      <div>
                        <h3 className="font-bold text-gray-900">{winner.user.name}</h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-3 h-3 mr-1" />
                          {winner.user.city}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Prize:</span>
                        <span className="font-semibold">{winner.raffle.title}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Value:</span>
                        <span className="font-bold text-green-500">{formatCurrency(winner.prizeValue)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Won on:</span>
                        <span className="text-sm">{formatDate(new Date(winner.drawnAt))}</span>
                      </div>
                    </div>

                    {winner.testimonial && (
                      <div className="bg-gray-50 p-3 rounded-2xl mt-4">
                        <p className="text-sm text-gray-700 italic">"{winner.testimonial}"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {winners.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No winners yet</h3>
            <p className="text-gray-600">Be the first to win amazing prizes!</p>
          </div>
        )}

        {/* Trust Section */}
        <div className="mt-20 text-center">
          <Card className="rounded-2xl shadow-lg border-0 bg-green-50 border-green-200">
            <CardContent className="p-12">
              <Trophy className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-green-800 mb-4">Your Turn to Win!</h2>
              <p className="text-xl text-green-700 mb-8 max-w-2xl mx-auto">
                Join thousands of happy winners across Pakistan. Every raffle is fair, transparent, and guaranteed to
                deliver.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Badge className="bg-green-500 text-white px-6 py-3 rounded-2xl text-lg">✅ 100% Genuine Winners</Badge>
                <Badge className="bg-green-500 text-white px-6 py-3 rounded-2xl text-lg">✅ Fast Prize Delivery</Badge>
                <Badge className="bg-green-500 text-white px-6 py-3 rounded-2xl text-lg">
                  ✅ Verified Testimonials
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
