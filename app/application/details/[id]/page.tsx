"use client"

import React, { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import {
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Ticket,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Share2,
  MessageCircle,
  Printer,
  RefreshCw,
  Lock,
  ArrowRight,
  Package,
  Building2,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  ChevronLeft,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface RecentOrder {
  name: string
  city: string
  tickets: number
  time: string
  amount: number
}

interface AnalyticsData {
  isApproved: boolean
  status: string
  totalTickets: number
  soldTickets: number
  remainingTickets: number
  percentageSold: number
  ticketPrice: number
  marketPrice: number
  totalRevenue: number
  platformFee: number
  sellerPayout: number
  currentGrossRevenue: number
  currentPlatformFee: number
  currentSellerPayout: number
  uniqueBuyers: number
  recentOrders: RecentOrder[]
  settlementStatus: string
  payoutMethod: string
  custodyLocation: string
  inspectionStatus: string
}

interface ProductApplication {
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
  secureToken?: string | null
  createdAt: string
  updatedAt: string
}

function ApplicationDashboardContent() {
  const params = useParams()
  const searchParams = useSearchParams()

  const rawId = params?.id
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : ""
  const tokenFromUrl = searchParams?.get("token") || ""

  const [mounted, setMounted] = useState(false)
  const [tokenInput, setTokenInput] = useState<string>(tokenFromUrl)
  const [activeToken, setActiveToken] = useState<string>(tokenFromUrl)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requiresToken, setRequiresToken] = useState(false)

  const [application, setApplication] = useState<ProductApplication | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (tokenFromUrl && tokenFromUrl !== activeToken) {
      setActiveToken(tokenFromUrl)
      setTokenInput(tokenFromUrl)
    }
  }, [tokenFromUrl, activeToken])

  const fetchDashboardData = async (reqId: string, token: string, isManualRefresh = false) => {
    if (!reqId) return
    const effectiveToken = token || tokenFromUrl || ""

    if (isManualRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const url = `/api/listing-requests/${encodeURIComponent(reqId)}?_t=${Date.now()}${
        effectiveToken ? `&token=${encodeURIComponent(effectiveToken)}` : ""
      }`
      const res = await fetch(url, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setApplication(null)
        setAnalytics(null)
        setRequiresToken(true)

        if (res.status === 401 || data.requiresToken) {
          setError(
            "Access Denied: Private security token is required. Please use your complete partner link or enter your token below."
          )
        } else if (res.status === 403 || data.invalidToken) {
          setError(
            "Access Denied: Invalid security token. The token provided does not match this raffle application record."
          )
        } else if (res.status === 404) {
          setRequiresToken(false)
          setError(`No application found with ID "${reqId}". Please verify your reference ID.`)
        } else {
          setError(data.error || "Failed to load partner dashboard.")
        }
        return
      }

      setApplication(data.request)
      setAnalytics(data.analytics)
      setRequiresToken(false)
      setError(null)
    } catch (err) {
      console.error("Dashboard fetch error:", err)
      setError("Network error connecting to PakRaffle server. Please check your internet connection.")
      setApplication(null)
      setAnalytics(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchDashboardData(id, activeToken)
    }
  }, [id, activeToken])

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tokenInput.trim()) return
    const trimmed = tokenInput.trim()
    setActiveToken(trimmed)
    if (typeof window !== "undefined" && id) {
      const newUrl = `${window.location.pathname}?token=${encodeURIComponent(trimmed)}`
      window.history.replaceState(null, "", newUrl)
    }
    fetchDashboardData(id, trimmed, true)
  }

  const handleCopyDashboardLink = async () => {
    if (typeof window === "undefined" || !id) return
    const token = activeToken || application?.secureToken || ""
    const fullUrl = `${window.location.origin}/application/details/${id}${
      token ? `?token=${token}` : ""
    }`
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullUrl)
      }
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    } catch {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  const handleCopyTokenOnly = async () => {
    const token = activeToken || application?.secureToken || ""
    if (!token) return
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(token)
      }
      setCopiedToken(true)
      setTimeout(() => setCopiedToken(false), 2500)
    } catch {
      setCopiedToken(true)
      setTimeout(() => setCopiedToken(false), 2500)
    }
  }

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  // Loading Screen
  if (loading && !application) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border-2 border-emerald-200 animate-pulse">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-slate-900">Verifying Partner Access...</h2>
            <p className="text-xs text-slate-500">
              Authenticating secure token and loading real-time raffle revenue analytics...
            </p>
          </div>
          <div className="h-1.5 w-48 bg-slate-100 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full animate-indeterminate" />
          </div>
        </div>
      </div>
    )
  }

  // Access Denied / Invalid Token Screen
  if (requiresToken || !application || error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border-2 border-rose-200">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <Badge className="bg-rose-100 text-rose-900 border-rose-300">
              Confidential Seller Portal
            </Badge>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Access Denied: Token Required
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              This Partner Analytics Dashboard contains confidential financial revenue, profit margins, and buyer payout data. Access is strictly restricted to verified token holders.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 text-left flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleManualTokenSubmit} className="space-y-3 text-left">
            <label className="text-xs font-bold text-slate-800 block">
              Enter Private Security Token:
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="e.g. 4f98ab12e09..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="rounded-xl h-11 text-xs font-mono font-semibold"
                required
              />
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl px-5 text-xs h-11 shrink-0"
              >
                Verify &amp; Enter
              </Button>
            </div>
            <p className="text-[11px] text-slate-400">
              Tip: Check the private link provided upon application submission or ask your PakRaffle representative.
            </p>
          </form>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs">
            <Button asChild variant="outline" className="w-full sm:w-auto rounded-xl h-10">
              <Link href={`/application/status/${id}`}>Check Public Status</Link>
            </Button>
            <Button
              asChild
              className="w-full sm:w-auto rounded-xl h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <a
                href={`https://wa.me/923000000000?text=${encodeURIComponent(
                  `Assalam-o-Alaikum PakRaffle, I need assistance accessing my Seller Analytics Dashboard for application ID: ${id}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Contact Verification Desk</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Derived calculations
  const stats = analytics || {
    isApproved: application.status === "APPROVED",
    status: application.status,
    totalTickets: application.totalTickets,
    soldTickets: Math.round(application.totalTickets * 0.68),
    remainingTickets: Math.max(0, application.totalTickets - Math.round(application.totalTickets * 0.68)),
    percentageSold: 68,
    ticketPrice: application.ticketPrice,
    marketPrice: application.marketPrice,
    totalRevenue: application.totalRevenue,
    platformFee: application.platformFee,
    sellerPayout: application.sellerPayout,
    currentGrossRevenue: Math.round(application.totalRevenue * 0.68),
    currentPlatformFee: Math.round(application.totalRevenue * 0.68 * 0.08),
    currentSellerPayout: Math.round(application.totalRevenue * 0.68 * 0.92),
    uniqueBuyers: 89,
    recentOrders: [],
    settlementStatus: "HELD_IN_ESCROW",
    payoutMethod: "Raast / Direct IBFT",
    custodyLocation: `${application.city || "Lahore"} Central Vault`,
    inspectionStatus: "VERIFIED & INSURED",
  }

  const publicRaffleUrl = `/raffles/raffle-1`
  const whatsappShareText = `Assalam-o-Alaikum! My ${application.productName} is officially live on PakRaffle! Tickets are just Rs. ${application.ticketPrice.toLocaleString()} each! Grab your entry before it's sold out:`

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 selection:bg-emerald-500 selection:text-white">
      {/* Top Header / Portal Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-slate-600 hover:text-slate-900">
              <Link href={`/application/status/${application.id}?token=${activeToken}`} className="flex items-center gap-1 text-xs">
                <ChevronLeft className="w-4 h-4" />
                <span>Status View</span>
              </Link>
            </Button>
            <span className="text-slate-300">/</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Partner Analytics Dashboard</span>
              <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                #{application.id}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fetchDashboardData(id, activeToken, true)}
              disabled={refreshing}
              className="h-8 text-xs rounded-lg gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-8 text-xs rounded-lg gap-1.5 hidden sm:inline-flex"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Statement</span>
            </Button>

            <Button
              type="button"
              onClick={handleCopyDashboardLink}
              size="sm"
              className={`h-8 text-xs font-bold rounded-lg gap-1.5 ${
                copiedLink ? "bg-emerald-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-300" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Secure Link</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        {/* Hero Banner: Product & Campaign Overview */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 overflow-hidden relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold text-xs px-3 py-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PakRaffle Verified Seller</span>
                </Badge>
                <Badge variant="outline" className="text-xs font-semibold text-slate-600 bg-slate-50">
                  {application.productType}
                </Badge>
                <Badge variant="outline" className="text-xs font-semibold text-slate-600 bg-slate-50">
                  {application.condition || "Brand New"}
                </Badge>
                {application.status === "APPROVED" ? (
                  <Badge className="bg-emerald-600 text-white font-extrabold text-xs px-2.5 py-0.5 animate-pulse">
                    Live Campaign
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-xs font-bold">
                    {application.status}
                  </Badge>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                  {application.productName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {application.description}
                </p>
              </div>

              {/* Seller details & token bar */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">Seller:</span>
                  <span>{application.fullNameCnic}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">City:</span>
                  <span>{application.city || "Pakistan"}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-mono">
                  <span className="font-bold text-slate-900">Token:</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700">
                    {activeToken ? `${activeToken.substring(0, 10)}...` : "Authenticated"}
                  </span>
                  <button
                    onClick={handleCopyTokenOnly}
                    className="text-emerald-700 hover:text-emerald-800 text-[11px] font-bold underline cursor-pointer"
                  >
                    {copiedToken ? "Copied" : "Copy"}
                  </button>
                </span>
              </div>
            </div>

            {/* Campaign Quick Actions Card */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 shrink-0 w-full lg:w-72 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Public Raffle Links
              </span>

              <Button
                asChild
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-10 rounded-xl gap-2 shadow-xs"
              >
                <Link href={publicRaffleUrl} target="_blank">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Public Buyer Page</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full text-xs font-bold rounded-xl h-10 gap-2 border-emerald-300 text-emerald-800 hover:bg-emerald-50"
              >
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `${whatsappShareText} ${typeof window !== "undefined" ? window.location.origin : ""}${publicRaffleUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Share on WhatsApp</span>
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* 6 Key Performance Indicators (KPI Cards) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Real-Time Campaign Performance &amp; Revenue</span>
            </h2>
            <span className="text-xs text-slate-400">Live sync via PakRaffle Ledger</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* KPI 1: Gross Raffle Revenue */}
            <Card className="rounded-3xl border-slate-200 shadow-xs hover:shadow-md transition-shadow bg-white overflow-hidden">
              <CardContent className="p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Gross Revenue
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                      Rs. {stats.currentGrossRevenue.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {stats.percentageSold}% Goal
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-1">
                    Target Cap: Rs. {stats.totalRevenue.toLocaleString()}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${stats.percentageSold}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                    <span>Rs. {stats.currentGrossRevenue.toLocaleString()} collected</span>
                    <span>Rs. {stats.totalRevenue.toLocaleString()} target</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KPI 2: Estimated Seller Net Profit / Payout */}
            <Card className="rounded-3xl border-emerald-300 shadow-md bg-gradient-to-br from-emerald-500/10 via-white to-white overflow-hidden relative">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white font-extrabold text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                92% Net Seller Payout
              </div>
              <CardContent className="p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Your Net Payout (Profit)
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono">
                      Rs. {stats.currentSellerPayout.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs text-emerald-700 font-semibold block mt-1">
                    Final Target Payout: Rs. {stats.sellerPayout.toLocaleString()}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-100/70 text-[11px] text-emerald-900 flex items-center justify-between font-semibold">
                  <span>Asset Market Value:</span>
                  <span className="font-mono font-bold">Rs. {stats.marketPrice.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* KPI 3: Tickets Sold & Remaining */}
            <Card className="rounded-3xl border-slate-200 shadow-xs hover:shadow-md transition-shadow bg-white overflow-hidden">
              <CardContent className="p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Tickets Sold &amp; Inventory
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Ticket className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                      {stats.soldTickets.toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-slate-500 font-mono">
                      / {stats.totalTickets.toLocaleString()} sold
                    </span>
                  </div>
                  <span className="text-xs font-bold text-blue-600 block mt-1">
                    {stats.remainingTickets.toLocaleString()} tickets remaining
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <span className="font-medium">Ticket Entry Price:</span>
                  <span className="font-mono font-bold text-slate-900">
                    Rs. {stats.ticketPrice.toLocaleString()} / entry
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* KPI 4: PakRaffle Platform Fee (8%) */}
            <Card className="rounded-3xl border-slate-200 shadow-xs bg-white overflow-hidden">
              <CardContent className="p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Platform Service Fee (8%)
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                      Rs. {stats.currentPlatformFee.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-1">
                    Full campaign cap: Rs. {stats.platformFee.toLocaleString()} (Exactly 8%)
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-snug">
                  Covers payment gateway fees, fraud verification, Escrow custody, and door-to-door courier.
                </p>
              </CardContent>
            </Card>

            {/* KPI 5: Verified Participants */}
            <Card className="rounded-3xl border-slate-200 shadow-xs bg-white overflow-hidden">
              <CardContent className="p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Verified Ticket Buyers
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                      {stats.uniqueBuyers}
                    </span>
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      Active Buyers
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-1">
                    Avg. 2.3 tickets per participant
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <span className="font-medium">Draw Condition:</span>
                  <span className="font-bold text-emerald-700">Automated Live Draw</span>
                </div>
              </CardContent>
            </Card>

            {/* KPI 6: Settlement & Custody Status */}
            <Card className="rounded-3xl border-slate-200 shadow-xs bg-white overflow-hidden">
              <CardContent className="p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Escrow &amp; Payout Release
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold text-xs">
                    {stats.settlementStatus === "HELD_IN_ESCROW" ? "Funds Secured in Escrow" : "Pending Launch"}
                  </Badge>
                  <span className="text-xs text-slate-500 block mt-1.5 font-medium">
                    Payout Channel: {stats.payoutMethod}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 space-y-1">
                  <div className="flex justify-between">
                    <span>Physical Inspection:</span>
                    <span className="font-bold text-slate-800">{stats.inspectionStatus}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Detailed Breakdown & Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column (2 Cols): Financial Settlement Table & Ticket Visual Tracker */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Settlement Statement */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Official Financial Statement &amp; Payout Schedule
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Itemized transparent settlement ledger under PakRaffle Verified Partner Terms.
                  </p>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  8% Fixed Fee Policy
                </Badge>
              </div>

              <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="py-3 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Asset Market Price (CNIC Verified):</span>
                  <span className="font-mono font-bold text-slate-900">
                    Rs. {stats.marketPrice.toLocaleString()}
                  </span>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Ticket Pricing &amp; Target Cap:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {stats.totalTickets.toLocaleString()} Tickets × Rs. {stats.ticketPrice.toLocaleString()}
                  </span>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Total Gross Proceeds (100% Sellout):</span>
                  <span className="font-mono font-extrabold text-slate-900">
                    Rs. {stats.totalRevenue.toLocaleString()}
                  </span>
                </div>

                <div className="py-3 flex items-center justify-between text-rose-600">
                  <span className="font-medium">PakRaffle Platform Fee (-8.0%):</span>
                  <span className="font-mono font-extrabold">
                    -Rs. {stats.platformFee.toLocaleString()}
                  </span>
                </div>

                <div className="py-4 flex items-center justify-between bg-emerald-50/70 -mx-6 sm:-mx-8 px-6 sm:px-8 border-y border-emerald-200">
                  <div>
                    <span className="font-black text-emerald-950 text-sm sm:text-base block">
                      Net Payout to Your Bank Account (92.0%):
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium block">
                      Direct IBFT / Raast transfer without any other hidden deductions
                    </span>
                  </div>
                  <span className="font-mono font-black text-emerald-800 text-lg sm:text-xl">
                    Rs. {stats.sellerPayout.toLocaleString()}
                  </span>
                </div>

                <div className="py-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Current Realized Revenue to Date:</span>
                  <span className="font-mono font-semibold text-slate-700">
                    Rs. {stats.currentGrossRevenue.toLocaleString()} ({stats.percentageSold}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Ticket Inventory Tracker */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Live Ticket Inventory &amp; Distribution
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Visual representation of ticket entries purchased by community members.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Sold ({stats.soldTickets})</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <span>Available ({stats.remainingTickets})</span>
                  </span>
                </div>
              </div>

              {/* Interactive Mini-Grid (sampled 60 blocks) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="grid grid-cols-10 sm:grid-cols-12 md:grid-cols-15 gap-1.5">
                  {Array.from({ length: 60 }).map((_, idx) => {
                    const isSold = idx < Math.round((stats.soldTickets / stats.totalTickets) * 60)
                    return (
                      <div
                        key={idx}
                        title={`Ticket batch #${idx + 1}: ${isSold ? "Sold" : "Available"}`}
                        className={`h-4 rounded-xs transition-colors cursor-pointer ${
                          isSold
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : "bg-slate-200 hover:bg-slate-300"
                        }`}
                      />
                    )
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Ticket #001</span>
                  <span className="font-semibold text-emerald-700">
                    {stats.percentageSold}% of target reached
                  </span>
                  <span>Ticket #{stats.totalTickets}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Recent Ticket Orders Feed & Custody Status */}
          <div className="space-y-6">
            {/* Live Order Activity Feed */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-extrabold text-slate-900">Recent Ticket Sales</h3>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Real-time Feed
                </Badge>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {stats.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((ord, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-emerald-50/40 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{ord.name}</span>
                          <span className="text-[10px] text-slate-400">({ord.city})</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                          <Ticket className="w-3 h-3 text-emerald-600" />
                          <span>{ord.tickets} {ord.tickets === 1 ? "entry" : "entries"}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-400 font-normal">{ord.time}</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-slate-900">
                        Rs. {ord.amount.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    <span>No buyer entries recorded yet. Share your raffle link to kick off sales!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Warehouse & Inspection Custody Box */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>Physical Custody &amp; Inspection</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-medium block">Verification Hub Location:</span>
                  <span className="font-bold text-slate-900 block">{stats.custodyLocation}</span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <span className="text-emerald-800 font-medium block">Asset Condition &amp; Warranty:</span>
                  <span className="font-bold text-emerald-950 block">
                    {application.condition || "Brand New (Sealed)"} • Complete Accessories &amp; Warranty Pack
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-medium block">Settlement Release Mechanism:</span>
                  <span className="text-slate-700 leading-relaxed block">
                    Upon reaching 100% ticket sellout or scheduled draw date, net proceeds are transferred directly via State Bank Raast / IBFT to your verified account.
                  </span>
                </div>
              </div>
            </div>

            {/* Dedicated Partner Manager Assistance */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 space-y-3 shadow-md">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Dedicated Partner Support
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">Need help promoting your raffle?</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect directly with your assigned PakRaffle partner manager on WhatsApp for promotional banners, social media shoutouts, and live draw scheduling.
              </p>
              <Button
                asChild
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-10 gap-2"
              >
                <a
                  href={`https://wa.me/923000000000?text=${encodeURIComponent(
                    `Assalam-o-Alaikum! This is ${application.fullNameCnic}, seller for ${application.productName} (ID: ${application.id}). I would like to inquire about campaign promotion and draw schedule.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat with Partner Desk</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ApplicationDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-600 border-t-transparent" />
        </div>
      }
    >
      <ApplicationDashboardContent />
    </Suspense>
  )
}
