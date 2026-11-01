"use client"

import type React from "react"
import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  Copy,
  ExternalLink,
  Info,
  Layers,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  Printer,
  RefreshCw,
  ShieldCheck,
  Target,
  Ticket,
  Truck,
  User,
} from "lucide-react"
import {
  CONTAINER,
  Cta,
  INK_PANEL,
  Kicker,
  LiveDot,
  Mesh,
  PANEL,
  Pill,
  SHELL,
  type Tone,
} from "@/components/marketing/kit"
import { cn } from "@/lib/utils"

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

const WHATSAPP_INTL = "923377155722"

/** Listing figures arrive in rupees; they are grouped locally, never scaled like entry prices. */
const num = (value: number) => (Number.isFinite(value) ? value : 0).toLocaleString("en-PK")
const money = (value: number) => `Rs ${num(Math.round(Number.isFinite(value) ? value : 0))}`

/** Each verification stage owns a mesh tone so the page colour-reads before you read a word. */
const STATUS_META: Record<
  string,
  { label: string; sub: string; pill: string; tone: Tone; live: boolean }
> = {
  PENDING: {
    label: "Awaiting desk review",
    sub: "Your application is logged and queued. The verification team will reach you on WhatsApp within 24–48 hours.",
    pill: "border-amber-500/25 bg-amber-500/[0.09] text-amber-900",
    tone: "amber",
    live: false,
  },
  UNDER_REVIEW: {
    label: "Identity & item verification",
    sub: "Identity checks are underway and the item is being inspected or prepared for insured escrow custody.",
    pill: "border-sky-600/20 bg-sky-600/10 text-sky-800",
    tone: "sky",
    live: false,
  },
  APPROVED: {
    label: "Approved · scheduled for live draw",
    sub: "Item received and verified in custody. The campaign is cleared for its public ticket launch.",
    pill: "border-emerald-600/20 bg-emerald-600/[0.09] text-emerald-800",
    tone: "emerald",
    live: true,
  },
  REJECTED: {
    label: "Action required",
    sub: "A discrepancy was found, or the item cannot be accepted. Read the officer's remark below or contact support.",
    pill: "border-rose-500/25 bg-rose-500/[0.09] text-rose-800",
    tone: "violet",
    live: false,
  },
}

const FIELD =
  "w-full rounded-2xl border border-slate-900/10 bg-white px-4 py-3 font-mono text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"

/* ------------------------------------------------------------------ small pieces */

function ToolButton({
  children,
  icon: Icon,
  onClick,
  variant = "ghost",
  className,
  disabled,
  spin,
  ariaLabel,
}: {
  children: React.ReactNode
  icon: React.ElementType
  onClick?: () => void
  variant?: "ghost" | "primary"
  className?: string
  disabled?: boolean
  spin?: boolean
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      // The caption disappears on phones, so the name is carried explicitly for screen readers.
      aria-label={ariaLabel}
      className={cn(
        "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl px-3 text-[12.5px] font-semibold transition disabled:opacity-60",
        variant === "primary"
          ? "bg-emerald-600 text-white shadow-[0_12px_28px_-16px_rgba(5,150,105,0.9)] hover:bg-emerald-500"
          : "border border-slate-900/10 bg-white/70 text-slate-700 backdrop-blur hover:bg-white hover:text-slate-900",
        className,
      )}
    >
      <Icon className={cn("h-3.5 w-3.5 shrink-0", spin && "animate-spin text-emerald-600")} />
      <span className="hidden sm:inline">{children}</span>
    </button>
  )
}

/** Dark-band figure. Single column on phones: two-up would clip a rupee amount. */
function InkStat({
  label,
  value,
  hint,
  icon: Icon,
  emphasis = false,
}: {
  label: string
  value: string
  hint: string
  icon: React.ElementType
  emphasis?: boolean
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-2xl border p-4",
        emphasis ? "border-emerald-400/35 bg-emerald-500/[0.12]" : "border-white/10 bg-white/[0.04]",
      )}
    >
      <p
        className={cn(
          "flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em]",
          emphasis ? "text-emerald-300" : "text-white/50",
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="mt-2 break-words font-mono text-[1.3rem] font-semibold leading-none tabular-nums tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1.5 text-[11px] leading-snug text-white/50">{hint}</p>
    </div>
  )
}

function Fact({
  icon: Icon,
  label,
  value,
  mono = false,
  accent = false,
}: {
  icon?: React.ElementType
  label: string
  value: string
  mono?: boolean
  accent?: boolean
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-900/5 bg-white/70 px-3.5 py-3">
      <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {Icon && <Icon className="h-3.5 w-3.5 text-emerald-600" />}
        {label}
      </p>
      <p
        className={cn(
          "mt-1 break-words text-[13px] font-semibold text-slate-900",
          mono && "font-mono tabular-nums",
          accent && "text-emerald-700",
        )}
      >
        {value}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------------- page */

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

  // Origin only exists in the browser, so the tracking link is completed after mount.
  useEffect(() => {
    setMounted(true)
    setOrigin(window.location.origin)
  }, [])

  // Sync token from URL whenever URL changes
  useEffect(() => {
    if (tokenFromUrl && tokenFromUrl !== activeToken) {
      setActiveToken(tokenFromUrl)
      setTokenInput(tokenFromUrl)
    }
  }, [tokenFromUrl, activeToken])

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
    } catch (err) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reqId, activeToken])

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tokenInput.trim()) return
    const trimmed = tokenInput.trim()
    setActiveToken(trimmed)
    const newUrl = `${window.location.pathname}?token=${encodeURIComponent(trimmed)}`
    window.history.replaceState(null, "", newUrl)
    fetchStatus(reqId, trimmed, true)
  }

  const handleCopyLink = async () => {
    if (!reqId) return
    const token = activeToken || application?.secureToken || ""
    const fullUrl = `${window.location.origin}/application/status/${reqId}${token ? `?token=${token}` : ""}`
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
    } catch (err) {
      console.error("Clipboard copy failed:", err)
    }
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  /* --------------------------------------------------------------- loading state */
  if (loading) {
    return (
      <div className={cn(SHELL, "relative overflow-hidden")}>
        <Mesh tone="emerald" />
        <div className={cn(CONTAINER, "space-y-4 py-14 sm:py-20")}>
          <div className="h-5 w-40 animate-pulse rounded-full bg-slate-900/[0.06]" />
          <div className={cn(PANEL, "h-44 animate-pulse sm:h-52")} />
          <div className={cn(PANEL, "h-64 animate-pulse")} />
          <p className="text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-slate-400">
            Verifying your token…
          </p>
        </div>
      </div>
    )
  }

  /* ------------------------------------------------------- token gate / error state */
  if (requiresToken || (error && !application)) {
    return (
      <div className={cn(SHELL, "relative min-h-screen overflow-hidden")}>
        <Mesh tone="amber" />
        <div className={cn(CONTAINER, "flex min-h-screen items-center justify-center py-20")}>
          <div className={cn(PANEL, "w-full max-w-lg p-6 sm:p-8")}>
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900/[0.05] text-slate-700">
                <Lock className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <Kicker>Private application security</Kicker>
                <h1 className="mt-2 font-display text-[1.6rem] font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                  A tracking token is required
                </h1>
              </div>
            </div>

            <p className="mt-4 text-[13.5px] leading-relaxed text-slate-600">
              Listing applications hold seller CNIC details, phone numbers and escrow custody notes, so this record is
              only readable with the private link issued on submission.
            </p>

            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/[0.07] p-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <p className="text-[12.5px] font-medium leading-relaxed text-rose-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleManualTokenSubmit} className="mt-6 space-y-3">
              <label htmlFor="status-token" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Private tracking token
              </label>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <input
                  id="status-token"
                  type="text"
                  placeholder="e.g. 4f98ab12e09…"
                  value={tokenInput}
                  onChange={(event) => setTokenInput(event.target.value)}
                  className={cn(FIELD, "flex-1")}
                  required
                />
                <button
                  type="submit"
                  className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-[0_14px_34px_-16px_rgba(5,150,105,0.9)] transition hover:bg-emerald-500"
                >
                  Access
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11.5px] leading-relaxed text-slate-500">
                The token is the last part of the link you received after submitting the listing application.
              </p>
            </form>

            <div className="mt-6 flex flex-col gap-2.5 border-t border-slate-900/5 pt-5 sm:flex-row">
              <Cta href="/list-product" variant="ghost" className="w-full sm:w-auto">
                Back to sell product
              </Cta>
              <Cta
                href={`https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent(
                  `Assalam o Alaikum PakRaffle, I need help accessing my listing application status for ID: ${reqId}`,
                )}`}
                className="w-full sm:w-auto"
              >
                <MessageCircle className="h-4 w-4" />
                Contact verification desk
              </Cta>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className={cn(SHELL, "relative min-h-screen overflow-hidden")}>
        <Mesh tone="emerald" />
        <div className={cn(CONTAINER, "flex min-h-screen items-center justify-center py-20")}>
          <div className={cn(PANEL, "w-full max-w-md p-6 text-center sm:p-8")}>
            <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900">
              No application details available
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
              Nothing is recorded against that reference. Double-check the link we sent you, or submit the product again.
            </p>
            <Cta href="/list-product" arrow className="mt-6 w-full">
              Go to sell product
            </Cta>
          </div>
        </div>
      </div>
    )
  }

  /* ------------------------------------------------------------- derived figures */
  const meta = STATUS_META[application.status] || {
    label: application.status,
    sub: "Application status updated.",
    pill: "border-slate-900/10 bg-white/70 text-slate-700",
    tone: "emerald" as Tone,
    live: false,
  }

  const currentStage =
    application.status === "APPROVED" ? 4 : application.status === "UNDER_REVIEW" ? 2 : 1

  const steps = [
    {
      num: 1,
      title: "Application received",
      desc: "Specs and contact details logged into the verification queue.",
      completed: true,
    },
    {
      num: 2,
      title: "Desk & identity check",
      desc: "NADRA CNIC, product invoice and WhatsApp contact are confirmed.",
      completed: currentStage > 2,
    },
    {
      num: 3,
      title: "Physical custody & inspection",
      desc: "Item is delivered and secured in PakRaffle escrow custody.",
      completed: currentStage > 3,
    },
    {
      num: 4,
      title: "Live campaign launch",
      desc: "Ticket sales open to the community until the pool hits 100%.",
      completed: application.status === "APPROVED",
    },
  ]

  // Masked CNIC for security
  const formatMaskedCnic = (cnic?: string | null) => {
    if (!cnic) return "Not provided (verified on call)"
    const clean = cnic.trim()
    if (clean.length < 8) return clean
    return `${clean.substring(0, 5)}-*****${clean.slice(-3)}`
  }

  const dateValue = application.updatedAt || application.createdAt
  const formattedDate =
    mounted && dateValue
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
  const safeTotalRevenue = Number(application.totalRevenue) || safeTicketPrice * safeTotalTickets
  const feeShare = safeTotalRevenue > 0 ? Math.round((safePlatformFee / safeTotalRevenue) * 100) : 8
  const payoutShare = 100 - feeShare

  const effectiveToken = activeToken || application.secureToken || ""
  const dashboardHref = `/application/details/${application.id}?token=${effectiveToken}`
  const trackingLink = `${origin || ""}/application/status/${application.id}?token=${effectiveToken}`
  const inquiryText = `Assalam o Alaikum PakRaffle Team, I am inquiring regarding my Product Listing Application #${application.id} for "${application.productName}".`

  return (
    <div className={SHELL}>
      {/* --------------------------------------------------------------- toolbar */}
      <header className="sticky top-0 z-40 border-b border-slate-900/5 bg-[#f8f9f6]/85 backdrop-blur-xl print:hidden">
        <div className={cn(CONTAINER, "flex items-center justify-between gap-3 py-2.5")}>
          <div className="flex min-w-0 items-center gap-2.5">
            <Link
              href="/list-product"
              aria-label="Back to sell product"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-900/10 bg-white/70 text-slate-600 transition hover:bg-white hover:text-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-semibold text-slate-900">Application status</p>
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                #{application.id}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <ToolButton
              icon={RefreshCw}
              onClick={() => fetchStatus(reqId, activeToken, true)}
              disabled={refreshing}
              spin={refreshing}
              ariaLabel={refreshing ? "Refreshing status" : "Refresh status"}
            >
              {refreshing ? "Updating" : "Refresh"}
            </ToolButton>
            <ToolButton icon={Printer} onClick={() => window.print()} className="hidden sm:inline-flex">
              Print
            </ToolButton>
            <ToolButton
              icon={copiedLink ? Check : Copy}
              variant="primary"
              onClick={handleCopyLink}
              ariaLabel={copiedLink ? "Tracking link copied" : "Copy private tracking link"}
            >
              {copiedLink ? "Link copied" : "Copy private link"}
            </ToolButton>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden border-b border-slate-900/5">
        <Mesh tone={meta.tone} />
        <div className={cn(CONTAINER, "py-8 sm:py-12")}>
          <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-10">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Pill className={meta.pill}>
                  {meta.live ? <LiveDot /> : <Clock className="h-3 w-3" />}
                  {meta.label}
                </Pill>
                <Pill className="font-mono text-[10px] uppercase tracking-[0.12em]">{application.productType}</Pill>
                <Pill>{application.condition || "Brand new"}</Pill>
              </div>

              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
                Official verification status
              </p>
              <h1 className="mt-2 break-words font-display text-[1.85rem] font-semibold leading-[1.05] tracking-[-0.025em] text-slate-900 sm:text-[2.4rem] lg:text-[2.75rem]">
                {application.productName}
              </h1>
              <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-slate-600 sm:text-[15px]">{meta.sub}</p>

              <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                Last updated
                <span className="font-mono text-slate-700">{formattedDate}</span>
              </p>

              {application.adminNotes && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-900/5 bg-white/75 p-4">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-slate-900">Verification officer's remark</p>
                    <p className="mt-1 whitespace-pre-line text-[12.5px] leading-relaxed text-slate-600">
                      {application.adminNotes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Stage rail */}
            <div className={cn(PANEL, "p-5 sm:p-6")}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  Four-stage timeline
                </p>
                <p className="font-mono text-[11px] tabular-nums text-slate-500">
                  Stage {currentStage} / 4
                </p>
              </div>

              <ol className="mt-4 space-y-2.5">
                {steps.map((step) => {
                  // A finished stage always reads as completed; "in progress" is only for the
                  // stage the application is currently sitting on.
                  const isDone = step.completed
                  const isCurrent = !isDone && currentStage === step.num
                  return (
                    <li
                      key={step.num}
                      className={cn(
                        "flex gap-3 rounded-2xl border p-3.5 transition-colors",
                        isCurrent
                          ? "border-emerald-600/30 bg-emerald-600/[0.07]"
                          : isDone
                            ? "border-emerald-600/15 bg-white/70"
                            : "border-slate-900/5 bg-white/50",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-semibold tabular-nums",
                          isDone
                            ? "bg-emerald-600 text-white"
                            : isCurrent
                              ? "bg-amber-400/90 text-amber-950"
                              : "bg-slate-900/[0.06] text-slate-500",
                        )}
                      >
                        {isDone ? <Check className="h-4 w-4" strokeWidth={3} /> : `0${step.num}`}
                      </span>
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-x-2 text-[13px] font-semibold text-slate-900">
                          {step.title}
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.12em]",
                              isDone
                                ? "bg-emerald-600/10 text-emerald-800"
                                : isCurrent
                                  ? "bg-amber-400/20 text-amber-900"
                                  : "bg-slate-900/[0.05] text-slate-500",
                            )}
                          >
                            {isDone ? "Completed" : isCurrent ? "In progress" : "Pending"}
                          </span>
                        </p>
                        <p className="mt-1 text-[11.5px] leading-relaxed text-slate-500">{step.desc}</p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>

          {application.status === "APPROVED" && (
            <div className="mt-7 flex flex-col gap-5 rounded-3xl border border-emerald-600/20 bg-emerald-600/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="min-w-0">
                <Kicker>Partner portal active</Kicker>
                <p className="mt-2 font-display text-lg font-semibold leading-snug tracking-tight text-slate-900 sm:text-xl">
                  Your application is approved and live
                </p>
                <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-slate-600">
                  Track real-time ticket sales, gross revenue, your net payout and the settlement stage on the partner
                  analytics dashboard.
                </p>
              </div>
              <Cta href={dashboardHref} arrow className="w-full shrink-0 sm:w-auto">
                Open analytics dashboard
              </Cta>
            </div>
          )}
        </div>
      </section>

      {/* A plain wrapper, not <main>: the app shell already renders one, and nested mains are invalid. */}
      <div className={cn(CONTAINER, "space-y-6 py-9 sm:space-y-8 sm:py-11 print:space-y-4")}>
        {/* -------------------------------------------------- agreed economics */}
        <section className={cn(INK_PANEL, "relative overflow-hidden p-5 sm:p-7")}>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl"
          />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div className="min-w-0">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-emerald-300/90">
                  Agreed financial structure
                </p>
                <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  Ticket economics &amp; {payoutShare}% seller payout
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                100% escrow backed
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InkStat
                label="Target to sell out"
                value={num(safeTotalTickets)}
                hint="Tickets issued to reach 100% of the pool"
                icon={Ticket}
                emphasis
              />
              <InkStat
                label="Ticket price"
                value={money(safeTicketPrice)}
                hint="Per community raffle entry"
                icon={Target}
              />
              <InkStat
                label={`PakRaffle fee (${feeShare}%)`}
                value={money(safePlatformFee)}
                hint="Marketing, escrow custody and the live draw"
                icon={Layers}
              />
              <InkStat
                label={`Your net payout (${payoutShare}%)`}
                value={money(safeSellerPayout)}
                hint="Cash transferred to your verified bank account"
                icon={ShieldCheck}
                emphasis
              />
            </div>

            <p className="mt-5 flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-[12.5px] leading-relaxed text-emerald-50/80 sm:flex-row sm:items-start">
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              <span>
                Exactly{" "}
                <strong className="font-mono font-semibold text-white">{num(safeTotalTickets)} tickets</strong> will be
                issued at <strong className="font-mono font-semibold text-white">{money(safeTicketPrice)}</strong> each.
                At 100% sellout the draw is broadcast live, and{" "}
                <strong className="font-mono font-semibold text-white">{money(safeSellerPayout)}</strong> is wired to
                your verified Pakistani bank account.
              </span>
            </p>
          </div>
        </section>

        {/* ----------------------------------------------- dossier + seller record */}
        <section className="grid gap-5 lg:grid-cols-3 lg:gap-6">
          <div className={cn(PANEL, "p-5 sm:p-6 lg:col-span-2")}>
            <div className="flex items-center gap-3 border-b border-slate-900/5 pb-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-700">
                <PackageCheck className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                  Product dossier
                </h3>
                <p className="text-[11.5px] text-slate-500">Asset details as submitted by the seller</p>
              </div>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <Fact icon={Ticket} label="Category" value={application.productType} />
              <Fact label="Condition" value={application.condition || "Brand new"} accent />
              <Fact label="Declared market price" value={money(safeMarketPrice)} mono />
              <Fact icon={MapPin} label="Inspection hub" value={application.city || "Not specified"} />
            </div>

            <p className="mt-4 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">Description</p>
            <p className="mt-1.5 whitespace-pre-line rounded-2xl border border-slate-900/5 bg-white/70 p-4 text-[12.5px] leading-relaxed text-slate-600">
              {application.description}
            </p>

            {application.images && application.images.length > 0 && (
              <div className="mt-5">
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Submitted asset photos
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {application.images.map((imgUrl, index) => (
                    <a
                      key={`${imgUrl}-${index}`}
                      href={imgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block aspect-video overflow-hidden rounded-2xl border border-slate-900/10 bg-slate-900/[0.04]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`${application.productName} asset ${index + 1}`}
                        className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
                      />
                      <span className="absolute inset-0 flex items-center justify-center gap-1 bg-slate-950/45 text-[11px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <ExternalLink className="h-3.5 w-3.5" />
                        View photo
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={cn(PANEL, "p-5 sm:p-6")}>
            <div className="flex items-center gap-3 border-b border-slate-900/5 pb-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-900/[0.06] text-slate-700">
                <Building2 className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                  Seller identity
                </h3>
                <p className="text-[11.5px] text-slate-500">Confidential NADRA profile</p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              <Fact icon={User} label="Full legal name (per CNIC)" value={application.fullNameCnic} />
              <p className="-mb-1 text-[10.5px] text-slate-400">Must match the receiving bank account title.</p>
              <Fact label="NADRA CNIC number" value={formatMaskedCnic(application.cnicNumber)} mono />
              <Fact icon={Phone} label="WhatsApp contact" value={application.phone} mono accent />
              <Fact icon={Mail} label="Email address" value={application.email} />
              <Fact icon={MapPin} label="Physical desk city" value={application.city || "Lahore"} />
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- agreement */}
        <section className={cn(PANEL, "p-5 sm:p-6")}>
          <div className="flex items-center gap-3 border-b border-slate-900/5 pb-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-700">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                Seller agreement &amp; escrow custody terms
              </h3>
              <p className="text-[11.5px] text-slate-500">What you signed up for when the listing was submitted</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: Phone,
                title: "1. Verified contact outreach",
                body: "The verification team calls or messages your WhatsApp number within 24–48 hours to confirm serial numbers, receipt authenticity and the shipment plan.",
              },
              {
                icon: Truck,
                title: "2. Mandatory escrow custody",
                body: "The product is shipped to or handed over at the inspection desk and held in insured PakRaffle custody until the raffle completes or is cancelled.",
              },
              {
                icon: AlertCircle,
                title: "3. Cancellation & platform fee",
                body: "If you cancel after ticket sales open, every sold ticket is refunded in full to buyers and the platform fee is settled before the item is returned.",
              },
              {
                icon: Clock,
                title: "4. Three-month campaign window",
                body: "A campaign must complete within 90 days. If the pool is not full by then, PakRaffle cancels the draw, refunds ticket holders, deducts the fee and returns the item.",
              },
            ].map((term) => (
              <div key={term.title} className="flex gap-3 rounded-2xl border border-slate-900/5 bg-white/70 p-4">
                <term.icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-slate-900">{term.title}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-slate-600">{term.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------- private link box */}
        <section className={cn(PANEL, "p-5 sm:p-6 print:hidden")}>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <Lock className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                Your private tracking link
              </h3>
              <p className="text-[11.5px] text-slate-500">
                Bookmark it — it is the only way back into this record.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <p className="no-scrollbar min-w-0 flex-1 select-all overflow-x-auto whitespace-nowrap rounded-2xl border border-slate-900/10 bg-white/80 px-4 py-3 font-mono text-[11.5px] text-slate-700">
              {trackingLink}
            </p>
            <button
              type="button"
              onClick={handleCopyLink}
              className={cn(
                "inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold text-white transition",
                copiedLink ? "bg-emerald-700" : "bg-emerald-600 hover:bg-emerald-500",
              )}
            >
              {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedLink ? "Copied" : "Copy link"}
            </button>
          </div>
        </section>

        {/* ------------------------------------------------------------ next steps */}
        <section className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap print:hidden">
          <Cta href="/list-product" variant="ghost" className="w-full sm:w-auto">
            Submit another product
          </Cta>
          <Cta href="/raffles" variant="ghost" className="w-full sm:w-auto">
            Browse live draws
          </Cta>
          <Cta
            href={`https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent(inquiryText)}`}
            className="w-full sm:ml-auto sm:w-auto"
          >
            <MessageCircle className="h-4 w-4" />
            Direct WhatsApp inquiry
          </Cta>
        </section>
      </div>
    </div>
  )
}

export default function ApplicationStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f9f6] px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-5xl space-y-4">
            <div className="h-5 w-40 animate-pulse rounded-full bg-slate-900/[0.06]" />
            <div className="h-44 animate-pulse rounded-3xl bg-white/70" />
            <div className="h-64 animate-pulse rounded-3xl bg-white/70" />
          </div>
        </div>
      }
    >
      <StatusDetailContent />
    </Suspense>
  )
}
