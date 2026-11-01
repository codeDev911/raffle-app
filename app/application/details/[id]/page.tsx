"use client"

import type React from "react"
import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  Gift,
  Layers,
  Lock,
  MapPin,
  MessageCircle,
  Package,
  Printer,
  RefreshCw,
  ShieldCheck,
  Tag,
  Ticket,
  TrendingUp,
  User,
  Users,
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
} from "@/components/marketing/kit"
import { cn } from "@/lib/utils"

interface RecentOrder {
  name: string
  city: string
  tickets: number
  time: string
  amount: number
}

interface AnalyticsData {
  isApproved: boolean
  isLaunched?: boolean
  raffleId?: string | null
  publicRaffleUrl?: string | null
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
  raffleId?: string | null
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

const WHATSAPP_INTL = "923377155722"

/** Ledger amounts arrive in rupees, so they are grouped locally and never divided like entry prices. */
const num = (value: number) => (Number.isFinite(value) ? value : 0).toLocaleString("en-PK")
const money = (value: number) => `Rs ${num(Math.round(Number.isFinite(value) ? value : 0))}`

function submittedDate(iso?: string) {
  const date = new Date(iso || "")
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", year: "numeric" }).format(date)
}

function clockTime(value: number) {
  return new Intl.DateTimeFormat("en-PK", { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(value))
}

const STATUS_META: Record<string, { label: string; tone: string }> = {
  PENDING: { label: "Awaiting review", tone: "border-amber-500/25 bg-amber-500/10 text-amber-900" },
  UNDER_REVIEW: { label: "Under review", tone: "border-sky-600/20 bg-sky-600/10 text-sky-800" },
  APPROVED: { label: "Approved", tone: "border-emerald-600/20 bg-emerald-600/10 text-emerald-800" },
  REJECTED: { label: "Not approved", tone: "border-rose-500/25 bg-rose-500/10 text-rose-800" },
}

const FIELD =
  "w-full rounded-2xl border border-slate-900/10 bg-white px-4 py-3 font-mono text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"

/* ------------------------------------------------------------------ small pieces */

/** Toolbar button — same grammar as the kit's Cta, but for actions instead of navigation. */
function ToolButton({
  children,
  icon: Icon,
  onClick,
  variant = "ghost",
  className,
  disabled,
  type = "button",
  ariaLabel,
}: {
  children: React.ReactNode
  icon: React.ElementType
  onClick?: () => void
  variant?: "ghost" | "primary"
  className?: string
  disabled?: boolean
  type?: "button" | "submit"
  ariaLabel?: string
}) {
  return (
    <button
      type={type}
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
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="hidden sm:inline">{children}</span>
    </button>
  )
}

/** One headline figure. Mirrors the kit's StatTile type scale so both pages read the same. */
function Metric({
  label,
  value,
  hint,
  icon: Icon,
  accent = false,
  children,
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  icon: React.ElementType
  accent?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className={cn(PANEL, "flex min-w-0 flex-col gap-3 p-4 sm:p-5")}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[9.5px] font-semibold uppercase leading-tight tracking-[0.16em] text-slate-500">{label}</p>
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
            accent ? "bg-emerald-600/10 text-emerald-700" : "bg-slate-900/[0.05] text-slate-500",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "font-mono text-[1.2rem] font-semibold leading-tight tabular-nums tracking-tight sm:text-[1.5rem]",
            accent ? "text-emerald-700" : "text-slate-900",
          )}
        >
          {value}
        </p>
        {hint && <p className="mt-1 text-[11px] leading-snug text-slate-500">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

function Fact({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5 rounded-2xl border border-slate-900/5 bg-white/70 px-3.5 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      <div className="min-w-0">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-[12.5px] font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

function StatementRow({ label, value, tone = "plain" }: { label: string; value: string; tone?: "plain" | "minus" | "muted" }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3",
        tone === "minus" && "text-rose-600",
        tone === "muted" && "text-slate-500",
      )}
    >
      <span className={cn("text-[12.5px] leading-snug sm:text-[13px]", tone === "muted" ? "text-slate-500" : "font-medium text-slate-600")}>
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-[13px] font-semibold tabular-nums text-slate-900 sm:text-sm",
          tone === "minus" && "text-rose-600",
          tone === "muted" && "text-[12px] font-medium text-slate-600",
        )}
      >
        {value}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------------- page */

function ApplicationDashboardContent() {
  const params = useParams()
  const searchParams = useSearchParams()

  const rawId = params?.id
  const id = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : ""
  const tokenFromUrl = searchParams?.get("token") || ""

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
  const [syncedAt, setSyncedAt] = useState<number | null>(null)
  // Origin only exists in the browser, so the share text is completed after mount — reading it
  // during render produced a different href on the server than on the client.
  const [origin, setOrigin] = useState("")

  useEffect(() => {
    setOrigin(window.location.origin)
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
      setSyncedAt(Date.now())
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, activeToken])

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tokenInput.trim()) return
    const trimmed = tokenInput.trim()
    setActiveToken(trimmed)
    const newUrl = `${window.location.pathname}?token=${encodeURIComponent(trimmed)}`
    window.history.replaceState(null, "", newUrl)
    fetchDashboardData(id, trimmed, true)
  }

  const handleCopyDashboardLink = async () => {
    if (!id) return
    const token = activeToken || application?.secureToken || ""
    const fullUrl = `${window.location.origin}/application/details/${id}${token ? `?token=${token}` : ""}`
    try {
      await navigator.clipboard.writeText(fullUrl)
    } catch {
      // Clipboard blocked by the browser — the copy below still confirms the action.
    }
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  const handleCopyTokenOnly = async () => {
    const token = activeToken || application?.secureToken || ""
    if (!token) return
    try {
      await navigator.clipboard.writeText(token)
    } catch {
      // Ignored — same fallback as above.
    }
    setCopiedToken(true)
    setTimeout(() => setCopiedToken(false), 2500)
  }

  /* --------------------------------------------------------------- loading state */
  if (loading && !application) {
    return (
      <div className={cn(SHELL, "relative min-h-screen overflow-hidden")}>
        <Mesh tone="emerald" />
        <div className={cn(CONTAINER, "flex min-h-screen items-center justify-center py-24")}>
          <div className={cn(PANEL, "w-full max-w-md p-6 text-center sm:p-8")}>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-700">
              <BarChart3 className="h-7 w-7" />
            </span>
            <h1 className="mt-4 font-display text-xl font-semibold tracking-tight text-slate-900">Verifying partner access</h1>
            <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-slate-600">
              Checking your security token, then pulling live ticket, revenue and payout figures from the PakRaffle ledger.
            </p>
            <div className="mx-auto mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-slate-900/[0.07]">
              <div className="animate-indeterminate h-full w-1/3 rounded-full bg-emerald-600" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ------------------------------------------------------- token gate / error state */
  if (requiresToken || !application || error) {
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
                <Kicker>Confidential seller portal</Kicker>
                <h1 className="mt-2 font-display text-[1.6rem] font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                  A security token is required
                </h1>
              </div>
            </div>

            <p className="mt-4 text-[13.5px] leading-relaxed text-slate-600">
              This dashboard carries revenue, margin and payout figures for one listing only, so it stays locked to the
              private link we sent you when the application was submitted.
            </p>

            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/[0.07] p-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <p className="text-[12.5px] font-medium leading-relaxed text-rose-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleManualTokenSubmit} className="mt-6 space-y-3">
              <label htmlFor="partner-token" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Private security token
              </label>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <input
                  id="partner-token"
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
                  Verify &amp; enter
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11.5px] leading-relaxed text-slate-500">
                Lost the link? Check the email or WhatsApp message sent on submission, or ask your PakRaffle
                representative to re-send it.
              </p>
            </form>

            <div className="mt-6 flex flex-col gap-2.5 border-t border-slate-900/5 pt-5 sm:flex-row">
              <Cta href={`/application/status/${id}`} variant="ghost" className="w-full sm:w-auto">
                Check public status
              </Cta>
              <Cta
                href={`https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent(
                  `Assalam-o-Alaikum PakRaffle, I need assistance accessing my partner dashboard for application ID: ${id}`,
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

  /* ------------------------------------------------------------- derived figures */
  const stats: AnalyticsData = analytics || {
    isApproved: application.status === "APPROVED",
    isLaunched: Boolean(application.raffleId),
    raffleId: application.raffleId || null,
    publicRaffleUrl: application.raffleId ? `/raffles/${application.raffleId}` : null,
    status: application.status,
    totalTickets: application.totalTickets,
    soldTickets: 0,
    remainingTickets: application.totalTickets,
    percentageSold: 0,
    ticketPrice: application.ticketPrice,
    marketPrice: application.marketPrice,
    totalRevenue: application.totalRevenue,
    platformFee: application.platformFee,
    sellerPayout: application.sellerPayout,
    currentGrossRevenue: 0,
    currentPlatformFee: 0,
    currentSellerPayout: 0,
    uniqueBuyers: 0,
    recentOrders: [],
    settlementStatus: application.raffleId
      ? "HELD_IN_ESCROW"
      : application.status === "APPROVED"
        ? "APPROVED_FOR_LAUNCH"
        : "PENDING_APPROVAL",
    payoutMethod: "Raast / Direct IBFT",
    custodyLocation: `${application.city || "Lahore"} Central Vault`,
    inspectionStatus: application.raffleId ? "VERIFIED & INSURED" : "PENDING_INSPECTION",
  }

  const publicRaffleUrl = stats.publicRaffleUrl || (application.raffleId ? `/raffles/${application.raffleId}` : null)
  const statusMeta = STATUS_META[application.status] || {
    label: (application.status || "unknown").toLowerCase().replace(/_/g, " "),
    tone: "border-slate-900/10 bg-white/70 text-slate-700",
  }
  const feeShare = stats.totalRevenue > 0 ? Math.round((stats.platformFee / stats.totalRevenue) * 100) : 8
  const payoutShare = 100 - feeShare
  const avgPerBuyer = stats.uniqueBuyers > 0 ? (stats.soldTickets / stats.uniqueBuyers).toFixed(1) : "—"
  const escrowHeld = stats.settlementStatus === "HELD_IN_ESCROW"
  const soldBlocks = Math.round((Math.min(stats.percentageSold, 100) / 100) * 60)

  const statusHref = `/application/status/${application.id}${activeToken ? `?token=${activeToken}` : ""}`
  const shareUrl = publicRaffleUrl ? `${origin}${publicRaffleUrl}` : ""
  const shareText = `Assalam-o-Alaikum! My ${application.productName} is officially live on PakRaffle! Tickets are just ${money(
    stats.ticketPrice,
  )} each! Grab your entry before it's sold out: ${shareUrl}`
  const managerText = `Assalam-o-Alaikum! This is ${application.fullNameCnic}, seller for ${application.productName} (ID: ${application.id}). I would like to inquire about campaign promotion and draw schedule.`

  return (
    <div className={SHELL}>
      {/* --------------------------------------------------------------- toolbar */}
      <header className="sticky top-0 z-40 border-b border-slate-900/5 bg-[#f8f9f6]/85 backdrop-blur-xl print:hidden">
        <div className={cn(CONTAINER, "flex items-center justify-between gap-3 py-2.5")}>
          <div className="flex min-w-0 items-center gap-2.5">
            <Link
              href={statusHref}
              aria-label="Back to public status page"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-900/10 bg-white/70 text-slate-600 transition hover:bg-white hover:text-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-semibold text-slate-900">Partner dashboard</p>
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">#{application.id}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <ToolButton
              icon={RefreshCw}
              onClick={() => fetchDashboardData(id, activeToken, true)}
              disabled={refreshing}
              ariaLabel={refreshing ? "Refreshing figures" : "Refresh figures"}
            >
              {refreshing ? "Refreshing" : "Refresh"}
            </ToolButton>
            <ToolButton icon={Printer} onClick={() => window.print()} className="hidden sm:inline-flex">
              Print statement
            </ToolButton>
            <ToolButton
              icon={copiedLink ? Check : Copy}
              variant="primary"
              onClick={handleCopyDashboardLink}
              ariaLabel={copiedLink ? "Dashboard link copied" : "Copy secure dashboard link"}
            >
              {copiedLink ? "Link copied" : "Copy secure link"}
            </ToolButton>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden border-b border-slate-900/5 print:hidden">
        <Mesh tone="emerald" />
        <div className={cn(CONTAINER, "py-8 sm:py-12")}>
          <div className="grid gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-10">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Pill className={cn(statusMeta.tone)}>
                  {stats.isLaunched ? <LiveDot /> : <Clock className="h-3 w-3" />}
                  {stats.isLaunched ? "Live campaign" : statusMeta.label}
                </Pill>
                <Pill>{application.productType}</Pill>
                <Pill>{application.condition || "Brand new"}</Pill>
              </div>

              <h1 className="mt-4 break-words font-display text-[1.85rem] font-semibold leading-[1.05] tracking-[-0.025em] text-slate-900 sm:text-[2.4rem] lg:text-[2.75rem]">
                {application.productName}
              </h1>
              <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-slate-600 sm:text-[15px]">
                {application.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <Fact icon={User} label="Seller" value={application.fullNameCnic} />
                <Fact icon={MapPin} label="City" value={application.city || "Pakistan"} />
                <Fact icon={Tag} label="Market value" value={money(stats.marketPrice)} />
                <Fact icon={Calendar} label="Submitted" value={submittedDate(application.createdAt)} />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate-900/5 pt-4 text-[11.5px] text-slate-500">
                <span className="font-mono uppercase tracking-[0.16em] text-slate-400">Access token</span>
                <span className="rounded-lg bg-slate-900/[0.05] px-2 py-1 font-mono text-[11px] text-slate-700">
                  {activeToken ? `${activeToken.slice(0, 10)}…` : "authenticated"}
                </span>
                <button
                  type="button"
                  onClick={handleCopyTokenOnly}
                  className="font-semibold text-emerald-700 underline underline-offset-4 transition hover:text-emerald-800"
                >
                  {copiedToken ? "Copied" : "Copy token"}
                </button>
                <span className="text-slate-300">·</span>
                <span>{syncedAt ? `Synced ${clockTime(syncedAt)}` : "Synced on load"}</span>
              </div>
            </div>

            {/* Campaign pool — PANEL rather than TicketCard: the ticket mask would nick the full-width bar. */}
            <div className={cn(PANEL, "p-5 sm:p-6")}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Campaign pool</p>
                <p className="font-mono text-[11px] tabular-nums text-slate-500">
                  {num(stats.soldTickets)} / {num(stats.totalTickets)}
                </p>
              </div>

              <p className="mt-3 font-mono text-[2.1rem] font-semibold leading-none tabular-nums tracking-tight text-slate-900">
                {stats.percentageSold}%
              </p>
              <p className="mt-1.5 text-[12px] text-slate-500">
                of the pool sold · {num(stats.remainingTickets)} tickets still open
              </p>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-900/[0.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-[width] duration-500"
                  style={{ width: `${Math.min(stats.percentageSold, 100)}%` }}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-900/5 bg-white/80 px-3.5 py-3">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">Collected</p>
                  <p className="mt-1 font-mono text-[15px] font-semibold tabular-nums text-slate-900 sm:text-lg">
                    {money(stats.currentGrossRevenue)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-900/5 bg-white/80 px-3.5 py-3">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">Target</p>
                  <p className="mt-1 font-mono text-[15px] font-semibold tabular-nums text-slate-500 sm:text-lg">
                    {money(stats.totalRevenue)}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-[11.5px] leading-relaxed text-slate-500">
                {money(stats.ticketPrice)} per entry · {payoutShare}% of every rupee raised is yours, released after the
                draw.
              </p>

              <div className="mt-5 grid gap-2 border-t border-dashed border-slate-900/10 pt-5">
                {publicRaffleUrl ? (
                  <>
                    <Cta href={publicRaffleUrl} target="_blank" arrow className="w-full">
                      <ExternalLink className="h-4 w-4" />
                      View live raffle page
                    </Cta>
                    <Cta href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} variant="ghost" className="w-full">
                      <MessageCircle className="h-4 w-4 text-emerald-600" />
                      Share on WhatsApp
                    </Cta>
                  </>
                ) : (
                  <>
                    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] p-4">
                      <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-amber-900">
                        <Clock className="h-4 w-4" />
                        Campaign pending launch
                      </p>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-amber-800/80">
                        The review desk is finishing the physical inspection and the catalogue entry. Your public raffle
                        link appears here the moment the draw is published.
                      </p>
                    </div>
                    <Cta href={statusHref} variant="ghost" className="w-full">
                      Check verification status
                    </Cta>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- metrics */}
      <section className={cn(CONTAINER, "pt-8 sm:pt-10")}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <Kicker>Campaign performance &amp; revenue</Kicker>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">Live sync via PakRaffle ledger</p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Metric
            label="Gross revenue collected"
            value={money(stats.currentGrossRevenue)}
            hint={`Target cap ${money(stats.totalRevenue)}`}
            icon={DollarSign}
          >
            <div className="space-y-1.5">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-900/[0.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-[width] duration-500"
                  style={{ width: `${Math.min(stats.percentageSold, 100)}%` }}
                />
              </div>
              <p className="font-mono text-[10.5px] tabular-nums text-slate-500">{stats.percentageSold}% of goal</p>
            </div>
          </Metric>

          <Metric
            label="Your net payout (profit)"
            value={money(stats.currentSellerPayout)}
            hint={`Full sellout pays ${money(stats.sellerPayout)}`}
            icon={TrendingUp}
            accent
          >
            <p className="rounded-xl bg-emerald-600/[0.07] px-3 py-2 text-[11px] font-semibold text-emerald-800">
              {payoutShare}% seller share · asset worth {money(stats.marketPrice)}
            </p>
          </Metric>

          <Metric
            label="Tickets sold"
            value={`${num(stats.soldTickets)}`}
            hint={`${num(stats.remainingTickets)} of ${num(stats.totalTickets)} still available`}
            icon={Ticket}
          >
            <p className="border-t border-slate-900/5 pt-2 font-mono text-[11px] tabular-nums text-slate-500">
              {money(stats.ticketPrice)} / entry
            </p>
          </Metric>

          <Metric
            label={`Platform service fee (${feeShare}%)`}
            value={money(stats.currentPlatformFee)}
            hint={`Cap at full sellout ${money(stats.platformFee)}`}
            icon={Layers}
          >
            <p className="text-[11px] leading-relaxed text-slate-500">
              Covers payment gateway, fraud checks, escrow custody and door-to-door courier.
            </p>
          </Metric>

          <Metric
            label="Verified ticket buyers"
            value={num(stats.uniqueBuyers)}
            hint={`Avg. ${avgPerBuyer} tickets per participant`}
            icon={Users}
          >
            <p className="border-t border-slate-900/5 pt-2 text-[11px] font-semibold text-emerald-700">
              Automated live draw · recording published
            </p>
          </Metric>

          <Metric
            label="Escrow & payout release"
            value={escrowHeld ? "Escrow secured" : "Awaiting launch"}
            hint={(stats.inspectionStatus || "").replace(/_/g, " ").toLowerCase()}
            icon={ShieldCheck}
          >
            <p className="border-t border-slate-900/5 pt-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-slate-500">
              {(stats.settlementStatus || "").replace(/_/g, " ")} · {stats.payoutMethod}
            </p>
          </Metric>
        </div>
      </section>

      {/* ---------------------------------------------------- statement + activity */}
      <section className={cn(CONTAINER, "mt-8 grid gap-5 pb-16 sm:mt-10 lg:grid-cols-3 lg:gap-6")}>
        <div className="space-y-5 lg:col-span-2">
          <div className={cn(PANEL, "p-5 sm:p-6")}>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-900/5 pb-4">
              <div className="min-w-0">
                <h2 className="font-display text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                  Official financial statement
                </h2>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                  Itemised settlement under PakRaffle verified-partner terms — no hidden deductions.
                </p>
              </div>
              <Pill className="font-mono text-[10px] uppercase tracking-[0.12em]">{feeShare}% fixed fee policy</Pill>
            </div>

            <div className="mt-1 divide-y divide-slate-900/5">
              <StatementRow label="Asset market value (CNIC verified)" value={money(stats.marketPrice)} />
              <StatementRow
                label="Ticket pricing & target cap"
                value={`${num(stats.totalTickets)} × ${money(stats.ticketPrice)}`}
              />
              <StatementRow label="Total gross proceeds (100% sellout)" value={money(stats.totalRevenue)} />
              <StatementRow label={`PakRaffle platform fee (−${feeShare}%)`} value={`−${money(stats.platformFee)}`} tone="minus" />
            </div>

            <div className="my-4 -mx-5 flex flex-wrap items-center justify-between gap-3 border-y border-emerald-600/20 bg-emerald-600/[0.07] px-5 py-4 sm:-mx-6 sm:px-6">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-emerald-900 sm:text-[15px]">
                  Net payout to your account ({payoutShare}%)
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-emerald-800/80">
                  Direct IBFT / Raast transfer after the draw closes.
                </p>
              </div>
              <p className="font-mono text-lg font-semibold tabular-nums text-emerald-800 sm:text-[1.4rem]">
                {money(stats.sellerPayout)}
              </p>
            </div>

            <StatementRow
              label="Realised revenue to date"
              value={`${money(stats.currentGrossRevenue)} (${stats.percentageSold}%)`}
              tone="muted"
            />
          </div>

          <div className={cn(PANEL, "p-5 sm:p-6")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                  Live ticket inventory
                </h2>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                  Every block is a batch of issued entries; sold batches turn green as receipts clear.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Sold {num(stats.soldTickets)}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-900/15" />
                  Open {num(stats.remainingTickets)}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-900/5 bg-slate-900/[0.03] p-3.5 sm:p-4">
              <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-12" aria-hidden>
                {Array.from({ length: 60 }).map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-3.5 rounded-sm sm:h-4",
                      index < soldBlocks ? "bg-emerald-500" : "bg-slate-900/10",
                    )}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                <span>Batch 01</span>
                <span className="text-emerald-700">{stats.percentageSold}% of target</span>
                <span>Batch 60</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className={cn(PANEL, "p-5")}>
            <div className="flex items-center justify-between gap-3 border-b border-slate-900/5 pb-3">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-slate-900">
                <LiveDot />
                Recent ticket sales
              </p>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-slate-400">Real-time</span>
            </div>

            <div className="no-scrollbar mt-3 max-h-[22rem] space-y-2 overflow-y-auto">
              {(stats.recentOrders || []).length > 0 ? (
                (stats.recentOrders || []).map((order, index) => (
                  <div
                    key={`${order.name}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-900/5 bg-white/70 px-3.5 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-semibold text-slate-900">{order.name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Ticket className="h-3 w-3 shrink-0 text-emerald-600" />
                        <span className="font-mono tabular-nums">
                          {order.tickets} {order.tickets === 1 ? "entry" : "entries"}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="truncate">{order.city}</span>
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-[12.5px] font-semibold tabular-nums text-slate-900">{money(order.amount)}</p>
                      <p className="text-[10px] text-slate-400">{order.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-900/10 px-4 py-8 text-center">
                  <Gift className="mx-auto h-5 w-5 text-slate-300" />
                  <p className="mx-auto mt-2 max-w-[16rem] text-[12px] leading-relaxed text-slate-500">
                    No entries yet. Share the live raffle link — every ticket shows up here the moment its receipt clears.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className={cn(PANEL, "p-5")}>
            <p className="flex items-center gap-2 text-[13px] font-semibold text-slate-900">
              <Package className="h-4 w-4 text-emerald-600" />
              Physical custody &amp; inspection
            </p>
            <dl className="mt-4 space-y-2.5 text-[12px]">
              <div className="rounded-2xl border border-slate-900/5 bg-white/70 px-3.5 py-3">
                <dt className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">Verification hub</dt>
                <dd className="mt-1 font-semibold text-slate-900">{stats.custodyLocation}</dd>
              </div>
              <div className="rounded-2xl border border-emerald-600/20 bg-emerald-600/[0.06] px-3.5 py-3">
                <dt className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Asset condition</dt>
                <dd className="mt-1 font-semibold text-emerald-900">
                  {application.condition || "Brand new (sealed)"} · accessories &amp; warranty pack
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-900/5 bg-white/70 px-3.5 py-3">
                <dt className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">Release mechanism</dt>
                <dd className="mt-1 leading-relaxed text-slate-600">
                  At 100% sellout or the scheduled draw date, the net amount moves straight to your verified Raast / IBFT
                  account.
                </dd>
              </div>
            </dl>
          </div>

          <div className={cn(INK_PANEL, "relative overflow-hidden p-5 print:hidden")}>
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="relative">
              <p className="flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-emerald-300/90">
                <Building2 className="h-3.5 w-3.5" />
                Dedicated partner support
              </p>
              <p className="mt-3 font-display text-lg font-semibold leading-snug text-white">
                Want your draw pushed to more buyers?
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-emerald-50/75">
                Message the partner desk for promotional banners, social shout-outs and the live draw schedule.
              </p>
              <Cta
                href={`https://wa.me/${WHATSAPP_INTL}?text=${encodeURIComponent(managerText)}`}
                variant="light"
                className="mt-4 w-full"
              >
                <MessageCircle className="h-4 w-4" />
                Chat with partner desk
              </Cta>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function ApplicationDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8f9f6] p-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        </div>
      }
    >
      <ApplicationDashboardContent />
    </Suspense>
  )
}
