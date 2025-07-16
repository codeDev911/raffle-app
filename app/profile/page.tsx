import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Mail, Phone, MapPin, Calendar, Trophy, Gift, DollarSign, Star, Edit } from "lucide-react"
import Link from "next/link"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import { redirect } from "next/navigation"




async function getUserProfile() {
  const user = await getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const [userDetails, entries, payments, winners] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      include: {
        _count: {
          select: {
            entries: true,
            winners: true,
          },
        },
      },
    }),
    prisma.entry.findMany({
      where: { userId: user.id },
      include: {
        raffle: {
          select: {
            title: true,
            image: true,
            realPrice:true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.payment.findMany({
      where: { userId: user.id, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.winner.findMany({
      where: { userId: user.id },
      include: {
        raffle: {
          select: {
            title: true,
            image: true,
          },
        },
      },
      orderBy: { drawnAt: "desc" },
    }),
  ])

  const totalSpent = await prisma.payment.aggregate({
    where: { userId: user.id, status: "COMPLETED" },
    _sum: { amount: true },
  })

  const totalWinnings = await prisma.winner.aggregate({
    where: { userId: user.id },
    _sum: { prizeValue:true },
  })

  return {
    user: userDetails,
    entries,
    payments,
    winners,
    totalSpent: totalSpent._sum.amount || 0,
    totalWinnings: totalWinnings._sum.prizeValue || 0,
  }
}


export const metadata = {
  title: 'Your Profile - PakRaffle',
  description: 'Manage your profile, view your entries, and update your information on PakRaffle.',
  keywords: ['PakRaffle profile', 'user dashboard', 'my account', 'raffle entries'],
  robots: 'noindex, nofollow', // Optional: Hide profile pages from search engines
  openGraph: {
    title: 'Your Profile - PakRaffle',
    description: 'View and manage your PakRaffle account.',
    url: 'https://pakraffle.com/profile',
    siteName: 'PakRaffle',
    type: 'profile',
  },
  twitter: {
    card: 'summary',
    title: 'Your Profile - PakRaffle',
    description: 'View and manage your PakRaffle account.',
  },
  themeColor: '#10B981',
}

export default async function ProfilePage() {
  const { user, entries, payments, winners, totalSpent, totalWinnings } = await getUserProfile()

  if (!user) {
    redirect("/auth/login")
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarFallback className="bg-green-500 text-white text-2xl font-bold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{user.name}</h1>
          <p className="text-xl text-gray-600 mb-4">{user.email}</p>
          <div className="flex justify-center space-x-4">
            <Badge
              className={`rounded-2xl px-4 py-2 ${
                isVIP
                  ? "bg-yellow-100 text-yellow-700"
                  : user.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              {isVIP ? (
                <>
                  <Star className="w-4 h-4 mr-1" />
                  VIP Member
                </>
              ) : user.isActive ? (
                "Active Member"
              ) : (
                "Inactive"
              )}
            </Badge>
            <Badge className="bg-blue-100 text-blue-700 rounded-2xl px-4 py-2">
              Member since {formatDate(new Date(user.createdAt))}
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="rounded-2xl shadow-lg border-0 text-center">
            <CardContent className="p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gift className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{user._count.entries}</div>
              <div className="text-gray-600">Total Entries</div>
            </CardContent>
          </Card>

          {/* <Card className="rounded-2xl shadow-lg border-0 text-center">
            <CardContent className="p-6">
              <div className="bg-green-100 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(totalSpent)}</div>
              <div className="text-gray-600">Total Spent</div>
            </CardContent>
          </Card> */}

          <Card className="rounded-2xl shadow-lg border-0 text-center">
            <CardContent className="p-6">
              <div className="bg-yellow-100 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{user._count.winners}</div>
              <div className="text-gray-600">Prizes Won</div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg border-0 text-center">
            <CardContent className="p-6">
              <div className="bg-purple-100 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(totalWinnings)}</div>
              <div className="text-gray-600">Total Winnings</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-green-500" />
                  Personal Information
                </span>
                <Button asChild variant="outline" size="sm" className="rounded-2xl">
                  <Link href="/profile/settings">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              )}
              {user.city && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">City</p>
                    <p className="font-medium">{user.city}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{formatDate(new Date(user.createdAt))}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Entries */}
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Gift className="mr-2 h-5 w-5 text-green-500" />
                  Recent Entries
                </span>
                <Button asChild variant="outline" size="sm" className="rounded-2xl">
                  <Link href="/profile/entries">View All</Link>
                </Button>
              </CardTitle>
              <CardDescription>Your latest raffle entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
                    <div>
                      <h4 className="font-semibold text-sm">{entry.raffle.title}</h4>
                      <p className="text-xs text-gray-600">
                        {entry.quantity} entries • {formatCurrency(entry.totalCost)}
                      </p>
                    </div>
                    <Badge
                      className={`rounded-2xl text-xs ${
                        entry.raffle.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {entry.raffle.status}
                    </Badge>
                  </div>
                ))}
                {entries.length === 0 && <p className="text-gray-500 text-center py-4 text-sm">No entries yet</p>}
              </div>
            </CardContent>
          </Card>

          {/* Wins & Achievements */}
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                Wins & Achievements
              </CardTitle>
              <CardDescription>Your prizes and accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {winners.map((winner) => (
                  <div key={winner.id} className="p-3 bg-yellow-50 rounded-2xl border border-yellow-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-sm text-yellow-800">{winner.raffle.title}</h4>
                        <p className="text-xs text-yellow-600">{formatCurrency(winner.prizeValue)}</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-700 rounded-2xl text-xs">
                        {winner.verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                    <p className="text-xs text-yellow-600 mt-2">Won on {formatDate(new Date(winner.drawnAt))}</p>
                  </div>
                ))}
                {winners.length === 0 && (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No wins yet</p>
                    <p className="text-gray-400 text-xs">Keep entering raffles to win amazing prizes!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your account and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Button asChild className="bg-green-500 hover:bg-green-600 text-white rounded-2xl p-6 h-auto">
                  <Link href="/raffles" className="flex flex-col items-center space-y-2">
                    <Gift className="h-8 w-8" />
                    <span className="font-semibold">Browse Raffles</span>
                    <span className="text-sm opacity-90">Find new prizes to win</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-2xl p-6 h-auto">
                  <Link href="/profile/entries" className="flex flex-col items-center space-y-2">
                    <Trophy className="h-8 w-8" />
                    <span className="font-semibold">My Entries</span>
                    <span className="text-sm text-gray-600">View all your entries</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-2xl p-6 h-auto">
                  <Link href="/profile/settings" className="flex flex-col items-center space-y-2">
                    <User className="h-8 w-8" />
                    <span className="font-semibold">Account Settings</span>
                    <span className="text-sm text-gray-600">Update your information</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
