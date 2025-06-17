import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Users, Search, Mail, Phone, MapPin, Calendar, DollarSign, Trophy } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"

async function getCustomersData() {
  const [customers, stats] = await Promise.all([
    prisma.user.findMany({
      where: { role: "USER" },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            entries: true,
            winners: true,
          },
        },
        payments: {
          where: { status: "COMPLETED" },
          select: { amount: true },
        },
      },
    }),
    Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({
        where: {
          role: "USER",
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.user.count({
        where: {
          role: "USER",
          payments: {
            some: {
              status: "COMPLETED",
              amount: { gte: 500000 }, // VIP threshold: 5000 PKR
            },
          },
        },
      }),
    ]),
  ])

  const [totalCustomers, activeThisMonth, totalRevenue, vipCustomers] = stats

  return {
    customers: customers.map((customer) => ({
      ...customer,
      totalSpent: customer.payments.reduce((sum, payment) => sum + payment.amount, 0),
      lastActivity: customer.createdAt, // You can update this with actual last activity logic
    })),
    stats: {
      totalCustomers,
      activeThisMonth,
      totalRevenue: totalRevenue._sum.amount || 0,
      vipCustomers,
    },
  }
}

export default async function AdminCustomersPage() {
  const { customers, stats } = await getCustomersData()

  const customerStats = [
    {
      title: "Total Customers",
      value: stats.totalCustomers.toLocaleString(),
      change: "+324",
      icon: Users,
    },
    {
      title: "Active This Month",
      value: stats.activeThisMonth.toLocaleString(),
      change: "+12%",
      icon: Calendar,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      change: "+18%",
      icon: DollarSign,
    },
    {
      title: "VIP Customers",
      value: stats.vipCustomers.toString(),
      change: "+8",
      icon: Trophy,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
        <p className="text-gray-600 mt-2">Manage and track all your customers and their activities</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {customerStats.map((stat, index) => (
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
                <Input placeholder="Search customers..." className="pl-10 rounded-2xl" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-2xl">
                All
              </Button>
              <Button variant="outline" className="rounded-2xl">
                Active
              </Button>
              <Button variant="outline" className="rounded-2xl">
                VIP
              </Button>
              <Button variant="outline" className="rounded-2xl">
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="rounded-2xl shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-red-500" />
            All Customers
          </CardTitle>
          <CardDescription>Complete list of registered customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers.map((customer) => {
              const isVIP = customer.totalSpent >= 500000 // 5000 PKR threshold
              return (
                <div key={customer.id} className="bg-gray-50 p-6 rounded-2xl hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                        <Badge
                          className={`rounded-2xl ${
                            isVIP
                              ? "bg-yellow-100 text-yellow-700"
                              : customer.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {isVIP ? "VIP" : customer.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{customer.phone}</span>
                          </div>
                        )}
                        {customer.city && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{customer.city}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Joined {formatDate(new Date(customer.createdAt))}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Spent {formatCurrency(customer.totalSpent)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Trophy className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{customer._count.winners} wins</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{customer._count.entries}</div>
                        <div className="text-xs text-gray-500">Total Entries</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(customer.totalSpent)}</div>
                        <div className="text-xs text-gray-500">Total Spent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{customer._count.winners}</div>
                        <div className="text-xs text-gray-500">Wins</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Last activity: {formatDate(new Date(customer.lastActivity))}
                    </span>
                    <div className="flex space-x-2">
                      <Button asChild variant="outline" size="sm" className="rounded-2xl">
                        <Link href={`/admin/customers/${customer.id}`}>View Details</Link>
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-2xl">
                        Send Message
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {customers.length === 0 && (
        <Card className="rounded-2xl shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-600">Customers will appear here once they register</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
