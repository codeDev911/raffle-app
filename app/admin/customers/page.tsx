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
  CheckCircle2,
  XCircle,
  TrendingUp,
  Download,
  Eye,
  MoreHorizontal,
  Mail,
  Phone,
  Sparkles,
  RefreshCw,
  Trophy,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  DollarSign,
  Calendar,
  ArrowUpDown,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  city: string | null
  role: string
  isActive: boolean
  createdAt: string
  totalSpent: number
  _count: {
    entries: number
    winners: number
  }
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

  // Filters State
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [amountPreset, setAmountPreset] = useState("all")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [datePreset, setDatePreset] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

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
          sortBy,
          t: Date.now().toString(),
        })

        // Amount filters
        if (amountPreset === "gt10k") {
          params.append("minAmount", "10000")
        } else if (amountPreset === "gt5k") {
          params.append("minAmount", "5000")
        } else if (amountPreset === "1k_5k") {
          params.append("minAmount", "1000")
          params.append("maxAmount", "5000")
        } else if (amountPreset === "lt1k") {
          params.append("maxAmount", "1000")
        } else if (amountPreset === "custom") {
          if (minAmount && !isNaN(Number(minAmount))) params.append("minAmount", minAmount)
          if (maxAmount && !isNaN(Number(maxAmount))) params.append("maxAmount", maxAmount)
        }

        // Date filters
        if (datePreset !== "all" && datePreset !== "custom") {
          params.append("datePreset", datePreset)
        } else if (datePreset === "custom") {
          if (startDate) params.append("startDate", startDate)
          if (endDate) params.append("endDate", endDate)
        }

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
    [
      page,
      limit,
      statusFilter,
      debouncedSearch,
      amountPreset,
      minAmount,
      maxAmount,
      datePreset,
      startDate,
      endDate,
      sortBy,
    ]
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

  const handleAmountPresetChange = (preset: string) => {
    setAmountPreset(preset)
    if (preset !== "custom") {
      setMinAmount("")
      setMaxAmount("")
    }
    setPage(1)
  }

  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset)
    if (preset !== "custom") {
      setStartDate("")
      setEndDate("")
    }
    setPage(1)
  }

  const handleResetFilters = () => {
    setSearchTerm("")
    setDebouncedSearch("")
    setStatusFilter("All")
    setAmountPreset("all")
    setMinAmount("")
    setMaxAmount("")
    setDatePreset("all")
    setStartDate("")
    setEndDate("")
    setSortBy("newest")
    setPage(1)
  }

  const activeFilterCount =
    (statusFilter !== "All" ? 1 : 0) +
    (amountPreset !== "all" ? 1 : 0) +
    (datePreset !== "all" ? 1 : 0) +
    (searchTerm ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0)

  // Export CSV
  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams({
        all: "true",
        status: statusFilter,
        search: debouncedSearch,
        sortBy,
      })

      if (amountPreset === "gt10k") params.append("minAmount", "10000")
      else if (amountPreset === "gt5k") params.append("minAmount", "5000")
      else if (amountPreset === "1k_5k") {
        params.append("minAmount", "1000")
        params.append("maxAmount", "5000")
      } else if (amountPreset === "lt1k") params.append("maxAmount", "1000")
      else if (amountPreset === "custom") {
        if (minAmount) params.append("minAmount", minAmount)
        if (maxAmount) params.append("maxAmount", maxAmount)
      }

      if (datePreset !== "all" && datePreset !== "custom") {
        params.append("datePreset", datePreset)
      } else if (datePreset === "custom") {
        if (startDate) params.append("startDate", startDate)
        if (endDate) params.append("endDate", endDate)
      }

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

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute(
        "download",
        `customers_filtered_${new Date().toISOString().split("T")[0]}.csv`
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("Export failed:", err)
    } finally {
      setIsExporting(false)
    }
  }

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

  const startRecord = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const endRecord = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Customer Directory & Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Analyze customer spending patterns, registration timelines, and activity metrics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCustomers(true)}
            disabled={isLoading}
            className="rounded-xl border-slate-200 text-slate-700 min-h-[38px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={isExporting || pagination.total === 0}
            className="rounded-xl border-slate-200 text-slate-700 min-h-[38px] font-semibold"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Users
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
              {stats.totalCustomers.toLocaleString()}
            </p>
            <span className="inline-block text-[11px] text-slate-400 mt-1">
              Registered participants
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
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-2">
              {stats.activeThisMonth.toLocaleString()}
            </p>
            <span className="inline-block text-[11px] text-slate-400 mt-1">
              Recent sign-ups
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Gross Revenue
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 font-mono">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <span className="inline-block text-[11px] text-slate-400 mt-1">
              All completed payments
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

      {/* Main Search, Status & Advanced Filter Bar */}
      <Card className="rounded-2xl border border-slate-200/80 shadow-xs bg-white overflow-hidden">
        <CardContent className="p-4 sm:p-5 space-y-4">
          {/* Top Bar: Search, Status, and Toggle Advanced Filters */}
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

            {/* Status Pills */}
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
                    {status === "All" ? "All Statuses" : status}
                  </button>
                )
              })}

              {/* Advanced Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-colors min-h-[40px] ${
                  showAdvancedFilters || activeFilterCount > 0
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters & Analysis</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center ml-0.5">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ADVANCED FILTER PANEL (AMOUNT & DATE REGISTERED) */}
          {showAdvancedFilters && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 pt-4 mt-2 transition-all">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. AMOUNT SPENT FILTER */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      Amount Spent (PKR)
                    </label>
                    {amountPreset !== "all" && (
                      <button
                        type="button"
                        onClick={() => handleAmountPresetChange("all")}
                        className="text-[11px] text-red-600 hover:underline"
                      >
                        Reset Amount
                      </button>
                    )}
                  </div>

                  {/* Preset Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: "all", label: "Any Amount" },
                      { id: "gt10k", label: "> Rs. 10,000" },
                      { id: "gt5k", label: "> Rs. 5,000 (VIP)" },
                      { id: "1k_5k", label: "Rs. 1k – 5k" },
                      { id: "lt1k", label: "< Rs. 1,000" },
                      { id: "custom", label: "Custom Range" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleAmountPresetChange(p.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          amountPreset === p.id
                            ? "bg-emerald-600 text-white shadow-2xs font-semibold"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Min / Max inputs */}
                  {amountPreset === "custom" && (
                    <div className="grid grid-cols-2 gap-2 pt-1.5">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Min Spent (Rs)</span>
                        <Input
                          type="number"
                          placeholder="Min PKR"
                          min="0"
                          value={minAmount}
                          onChange={(e) => {
                            setMinAmount(e.target.value)
                            setPage(1)
                          }}
                          className="h-9 text-xs rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Max Spent (Rs)</span>
                        <Input
                          type="number"
                          placeholder="Max PKR"
                          min="0"
                          value={maxAmount}
                          onChange={(e) => {
                            setMaxAmount(e.target.value)
                            setPage(1)
                          }}
                          className="h-9 text-xs rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. REGISTRATION DATE FILTER */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      Registration Date
                    </label>
                    {datePreset !== "all" && (
                      <button
                        type="button"
                        onClick={() => handleDatePresetChange("all")}
                        className="text-[11px] text-red-600 hover:underline"
                      >
                        Reset Date
                      </button>
                    )}
                  </div>

                  {/* Date Preset Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: "all", label: "All Time" },
                      { id: "today", label: "Today" },
                      { id: "last7days", label: "Last 7 Days" },
                      { id: "last30days", label: "Last 30 Days" },
                      { id: "thisMonth", label: "This Month" },
                      { id: "custom", label: "Custom Dates" },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleDatePresetChange(d.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          datePreset === d.id
                            ? "bg-blue-600 text-white shadow-2xs font-semibold"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Date Inputs */}
                  {datePreset === "custom" && (
                    <div className="grid grid-cols-2 gap-2 pt-1.5">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Joined From</span>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => {
                            setStartDate(e.target.value)
                            setPage(1)
                          }}
                          className="h-9 text-xs rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Joined To</span>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => {
                            setEndDate(e.target.value)
                            setPage(1)
                          }}
                          className="h-9 text-xs rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. SORTING & ACTIONS */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-purple-600" />
                    Sort Analysis By
                  </label>

                  <Select
                    value={sortBy}
                    onValueChange={(val) => {
                      setSortBy(val)
                      setPage(1)
                    }}
                  >
                    <SelectTrigger className="h-9 rounded-xl bg-white text-xs border-slate-200">
                      <SelectValue placeholder="Sort customers" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-xs">
                      <SelectItem value="newest">Newest Registered</SelectItem>
                      <SelectItem value="oldest">Oldest Registered</SelectItem>
                      <SelectItem value="spent_desc">Highest Amount Spent</SelectItem>
                      <SelectItem value="spent_asc">Lowest Amount Spent</SelectItem>
                      <SelectItem value="entries_desc">Most Raffle Entries</SelectItem>
                      <SelectItem value="name_asc">Name (A–Z)</SelectItem>
                      <SelectItem value="name_desc">Name (Z–A)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="pt-2 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetFilters}
                      className="w-full rounded-xl text-xs h-9 border-slate-200 text-slate-600 hover:text-slate-900"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE FILTER BADGES STRIP */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-medium">Applied:</span>

              {statusFilter !== "All" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-semibold">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter("All")} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {amountPreset !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                  Spent:{" "}
                  {amountPreset === "gt10k"
                    ? "> Rs. 10k"
                    : amountPreset === "gt5k"
                      ? "> Rs. 5k"
                      : amountPreset === "1k_5k"
                        ? "Rs. 1k – 5k"
                        : amountPreset === "lt1k"
                          ? "< Rs. 1k"
                          : `Rs. ${minAmount || "0"} – ${maxAmount || "∞"}`}
                  <button onClick={() => handleAmountPresetChange("all")} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {datePreset !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-semibold">
                  Date:{" "}
                  {datePreset === "today"
                    ? "Today"
                    : datePreset === "last7days"
                      ? "Last 7 Days"
                      : datePreset === "last30days"
                        ? "Last 30 Days"
                        : datePreset === "thisMonth"
                          ? "This Month"
                          : `${startDate || "Start"} to ${endDate || "End"}`}
                  <button onClick={() => handleDatePresetChange("all")} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {sortBy !== "newest" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-semibold">
                  Sorted: {sortBy.replace("_", " ")}
                  <button onClick={() => setSortBy("newest")} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-red-600 hover:underline text-[11px] font-semibold ml-auto"
              >
                Reset All
              </button>
            </div>
          )}
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
              {activeFilterCount > 0
                ? "No customer matches your specified amount, date, or status filter. Try clearing your filters."
                : "Customers will automatically be listed here as users register on your platform."}
            </p>
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="mt-4 rounded-xl text-xs"
              >
                Reset All Filters
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
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => setPage(1)}
                disabled={!pagination.hasPrev || isLoading}
              >
                <ChevronsLeft className="h-4 w-4" />
                <span className="sr-only">First page</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>

              <div className="px-3 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-800">
                Page {pagination.page} of {pagination.totalPages}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasNext || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => setPage(pagination.totalPages)}
                disabled={!pagination.hasNext || isLoading}
              >
                <ChevronsRight className="h-4 w-4" />
                <span className="sr-only">Last page</span>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
