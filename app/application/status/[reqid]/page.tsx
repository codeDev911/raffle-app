"use client"

import React, { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  PackageCheck,
  Truck,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  FileText,
  Sparkles,
  ArrowRight,
  Lock,
  Building2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Ticket,
  ChevronRight,
  Info,
  RefreshCw,
  Printer,
  ChevronLeft,
  Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface ApplicationData {
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
  images?: string[]
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED"
  adminNotes?: string | null
  secureToken?: string | null
  createdAt: string | Date
  updatedAt: string | Date
}

function StatusDetailContent() {
  const params = useParams()
  const searchParams = useSearchParams()

  const rawReqId = params?.reqid
  const reqId = typeof rawReqId === "string" ? rawReqId : Array.isArray(rawReqId) ? rawReqId[0] : ""
  const tokenFromUrl = searchParams.get("token") || ""

  const [mounted, setMounted] = useState(false)
  const [origin, setOrigin] = useState("")
  const [tokenInput, setTokenInput] = useState<string>(tokenFromUrl)
  const [activeToken, setActiveToken] = useState<string>(tokenFromUrl)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requiresToken, setRequiresToken] = useState(false)
  const [application, setApplication] = useState<ApplicationData | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  // Track hydration / window origin safely
  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin)
    }
  }, [])

  // Sync token from URL whenever URL changes
  useEffect(() => {
    if (tokenFromUrl && tokenFromUrl !== activeToken) {
      setActiveToken(tokenFromUrl)
      setTokenInput(tokenFromUrl)
    }
  }, [tokenFromUrl, activeToken])

  // Fetch status from API
  const fetchStatus = async (id: string, token: string, isManualRefresh = false) => {
    if (!id) return
    const effectiveToken = token || tokenFromUrl || ""
    if (isManualRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const url = `/api/listing-requests/${encodeURIComponent(id)}?_t=${Date.now()}${
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
        setRequiresToken(true)
        if (res.status === 401 || data.requiresToken) {
          setError(
            "Access Denied: Private tracking token is required. Please provide a valid security token to view this application."
          )
        } else if (res.status === 403 || data.invalidToken) {
          setError(
            "Access Denied: The security token provided is invalid. Please check your reference link or enter the correct token below."
          )
        } else if (res.status === 404) {
          setRequiresToken(false)
          setError(`No application found with ID "${id}". Please check your Reference ID.`)
        } else {
          setError(data.error || "Failed to load application status.")
        }
        return
      } else {
        setApplication(data.request)
        setRequiresToken(false)
        setError(null)
      }
    } catch (err: any) {
      console.error("Status fetch error:", err)
      setError("Network error while connecting to PakRaffle server. Please check your connection.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Trigger fetch when reqId or activeToken changes
  useEffect(() => {
    if (reqId) {
      fetchStatus(reqId, activeToken)
    }
  }, [reqId, activeToken])

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tokenInput.trim()) return
    const trimmed = tokenInput.trim()
    setActiveToken(trimmed)
    if (typeof window !== "undefined" && reqId) {
      const newUrl = `${window.location.pathname}?token=${encodeURIComponent(trimmed)}`
      window.history.replaceState(null, "", newUrl)
    }
    fetchStatus(reqId, trimmed, true)
  }

  const handleCopyLink = async () => {
    if (typeof window === "undefined" || !reqId) return
    const token = activeToken || application?.secureToken || ""
    const fullUrl = `${window.location.origin}/application/status/${reqId}${
      token ? `?token=${token}` : ""
    }`
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullUrl)
      } else {
        const textArea = document.createElement("textarea")
        textArea.value = fullUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    } catch (err) {
      console.error("Clipboard copy failed:", err)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 bg-slate-200 rounded-lg w-1/3 animate-pulse" />
          <div className="h-44 bg-slate-200 rounded-3xl animate-pulse" />
          <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
          <div className="h-48 bg-slate-200 rounded-3xl animate-pulse" />
        </div>
      </div>
    )
  }

  // Token missing or invalid state
  if (requiresToken || (error && !application)) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center border-2 border-amber-300">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <Badge className="bg-amber-100 text-amber-900 border-amber-300 mb-2">
              Private Application Security
            </Badge>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Secure Access Token Required
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Product listing applications contain confidential seller CNIC, phone numbers, and physical escrow custody details. To view this record, provide your private tracking token.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 text-left flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleManualTokenSubmit} className="space-y-3 text-left">
            <label className="text-xs font-bold text-slate-800 block">
              Enter Private Token:
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="e.g. 4f98ab12e09..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="rounded-xl h-11 text-xs font-mono font-medium"
                required
              />
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-5 text-xs h-11"
              >
                Access
              </Button>
            </div>
            <p className="text-[11px] text-slate-500">
              Tip: The token is part of the URL you received after submitting your listing application.
            </p>
          </form>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs">
            <Button asChild variant="outline" className="w-full sm:w-auto rounded-xl h-10">
              <Link href="/list-product">Back to Sell Product</Link>
            </Button>
            <Button
              asChild
              className="w-full sm:w-auto rounded-xl h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <a
                href={`https://wa.me/923000000000?text=${encodeURIComponent(
                  `Assalam o Alaikum PakRaffle, I need help accessing my listing application status for ID: ${reqId}`
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

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800">No application details available</h2>
        <Button asChild className="mt-4 rounded-xl">
          <Link href="/list-product">Go to Sell Product</Link>
        </Button>
      </div>
    )
  }

  // Stepper Stage configuration
  const getStageIndex = (status: string) => {
    switch (status) {
      case "PENDING":
        return 1
      case "UNDER_REVIEW":
        return 2
      case "APPROVED":
        return 4
      case "REJECTED":
        return 1
      default:
        return 1
    }
  }

  const currentStage = getStageIndex(application.status)

  const steps = [
    {
      num: 1,
      title: "Application Received",
      desc: "Specs & contact logged into verification queue",
      active: true,
      completed: true,
    },
    {
      num: 2,
      title: "Desk & Identity Check",
      desc: "NADRA CNIC, product invoice, & WhatsApp contact",
      active: currentStage >= 2,
      completed: currentStage > 2,
    },
    {
      num: 3,
      title: "Physical Custody & Inspection",
      desc: "Item delivered & secured in PakRaffle escrow custody",
      active: currentStage >= 3,
      completed: currentStage > 3,
    },
    {
      num: 4,
      title: "Live Campaign Launch",
      desc: "Community ticket sales open to reach 100% target",
      active: currentStage >= 4,
      completed: application.status === "APPROVED",
    },
  ]

  // Status Badge Styling Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          bg: "bg-amber-100 text-amber-900 border-amber-300",
          dot: "bg-amber-500",
          label: "PENDING DESK REVIEW",
          sub: "Application received and queued for review. Our team will contact your WhatsApp within 24-48 hours.",
        }
      case "UNDER_REVIEW":
        return {
          bg: "bg-blue-100 text-blue-900 border-blue-300",
          dot: "bg-blue-500",
          label: "UNDER PHYSICAL / IDENTITY VERIFICATION",
          sub: "Identity verified. Item is being inspected or prepared for secure escrow custody hold.",
        }
      case "APPROVED":
        return {
          bg: "bg-emerald-100 text-emerald-900 border-emerald-300",
          dot: "bg-emerald-500",
          label: "APPROVED & SCHEDULED FOR LIVE DRAW",
          sub: "Item received and verified in custody. Campaign scheduled for public ticket launch.",
        }
      case "REJECTED":
        return {
          bg: "bg-rose-100 text-rose-900 border-rose-300",
          dot: "bg-rose-500",
          label: "ACTION REQUIRED / REJECTED",
          sub: "Discrepancy detected or item cannot be accepted. Please review remarks or contact support.",
        }
      default:
        return {
          bg: "bg-slate-100 text-slate-800 border-slate-300",
          dot: "bg-slate-500",
          label: status,
          sub: "Application status updated.",
        }
    }
  }

  const statusInfo = getStatusBadge(application.status)

  // Masked CNIC for security
  const formatMaskedCnic = (cnic?: string | null) => {
    if (!cnic) return "Not Provided (Will be verified on call)"
    const clean = cnic.trim()
    if (clean.length < 8) return clean
    return `${clean.substring(0, 5)}-*****${clean.slice(-3)}`
  }

  const dateValue = application.updatedAt || application.createdAt
  const formattedDate = mounted && dateValue
    ? new Date(dateValue).toLocaleString("en-PK", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recently updated"

  const safeTotalTickets = Number(application.totalTickets) || 0
  const safeTicketPrice = Number(application.ticketPrice) || 0
  const safePlatformFee = Number(application.platformFee) || 0
  const safeSellerPayout = Number(application.sellerPayout) || 0
  const safeMarketPrice = Number(application.marketPrice) || 0

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 selection:bg-emerald-500 selection:text-white">
      {/* Top Banner Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-slate-600 hover:text-slate-900">
              <Link href="/list-product" className="flex items-center gap-1 text-xs">
                <ChevronLeft className="w-4 h-4" />
                <span>Sell Product</span>
              </Link>
            </Button>
            <span className="text-slate-300">/</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Application Status</span>
              <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                #{application.id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fetchStatus(reqId, activeToken, true)}
              disabled={refreshing}
              className="h-8 text-xs rounded-lg gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
              <span>{refreshing ? "Updating..." : "Refresh"}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-8 text-xs rounded-lg gap-1.5 hidden sm:flex"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </Button>

            <Button
              type="button"
              onClick={handleCopyLink}
              size="sm"
              className={`h-8 text-xs rounded-lg gap-1.5 transition-all ${
                copiedLink
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Private Link</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Approved Status Celebration & Partner Analytics Dashboard Banner */}
        {application.status === "APPROVED" && (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-emerald-400/40">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <Badge className="bg-emerald-500/50 text-white border-emerald-300 text-xs font-bold uppercase tracking-wider">
                  Partner Portal Active
                </Badge>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Your Application is Approved &amp; Live!
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/95 leading-relaxed">
                Your product raffle campaign has been successfully approved and launched. Track your real-time raffle revenue, net profit, sold tickets, and payout settlement on your dedicated one-page dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
              <Button
                asChild
                className="bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs sm:text-sm h-11 px-5 rounded-2xl shadow-lg gap-2"
              >
                <Link href={`/application/details/${application.id}?token=${application.secureToken || activeToken}`}>
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Open Partner Analytics Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Highlighted Status Hero Card */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Official Verification Status
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-500">
                  Updated: {formattedDate}
                </span>
              </div>

              {/* Prominent Status Pill */}
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold border ${statusInfo.bg} shadow-2xs`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.dot} animate-pulse`} />
                <span>{statusInfo.label}</span>
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {application.productName}
              </h1>
              <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
                {statusInfo.sub}
              </p>
            </div>

            {application.adminNotes && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Verification Officer Remark:</span>
                  <span className="text-slate-600 mt-0.5 block leading-relaxed">
                    {application.adminNotes}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Visual 4-Step Progress Timeline */}
          <div className="bg-slate-50/80 px-6 sm:px-8 py-6 border-t border-slate-200">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
              4-Stage Verification &amp; Launch Timeline
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((st) => {
                const isCurrent = currentStage === st.num
                const isDone = st.completed
                return (
                  <div
                    key={st.num}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                        : isDone
                        ? "bg-emerald-50/60 border-emerald-200"
                        : "bg-white/60 border-slate-200 opacity-70"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isDone
                            ? "bg-emerald-600 text-white"
                            : isCurrent
                            ? "bg-amber-500 text-slate-950 font-extrabold"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4" /> : `0${st.num}`}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isDone
                            ? "bg-emerald-100 text-emerald-800"
                            : isCurrent
                            ? "bg-amber-100 text-amber-900"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isDone ? "Completed" : isCurrent ? "In Progress" : "Pending"}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{st.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{st.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Financial & Ticket Economics Card - Prominently Displaying Target Tickets */}
        <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                Agreed Financial Structure
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Ticket Economics &amp; 92% Seller Payout
              </h2>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Escrow Backed</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Target Tickets to Sold Out - Highlighted! */}
            <div className="bg-slate-900/90 p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/60 shadow-lg space-y-1">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Ticket className="w-3.5 h-3.5" />
                <span>Target to Sold Out</span>
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white block">
                {safeTotalTickets.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 block">
                Desired tickets to reach 100% completion
              </span>
            </div>

            {/* Ticket Price */}
            <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Ticket Price (PKR)
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-amber-400 block">
                Rs. {safeTicketPrice.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 block">Per community raffle entry</span>
            </div>

            {/* PakRaffle 8% Fee */}
            <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-red-500/30 space-y-1">
              <span className="text-[11px] font-semibold text-red-300 uppercase tracking-wider block">
                PakRaffle Fee (8%)
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-red-400 block">
                Rs. {safePlatformFee.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 block">
                Covers marketing, escrow &amp; live draw
              </span>
            </div>

            {/* Net Seller Payout (92%) */}
            <div className="bg-emerald-600/90 p-4 sm:p-5 rounded-2xl border border-emerald-400 shadow-lg space-y-1">
              <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider block">
                Your Net Payout (92%)
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-black text-white block">
                Rs. {safeSellerPayout.toLocaleString()}
              </span>
              <span className="text-[11px] text-emerald-100/90 block">
                Guaranteed cash to your bank account
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-start gap-3">
            <span className="text-xl shrink-0 leading-none">🎯</span>
            <span className="leading-relaxed">
              <strong>Campaign Target:</strong> Exactly{" "}
              <strong className="text-emerald-300 underline font-mono">
                {safeTotalTickets.toLocaleString()} tickets
              </strong>{" "}
              will be issued for public purchase at{" "}
              <strong className="text-amber-300 font-mono">
                Rs. {safeTicketPrice.toLocaleString()}
              </strong>{" "}
              each. Upon 100% ticket sellout, the live draw will be broadcasted, and{" "}
              <strong className="text-emerald-300 font-mono">
                Rs. {safeSellerPayout.toLocaleString()}
              </strong>{" "}
              will be wired to your verified Pakistani bank account.
            </span>
          </div>
        </section>

        {/* Product Details & Seller Dossier Grid */}
        <section className="grid lg:grid-cols-3 gap-6">
          {/* Product Specifications */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-2xs">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                <PackageCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Product Dossier</h3>
                <p className="text-xs text-slate-500">Asset details submitted by seller</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 block">Category:</span>
                <span className="font-bold text-slate-900 text-sm">{application.productType}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 block">Condition:</span>
                <span className="font-bold text-emerald-700 text-sm">
                  {application.condition || "Brand New"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 block">Declared Market Price:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  Rs. {safeMarketPrice.toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 block">Inspection City Hub:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {application.city || "Not Specified"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-800 block">Product Description:</span>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {application.description}
              </div>
            </div>

            {application.images && application.images.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-800 block">Submitted Asset Photo:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {application.images.map((imgUrl, i) => (
                    <a
                      key={i}
                      href={imgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 hover:opacity-95 transition-opacity"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`Product Asset ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Photo</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Seller Legal Identity & Contact */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-2xs">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Seller Identity</h3>
                <p className="text-xs text-slate-500">Confidential NADRA profile</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 block">Full Legal Name (as per CNIC):</span>
                <span className="font-bold text-slate-900 text-sm block">
                  {application.fullNameCnic}
                </span>
                <span className="text-[10px] text-slate-400">Must match receiving bank title</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 block">NADRA CNIC Number:</span>
                <span className="font-mono font-bold text-slate-900 text-sm block">
                  {formatMaskedCnic(application.cnicNumber)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 block">WhatsApp Contact:</span>
                <span className="font-mono font-bold text-emerald-800 text-sm block">
                  {application.phone}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 block">Email Address:</span>
                <span className="font-medium text-slate-900 text-sm block truncate">
                  {application.email}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 block">Physical Desk City:</span>
                <span className="font-bold text-slate-900 text-sm block">
                  {application.city || "Lahore"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Mandatory Seller Agreement & Custody Terms */}
        <section className="bg-amber-50/70 rounded-3xl border border-amber-200/90 p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 pb-2 border-b border-amber-200">
            <ShieldCheck className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-amber-950 text-sm sm:text-base uppercase tracking-wider">
              Enforced Seller Agreement &amp; Escrow Custody Terms
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs text-amber-900">
            <div className="p-4 rounded-2xl bg-white/70 border border-amber-200/60 space-y-1.5">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-700" />
                <span>1. Verified Contact Outreach:</span>
              </span>
              <p className="leading-relaxed text-slate-700">
                Our verification team will call or message your provided WhatsApp number within 24 to 48 hours to confirm serial numbers, receipt authenticity, and schedule shipment.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 border border-amber-200/60 space-y-1.5">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-700" />
                <span>2. Mandatory Escrow Custody Hold:</span>
              </span>
              <p className="leading-relaxed text-slate-700">
                The product must be shipped or handed over to our inspection desk. It will be held securely in insured PakRaffle custody until the raffle is either completed or officially cancelled.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 border border-amber-200/60 space-y-1.5">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                <span>3. Cancellation &amp; 8% Platform Fee:</span>
              </span>
              <p className="leading-relaxed text-slate-700">
                If you request to cancel your raffle after ticket sales open, all sold tickets are refunded 100% to buyers, and you agree to pay the 8% platform fee before your item is returned.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 border border-amber-200/60 space-y-1.5">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>4. 3-Month Campaign Duration:</span>
              </span>
              <p className="leading-relaxed text-slate-700">
                Your campaign must complete within 3 months (90 days). If 100% tickets are not filled in 90 days, PakRaffle cancels the raffle, refunds all ticket holders, deducts 8%, and returns your item.
              </p>
            </div>
          </div>
        </section>

        {/* Private Tracking Link Box */}
        <section className="bg-emerald-50/60 rounded-3xl border-2 border-emerald-500/40 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Your Private Application Tracking Link
              </h3>
              <p className="text-xs text-slate-600">
                Bookmark or copy this link. Keep it secret to check live updates anytime.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="w-full bg-white border border-emerald-300 rounded-2xl px-4 py-3 font-mono text-xs text-slate-700 select-all overflow-x-auto whitespace-nowrap">
              {origin
                ? `${origin}/application/status/${application.id}?token=${activeToken || application.secureToken || ""}`
                : `/application/status/${application.id}?token=${activeToken || application.secureToken || ""}`}
            </div>
            <Button
              type="button"
              onClick={handleCopyLink}
              className={`w-full sm:w-auto h-11 px-6 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                copiedLink
                  ? "bg-emerald-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1.5" />
                  <span>Copy Link</span>
                </>
              )}
            </Button>
          </div>
        </section>

        {/* Action Toolbar */}
        <section className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button asChild variant="outline" className="w-full sm:w-auto rounded-2xl text-xs h-12 px-6">
              <Link href="/list-product">Submit Another Product</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto rounded-2xl text-xs h-12 px-6">
              <Link href="/raffles">Browse Live Draws</Link>
            </Button>
          </div>

          <Button
            asChild
            className="w-full sm:w-auto rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-12 px-7 shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
          >
            <a
              href={`https://wa.me/923000000000?text=${encodeURIComponent(
                `Assalam o Alaikum PakRaffle Team, I am inquiring regarding my Product Listing Application #${application.id} for "${application.productName}".`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Direct WhatsApp Inquiry</span>
            </a>
          </Button>
        </section>
      </main>
    </div>
  )
}

export default function ApplicationStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-8 bg-slate-200 rounded-lg w-1/3 animate-pulse" />
            <div className="h-44 bg-slate-200 rounded-3xl animate-pulse" />
            <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
          </div>
        </div>
      }
    >
      <StatusDetailContent />
    </Suspense>
  )
}
