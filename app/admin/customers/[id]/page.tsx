import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Trophy, Gift } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import { notFound } from "next/navigation"

async function getCustomerDetails(id: string) {
  const customer = await prisma.user.findUnique({
    where: { id, role: "USER" },
    include: {
      entries: {
        include: {
          raffle: {
            select: {
              title: true,
              price: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
      winners: {
        include: {
          raffle: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { drawnAt: "desc" },
      },
    },
  })

  if (!customer) {
    notFound()
  }

  const totalSpent = customer.payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, payment) => sum + payment.amount, 0)

  return { ...customer, totalSpent }
}

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await getCustomerDetails(params.id)
  const isVIP = customer.totalSpent >= 500000 // 5000 PKR threshold

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button asChild variant="ghost" className="rounded-2xl">
          <Link href="/admin/customers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-gray-600 mt-2">Customer details and activity history</p>
        </div>
      </div>

      {/* Customer Overview */}
      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Customer Info
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
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <span>{customer.email}</span>
            </div>
            {customer.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.city && (
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span>{customer.city}</span>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span>Joined {formatDate(new Date(customer.createdAt))}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Spent</span>
              <span className="text-2xl font-bold text-green-600">{formatCurrency(customer.totalSpent)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Entries</span>
              <span className="text-xl font-semibold">{customer.entries.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Wins</span>
              <span className="text-xl font-semibold text-yellow-600">{customer.winners.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Success Rate</span>
              <span className="text-xl font-semibold">
                {customer.entries.length > 0
                  ? ((customer.winners.length / customer.entries.length) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full rounded-2xl">
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </Button>
            <Button variant="outline" className="w-full rounded-2xl">
              <Gift className="mr-2 h-4 w-4" />
              Award Prize
            </Button>
            <Button variant="outline" className="w-full rounded-2xl text-red-600 hover:text-red-700">
              Suspend Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Entries */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
            <CardDescription>Latest raffle entries by this customer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customer.entries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <h4 className="font-semibold">{entry.raffle.title}</h4>
                    <p className="text-sm text-gray-600">
                      {entry.quantity} entries • {formatCurrency(entry.totalCost)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{formatDate(new Date(entry.createdAt))}</p>
                  </div>
                </div>
              ))}
              {customer.entries.length === 0 && <p className="text-gray-500 text-center py-4">No entries yet</p>}
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Recent payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customer.payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <h4 className="font-semibold">{formatCurrency(payment.amount)}</h4>
                    <p className="text-sm text-gray-600">{payment.method}</p>
                  </div>
                  <div className="text-right">
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
                    <p className="text-sm text-gray-500 mt-1">{formatDate(new Date(payment.createdAt))}</p>
                  </div>
                </div>
              ))}
              {customer.payments.length === 0 && <p className="text-gray-500 text-center py-4">No payments yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wins */}
      {customer.winners.length > 0 && (
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
              Wins & Prizes
            </CardTitle>
            <CardDescription>All prizes won by this customer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {customer.winners.map((winner) => (
                <div key={winner.id} className="p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-yellow-800">{winner.raffle.title}</h4>
                      <p className="text-yellow-600">{formatCurrency(winner.prizeValue)}</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700 rounded-2xl">
                      {winner.verified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  <p className="text-sm text-yellow-600 mt-2">Won on {formatDate(new Date(winner.drawnAt))}</p>
                  {winner.deliveredAt && (
                    <p className="text-sm text-green-600">Delivered on {formatDate(new Date(winner.deliveredAt))}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
