import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Trophy,
  Users,
  Clock,
  Star,
  Gift,
  Zap,
  Smartphone,
  CreditCard,
  CheckCircle,
  Shield,
  TrendingUp,
  Award,
  MapPin,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { TypewriterEffect } from "@/components/typewriter-effect"

async function getFeaturedRaffles() {
  return await prisma.raffle.findMany({
    where: {
      status: "ACTIVE",
      featured: true,
    },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { entries: true },
      },
    },
  })
}

async function getStats() {
  const [totalWinners, totalPrizeValue, activeRaffles, totalCustomers, totalEntries] = await Promise.all([
    prisma.winner.count(),
    prisma.winner.aggregate({
      _sum: { prizeValue: true },
    }),
    prisma.raffle.count({
      where: { status: "ACTIVE" },
    }),
    prisma.user.count({
      where: { role: "USER" },
    }),
    prisma.entry.count(),
  ])

  return {
    totalWinners,
    totalPrizeValue: totalPrizeValue._sum.prizeValue || 0,
    activeRaffles,
    totalCustomers,
    totalEntries,
  }
}

export default async function HomePage() {
  const [featuredRaffles, stats] = await Promise.all([getFeaturedRaffles(), getStats()])

  const typewriterPhrases = [
    `${stats.totalCustomers.toLocaleString()}+ Happy Customers`,
    `${stats.activeRaffles}+ Amazing Raffles`,
    "Electronics, Cars, Cash & More",
    `${stats.totalWinners.toLocaleString()}+ Lucky Winners`,
    "Across All Pakistan",
    `${formatCurrency(stats.totalPrizeValue)} in Prizes`,
    `${stats.totalEntries.toLocaleString()}+ Total Entries`,
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 py-24 px-4 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-emerald-300 rounded-full opacity-30 animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-green-400 rounded-full opacity-25 animate-pulse"></div>
          <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-emerald-200 rounded-full opacity-20 animate-bounce"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-12">
            {/* Badge */}
            <div className="flex justify-center">
              <Badge className="bg-green-500 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-lg">
                🇵🇰 Pakistan's #1 Raffle Platform
              </Badge>
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Win Amazing
                <span className="text-green-500"> Prizes</span>
                <br />
                <span className="text-4xl lg:text-5xl text-gray-700">
                  We Have{" "}
                  <TypewriterEffect
                    phrases={typewriterPhrases}
                    className="text-green-500 font-bold"
                    typingSpeed={80}
                    deletingSpeed={40}
                    pauseTime={2500}
                  />
                </span>
              </h1>
              <p className="text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
                Join thousands of Pakistanis winning incredible prizes through our fair and transparent raffle system.
                <br />
                <span className="text-green-600 font-semibold">Pay easily with EasyPaisa or JazzCash!</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white rounded-2xl px-10 py-8 text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
              >
                <Link href="/raffles">
                  <Gift className="mr-3 h-6 w-6" />
                  Browse Raffles
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-green-500 text-green-500 hover:bg-green-50 rounded-2xl px-10 py-8 text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Link href="#how-it-works">
                  <Zap className="mr-3 h-6 w-6" />
                  How It Works
                </Link>
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-16">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-green-500 mb-2">{stats.totalCustomers.toLocaleString()}+</div>
                  <div className="text-gray-600 font-medium">Happy Customers</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-blue-500 mb-2">{stats.totalWinners.toLocaleString()}+</div>
                  <div className="text-gray-600 font-medium">Lucky Winners</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="bg-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-purple-500 mb-2">{formatCurrency(stats.totalPrizeValue)}</div>
                  <div className="text-gray-600 font-medium">Prizes Won</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="bg-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-orange-500 mb-2">100%</div>
                  <div className="text-gray-600 font-medium">Fair & Transparent</div>
                </CardContent>
              </Card>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8">
              <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl inline-block shadow-xl">
                <div className="flex flex-wrap items-center justify-center gap-8 text-green-700">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-6 h-6" />
                    <span className="font-semibold">SSL Encrypted</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-semibold">PCI Compliant</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-6 h-6" />
                    <span className="font-semibold">100% Secure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Raffles */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-700 px-4 py-2 rounded-2xl mb-4">Featured Raffles</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Today's Hot Raffles</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't miss out on these amazing prizes! Limited entries available.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRaffles.map((raffle) => {
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
                    <Badge className="absolute top-4 left-4 bg-green-500 text-white rounded-2xl">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl px-3 py-1">
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

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {raffle.currentEntries}/{raffle.totalEntries}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(raffle.currentEntries / raffle.totalEntries) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {raffle._count.entries} people joined
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

          <div className="text-center mt-12">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-green-500 text-green-500 hover:bg-green-50 rounded-2xl px-8 py-6"
            >
              <Link href="/raffles">View All Raffles</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Winning is simple! Follow these easy steps to enter our raffles.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">1. Choose Your Prize</h3>
              <p className="text-gray-600">
                Browse our amazing collection of prizes and select the raffle you want to enter.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">2. Pay with EasyPaisa/JazzCash</h3>
              <p className="text-gray-600">Secure payment through Pakistan's most trusted mobile payment platforms.</p>
            </div>

            <div className="text-center group">
              <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">3. Win Amazing Prizes</h3>
              <p className="text-gray-600">
                Our transparent random selection ensures everyone has a fair chance to win!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted Payment Methods</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Pay securely with Pakistan's most popular and trusted mobile payment platforms
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* EasyPaisa */}
            <Card className="rounded-2xl shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="bg-blue-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Smartphone className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-600 mb-4">EasyPaisa</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Pakistan's leading mobile financial service with over 7 million active users. Instant payments,
                    maximum security, and 24/7 availability.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Instant Payment Processing</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Bank-Level Security</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Available 24/7</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* JazzCash */}
            <Card className="rounded-2xl shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="bg-orange-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <CreditCard className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-orange-600 mb-4">JazzCash</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Pakistan's most trusted digital wallet with advanced encryption and fraud protection. Fast,
                    reliable, and accepted nationwide.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Advanced Encryption</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Fraud Protection</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Nationwide Acceptance</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <div className="bg-green-50 p-6 rounded-2xl inline-block">
              <div className="flex items-center space-x-4 text-green-700">
                <Shield className="w-6 h-6" />
                <span className="font-semibold">SSL Encrypted • PCI Compliant • 100% Secure</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
