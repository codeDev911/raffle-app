import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, CreditCard, Trophy, Calendar, Gift, Crown, Trash, PenIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils"
import { notFound } from "next/navigation"
import { WinnerSelectionDialog } from "@/components/winner-selection-dialog"

async function getRaffleDetails(id: string) {
  const raffle = await prisma.raffle.findUnique({
    where: { id },
    include: {
      entries: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              city: true,
            },
          },
          payment: {
            select: {
              status: true,
              method: true,
              amount: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      winners: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              city: true,
            },
          },
        },
      },
      _count: {
        select: {
          entries: true,
          winners: true,
        },
      },
    },
  })

  if (!raffle) {
    notFound()
  }

  // Calculate statistics
  const totalRevenue = raffle.entries
    .filter((entry) => entry.payment?.status === "COMPLETED")
    .reduce((sum, entry) => sum + (entry.payment?.amount || 0), 0)

  const totalEntries = raffle.entries.reduce((sum, entry) => sum + entry.quantity, 0)

  // Get unique customers
  const uniqueCustomers = new Set(raffle.entries.map((entry) => entry.userId)).size

  // Get payments data
  const payments = raffle.entries
    .filter((entry) => entry.payment)
    .map((entry) => ({
      id: entry.id,
      user: entry.user,
      amount: entry.payment!.amount,
      status: entry.payment!.status,
      method: entry.payment!.method,
      createdAt: entry.payment!.createdAt,
      entries: entry.quantity,
    }))

  return {
    raffle,
    totalRevenue,
    totalEntries,
    uniqueCustomers,
    payments,
  }
}

export default async function AdminRaffleDetailPage({ params }: { params: { id: string } }) {
  const { raffle, totalRevenue, totalEntries, uniqueCustomers, payments } = await getRaffleDetails(params.id)

  const hasWinner = raffle.winners.length > 0
  const canSelectWinner = raffle.status === "ACTIVE" && totalEntries > 0 && !hasWinner

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button asChild variant="ghost" className="rounded-2xl">
          <Link href="/admin/raffles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Raffles
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{raffle.title}</h1>
          <p className="text-gray-600 mt-2">Detailed raffle information and management</p>
        </div>
        <Button variant={"outline"}>
           <Link className="flex items-center space-x-2" href={`/admin/raffles/${raffle.id}/edit`}>
            <PenIcon />
            <p>Edit</p>
            </Link>
        </Button>
        <Button variant={"destructive"}>
            <Link className="flex items-center space-x-2" href={`/admin/raffles/${raffle.id}/delete`}>
                <Trash />
                <p>Delete</p>
            </Link>
        </Button>
        {hasWinner && (
          <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl">
            <Link href={`/admin/raffles/${raffle.id}/winner`}>
              <Crown className="mr-2 h-4 w-4" />
              View Winner
            </Link>
          </Button>
        )}
      </div>

      {/* Raffle Overview */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl shadow-lg border-0">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <Image
                    src={raffle.image || "/placeholder.svg?height=300&width=400"}
                    alt={raffle.title}
                    width={400}
                    height={300}
                    className="w-full rounded-2xl shadow-md"
                  />
                </div>
                <div className="md:w-2/3 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{raffle.title}</h2>
                    <p className="text-gray-600 mb-4">{raffle.description}</p>
                    {raffle.longDescription && <p className="text-gray-600 text-sm">{raffle.longDescription}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-semibold">{raffle.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
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
                    <div>
                      <p className="text-sm text-gray-500">Price per Entry</p>
                      <p className="font-semibold text-green-600">{formatCurrency(raffle.price)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">End Date</p>
                      <p className="font-semibold">{formatDate(new Date(raffle.endDate))}</p>
                    </div>
                  </div>

                  {raffle.featured && (
                    <Badge className="bg-yellow-100 text-yellow-700 rounded-2xl">Featured Raffle</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats & Actions */}
        <div className="space-y-6">
          {/* Statistics */}
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-red-500" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Entries</span>
                <span className="text-2xl font-bold text-blue-600">{totalEntries}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Max Entries</span>
                <span className="text-xl font-semibold">{raffle.totalEntries}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Unique Customers</span>
                <span className="text-xl font-semibold">{uniqueCustomers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Revenue</span>
                <span className="text-xl font-bold text-green-600">{formatCurrency(totalRevenue)}</span>
              </div>

              <div className="pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{Math.round((totalEntries / raffle.totalEntries) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(totalEntries / raffle.totalEntries) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Winner Selection */}
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="mr-2 h-5 w-5 text-yellow-500" />
                Winner Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasWinner ? (
                <div className="text-center space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-2xl">
                    <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                    <p className="font-semibold text-yellow-800">Winner Selected!</p>
                    <p className="text-sm text-yellow-600">{raffle.winners[0].user.name}</p>
                  </div>
                  <Button asChild className="w-full bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl">
                    <Link href={`/admin/raffles/${raffle.id}/winner`}>View Winner Details</Link>
                  </Button>
                </div>
              ) : canSelectWinner ? (
                <div className="text-center space-y-4">
                  <div className="bg-green-50 p-4 rounded-2xl">
                    <Gift className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-green-800">Ready to Draw!</p>
                    <p className="text-sm text-green-600">{totalEntries} entries available</p>
                  </div>
                  <WinnerSelectionDialog raffleId={raffle.id} totalEntries={totalEntries} />
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="font-semibold text-gray-600">Not Ready</p>
                    <p className="text-sm text-gray-500">
                      {totalEntries === 0 ? "No entries yet" : "Raffle not active"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payments Table */}
      <Card className="rounded-2xl shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-red-500" />
            Payments ({payments.length})
          </CardTitle>
          <CardDescription>All payments for this raffle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-gray-50 p-4 rounded-2xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{payment.user.name}</h4>
                      <Badge
                        className={`rounded-2xl ${
                          payment.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : payment.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {payment.status}
                      </Badge>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <div className="font-medium">{payment.user.email}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <div className="font-medium text-green-600">{formatCurrency(payment.amount)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Method:</span>
                        <div className="font-medium">{payment.method}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <div className="font-medium">{formatDateTime(new Date(payment.createdAt))}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{payment.entries}</div>
                    <div className="text-sm text-gray-500">entries</div>
                  </div>
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No payments yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Entries Table */}
      <Card className="rounded-2xl shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-red-500" />
            Customer Entries ({raffle.entries.length})
          </CardTitle>
          <CardDescription>All customers who entered this raffle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {raffle.entries.map((entry) => (
              <div key={entry.id} className="bg-gray-50 p-4 rounded-2xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{entry.user.name}</h4>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{entry.quantity}</div>
                        <div className="text-sm text-gray-500">entries</div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <div className="font-medium">{entry.user.email}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <div className="font-medium">{entry.user.phone || "N/A"}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">City:</span>
                        <div className="font-medium">{entry.user.city || "N/A"}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Entry Date:</span>
                        <div className="font-medium">{formatDateTime(new Date(entry.createdAt))}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {raffle.entries.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No entries yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
