"use client"

import { useState, useEffect, useCallback } from "react"
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
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Trophy,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Shield,
  Sparkles,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  city?: string
  createdAt: string
  isActive: boolean
  _count: {
    entries: number
    winners: number
  }
  totalSpent: number
  lastActivity: string
}

interface CustomerStats {
  totalCustomers: number
  activeThisMonth: number
  totalRevenue: number
  vipCustomers: number
}

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    activeThisMonth: 0,
    totalRevenue: 0,
    vipCustomers: 0,
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

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1)
    }, 350)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // Server-side dynamic fetch
  const fetchCustomers = useCallback(
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

        const res = await fetch(`/api/admin/customers?${params.toString()}`, {
          headers: { "Cache-Control": "no-cache" },
        })

        if (!res.ok) {
          throw new Error(`Failed to fetch customers: ${res.statusText}`)
        }

        const data = await res.json()
        setCustomers(data.customers || [])
        if (data.pagination) setPagination(data.pagination)
        if (data.stats) setStats(data.stats)
      } catch (err: any) {
        console.error("Error fetching customers:", err)
        setError(err.message || "Failed to load customers")
      } finally {
        if (showLoading) setIsLoading(false)
      }
    },
    [page, limit, statusFilter, debouncedSearch]
  )

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const handleStatusChange = (status: string) => {
    setStatusFilter(status)
    setPage(1)
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }

  // Export CSV
  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams({
        all: "true",
        status: statusFilter,
        search: debouncedSearch,
      })
      const res = await fetch(`/api/admin/customers?${params.toString()}`)
      const data = await res.json()
      const exportList: Customer[] = data.customers || customers

      const headers = [
        "Customer ID",
        "Name",
        "Email",
        "Phone",
        "City",
        "Total Spent (PKR)",
        "Entries Count",
        "Wins Count",
        "Join Date",
        "Status",
      ]

      const rows = exportList.map((c) => [
        c.id,
        `"${c.name || ""}"`,
        `"${c.email || ""}"`,
        `"${c.phone || ""}"`,
        `"${c.city || ""}"`,
        (c.totalSpent / 100).toFixed(0),
        c._count.entries,
        c._count.winners,
        `"${formatDate(new Date(c.createdAt))}"`,
        c.isActive ? "Active" : "Inactive",
      ])

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `pakraffle-customers-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Exported ${exportList.length} customer records`)
    } catch (err) {
      console.error("CSV Export failed", err)
      toast.error("Failed to export customers")
    } finally {
      setIsExporting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

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
            Customer Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registered participants, engagement metrics, total spend & winners
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => fetchCustomers(true)}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Customers
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
              {stats.totalCustomers.toLocaleString()}
            </p>
            <span className="inline-block text-[11px] text-slate-400 mt-1">
              Registered platform users
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                New This Month
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-2">
              +{stats.activeThisMonth.toLocaleString()}
            </p>
            <span className="inline-block text-[11px] text-slate-400 mt-1">
              Joined during current month
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Customer LTV Volume
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 truncate">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <span className="inline-block text-[11px] text-slate-400 mt-1">
              Cumulative completed spend
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                VIP Tier Buyers
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-amber-600 mt-2">
              {stats.vipCustomers.toLocaleString()}
            </p>
            <span className="inline-block text-[11px] text-slate-400 mt-1">
              Spent Rs. 5,000+ total
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
              <Input
                placeholder="Search customers by name, email, phone, city..."
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

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {["All", "Active", "VIP", "Inactive"].map((status) => {
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
                    {status === "All" ? "All Customers" : status}
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={() => fetchCustomers(true)}>
            Retry
          </Button>
        </div>
      )}

      {/* Customer List Card */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Registered Customers</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {startRecord}–{endRecord} of {pagination.total} total members
            </p>
          </div>

          {/* Rows Per Page */}
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

        {/* LOADING SKELETON */}
        {/* LOADING SKELETON STATE */}
        {isLoading ? (
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-[850px]">
              <TableHeader className="bg-slate-50/75">
                <TableRow className="border-slate-200">
                  <TableHead className="font-semibold text-xs text-slate-600">Customer</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-600">Contact</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-600">Location</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-600">Entries</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-600">Total Spent</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-600">Wins</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-600">Status</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-600">Joined</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-slate-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(6)].map((_, i) => (
                  <TableRow key={i} className="border-slate-100">
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3 animate-pulse">
                        <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <div className="w-28 h-4 bg-slate-200 rounded" />
                          <div className="w-36 h-3 bg-slate-100 rounded" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="w-16 h-4 bg-slate-200 rounded animate-pulse" />
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="w-10 h-5 bg-slate-200 rounded animate-pulse" />
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="w-20 h-4 bg-slate-200 rounded animate-pulse" />
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="w-8 h-4 bg-slate-200 rounded animate-pulse" />
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="w-16 h-6 bg-slate-200 rounded-full animate-pulse" />
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="w-20 h-4 bg-slate-100 rounded animate-pulse" />
                    </TableCell>
                    <TableCell className="py-3.5 text-right">
                      <div className="w-8 h-8 bg-slate-100 rounded ml-auto animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : customers.length === 0 ? (
          /* EMPTY STATE */
          <div className="py-16 px-4 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No customers found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchTerm || statusFilter !== "All"
                ? "No customer matches your search or filter. Try clearing your filters."
                : "Customers will automatically be listed here as users register on your platform."}
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
          /* RESPONSIVE TABLE VIEW FOR ALL SCREEN SIZES */
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-[850px]">
              <TableHeader className="bg-slate-50/75">
                <TableRow className="border-slate-200">
                  <TableHead className="font-semibold text-xs text-slate-600">Customer</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-600">Contact</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-600">Location</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-600">Entries</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-600">Total Spent</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-600">Wins</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-600">Status</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-600">Joined</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-slate-600">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => {
                  const isVIP = customer.totalSpent >= 500000

                  return (
                    <TableRow
                      key={customer.id}
                      className="border-slate-100 hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Customer Avatar & Name */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                            {getInitials(customer.name)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-slate-900 text-sm truncate max-w-[150px]">
                              {customer.name}
                            </span>
                            <span className="text-xs text-slate-500 truncate max-w-[180px]">
                              {customer.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact details */}
                      <TableCell className="py-3.5">
                        <div className="space-y-0.5 text-xs text-slate-600">
                          {customer.phone ? (
                            <div className="flex items-center gap-1.5 font-medium text-slate-800">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{customer.phone}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">No phone</span>
                          )}
                        </div>
                      </TableCell>

                      {/* City */}
                      <TableCell className="py-3.5">
                        {customer.city ? (
                          <div className="flex items-center gap-1 text-xs text-slate-700 font-medium">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <span>{customer.city}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </TableCell>

                      {/* Entries count */}
                      <TableCell className="py-3.5">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                          {customer._count.entries}
                        </span>
                      </TableCell>

                      {/* Spent */}
                      <TableCell className="py-3.5">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {formatCurrency(customer.totalSpent)}
                        </span>
                      </TableCell>

                      {/* Wins */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-1 text-xs font-semibold text-amber-700">
                          <Trophy className="h-3.5 w-3.5 text-amber-500" />
                          <span>{customer._count.winners}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3.5">
                        {isVIP ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            VIP
                          </span>
                        ) : customer.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            Inactive
                          </span>
                        )}
                      </TableCell>

                      {/* Joined Date */}
                      <TableCell className="py-3.5">
                        <span className="text-xs text-slate-600 whitespace-nowrap">
                          {formatDate(new Date(customer.createdAt))}
                        </span>
                      </TableCell>

                      {/* Actions */}
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
                                href={`/admin/customers/${customer.id}`}
                                className="flex items-center cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4 text-slate-500" />
                                View Profile
                              </Link>
                            </DropdownMenuItem>
                            {customer.email && (
                              <DropdownMenuItem asChild>
                                <a
                                  href={`mailto:${customer.email}`}
                                  className="flex items-center cursor-pointer"
                                >
                                  <Mail className="mr-2 h-4 w-4 text-slate-500" />
                                  Email User
                                </a>
                              </DropdownMenuItem>
                            )}
                            {customer.phone && (
                              <DropdownMenuItem asChild>
                                <a
                                  href={`tel:${customer.phone}`}
                                  className="flex items-center cursor-pointer"
                                >
                                  <Phone className="mr-2 h-4 w-4 text-slate-500" />
                                  Call User
                                </a>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {pagination.total > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600 font-medium text-center sm:text-left">
              Showing <span className="font-bold text-slate-900">{startRecord}</span> to{" "}
              <span className="font-bold text-slate-900">{endRecord}</span> of{" "}
              <span className="font-bold text-slate-900">{pagination.total}</span> customers
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={pagination.page <= 1 || isLoading}
                className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev || isLoading}
                className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

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

              <span className="sm:hidden text-xs font-semibold text-slate-700 px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasNext || isLoading}
                className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

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
