"use client"

// Shared building blocks for the Merchant Connect admin console (list, store, campaign,
// settlement). Kept in one place so a status colour or a money format never diverges
// between the four screens.
import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, CheckCircle2, Loader2, RefreshCw, ShieldAlert } from "lucide-react"
import type { LucideIcon } from "lucide-react"

/** Token the /api/admin/* guard expects when MERCHANT_ADMIN_TOKEN is set in the environment. */
export const TOKEN_KEY = "merchantsAdminToken"

// ---- formatting -------------------------------------------------------------

export const formatPKR = (n: number | null | undefined) =>
  `Rs. ${Math.round(Number(n) || 0).toLocaleString("en-PK")}`

export const formatNumber = (n: number | null | undefined) => (Number(n) || 0).toLocaleString("en-PK")

/** "1 ticket" / "3 tickets" — these screens render a lot of counts next to nouns. */
export const plural = (n: number | null | undefined, word: string, pluralWord?: string) =>
  `${formatNumber(n)} ${Number(n) === 1 ? word : pluralWord || `${word}s`}`

export const formatDate = (value: string | Date | null | undefined) =>
  !value
    ? "—"
    : new Intl.DateTimeFormat("en-PK", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value))

export const formatDateTime = (value: string | Date | null | undefined) =>
  !value
    ? "—"
    : new Intl.DateTimeFormat("en-PK", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))

/** "3h ago" style hint, so an operator can see at a glance what is stale. */
export function formatAgo(value: string | Date | null | undefined) {
  if (!value) return "—"
  const diff = Date.now() - new Date(value).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(value)
}

// ---- status vocabulary ------------------------------------------------------

export const STATUS_TONE: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  PAID: "bg-emerald-100 text-emerald-800",
  ISSUED: "bg-emerald-100 text-emerald-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  DRAW_READY: "bg-violet-100 text-violet-800",
  SETTLED: "bg-slate-200 text-slate-700",
  UNDER_REVIEW: "bg-sky-100 text-sky-800",
  INVOICED: "bg-sky-100 text-sky-800",
  PROCESSING: "bg-sky-100 text-sky-800",
  PENDING: "bg-amber-100 text-amber-900",
  PENDING_INVOICE: "bg-amber-100 text-amber-900",
  PAUSED: "bg-amber-100 text-amber-900",
  CANCELLED: "bg-rose-100 text-rose-800",
  FAILED: "bg-rose-100 text-rose-800",
  REFUNDED: "bg-rose-100 text-rose-800",
}

/** What each ticket status means in the settlement flow — shown as the sub-line, not a tooltip. */
export const ENTRY_HINT: Record<string, string> = {
  ISSUED: "Unbilled — lands on the next invoice",
  INVOICED: "Invoiced, awaiting payment confirmation",
  PAID: "Paid — eligible for the draw",
  CANCELLED: "Voided — not billed, not drawn",
}

export const CAMPAIGN_HINT: Record<string, string> = {
  ACTIVE: "Minting tickets on qualifying orders",
  PAUSED: "Minting stopped; existing tickets stay valid",
  PENDING_INVOICE: "Batch raised, waiting for settlement",
  DRAW_READY: "Settled — the draw can be executed",
  COMPLETED: "Winner drawn and published",
}

export const statusText = (status: string) =>
  status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ")

export function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  return (
    <Badge
      variant="secondary"
      className={`rounded-full font-semibold ${STATUS_TONE[status] || "bg-slate-100 text-slate-700"} ${className}`}
    >
      {statusText(status)}
    </Badge>
  )
}

/** Payment row status behind a ticket. Neutral when no payment exists yet. */
export function PaymentChip({ status }: { status: string | null }) {
  if (!status)
    return <span className="text-[11px] font-medium text-slate-400">no payment submitted</span>
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_TONE[status] || "bg-slate-100 text-slate-700"}`}>
      {statusText(status)}
    </span>
  )
}

// ---- layout primitives ------------------------------------------------------

export function Panel({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className = "",
  bodyClassName = "p-4 sm:p-5",
}: {
  title?: string
  subtitle?: string
  icon?: LucideIcon
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <Card className={`overflow-hidden border-slate-200 shadow-2xs ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Icon className="h-4 w-4" />
              </span>
            )}
            <div className="min-w-0">
              {title && <h2 className="truncate text-sm font-semibold text-slate-900">{title}</h2>}
              {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      <CardContent className={bodyClassName}>{children}</CardContent>
    </Card>
  )
}

const KPI_TONE: Record<string, string> = {
  slate: "bg-slate-100 text-slate-600",
  emerald: "bg-emerald-100 text-emerald-700",
  sky: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-700",
  violet: "bg-violet-100 text-violet-700",
  rose: "bg-rose-100 text-rose-700",
  red: "bg-red-100 text-red-700",
}

export function KpiTile({
  label,
  value,
  hint,
  icon: Icon,
  tone = "slate",
  href,
  onClick,
}: {
  label: string
  value: React.ReactNode
  hint?: string
  icon: LucideIcon
  tone?: keyof typeof KPI_TONE
  href?: string
  onClick?: () => void
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${KPI_TONE[tone]}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold leading-none tracking-tight text-slate-900 tabular-nums">{value}</p>
      {hint && <p className="mt-1.5 text-[11px] leading-snug text-slate-500">{hint}</p>}
    </>
  )

  if (href)
    return (
      <Link href={href} className="block rounded-2xl">
        <Card className="h-full border-slate-200 shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50/60">
          <CardContent className="p-4">{body}</CardContent>
        </Card>
      </Link>
    )

  if (onClick)
    return (
      <button type="button" onClick={onClick} className="block w-full rounded-2xl text-left">
        <Card className="h-full border-slate-200 shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50/60">
          <CardContent className="p-4">{body}</CardContent>
        </Card>
      </button>
    )

  return (
    <Card className="h-full border-slate-200 shadow-2xs">
      <CardContent className="p-4">{body}</CardContent>
    </Card>
  )
}

/** Definition-list row used across every detail panel. */
export function Field({ label, children, mono = false }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0 py-2">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className={`mt-1 text-sm text-slate-900 ${mono ? "font-mono text-xs break-all" : "break-words"}`}>{children}</dd>
    </div>
  )
}

export function Notice({ kind, children, onDismiss }: { kind: "error" | "success"; children: React.ReactNode; onDismiss?: () => void }) {
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`flex items-start justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-sm ${
        kind === "error"
          ? "border-rose-200 bg-rose-50 text-rose-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      <span className="flex min-w-0 items-start gap-2">
        {kind === "error" ? <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
        <span className="min-w-0">{children}</span>
      </span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="shrink-0 text-xs font-semibold opacity-70 hover:opacity-100">
          dismiss
        </button>
      )}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-2xs">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm font-semibold text-slate-700">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export function PageSkeleton({ label = "Loading records…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-red-600" />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  )
}

/** Breadcrumb + back link used at the top of every detail screen. */
export function DetailHeader({
  backHref,
  backLabel,
  crumbs,
  title,
  subtitle,
  badge,
  actions,
}: {
  backHref: string
  backLabel: string
  crumbs: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  badge?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <Link href={backHref} className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-red-700">
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="truncate">{crumbs}</span>
      </div>

      <div className="mt-3 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs sm:p-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
            {badge}
          </div>
          {subtitle && <div className="mt-1.5 text-sm text-slate-600">{subtitle}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

export function RefreshButton({ onClick, busy, className = "" }: { onClick: () => void; busy?: boolean; className?: string }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={busy} className={`rounded-xl ${className}`}>
      <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
      Refresh
    </Button>
  )
}

// ---- admin API access -------------------------------------------------------

export function useAdminApi(reloadKey?: unknown) {
  const [tokenRequired, setTokenRequired] = useState(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const request = useCallback(async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem(TOKEN_KEY) : null
    const res = await fetch(path, {
      ...init,
      cache: "no-store",
      headers: {
        "x-admin-request": "true",
        ...(token ? { "x-admin-token": token } : {}),
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers || {}),
      },
    })
    let json: any = null
    try {
      json = await res.json()
    } catch {
      // non-JSON response (proxy error page, cold start)
    }
    if (!res.ok || !json?.success) {
      const err: any = new Error(json?.error || `Request failed (${res.status})`)
      err.status = res.status
      err.code = json?.code
      if (res.status === 401 && json?.code === "ADMIN_TOKEN_REQUIRED" && mounted.current) setTokenRequired(true)
      throw err
    }
    if (mounted.current) setTokenRequired(false)
    return json as T
    // reloadKey is intentionally part of the identity so callers can re-bind after a token change
  }, [reloadKey])

  const askForToken = useCallback(() => {
    const value = window.prompt("Enter the MERCHANT_ADMIN_TOKEN for this environment")
    if (value === null) return false
    sessionStorage.setItem(TOKEN_KEY, value.trim())
    setTokenRequired(false)
    return true
  }, [])

  return { request, tokenRequired, askForToken }
}

/** Banner shown when the environment protects /api/admin with a token. */
export function TokenGate({ onProvide }: { onProvide: () => void }) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2.5">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="min-w-0">
          This environment requires the admin token before merchant records can be read. The token is
          stored only in this browser tab&apos;s session.
        </p>
      </div>
      <Button size="sm" variant="outline" onClick={onProvide} className="shrink-0 rounded-xl border-amber-300 bg-white text-amber-900 hover:bg-amber-100">
        Enter token
      </Button>
    </div>
  )
}
