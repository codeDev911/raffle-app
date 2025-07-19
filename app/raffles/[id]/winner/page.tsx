import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Crown, Trophy, Mail, Phone, MapPin, Calendar, Gift, CheckCircle, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils"
import { notFound } from "next/navigation"

async function getWinnerDetails(raffleId: string) {
  const winner = await prisma.winner.findFirst({
    where: { raffleId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          createdAt: true,
        },
      },
      raffle: {
        select: {
          title: true,
          description: true,
          image: true,
          price: true,
          totalEntries: true,
          category: true,
        },
      },
    },
  })

  if (!winner) {
    notFound()
  }

  // Get user's total entries for this raffle
  const userEntries = await prisma.entry.findMany({
    where: {
      userId: winner.userId,
      raffleId: winner.raffleId,
    },
  })

  const totalUserEntries = userEntries.reduce((sum, entry) => sum + entry.quantity, 0)

  // Get user's total spending
  const userPayments = await prisma.payment.aggregate({
    where: {
      userId: winner.userId,
      status: "COMPLETED",
    },
    _sum: { amount: true },
  })

  const totalSpent = userPayments._sum.amount || 0

  // Get user's total wins
  const userWins = await prisma.winner.count({
    where: { userId: winner.userId },
  })

  return {
    winner,
    totalUserEntries,
    totalSpent,
    userWins,
  }
}

export default async function WinnerDetailPage({ params }: { params: { id: string } }) {
  const { winner, totalUserEntries, totalSpent, userWins } = await getWinnerDetails(params.id)


  function maskEmail(email:string) {
    const [user, domain] = email.split("@");
    const visible = user.slice(0, 2);
    const masked = "*".repeat(user.length - 2);
    return `${visible}${masked}@${domain}`;
    }

    function maskPhone(phone:any) {
  const visibleStart = phone.slice(0, 3);
  const visibleEnd = phone.slice(-1);
  const masked = "*".repeat(phone.length - 4); // 3 + 1 = 4
  return `${visibleStart}${masked}${visibleEnd}`;
}

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const isVIP = totalSpent >= 500000 // 5000 PKR threshold

  return (
    <div className="space-y-8 py-16 max-w-7xl mx-auto">
     

      {/* Winner Announcement */}
      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-yellow-400">
                  <AvatarFallback className="bg-yellow-500 text-white text-2xl font-bold">
                    {getInitials(winner.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-2">
                  <Crown className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-yellow-800">Congratulations!</h2>
              <h3 className="text-2xl font-semibold text-gray-900">{winner.user.name}</h3>
              <p className="text-lg text-gray-600">Winner of {winner.raffle.title}</p>
            </div>

            <div className="flex justify-center space-x-4">
              <Badge className="bg-yellow-100 text-yellow-700 rounded-2xl px-4 py-2 text-lg">
                <Trophy className="w-4 h-4 mr-1" />
                Prize Value: {formatCurrency(winner.prizeValue)}
              </Badge>
              {winner.verified && (
                <Badge className="bg-green-100 text-green-700 rounded-2xl px-4 py-2 text-lg">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Verified Winner
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Winner Information */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="mr-2 h-5 w-5 text-yellow-500" />
              Winner Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{maskEmail(winner.user.email)}</p>
              </div>
            </div>
            {winner.user.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{maskPhone(winner.user.phone)}</p>
                </div>
              </div>
            )}
            {winner.user.city && (
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium">{winner.user.city}</p>
                </div>
              </div>
            )}
            {/* <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">{formatDate(new Date(winner.user.createdAt))}</p>
              </div>
            </div> */}

            {isVIP && (
              <div className="bg-yellow-50 p-3 rounded-2xl border border-yellow-200">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold text-yellow-800">VIP Customer</span>
                </div>
                <p className="text-sm text-yellow-600 mt-1">High-value customer with multiple purchases</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prize Information */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="mr-2 h-5 w-5 text-green-500" />
              Prize Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Image
                src={winner.raffle.image || "/placeholder.svg?height=200&width=300"}
                alt={winner.raffle.title}
                width={300}
                height={200}
                className="w-full h-40 object-cover rounded-2xl mb-4"
              />
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{winner.raffle.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{winner.raffle.description}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Category</span>
                <span className="font-medium">{winner.raffle.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Prize Value</span>
                <span className="font-bold text-green-600">{formatCurrency(winner.prizeValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Won On</span>
                <span className="font-medium">{formatDateTime(new Date(winner.drawnAt))}</span>
              </div>
              {winner.deliveredAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivered On</span>
                  <span className="font-medium text-green-600">{formatDateTime(new Date(winner.deliveredAt))}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Statistics */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-blue-500" />
              Customer Stats
            </CardTitle>
          </CardHeader> 
          <CardContent className="space-y-4">
              <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-1">{totalUserEntries}</div>
                          <div className="text-gray-600">Entries in this Raffle</div>
                        </div>
            
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600 mb-1">{formatCurrency(totalSpent)}</div>
                          <div className="text-gray-600">Total Spent</div>
                        </div>
            
                        <div className="text-center">
                          <div className="text-3xl font-bold text-yellow-600 mb-1">{userWins}</div>
                          <div className="text-gray-600">Total Wins</div>
                        </div>
            
                        <div className="bg-blue-50 p-4 rounded-2xl">
                          <h4 className="font-semibold text-blue-800 mb-2">Win Rate</h4>
                          <p className="text-sm text-blue-600">
                            This customer has won {userWins} out of their total raffle participations, showing{" "}
                            {userWins > 1 ? "excellent" : "good"} luck!
                          </p>
                        </div>
          </CardContent>
        </Card>
      </div>

    
    </div>
  )
}
