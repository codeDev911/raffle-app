"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  Tag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  DollarSign,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Smartphone,
  Bike,
  Gamepad2,
  Laptop,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProductRequest {
  id: string
  productType: string
  productName: string
  description: string
  phone: string
  email: string
  fullNameCnic: string
  cnicNumber?: string | null
  city?: string | null
  marketPrice: number
  ticketPrice: number
  totalTickets: number
  totalRevenue: number
  platformFee: number
  sellerPayout: number
  condition?: string | null
  images: string[]
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED"
  adminNotes?: string | null
  createdAt: string
  updatedAt: string
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ProductRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/listing-requests")
      const data = await res.json()
      if (data.success && Array.isArray(data.requests)) {
        setRequests(data.requests)
      }
    } catch (err) {
      console.error("Failed to load requests:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/listing-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus as any } : r))
        )
      }
    } catch (err) {
      console.error("Failed to update status:", err)
    } finally {
      setActionLoading(null)
    }
  }

  // Filter requests
  const filtered = requests.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false
    if (typeFilter !== "ALL" && r.productType !== typeFilter) return false
    if (!search.trim()) return true

    const q = search.toLowerCase()
    return (
      r.productName?.toLowerCase().includes(q) ||
      r.fullNameCnic?.toLowerCase().includes(q) ||
      r.phone?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.city?.toLowerCase().includes(q) ||
      r.cnicNumber?.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    )
  })

  // Aggregated Stats
  const totalCount = requests.length
  const pendingCount = requests.filter((r) => r.status === "PENDING").length
  const underReviewCount = requests.filter((r) => r.status === "UNDER_REVIEW").length
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length
  const totalMarketVolume = requests.reduce((sum, r) => sum + (r.marketPrice || 0), 0)
  const totalEstimatedFees = requests.reduce((sum, r) => sum + (r.platformFee || 0), 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Pending Review</span>
          </Badge>
        )
      case "UNDER_REVIEW":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>Under Review</span>
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Approved</span>
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300 font-semibold flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Product Listing Requests
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review user-submitted products, CNIC legal verification, market valuations &amp; 8% platform fee
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRequests}
            disabled={loading}
            className="rounded-xl h-10 px-3.5 text-xs font-semibold gap-2 border-slate-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-4 text-xs font-semibold shadow-xs">
            <Link href="/list-product" target="_blank">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              <span>Public Submission Form</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-slate-200/90 shadow-2xs">
          <CardContent className="p-4 sm:p-5">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Total Requests
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {totalCount}
              </span>
              <span className="text-xs font-semibold text-emerald-600">
                {approvedCount} Approved
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">All submitted assets</span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/90 shadow-2xs">
          <CardContent className="p-4 sm:p-5">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Pending Verification
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
                {pendingCount}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {underReviewCount} in review
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">Requires seller contact</span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/90 shadow-2xs">
          <CardContent className="p-4 sm:p-5">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Requested Asset Volume
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
                Rs. {(totalMarketVolume / 1000000).toFixed(2)}M
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">Total market value</span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/90 shadow-2xs bg-gradient-to-br from-emerald-50/50 to-white">
          <CardContent className="p-4 sm:p-5">
            <span className="text-xs font-medium text-emerald-800 uppercase tracking-wider block">
              Platform Fee (8%) Potential
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono">
                Rs. {totalEstimatedFees.toLocaleString()}
              </span>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
              8% from completed campaigns
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <Card className="rounded-2xl border-slate-200/90 shadow-2xs">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by product, seller name, CNIC, phone, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 rounded-xl text-xs sm:text-sm bg-white"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-56">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold focus:outline-hidden focus:border-slate-400"
              >
                <option value="ALL">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Vehicles">Vehicles &amp; Bikes</option>
                <option value="Gaming">Gaming &amp; Consoles</option>
                <option value="Laptops">Laptops</option>
                <option value="Appliances">Appliances</option>
                <option value="Watches">Watches</option>
                <option value="Other">Other Assets</option>
              </select>
            </div>
          </div>

          {/* Status Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Status:
            </span>
            {[
              { id: "ALL", label: `All (${requests.length})` },
              { id: "PENDING", label: `Pending (${pendingCount})` },
              { id: "UNDER_REVIEW", label: `Under Review (${underReviewCount})` },
              { id: "APPROVED", label: `Approved (${approvedCount})` },
              { id: "REJECTED", label: `Rejected (${requests.filter((r) => r.status === "REJECTED").length})` },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setStatusFilter(chip.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                  statusFilter === chip.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Requests Table */}
      <Card className="rounded-2xl border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider py-3.5 pl-6">
                  Ref &amp; Date
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider py-3.5">
                  Product Details
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider py-3.5">
                  Seller (CNIC Name)
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider py-3.5 text-right">
                  Market Price
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider py-3.5 text-right">
                  Ticket &amp; Cap
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider py-3.5 text-right">
                  8% Fee / Net Payout
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider py-3.5 text-center">
                  Status
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider py-3.5 pr-6 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent mx-auto mb-2" />
                    <p className="text-xs font-medium">Loading product requests...</p>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                      <Tag className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">No product requests found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {search ? "Try adjusting your search criteria" : "New submissions will appear here automatically"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Ref ID & Date */}
                    <TableCell className="pl-6 py-4">
                      <span className="font-mono text-xs font-bold text-slate-900 block">
                        {item.id}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </TableCell>

                    {/* Product Name & Type */}
                    <TableCell className="py-4 max-w-xs">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          {item.productType === "Vehicles" ? (
                            <Bike className="w-4 h-4" />
                          ) : item.productType === "Gaming" ? (
                            <Gamepad2 className="w-4 h-4" />
                          ) : item.productType === "Laptops" ? (
                            <Laptop className="w-4 h-4" />
                          ) : (
                            <Smartphone className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/requests/${item.id}`}
                            className="font-bold text-xs sm:text-sm text-slate-900 hover:text-emerald-700 line-clamp-1 transition-colors"
                          >
                            {item.productName}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                              {item.productType}
                            </span>
                            {item.condition && (
                              <span className="text-[10px] text-slate-500 truncate">
                                {item.condition}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Seller Name as per CNIC */}
                    <TableCell className="py-4">
                      <div className="min-w-0">
                        <span className="font-semibold text-xs text-slate-900 block truncate">
                          {item.fullNameCnic}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="font-mono">{item.phone}</span>
                        </div>
                        {item.city && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            <span>{item.city}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Market Price */}
                    <TableCell className="py-4 text-right">
                      <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 block">
                        Rs. {item.marketPrice.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Seller Target</span>
                    </TableCell>

                    {/* Ticket Price & Cap */}
                    <TableCell className="py-4 text-right">
                      <span className="font-mono font-semibold text-xs text-amber-600 block">
                        Rs. {item.ticketPrice.toLocaleString()}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                        {item.totalTickets.toLocaleString()} Tickets
                      </span>
                    </TableCell>

                    {/* 8% Platform Fee & Net Payout */}
                    <TableCell className="py-4 text-right">
                      <span className="font-mono font-bold text-xs text-emerald-700 block">
                        Rs. {item.sellerPayout.toLocaleString()} (92%)
                      </span>
                      <span className="font-mono text-[10px] text-red-500 block mt-0.5">
                        -Rs. {item.platformFee.toLocaleString()} (8%)
                      </span>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="py-4 text-center">
                      <div className="flex justify-center">
                        {getStatusBadge(item.status)}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="pr-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50"
                        >
                          <Link href={`/admin/requests/${item.id}`}>
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            <span>Details</span>
                          </Link>
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={actionLoading === item.id}
                              className="h-8 px-2 rounded-lg text-xs border-slate-200"
                            >
                              Status
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 rounded-xl text-xs">
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(item.id, "UNDER_REVIEW")}
                              className="font-medium cursor-pointer"
                            >
                              Under Review
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(item.id, "APPROVED")}
                              className="font-medium text-emerald-700 cursor-pointer"
                            >
                              Approve Request
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(item.id, "REJECTED")}
                              className="font-medium text-red-600 cursor-pointer"
                            >
                              Reject Request
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(item.id, "PENDING")}
                              className="font-medium text-slate-600 cursor-pointer"
                            >
                              Reset to Pending
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
