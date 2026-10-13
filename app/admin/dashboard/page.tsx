import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Trophy,
  Users,
  CreditCard,
  Gift,
  DollarSign,
  ArrowUpRight,
  Clock,
  Plus,
  ChevronRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils"
import { unstable_noStore as noStore } from "next/cache"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function getDashboardStats() {
  noStore()

  const [
    totalRevenue,
    activeRaffles,
    totalCustomers,
    pendingPayments,
    recentRaffles,
    recentCustomers,
    recentPayments,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.raffle.count({
      where: { status: "ACTIVE" },
    }),
    prisma.user.count({
      where: { role: "USER" },
    }),
    prisma.payment.count({
      where: { status: "PENDING" },
    }),
    prisma.raffle.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { entries: true },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: "USER" },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { entries: true },
        },
        payments: {
          where: { status: "COMPLETED" },
          select: { amount: true },
        },
      },
    }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
        entries: {
          select: {
            raffle: {
              select: { title: true },
            },
          },
        },
      },
    }),
  ])

  return {
    totalRevenue: totalRevenue._sum.amount || 0,
    activeRaffles,
    totalCustomers,
    pendingPayments,
    recentRaffles,
    recentCustomers,
    recentPayments,
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const metricCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      subtitle: "Gross cleared receipts",
      icon: DollarSign,
      color: "emerald",
      link: "/admin/payments?status=COMPLETED",
    },
    {
      title: "Active Raffles",
      value: stats.activeRaffles.toString(),
      subtitle: "Live ongoing campaigns",
      icon: Gift,
      color: "red",
      link: "/admin/raffles",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toLocaleString(),
      subtitle: "Registered participants",
      icon: Users,
      color: "blue",
      link: "/admin/customers",
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments.toString(),
      subtitle: "Awaiting bank verification",
      icon: Clock,
      color: "amber",
      link: "/admin/payments?status=PENDING",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Completed
          </span>
        )
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Executive Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time campaign performance, revenue pipeline & participant activity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs min-h-[40px]">
            <Link href="/admin/raffles/create">
              <Plus className="mr-2 h-4 w-4" />
              Launch Raffle
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metricCards.map((metric, i) => (
          <Link key={i} href={metric.link} className="group block focus:outline-hidden">
            <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white hover:border-slate-300 transition-all hover:shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {metric.title}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      metric.color === "emerald"
                        ? "bg-emerald-50 text-emerald-600"
                        : metric.color === "red"
                          ? "bg-red-50 text-red-600"
                          : metric.color === "blue"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    <metric.icon className="w-4 h-4" />
                  </div>
                </div>

                <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 truncate">
                  {metric.value}
                </p>

                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                  <span>{metric.subtitle}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Split section: Recent Raffles & Recent Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Raffles */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
          <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Gift className="w-4 h-4 text-red-600" />
                Live Campaigns
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Active raffle sales & progress
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs font-semibold text-slate-700">
              <Link href="/admin/raffles">
                View all
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {stats.recentRaffles.length > 0 ? (
              stats.recentRaffles.map((raffle) => {
                const percent = Math.min(
                  100,
                  Math.round((raffle.currentEntries / raffle.totalEntries) * 100)
                )

                return (
                  <Link
                    key={raffle.id}
                    href={`/admin/raffles/${raffle.id}`}
                    className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/60 transition-colors block group"
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 truncate group-hover:text-red-600 transition-colors">
                          {raffle.title}
                        </h4>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            raffle.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {raffle.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>{formatCurrency(raffle.price)} / entry</span>
                        <span>·</span>
                        <span>
                          {raffle.currentEntries} / {raffle.totalEntries} entries
                        </span>
                      </div>
                      {/* Mini progress bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-sm text-slate-900 block">
                        {percent}%
                      </span>
                      <span className="text-[11px] text-slate-400">Sold</span>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No active raffles found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Customers */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
          <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Recent Signups
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                New customer registrations & spend
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs font-semibold text-slate-700">
              <Link href="/admin/customers">
                View all
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {stats.recentCustomers.length > 0 ? (
              stats.recentCustomers.map((cust) => {
                const totalSpent = cust.payments.reduce((s, p) => s + p.amount, 0)
                const initials = cust.name
                  .split(" ")
                  .map((n) => n[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()

                return (
                  <Link
                    key={cust.id}
                    href={`/admin/customers/${cust.id}`}
                    className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/60 transition-colors block group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {cust.name}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">{cust.email}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-sm text-slate-900 block">
                        {formatCurrency(totalSpent)}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {cust._count.entries} entries
                      </span>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No recent customer registrations
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments Section */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Latest Transactions
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Live incoming receipts & checkout logs
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs font-semibold text-slate-700">
            <Link href="/admin/payments">
              View all
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile responsive cards for small screens */}
          <div className="md:hidden divide-y divide-slate-100">
            {stats.recentPayments.map((p) => (
              <div key={p.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate">{p.user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{p.entries[0]?.raffle?.title || "Raffle"}</p>
                  </div>
                  <div>{getStatusBadge(p.status)}</div>
                </div>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(p.amount)}</span>
                  <span className="text-slate-400 text-[11px]">{formatDate(new Date(p.createdAt))}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table for >= md */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/60 text-xs text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Customer</th>
                  <th className="py-3 px-5">Raffle Item</th>
                  <th className="py-3 px-5">Amount (PKR)</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-5">
                      <div className="font-semibold text-slate-900 text-sm">{payment.user?.name}</div>
                      <div className="text-xs text-slate-500">{payment.user?.email}</div>
                    </td>
                    <td className="py-3 px-5">
                      <span className="text-slate-800 font-medium truncate max-w-[200px] block">
                        {payment.entries[0]?.raffle?.title || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span className="font-mono font-bold text-slate-900">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-5">{getStatusBadge(payment.status)}</td>
                    <td className="py-3 px-5 text-xs text-slate-500">
                      {formatDateTime(new Date(payment.createdAt))}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <Button asChild variant="ghost" size="sm" className="rounded-lg text-xs font-semibold">
                        <Link href={`/admin/payments/${payment.id}`}>Review</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
