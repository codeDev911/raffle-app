import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Users,
  CreditCard,
  Trophy,
  Calendar,
  Gift,
  Crown,
  PenIcon,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Coins,
  Ticket,
  DollarSign,
  Smartphone,
  Receipt,
  Eye,
  Percent,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils"
import { notFound } from "next/navigation"
import { WinnerSelectionDialog } from "@/components/winner-selection-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RealVsAproxModal } from "@/components/real-vs-aprox-modal"
import { RaffleImageCarousel } from "@/components/RaffleImageCarousel"
import { AddExpenseModal } from "@/components/admin/AddExpenseModal"
import { DeleteExpenseButton } from "@/components/admin/DeleteExpenseButton"

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
              id: true,
              status: true,
              method: true,
              amount: true,
              transactionId: true,
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
              id: true,
              name: true,
              email: true,
              phone: true,
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
  const totalRevenue = raffle.entries.reduce((sum, entry) => sum + entry.totalCost, 0)
  const totalEntries = raffle.entries.reduce((sum, entry) => sum + entry.quantity, 0)

  // Get unique customers count
  const uniqueCustomers = new Set(raffle.entries.map((entry) => entry.userId)).size

  // Get payments list
  const payments = raffle.entries
    .filter((entry) => entry.payment)
    .map((entry) => ({
      id: entry.payment!.id || entry.id,
      entryId: entry.id,
      user: entry.user,
      amount: entry.payment!.amount,
      status: entry.payment!.status,
      method: entry.payment!.method,
      transactionId: entry.payment!.transactionId,
      createdAt: entry.payment!.createdAt,
      entries: entry.quantity,
    }))

  // Calculate expenses (stored in PKR in expenses array, so convert to paisa for calculation)
  const rawExpenses = (raffle as any).expenses
  const expensesList: { id?: string; description: string; amount: number; category?: string }[] =
    Array.isArray(rawExpenses)
      ? rawExpenses.filter((item: any) => !item.isBudget)
      : Array.isArray(rawExpenses?.items)
        ? rawExpenses.items
        : []

  const budgetPKR: number =
    typeof rawExpenses?.budget === "number"
      ? rawExpenses.budget
      : Array.isArray(rawExpenses)
        ? rawExpenses.find((item: any) => item.isBudget)?.amount || 0
        : 0

  const totalExpensesPKR = expensesList.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  )
  const totalExpensesPaisa = totalExpensesPKR * 100
  const totalCostPaisa = raffle.realPrice + totalExpensesPaisa
  const remainingBudgetPKR = budgetPKR > 0 ? budgetPKR - totalExpensesPKR : 0
  const isOverBudget = budgetPKR > 0 && totalExpensesPKR > budgetPKR

  // Calculate projected approximation data
  const aproxRevenue = raffle.price * raffle.totalEntries
  const aproxProfit = aproxRevenue - totalCostPaisa
  const aproxPercentage =
    totalCostPaisa > 0
      ? Math.ceil(((aproxRevenue - totalCostPaisa) / totalCostPaisa) * 100)
      : 0

  // Calculate real performance data
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
    budgetPKR,
    remainingBudgetPKR,
    isOverBudget,
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
    budgetPKR,
    remainingBudgetPKR,
    isOverBudget,
    aproxRevenue,
    aproxProfit,
    aproxPercentage,
    realProfit,
    realPercentage,
  } = await getRaffleDetails(resolvedParams.id)

  const hasWinner = raffle.winners.length > 0
  const canSelectWinner = raffle.status === "ACTIVE" && totalEntries > 0 && !hasWinner
  const progressPercent = Math.min(
    100,
    Math.round((totalEntries / Math.max(1, raffle.totalEntries)) * 100)
  )
  const ticketsRemaining = Math.max(0, raffle.totalEntries - totalEntries)

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-xl min-h-[38px] w-fit border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs"
        >
          <Link href="/admin/raffles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Raffles
          </Link>
        </Button>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl min-h-[38px] border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Link href={`/raffles/${raffle.id}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Public Page
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl min-h-[38px] border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Link href={`/admin/raffles/${raffle.id}/edit`}>
              <PenIcon className="mr-1.5 h-3.5 w-3.5" />
              Edit Raffle
            </Link>
          </Button>

          <AddExpenseModal
            raffleId={raffle.id}
            currentExpensesPKR={totalExpensesPKR}
            currentRevenuePKR={totalRevenue / 100}
            prizeCostPKR={raffle.realPrice / 100}
            ticketPricePKR={raffle.price / 100}
          />

          {hasWinner ? (
            <Button
              asChild
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl min-h-[38px] shadow-xs font-semibold"
            >
              <Link href={`/admin/raffles/${raffle.id}/winner`}>
                <Crown className="mr-1.5 h-4 w-4" />
                View Winner Details
              </Link>
            </Button>
          ) : canSelectWinner ? (
            <div className="inline-block">
              <WinnerSelectionDialog raffleId={raffle.id} totalEntries={totalEntries} />
            </div>
          ) : (
            <Badge className="rounded-xl bg-slate-100 text-slate-600 px-3 py-2 text-xs font-medium border border-slate-200">
              {totalEntries === 0 ? "No Entries Yet" : "Draw Inactive"}
            </Badge>
          )}
        </div>
      </div>

      {/* Hero Overview Header */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left: Interactive Carousel / Photos */}
          <div className="lg:col-span-5">
            <RaffleImageCarousel
              images={Array.from(
                new Set([
                  ...(raffle.image ? [raffle.image] : []),
                  ...(raffle.gallery || []),
                ])
              )}
              title={raffle.title}
              category={raffle.category}
              status={raffle.status}
              featured={raffle.featured}
              aspectRatioClass="aspect-[4/3]"
            />
          </div>

          {/* Right: Details & Status & Progress */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                <Badge
                  className={`rounded-xl text-xs font-semibold px-2.5 py-1 ${
                    raffle.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : raffle.status === "COMPLETED"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {raffle.status === "ACTIVE" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                  )}
                  {raffle.status}
                </Badge>

                <Badge variant="outline" className="rounded-xl text-xs font-medium text-slate-600 border-slate-200">
                  {raffle.category}
                </Badge>

                {raffle.featured && (
                  <Badge className="rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    <Crown className="w-3 h-3 mr-1 text-amber-600" />
                    Featured Campaign
                  </Badge>
                )}

                {hasWinner && (
                  <Badge className="rounded-xl text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                    <Trophy className="w-3 h-3 mr-1 text-purple-600" />
                    Winner Chosen
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight break-words">
                {raffle.title}
              </h1>

              <p className="text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                {raffle.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-slate-400" />
                  <span>
                    Price / Entry:{" "}
                    <strong className="text-slate-900 font-bold block sm:inline">{formatCurrency(raffle.price)}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>
                    Ends:{" "}
                    <strong className="text-slate-900 font-semibold block sm:inline">{formatDate(new Date(raffle.endDate))}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-slate-400" />
                  <span>
                    Base Prize:{" "}
                    <strong className="text-slate-900 font-semibold block sm:inline">{formatCurrency(raffle.realPrice)}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Progress Callout Card */}
            <div className="bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Ticket Sales Progress
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">{progressPercent}%</span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progressPercent >= 100
                      ? "bg-emerald-500"
                      : progressPercent > 50
                        ? "bg-blue-600"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block text-[11px]">Confirmed Sold</span>
                  <span className="font-bold text-slate-900 font-mono">{totalEntries} tickets</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Available Left</span>
                  <span className="font-bold text-slate-700 font-mono">{ticketsRemaining} tickets</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Collected Revenue
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-700 mt-2">
              {formatCurrency(totalRevenue)}
            </p>
            <span className="inline-block text-[11px] text-slate-400 mt-1">
              From {totalEntries} confirmed entries
            </span>
          </CardContent>
        </Card>

        {/* Net Real Profit */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Net Real Profit
              </span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  realProfit >= 0
                    ? "bg-blue-50 text-blue-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p
              className={`text-2xl font-bold font-mono mt-2 ${
                realProfit >= 0 ? "text-blue-700" : "text-rose-600"
              }`}
            >
              {formatCurrency(realProfit)}
            </p>
            <span className="inline-block text-[11px] text-slate-400 mt-1">
              ROI: {realPercentage >= 0 ? `+${realPercentage}%` : `${realPercentage}%`}
            </span>
          </CardContent>
        </Card>

        {/* Campaign Expenses */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Campaign Expenses
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Gift className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-amber-700 mt-2">
              {formatCurrency(totalExpensesPaisa)}
            </p>
            <div className="text-[11px] mt-1 space-y-0.5">
              <span className="text-slate-400 block">
                {expensesList.length} itemized expense{expensesList.length === 1 ? "" : "s"}
              </span>
              {budgetPKR > 0 && (
                <span
                  className={`font-semibold block ${
                    isOverBudget ? "text-rose-600" : "text-emerald-700"
                  }`}
                >
                  {isOverBudget
                    ? `Over Budget (Cap: Rs. ${budgetPKR.toLocaleString()})`
                    : `Rs. ${remainingBudgetPKR.toLocaleString()} buffer left (Cap: Rs. ${budgetPKR.toLocaleString()})`}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total Outflow */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Outflow
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
              {formatCurrency(totalCostPaisa)}
            </p>
            <span className="inline-block text-[11px] text-slate-400 mt-1">
              Prize + marketing & platform fees
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Projection Analysis & Comparison Card */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Percent className="w-4 h-4 text-red-500" />
              Projections vs Real Financial Breakdown
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare actual revenue & margins against 100% capacity target approximations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <AddExpenseModal
              raffleId={raffle.id}
              currentExpensesPKR={totalExpensesPKR}
              currentRevenuePKR={totalRevenue / 100}
              prizeCostPKR={raffle.realPrice / 100}
              ticketPricePKR={raffle.price / 100}
            />
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
        </div>

        <CardContent className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Target Gross Revenue
              </span>
              <p className="text-lg font-bold font-mono text-slate-900 mt-1">
                {formatCurrency(aproxRevenue)}
              </p>
              <span className="text-[11px] text-slate-400">At {raffle.totalEntries} entries</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Prize Cost
              </span>
              <p className="text-lg font-bold font-mono text-slate-700 mt-1">
                {formatCurrency(raffle.realPrice)}
              </p>
              <span className="text-[11px] text-slate-400">Asset acquisition</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Total Expenses
              </span>
              <p className="text-lg font-bold font-mono text-amber-700 mt-1">
                {formatCurrency(totalExpensesPaisa)}
              </p>
              <span className="text-[11px] text-slate-400">Campaign operations</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Target Profit
              </span>
              <p
                className={`text-lg font-bold font-mono mt-1 ${
                  aproxProfit >= 0 ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                {formatCurrency(aproxProfit)}
              </p>
              <span className="text-[11px] text-slate-400">Projected net</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Target Margin ROI
              </span>
              <p
                className={`text-lg font-bold font-mono mt-1 ${
                  aproxPercentage >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {aproxPercentage >= 0 ? "+" : ""}
                {aproxPercentage}%
              </p>
              <span className="text-[11px] text-slate-400">At max capacity</span>
            </div>
          </div>

          {/* Itemized Expenses Tagging */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-amber-500" />
                Itemized Campaign Expenses ({expensesList.length})
              </h4>
              <AddExpenseModal
                raffleId={raffle.id}
                currentExpensesPKR={totalExpensesPKR}
                currentRevenuePKR={totalRevenue / 100}
                prizeCostPKR={raffle.realPrice / 100}
                ticketPricePKR={raffle.price / 100}
                triggerButton={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50 font-semibold h-7 px-2"
                  >
                    + Add Expense
                  </Button>
                }
              />
            </div>

            {expensesList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {expensesList.map((exp, idx) => (
                  <div
                    key={exp.id || idx}
                    className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-950 shadow-2xs group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {exp.category && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-200/50 text-amber-800 uppercase tracking-wider">
                        {exp.category}
                      </span>
                    )}
                    <span className="font-medium text-slate-800">{exp.description}:</span>
                    <span className="font-mono font-bold text-amber-900">
                      Rs. {Number(exp.amount).toLocaleString()}
                    </span>
                    <DeleteExpenseButton
                      raffleId={raffle.id}
                      expenseId={exp.id || `exp-${idx}`}
                      expenseDesc={exp.description}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>No itemized expenses recorded yet for this campaign.</span>
                <AddExpenseModal
                  raffleId={raffle.id}
                  currentExpensesPKR={totalExpensesPKR}
                  currentRevenuePKR={totalRevenue / 100}
                  prizeCostPKR={raffle.realPrice / 100}
                  ticketPricePKR={raffle.price / 100}
                  triggerButton={
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-amber-300 text-amber-800 hover:bg-amber-50 h-7 rounded-lg"
                    >
                      + Record First Expense
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content: Tabs for Payments & Entries with TABLES (never raw divs) */}
      <Tabs defaultValue="payments" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-slate-100 p-1 rounded-xl h-auto">
            <TabsTrigger
              value="payments"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-2xs"
            >
              <CreditCard className="mr-1.5 h-3.5 w-3.5" />
              Payments ({payments.length})
            </TabsTrigger>
            <TabsTrigger
              value="entries"
              className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-2xs"
            >
              <Users className="mr-1.5 h-3.5 w-3.5" />
              Customer Entries ({raffle.entries.length})
            </TabsTrigger>
            {hasWinner && (
              <TabsTrigger
                value="winner"
                className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-2xs"
              >
                <Crown className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                Winner Details
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* PAYMENTS TAB (RENDERED WITH CLEAN RESPONSIVE TABLE) */}
        <TabsContent value="payments" className="mt-0">
          <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Raffle Payment Records</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Transactions received specifically for this raffle draw
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {payments.length} Records
              </Badge>
            </div>

            {payments.length === 0 ? (
              <div className="p-12 text-center">
                <CreditCard className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">No payments yet</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Transactions will appear here once participants buy tickets.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table className="w-full min-w-[700px]">
                  <TableHeader className="bg-slate-50/75">
                    <TableRow className="border-slate-200">
                      <TableHead className="font-semibold text-xs text-slate-600">Customer</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-600">Amount (PKR)</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-600">Entries</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-600">Method</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-600">Status</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-600">Trx ID</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-600">Date</TableHead>
                      <TableHead className="text-right font-semibold text-xs text-slate-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id} className="border-slate-100 hover:bg-slate-50/60">
                        <TableCell className="py-3.5">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 text-sm">{p.user.name}</span>
                            <span className="text-xs text-slate-500 truncate max-w-[180px]">
                              {p.user.email}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5 font-mono font-bold text-slate-900 text-sm">
                          {formatCurrency(p.amount)}
                        </TableCell>

                        <TableCell className="py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                            {p.entries} tickets
                          </span>
                        </TableCell>

                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{p.method}</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5">
                          <Badge
                            className={`rounded-xl text-xs font-semibold px-2.5 py-0.5 ${
                              p.status === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : p.status === "PENDING"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {p.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-3.5 text-xs font-mono text-slate-500 truncate max-w-[140px]">
                          {p.transactionId || "—"}
                        </TableCell>

                        <TableCell className="py-3.5 text-xs text-slate-600 whitespace-nowrap">
                          {formatDateTime(new Date(p.createdAt))}
                        </TableCell>

                        <TableCell className="py-3.5 text-right">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-xs h-8 px-2.5 font-semibold"
                          >
                            <Link href={`/admin/payments/${p.id}`}>
                              <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* CUSTOMER ENTRIES TAB (RENDERED WITH CLEAN RESPONSIVE TABLE) */}
        <TabsContent value="entries" className="mt-0">
          <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Customer Ticket Allocations</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Participants who purchased entries into this raffle
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {raffle.entries.length} Entries
              </Badge>
            </div>

            {raffle.entries.length === 0 ? (
              <div className="p-12 text-center">
                <Ticket className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">No participant entries yet</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customer ticket batches will appear here as orders complete.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table className="w-full min-w-[700px]">
                  <TableHeader className="bg-slate-50/75">
                    <TableRow className="border-slate-200">
                      <TableHead className="font-semibold text-xs text-slate-600">Participant</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-600">Contact / City</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-600">Tickets Bought</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-600">Total Cost (PKR)</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-600">Payment Status</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-600">Date</TableHead>
                      <TableHead className="text-right font-semibold text-xs text-slate-600">Profile</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {raffle.entries.map((entry) => (
                      <TableRow key={entry.id} className="border-slate-100 hover:bg-slate-50/60">
                        <TableCell className="py-3.5">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 text-sm">
                              {entry.user.name}
                            </span>
                            <span className="text-xs text-slate-500 truncate max-w-[180px]">
                              {entry.user.email}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5 text-xs text-slate-600">
                          <div>{entry.user.phone || "No phone"}</div>
                          <span className="text-slate-400 text-[11px]">{entry.user.city || "—"}</span>
                        </TableCell>

                        <TableCell className="py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {entry.quantity} tickets
                          </span>
                        </TableCell>

                        <TableCell className="py-3.5 font-mono font-bold text-slate-900 text-sm">
                          {formatCurrency(entry.totalCost)}
                        </TableCell>

                        <TableCell className="py-3.5">
                          <Badge
                            className={`rounded-xl text-xs font-semibold px-2.5 py-0.5 ${
                              entry.payment?.status === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : entry.payment?.status === "PENDING"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {entry.payment?.status || "PENDING"}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-3.5 text-xs text-slate-600 whitespace-nowrap">
                          {formatDate(new Date(entry.createdAt))}
                        </TableCell>

                        <TableCell className="py-3.5 text-right">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-xs h-8 px-2.5 font-semibold"
                          >
                            <Link href={`/admin/customers/${entry.user.id}`}>
                              <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                              Customer
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* WINNER TAB */}
        {hasWinner && (
          <TabsContent value="winner" className="mt-0">
            <Card className="rounded-2xl border border-amber-200/80 shadow-xs bg-linear-to-b from-amber-50/50 to-white overflow-hidden p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
                  <Crown className="w-10 h-10" />
                </div>
                <div className="space-y-1 text-center sm:text-left flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-200/60 text-amber-900 mb-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-700" />
                    Official Drawn Winner
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {raffle.winners[0].user.name}
                  </h3>
                  <p className="text-sm text-slate-600">
                    Email: <span className="font-medium text-slate-800">{raffle.winners[0].user.email}</span>
                    {raffle.winners[0].user.city && ` · City: ${raffle.winners[0].user.city}`}
                  </p>
                </div>
                <Button
                  asChild
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold px-5"
                >
                  <Link href={`/admin/raffles/${raffle.id}/winner`}>
                    Full Winner Profile
                  </Link>
                </Button>
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
