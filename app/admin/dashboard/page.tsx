import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, CreditCard, TrendingUp, Gift, DollarSign, AlertCircle } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import { unstable_noStore as noStore } from "next/cache"

// Force dynamic rendering and disable caching
export const dynamic = "force-dynamic"
export const revalidate = 0

async function getDashboardStats() {
  // Disable function caching
  noStore()

  console.log("Fetching dashboard stats...")

  const [totalRevenue, activeRaffles, totalCustomers, pendingPayments, recentRaffles, recentCustomers, recentPayments] =
    await Promise.all([
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
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { entries: true },
          },
        },
      }),
      prisma.user.findMany({
        where: { role: "USER" },
        take: 3,
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

  console.log("Dashboard stats fetched:", {
    totalRevenue: totalRevenue._sum.amount,
    activeRaffles,
    totalCustomers,
    pendingPayments,
    recentRafflesCount: recentRaffles.length,
    recentCustomersCount: recentCustomers.length,
    recentPaymentsCount: recentPayments.length,
  })

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

  const dashboardStats = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      change: "+12.5%",
      changeType: "positive" as const,
      icon: DollarSign,
    },
    {
      title: "Active Raffles",
      value: stats.activeRaffles.toString(),
      change: "+2",
      changeType: "positive" as const,
      icon: Gift,
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toLocaleString(),
      change: "+324",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments.toString(),
      change: "-5",
      changeType: "negative" as const,
      icon: CreditCard,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your admin dashboard. Here's what's happening today.</p>
        <p className="text-xs text-gray-500 mt-1">Last updated: {new Date().toLocaleString()}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="rounded-2xl shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-2xl">
                  <stat.icon className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Badge
                  className={`rounded-2xl ${
                    stat.changeType === "positive" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {stat.change}
                </Badge>
                <span className="text-sm text-gray-600 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Raffles */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="mr-2 h-5 w-5 text-red-500" />
              Recent Raffles
            </CardTitle>
            <CardDescription>Latest raffle activities and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentRaffles.length > 0 ? (
                stats.recentRaffles.map((raffle) => (
                  <div key={raffle.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <h4 className="font-semibold text-gray-900">{raffle.title}</h4>
                      <p className="text-sm text-gray-600">
                        {raffle._count.entries} entries • {formatCurrency(raffle.price * raffle._count.entries)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={`rounded-2xl ${
                          raffle.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {raffle.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(new Date(raffle.endDate))}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No recent raffles found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Customers */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-red-500" />
              Recent Customers
            </CardTitle>
            <CardDescription>New customer registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentCustomers.length > 0 ? (
                stats.recentCustomers.map((customer) => {
                  const totalSpent = customer.payments.reduce((sum, payment) => sum + payment.amount, 0)
                  return (
                    <div key={customer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div>
                        <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                        <p className="text-sm text-gray-600">{customer.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{formatCurrency(totalSpent)}</p>
                        <p className="text-xs text-gray-500">{formatDate(new Date(customer.createdAt))}</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No recent customers found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card className="rounded-2xl shadow-lg border-0 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-red-500" />
            Recent Payments
          </CardTitle>
          <CardDescription>Latest payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Raffle</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentPayments.length > 0 ? (
                  stats.recentPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{payment.user.name}</p>
                          <p className="text-sm text-gray-600">{payment.user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-gray-900">{payment.entries[0]?.raffle?.title || "N/A"}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
                      </td>
                      <td className="py-3 px-4">
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
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600">{formatDate(new Date(payment.createdAt))}</p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No recent payments found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="rounded-2xl shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-red-500" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-6 rounded-2xl text-center hover:bg-blue-100 transition-colors cursor-pointer">
              <Gift className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-blue-800">Create New Raffle</h3>
              <p className="text-sm text-blue-600 mt-1">Add a new raffle item</p>
            </div>
            <div className="bg-green-50 p-6 rounded-2xl text-center hover:bg-green-100 transition-colors cursor-pointer">
              <Trophy className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-green-800">Select Winner</h3>
              <p className="text-sm text-green-600 mt-1">Draw raffle winners</p>
            </div>
            <div className="bg-orange-50 p-6 rounded-2xl text-center hover:bg-orange-100 transition-colors cursor-pointer">
              <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-orange-800">Review Payments</h3>
              <p className="text-sm text-orange-600 mt-1">Check pending payments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
