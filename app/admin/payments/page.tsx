import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  CreditCard,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Smartphone,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDateTime } from "@/lib/utils"

async function getPaymentsData() {
  const [payments, stats] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    Promise.all([
      prisma.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.payment.count({ where: { status: "FAILED" } }),
      prisma.payment.count(),
    ]),
  ])

  const [totalRevenue, pendingPayments, failedPayments, totalPayments] = stats
  const completedPayments = totalPayments - pendingPayments - failedPayments
  const successRate = totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0

  return {
    payments: payments.map((payment) => ({
      ...payment,
      raffleName: (payment.metadata as any)?.raffleName || "Unknown Raffle",
      entries: (payment.metadata as any)?.quantity || 1,
    })),
    stats: {
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingPayments,
      failedPayments,
      successRate,
    },
  }
}

export default async function AdminPaymentsPage() {
  const { payments, stats } = await getPaymentsData()

  const paymentStats = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      change: "+12.5%",
      icon: DollarSign,
      color: "green",
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments.toString(),
      change: "-5",
      icon: Clock,
      color: "yellow",
    },
    {
      title: "Failed Payments",
      value: stats.failedPayments.toString(),
      change: "+2",
      icon: XCircle,
      color: "red",
    },
    {
      title: "Success Rate",
      value: `${stats.successRate.toFixed(1)}%`,
      change: "+1.2%",
      icon: TrendingUp,
      color: "blue",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
        <p className="text-gray-600 mt-2">Monitor and manage all payment transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paymentStats.map((stat, index) => (
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
              <div className="mt-4">
                <Badge className="bg-green-100 text-green-700 rounded-2xl">{stat.change}</Badge>
                <span className="text-sm text-gray-600 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="rounded-2xl shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search payments..." className="pl-10 rounded-2xl" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-2xl">
                All
              </Button>
              <Button variant="outline" className="rounded-2xl">
                Completed
              </Button>
              <Button variant="outline" className="rounded-2xl">
                Pending
              </Button>
              <Button variant="outline" className="rounded-2xl">
                Failed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="rounded-2xl shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-red-500" />
            Recent Payments
          </CardTitle>
          <CardDescription>All payment transactions and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-gray-50 p-6 rounded-2xl hover:bg-gray-100 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">{payment.user.name}</h3>
                        <Badge
                          className={`rounded-2xl ${
                            payment.status === "COMPLETED"
                              ? "bg-green-100 text-green-700"
                              : payment.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : payment.status === "PROCESSING"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-red-100 text-red-700"
                          }`}
                        >
                          {payment.status === "COMPLETED" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {payment.status === "PENDING" && <Clock className="w-3 h-3 mr-1" />}
                          {payment.status === "PROCESSING" && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {payment.status === "FAILED" && <XCircle className="w-3 h-3 mr-1" />}
                          {payment.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-500">{formatCurrency(payment.amount)}</div>
                        <div className="text-sm text-gray-500">{payment.entries} entries</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Payment ID:</span>
                        <div className="font-medium">{payment.id.slice(0, 8)}...</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Transaction ID:</span>
                        <div className="font-medium">{payment.transactionId || "N/A"}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Method:</span>
                        <div className="flex items-center space-x-1">
                          <Smartphone className="h-3 w-3" />
                          <span className="font-medium">{payment.method}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <div className="font-medium">{formatDateTime(new Date(payment.createdAt))}</div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className="text-gray-500">Raffle:</span>
                      <div className="font-medium text-blue-600">{payment.raffleName}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Customer: {payment.user.email}</span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="rounded-2xl">
                      View Details
                    </Button>
                    {payment.status === "PENDING" && (
                      <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white rounded-2xl">
                        Approve
                      </Button>
                    )}
                    {payment.status === "FAILED" && (
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl">
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {payments.length === 0 && (
        <Card className="rounded-2xl shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-600">Payments will appear here once customers make purchases</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
