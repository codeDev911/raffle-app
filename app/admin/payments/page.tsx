"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Smartphone,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Receipt,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
} from "lucide-react"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { ReceiptModal } from "@/components/receipt-modal"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

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

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    pendingPayments: 0,
    failedPayments: 0,
    successRate: 0,
  })
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1) // Reset to page 1 on new search
    }, 350)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // Fetch payments with server-side pagination & filtering
  const fetchPayments = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          status: statusFilter,
          search: debouncedSearch,
          t: Date.now().toString(),
        })

        const res = await fetch(`/api/admin/payments?${params.toString()}`, {
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!res.ok) {
          throw new Error(`Failed to fetch payments: ${res.statusText}`)
        }

        const data = await res.json()
        setPayments(data.payments || [])
        if (data.pagination) {
          setPagination(data.pagination)
        }
        if (data.stats) {
          setStats(data.stats)
        }
        setLastFetch(new Date())
      } catch (err: any) {
        console.error("Error fetching payments:", err)
        setError(err.message || "Failed to load payments")
      } finally {
        if (showLoading) setIsLoading(false)
      }
    },
    [page, limit, statusFilter, debouncedSearch]
  )

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleStatusChange = (status: string) => {
    setStatusFilter(status)
    setPage(1)
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }

  // Export full or filtered data to CSV
  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams({
        all: "true",
        status: statusFilter,
        search: debouncedSearch,
      })
      const res = await fetch(`/api/admin/payments?${params.toString()}`)
      const data = await res.json()
      const exportList: Payment[] = data.payments || payments

      const headers = [
        "Payment ID",
        "Customer Name",
        "Customer Email",
        "Raffle",
        "Amount (PKR)",
        "Entries",
        "Method",
        "Status",
        "Transaction ID",
        "Date",
      ]

      const rows = exportList.map((p) => [
        p.id,
        `"${p.user?.name || ""}"`,
        `"${p.user?.email || ""}"`,
        `"${p.raffleName || ""}"`,
        (p.amount / 100).toFixed(0),
        p.entries,
        p.method,
        p.status,
        `"${p.transactionId || ""}"`,
        `"${formatDateTime(new Date(p.createdAt))}"`,
      ])

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `pakraffle-payments-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Exported ${exportList.length} payment records`)
    } catch (err) {
      console.error("CSV Export failed", err)
      toast.error("Failed to export payments")
    } finally {
      setIsExporting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Completed
          </span>
        )
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending
          </span>
        )
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
            <AlertTriangle className="w-3 h-3 text-blue-600" />
            Processing
          </span>
        )
      case "FAILED":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
            <XCircle className="w-3 h-3 text-rose-600" />
            {status}
          </span>
        )
    }
  }

  // Generate pagination page numbers
  const getPaginationPages = () => {
    const totalPages = pagination.totalPages
    const current = pagination.page
    const delta = 1
    const pages: (number | string)[] = []

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= current - delta && i <= current + delta)) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...")
      }
    }
    return pages
  }

  const startRecord = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const endRecord = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Payment Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time ledger with server-side pagination, search & audit trails
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => fetchPayments(true)}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 min-h-[40px]"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin text-red-600" : ""}`} />
            Refresh
          </Button>

          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            disabled={isExporting || pagination.total === 0}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 min-h-[40px]"
          >
            <Download className={`mr-2 h-4 w-4 ${isExporting ? "animate-spin" : ""}`} />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* Stats Cards (High-contrast, responsive grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Revenue
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 truncate">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <span className="inline-block text-[11px] text-slate-400 mt-1">
              From completed checkouts
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Pending Approval
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-amber-600 mt-2">
              {stats.pendingPayments}
            </p>
            <span className="inline-block text-[11px] text-slate-400 mt-1">
              Receipts awaiting review
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Failed Payments
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-rose-600 mt-2">
              {stats.failedPayments}
            </p>
            <span className="inline-block text-[11px] text-slate-400 mt-1">
              Rejected or cancelled
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Success Rate
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
              {stats.successRate.toFixed(1)}%
            </p>
            <span className="inline-block text-[11px] text-slate-400 mt-1">
              Completed transaction ratio
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar & Search */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
              <Input
                placeholder="Search by customer name, email, raffle, or transaction ID..."
                className="pl-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white min-h-[44px] text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Pills / Segmented Controls */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {["All", "COMPLETED", "PENDING", "PROCESSING", "FAILED"].map((status) => {
                const isActive = statusFilter === status
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusChange(status)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors min-h-[40px] ${
                      isActive
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                    }`}
                  >
                    {status === "All"
                      ? "All Statuses"
                      : status.charAt(0) + status.slice(1).toLowerCase()}
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={() => fetchPayments(true)}>
            Retry
          </Button>
        </div>
      )}

      {/* Main Content: Desktop Table + Mobile Card View with Skeletons */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Payment Transactions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {startRecord}–{endRecord} of {pagination.total} total payments
            </p>
          </div>

          {/* Items per page selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-500 font-medium">Rows:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
              {[10, 25, 50].map((pageSize) => (
                <button
                  key={pageSize}
                  type="button"
                  onClick={() => handleLimitChange(pageSize)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    limit === pageSize
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {pageSize}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LOADING SKELETON STATE */}
        {isLoading ? (
          <div className="p-4 space-y-3">
            {/* Desktop Table Skeletons */}
            <div className="hidden md:block space-y-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-slate-100/80 animate-pulse rounded-xl flex items-center px-4 gap-4"
                >
                  <div className="w-1/4 h-4 bg-slate-200 rounded-md" />
                  <div className="w-1/4 h-4 bg-slate-200 rounded-md" />
                  <div className="w-1/6 h-4 bg-slate-200 rounded-md" />
                  <div className="w-1/6 h-4 bg-slate-200 rounded-md" />
                  <div className="w-1/12 h-4 bg-slate-200 rounded-md ml-auto" />
                </div>
              ))}
            </div>

            {/* Mobile Cards Skeletons */}
            <div className="md:hidden space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 animate-pulse"
                >
                  <div className="flex justify-between items-center">
                    <div className="w-32 h-4 bg-slate-200 rounded-md" />
                    <div className="w-20 h-5 bg-slate-200 rounded-full" />
                  </div>
                  <div className="w-48 h-3 bg-slate-100 rounded-md" />
                  <div className="flex justify-between pt-2 border-t border-slate-100">
                    <div className="w-24 h-4 bg-slate-200 rounded-md" />
                    <div className="w-16 h-4 bg-slate-200 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : payments.length === 0 ? (
          /* EMPTY STATE */
          <div className="py-16 px-4 text-center">
            <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No payment records found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchTerm || statusFilter !== "All"
                ? "No transactions match your current search query or status filter. Try clearing filters."
                : "Transactions will appear here once participants complete checkout."}
            </p>
            {(searchTerm || statusFilter !== "All") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("All")
                }}
                className="mt-4 rounded-xl text-xs"
              >
                Reset Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow className="border-slate-200">
                    <TableHead className="font-semibold text-xs text-slate-600">Customer</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600">Raffle Item</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600">Amount (PKR)</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600">Entries</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600">Method</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600">Status</TableHead>
                    <TableHead className="font-semibold text-xs text-slate-600">Date & Time</TableHead>
                    <TableHead className="text-right font-semibold text-xs text-slate-600">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow
                      key={payment.id}
                      className="border-slate-100 hover:bg-slate-50/80 transition-colors"
                    >
                      <TableCell className="py-3.5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 text-sm">
                            {payment.user?.name || "Customer"}
                          </span>
                          <span className="text-xs text-slate-500 truncate max-w-[200px]">
                            {payment.user?.email}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div className="flex flex-col max-w-[220px]">
                          <span className="font-medium text-slate-800 text-sm truncate">
                            {payment.raffleName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono truncate">
                            ID: {payment.id.slice(0, 8)}...
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {formatCurrency(payment.amount)}
                        </span>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                          {payment.entries}
                        </span>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{payment.method}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5">{getStatusBadge(payment.status)}</TableCell>

                      <TableCell className="py-3.5">
                        <span className="text-xs text-slate-600">
                          {formatDateTime(new Date(payment.createdAt))}
                        </span>
                      </TableCell>

                      <TableCell className="py-3.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg hover:bg-slate-100"
                            >
                              <MoreHorizontal className="h-4 w-4 text-slate-600" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 rounded-xl">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/payments/${payment.id}`}
                                className="flex items-center cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4 text-slate-500" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <ReceiptModal
                                payment={payment}
                                trigger={
                                  <div className="flex items-center w-full cursor-pointer">
                                    <Receipt className="mr-2 h-4 w-4 text-slate-500" />
                                    Send Receipt
                                  </div>
                                }
                              />
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* MOBILE CARD VIEW (hidden on desktop) */}
            <div className="md:hidden divide-y divide-slate-100">
              {payments.map((payment) => (
                <div key={payment.id} className="p-4 space-y-3 hover:bg-slate-50/50">
                  {/* Card top: Name and Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm truncate">
                        {payment.user?.name || "Customer"}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">{payment.user?.email}</p>
                    </div>
                    <div>{getStatusBadge(payment.status)}</div>
                  </div>

                  {/* Raffle & Amount details */}
                  <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Raffle:</span>
                      <span className="font-semibold text-slate-900 truncate max-w-[180px]">
                        {payment.raffleName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Amount:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Entries / Method:</span>
                      <span className="text-slate-700 font-medium">
                        {payment.entries} entries · {payment.method}
                      </span>
                    </div>
                    {payment.transactionId && (
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 font-mono text-[11px] text-slate-500">
                        <span>Trx ID:</span>
                        <span className="truncate max-w-[160px]">{payment.transactionId}</span>
                      </div>
                    )}
                  </div>

                  {/* Card footer: Date & Action button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">
                      {formatDateTime(new Date(payment.createdAt))}
                    </span>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs min-h-[38px] px-3 font-semibold"
                    >
                      <Link href={`/admin/payments/${payment.id}`}>
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PAGINATION TOOLBAR */}
        {pagination.total > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600 font-medium text-center sm:text-left">
              Showing <span className="font-bold text-slate-900">{startRecord}</span> to{" "}
              <span className="font-bold text-slate-900">{endRecord}</span> of{" "}
              <span className="font-bold text-slate-900">{pagination.total}</span> payments
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              {/* First Page */}
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={pagination.page <= 1 || isLoading}
                className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>

              {/* Prev Page */}
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev || isLoading}
                className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Numbered Page Buttons */}
              <div className="hidden sm:flex items-center gap-1">
                {getPaginationPages().map((p, idx) => {
                  if (p === "...") {
                    return (
                      <span key={`dots-${idx}`} className="px-2 text-xs text-slate-400">
                        ...
                      </span>
                    )
                  }
                  const pageNum = Number(p)
                  const isActive = pageNum === pagination.page
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setPage(pageNum)}
                      disabled={isLoading}
                      className={`min-h-[38px] min-w-[38px] text-xs font-semibold rounded-xl transition-colors ${
                        isActive
                          ? "bg-slate-900 text-white shadow-2xs"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              {/* Mobile Page Indicator */}
              <span className="sm:hidden text-xs font-semibold text-slate-700 px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              {/* Next Page */}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasNext || isLoading}
                className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Last Page */}
              <button
                type="button"
                onClick={() => setPage(pagination.totalPages)}
                disabled={pagination.page >= pagination.totalPages || isLoading}
                className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
