import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Gift, ArrowLeft, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import { redirect } from "next/navigation"

async function getUserEntries() {
  const user = await getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const entries = await prisma.entry.findMany({
    where: { userId: user.id },
    include: {
      raffle: {
        select: {
          title: true,
          description: true,
          image: true,
          status: true,
          endDate: true,
          price: true,
        },
      },
      payment: {
        select: {
          status: true,
          method: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return { user, entries }
}

export default async function UserEntriesPage() {
  const { user, entries } = await getUserEntries()

  const totalEntries = entries.reduce((sum, entry) => sum + entry.quantity, 0)
  const totalSpent = entries.reduce((sum, entry) => sum + entry.totalCost, 0)
  const activeEntries = entries.filter((entry) => entry.raffle.status === "ACTIVE").length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button asChild variant="ghost" className="rounded-2xl">
            <Link href="/profile">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Raffle Entries</h1>
            <p className="text-gray-600 mt-2">Track all your raffle participations</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-2xl shadow-lg border-0 text-center">
            <CardContent className="p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gift className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{totalEntries}</div>
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
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{activeEntries}</div>
              <div className="text-gray-600">Active Entries</div>
            </CardContent>
          </Card>
        </div>

        {/* Entries List */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="mr-2 h-5 w-5 text-green-500" />
              All Entries
            </CardTitle>
            <CardDescription>Complete history of your raffle entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-gray-50 p-6 rounded-2xl hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="w-full lg:w-48 h-32">
                      <Image
                        src={entry.raffle.image || "/placeholder.svg?height=128&width=192"}
                        alt={entry.raffle.title}
                        width={192}
                        height={128}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{entry.raffle.title}</h3>
                          <p className="text-gray-600">{entry.raffle.description}</p>
                        </div>
                        <Badge
                          className={`rounded-2xl ${
                            entry.raffle.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : entry.raffle.status === "COMPLETED"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {entry.raffle.status}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Entries</p>
                          <p className="font-semibold">{entry.quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Cost</p>
                          <p className="font-semibold text-green-600">{formatCurrency(entry.totalCost)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Entry Date</p>
                          <p className="font-semibold">{formatDate(new Date(entry.createdAt))}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Draw Date</p>
                          <p className="font-semibold">{formatDate(new Date(entry.raffle.endDate))}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <Badge
                            className={`rounded-2xl ${
                              entry.payment?.status === "COMPLETED"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            Payment: {entry.payment?.status || "Pending"}
                          </Badge>
                          {entry.payment?.method && (
                            <span className="text-sm text-gray-600">via {entry.payment.method}</span>
                          )}
                        </div>
                        <Button asChild variant="outline" size="sm" className="rounded-2xl">
                          <Link href={`/raffles/${entry.raffleId}`}>View Raffle</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {entries.length === 0 && (
              <div className="text-center py-12">
                <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No entries yet</h3>
                <p className="text-gray-600 mb-6">Start entering raffles to win amazing prizes!</p>
                <Button asChild className="bg-green-500 hover:bg-green-600 text-white rounded-2xl">
                  <Link href="/raffles">Browse Raffles</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
