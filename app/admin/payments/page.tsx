"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  Eye,
  Mail,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { ExportCSVButton } from "@/components/export-csv-button"
import { ReceiptModal } from "@/components/receipt-modal"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Payment {
  id: string
  amount: number
  status: string
  method: string
  transactionId: string | null
  createdAt: string
  user: {
    name: string
    email: string
  }
  raffleName: string
  entries: number
}

interface PaymentStats {
  totalRevenue: number
  pendingPayments: number
  failedPayments: number
  successRate: number
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    pendingPayments: 0,
    failedPayments: 0,
    successRate: 0,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  useEffect(() => {
    fetchPayments()
    // Set up auto-refresh every 30 seconds in production
    const interval = setInterval(fetchPayments, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, searchTerm, statusFilter])

  const fetchPayments = async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    setError(null)

    try {
      // Add cache-busting timestamp
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/admin/payments?t=${timestamp}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Fetched payments data:", data)

      setPayments(data.payments || [])
      setStats(
        data.stats || {
          totalRevenue: 0,
          pendingPayments: 0,
          failedPayments: 0,
          successRate: 0,
        },
      )
      setLastFetch(new Date())
    } catch (error) {
      console.error("Error fetching payments:", error)
      setError("Failed to fetch payments data. Please try again.")
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchPayments(true)
  }

  const filterPayments = () => {
    let filtered = payments

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.raffleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((payment) => payment.status === statusFilter)
    }

    setFilteredPayments(filtered)
  }

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

  const csvHeaders = [
    { key: "id", label: "Payment ID" },
    { key: "user.name", label: "Customer Name" },
    { key: "user.email", label: "Customer Email" },
    { key: "raffleName", label: "Raffle" },
    { key: "amount", label: "Amount (PKR)" },
    { key: "entries", label: "Entries" },
    { key: "method", label: "Payment Method" },
    { key: "status", label: "Status" },
    { key: "transactionId", label: "Transaction ID" },
    { key: "createdAt", label: "Date" },
  ]

  if (isLoading && payments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Loading payments data...</p>
        </div>
      </div>
    )
  }

  if (error && payments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} className="bg-red-500 hover:bg-red-600">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-gray-600">Monitor and manage all payment transactions</p>
            {lastFetch && <p className="text-sm text-gray-500">Last updated: {formatDateTime(lastFetch)}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading} className="rounded-2xl">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <ExportCSVButton data={filteredPayments} filename="payments" headers={csvHeaders} />
        </div>
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
                <Input
                  placeholder="Search payments..."
                  className="pl-10 rounded-2xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              {["All", "COMPLETED", "PENDING", "PROCESSING", "FAILED"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  className="rounded-2xl"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === "All" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="rounded-2xl shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-red-500" />
            Payments ({filteredPayments.length})
          </CardTitle>
          <CardDescription>All payment transactions and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Raffle</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Entries</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payment.user.name}</div>
                      <div className="text-sm text-gray-500">{payment.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{payment.raffleName}</div>
                    <div className="text-sm text-gray-500">ID: {payment.id.slice(0, 8)}...</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-green-600">{formatCurrency(payment.amount)}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-2xl">
                      {payment.entries}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4 text-gray-400" />
                      <span>{payment.method}</span>
                    </div>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDateTime(new Date(payment.createdAt))}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/payments/${payment.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <div>
                            <ReceiptModal payment={payment} />
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Contact Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "All"
                  ? "Try adjusting your search or filters"
                  : "Payments will appear here once customers make purchases"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
