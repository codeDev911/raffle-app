import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, CreditCard, Trophy, Calendar, Gift, Crown, PenIcon, XCircleIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils"
import { notFound } from "next/navigation"
import { WinnerSelectionDialog } from "@/components/winner-selection-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RealVsAproxModal } from "@/components/real-vs-aprox-modal"

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
  const totalRevenue = raffle.entries.reduce((sum,entry) => sum+ entry.totalCost,0)
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

  // Calculate expenses (stored in PKR in expenses array, so convert to paisa for calculation with price/realPrice/totalCost)
  const expensesList: { id?: string; description: string; amount: number }[] = Array.isArray(
    (raffle as any).expenses
  )
    ? (raffle as any).expenses
    : []
  const totalExpensesPKR = expensesList.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  )
  const totalExpensesPaisa = totalExpensesPKR * 100
  const totalCostPaisa = raffle.realPrice + totalExpensesPaisa

  // Calculate approximation data
  const aproxRevenue = raffle.price * raffle.totalEntries
  const aproxProfit = aproxRevenue - totalCostPaisa
  const aproxPercentage =
    totalCostPaisa > 0
      ? Math.ceil(((aproxRevenue - totalCostPaisa) / totalCostPaisa) * 100)
      : 0

  // Calculate real data
  const realProfit = totalRevenue - totalCostPaisa
  const realPercentage =
    totalCostPaisa > 0
      ? Math.ceil(((totalRevenue - totalCostPaisa) / totalCostPaisa) * 100)
      : 0

  return {
    raffle,
    totalRevenue,
    totalEntries,
    uniqueCustomers,
    payments,
    expensesList,
    totalExpensesPKR,
    totalExpensesPaisa,
    totalCostPaisa,
    aproxRevenue,
    aproxProfit,
    aproxPercentage,
    realProfit,
    realPercentage,
  }
}

export default async function AdminRaffleDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const resolvedParams = await Promise.resolve(params)
  const {
    raffle,
    totalRevenue,
    totalEntries,
    uniqueCustomers,
    payments,
    expensesList,
    totalExpensesPKR,
    totalExpensesPaisa,
    totalCostPaisa,
    aproxRevenue,
    aproxProfit,
    aproxPercentage,
    realProfit,
    realPercentage,
  } = await getRaffleDetails(resolvedParams.id)

  const hasWinner = raffle.winners.length > 0
  const canSelectWinner = raffle.status === "ACTIVE" && totalEntries > 0 && !hasWinner

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <Button asChild variant="outline" size="sm" className="rounded-xl min-h-[38px]">
        <Link href="/admin/raffles">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Raffles
        </Link>
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">{raffle.title}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Detailed raffle information and financial analytics</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasWinner ? (
            <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs min-h-[38px]">
              <Link href={`/admin/raffles/${raffle.id}/winner`}>
                <Crown className="mr-1.5 h-4 w-4" />
                View Winner
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              disabled
              className="cursor-not-allowed bg-slate-100 text-slate-400 rounded-xl min-h-[38px]"
            >
              <div>
                <XCircleIcon className="mr-1.5 h-4 w-4" />
                No Winner Yet
              </div>
            </Button>
          )}

          <Button asChild variant="outline" className="rounded-xl min-h-[38px]">
            <Link href={`/admin/raffles/${raffle.id}/edit`} className="flex items-center gap-1.5">
              <PenIcon className="h-4 w-4" />
              <span>Edit</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Raffle Overview */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Calculated */}
          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-green-500" />
                  <div>
                    <CardTitle>Revenue Calculated</CardTitle>
                    <CardDescription>Financial breakdown and profit analysis for this raffle</CardDescription>
                  </div>
                </div>
                <RealVsAproxModal
                  realData={{
                    revenue: totalRevenue,
                    profit: realProfit,
                    percentage: realPercentage,
                    entries: totalEntries,
                  }}
                  aproxData={{
                    revenue: aproxRevenue,
                    profit: aproxProfit,
                    percentage: aproxPercentage,
                    entries: raffle.totalEntries,
                  }}
                  originalPrice={raffle.realPrice}
                  pricePerEntry={raffle.price}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-green-50 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-green-600 font-medium">Total Revenue</span>
                    <CreditCard className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-xl font-bold text-green-700">{formatCurrency(totalRevenue)}</div>
                  <div className="text-xs text-green-600 mt-1">From all actual entries</div>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-600 font-medium">Net Real Profit</span>
                    <Trophy className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-xl font-bold text-blue-700">{formatCurrency(realProfit)}</div>
                  <div className="text-xs text-blue-600 mt-1">After prize & expenses</div>
                </div>

                <div className="bg-amber-50 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-amber-600 font-medium">Total Expenses</span>
                    <Gift className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-xl font-bold text-amber-700">{formatCurrency(totalExpensesPaisa)}</div>
                  <div className="text-xs text-amber-600 mt-1">
                    {expensesList.length} expense item{expensesList.length === 1 ? "" : "s"} deducted
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-orange-600 font-medium">Total Outflow (Costs)</span>
                    <Calendar className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="text-xl font-bold text-orange-700">{formatCurrency(totalCostPaisa)}</div>
                  <div className="text-xs text-orange-600 mt-1">Prize ({formatCurrency(raffle.realPrice)}) + Expenses</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col p-3 px-6 w-full items-start justify-start gap-4">
              <div className="bg-gray-100 w-full p-4 rounded-2xl">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Projections & Approximation Analysis</h2>
                  <p className="text-gray-500 text-xs">Projected revenue, prize cost, campaign expenses, and calculated net profit:</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-3">
                  <div className="flex flex-col space-y-1">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Gross Projected Revenue</h3>
                    <p className="text-base font-bold text-gray-900">{formatCurrency(aproxRevenue)}</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Prize Base Cost</h3>
                    <p className="text-base font-bold text-gray-700">{formatCurrency(raffle.realPrice)}</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Campaign Expenses</h3>
                    <p className="text-base font-bold text-amber-700">{formatCurrency(totalExpensesPaisa)}</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Net Projected Profit</h3>
                    <p className={`text-base font-black ${aproxProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                      {formatCurrency(aproxProfit)}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Earning / ROI %</h3>
                    <p className={`text-base font-bold ${aproxPercentage >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {aproxPercentage >= 0 ? "+" : ""}{aproxPercentage}%
                    </p>
                  </div>
                </div>

                {expensesList.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Itemized Expenses Deducted ({expensesList.length}):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {expensesList.map((exp, idx) => (
                        <div
                          key={exp.id || idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 shadow-2xs"
                        >
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{exp.description}:</span>
                          <span className="font-mono font-bold text-amber-900">
                            Rs. {Number(exp.amount).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
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

      {/* Payments and Entries Tabs */}
      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl">
          <TabsTrigger value="payments" className="rounded-2xl">
            <CreditCard className="mr-2 h-4 w-4" />
            Payments ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="entries" className="rounded-2xl">
            <Users className="mr-2 h-4 w-4" />
            Customer Entries ({raffle.entries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-6">
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
        </TabsContent>

        <TabsContent value="entries" className="mt-6">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
