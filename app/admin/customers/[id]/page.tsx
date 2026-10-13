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
  Mail,
  Phone,
  MapPin,
  Calendar,
  Trophy,
  Gift,
  CreditCard,
  Ticket,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Eye,
  ExternalLink,
  ShieldCheck,
} from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils"
import { notFound } from "next/navigation"

async function getCustomerDetails(id: string) {
  const customer = await prisma.user.findUnique({
    where: { id, role: "USER" },
    include: {
      entries: {
        include: {
          raffle: {
            select: {
              id: true,
              title: true,
              price: true,
              status: true,
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
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
      winners: {
        include: {
          raffle: {
            select: {
              id: true,
              title: true,
              price: true,
              realPrice: true,
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

  const completedPayments = customer.payments.filter((p) => p.status === "COMPLETED")
  const totalSpent = completedPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const totalTickets = customer.entries.reduce((sum, e) => sum + e.quantity, 0)

  return { ...customer, totalSpent, totalTickets }
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const resolvedParams = await Promise.resolve(params)
  const customer = await getCustomerDetails(resolvedParams.id)
  const isVIP = customer.totalSpent >= 500000 // 5000 PKR threshold

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    )
  }

  const successRate =
    customer.entries.length > 0
      ? ((customer.winners.length / customer.entries.length) * 100).toFixed(1)
      : "0.0"

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-xl min-h-[38px] w-fit border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs"
        >
          <Link href="/admin/customers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Link>
        </Button>

        {/* Quick Contact Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {customer.phone && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl min-h-[38px] border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              <a
                href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Smartphone className="w-4 h-4 mr-1.5 text-emerald-600" />
                WhatsApp
              </a>
            </Button>
          )}

          {customer.phone && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl min-h-[38px] border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              <a href={`tel:${customer.phone}`}>
                <Phone className="w-4 h-4 mr-1.5 text-slate-600" />
                Call Customer
              </a>
            </Button>
          )}

          {customer.email && (
            <Button
              asChild
              size="sm"
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl min-h-[38px] font-semibold"
            >
              <a href={`mailto:${customer.email}`}>
                <Mail className="w-4 h-4 mr-1.5 text-slate-300" />
                Send Email
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Customer Hero Profile Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-tr from-slate-100 to-slate-200 border border-slate-200 text-slate-800 flex items-center justify-center font-bold text-xl sm:text-2xl shadow-xs shrink-0">
              {getInitials(customer.name)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {isVIP && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    VIP Member
                  </span>
                )}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    customer.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {customer.isActive ? "Active Account" : "Inactive Account"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
                {customer.name}
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                User ID: {customer.id}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 text-xs text-slate-600">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Info</span>
              <div className="font-semibold text-slate-800">{customer.email}</div>
              <div>{customer.phone || "No phone registered"}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Registration</span>
              <div className="font-semibold text-slate-800">
                {formatDate(new Date(customer.createdAt))}
              </div>
              <div className="text-slate-500">{customer.city || "Pakistan"}</div>
            </div>
          </div>
        </div>

        {/* 4 Core Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Spent</span>
              <CreditCard className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 mt-1">
              {formatCurrency(customer.totalSpent)}
            </p>
            <span className="text-[11px] text-slate-400">All completed orders</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Tickets Bought</span>
              <Ticket className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-blue-700 mt-1">
              {customer.totalTickets}
            </p>
            <span className="text-[11px] text-slate-400">Across {customer.entries.length} raffle orders</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Raffles Won</span>
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-amber-700 mt-1">
              {customer.winners.length}
            </p>
            <span className="text-[11px] text-slate-400">Prizes awarded</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Win Rate</span>
              <TrendingUp className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {successRate}%
            </p>
            <span className="text-[11px] text-slate-400">Win / Entry ratio</span>
          </div>
        </div>
      </div>

      {/* Won Prizes Card (If applicable) */}
      {customer.winners.length > 0 && (
        <Card className="rounded-2xl border border-amber-200/80 shadow-xs bg-linear-to-b from-amber-50/40 to-white overflow-hidden">
          <CardHeader className="p-5 border-b border-amber-100">
            <CardTitle className="text-base font-bold text-amber-950 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Raffle Victories & Awarded Prizes ({customer.winners.length})
            </CardTitle>
            <CardDescription className="text-xs text-amber-800">
              Verified lucky draw selections won by this customer
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {customer.winners.map((winner) => (
                <div
                  key={winner.id}
                  className="p-4 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate">
                        {winner.raffle.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Drawn on {formatDate(new Date(winner.drawnAt))}
                      </p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 text-[11px] font-bold">
                      Winner
                    </Badge>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Prize Value:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(winner.raffle.realPrice || winner.raffle.price)}
                    </span>
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full rounded-lg text-xs font-semibold h-8 mt-1 border-amber-200 hover:bg-amber-50 text-amber-900"
                  >
                    <Link href={`/admin/raffles/${winner.raffle.id}`}>
                      View Raffle Page
                      <ExternalLink className="w-3 h-3 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tables Section: Customer Entries & Payment History (Using real Tables, no divs) */}
      <div className="space-y-8">
        {/* Table 1: Raffle Entries */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-blue-500" />
                Raffle Participation History
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All raffle tickets and entries purchased by this customer
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              {customer.entries.length} Entries
            </Badge>
          </div>

          {customer.entries.length === 0 ? (
            <div className="p-12 text-center">
              <Ticket className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No raffle entries yet</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Entries will appear once the customer takes part in a raffle.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table className="w-full min-w-[750px]">
                <TableHeader className="bg-slate-50/75">
                  <TableRow className="border-slate-200">
                    <TableHead className="font-semibold text-xs text-slate-600">Raffle Campaign</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600">Price / Ticket</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600">Tickets Purchased</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600">Total Cost (PKR)</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600">Payment Status</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600">Date</TableHead>
                    <TableHead className="text-right font-semibold text-xs text-slate-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.entries.map((entry) => (
                    <TableRow key={entry.id} className="border-slate-100 hover:bg-slate-50/60">
                      <TableCell className="py-3.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">
                            {entry.raffle.title}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Status: {entry.raffle.status}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 text-xs font-mono text-slate-700">
                        {formatCurrency(entry.raffle.price)}
                      </TableCell>

                      <TableCell className="py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
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
                          {entry.payment?.status || "COMPLETED"}
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
                          <Link href={`/admin/raffles/${entry.raffle.id}`}>
                            <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                            Raffle
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

        {/* Table 2: Payment History */}
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                Payment & Billing Transactions
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All checkout and payment attempts recorded for this customer
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              {customer.payments.length} Transactions
            </Badge>
          </div>

          {customer.payments.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No payment records found</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Transactions will appear here when the customer processes payment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table className="w-full min-w-[750px]">
                <TableHeader className="bg-slate-50/75">
                  <TableRow className="border-slate-200">
                    <TableHead className="font-semibold text-xs text-slate-600">Payment ID</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600">Amount (PKR)</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600">Method</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600">Transaction ID</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600">Status</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600">Date & Time</TableHead>
                    <TableHead className="text-right font-semibold text-xs text-slate-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.payments.map((payment) => (
                    <TableRow key={payment.id} className="border-slate-100 hover:bg-slate-50/60">
                      <TableCell className="py-3.5 font-mono text-xs text-slate-700">
                        {payment.id.slice(0, 10)}...
                      </TableCell>

                      <TableCell className="py-3.5 font-mono font-bold text-slate-900 text-sm">
                        {formatCurrency(payment.amount)}
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{payment.method}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 text-xs font-mono text-slate-500 truncate max-w-[150px]">
                        {payment.transactionId || "—"}
                      </TableCell>

                      <TableCell className="py-3.5">
                        <Badge
                          className={`rounded-xl text-xs font-semibold px-2.5 py-0.5 ${
                            payment.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : payment.status === "PENDING"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3.5 text-xs text-slate-600 whitespace-nowrap">
                        {formatDateTime(new Date(payment.createdAt))}
                      </TableCell>

                      <TableCell className="py-3.5 text-right">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs h-8 px-2.5 font-semibold"
                        >
                          <Link href={`/admin/payments/${payment.id}`}>
                            <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                            Invoice
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
      </div>
    </div>
  )
}
