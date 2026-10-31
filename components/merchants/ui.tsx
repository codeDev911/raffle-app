"use client"

// Merchant Connect UI kit — light workspace (white panels on slate-50), emerald operational
// highlights (#059669), border-slate-200, monospace tabular figures for all numbers.
import type React from "react"
import { useState } from "react"
import { Check, Copy, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WebhookTopic } from "@/lib/merchants/webhook-topics"

// ───────────────────────── client API helper ─────────────────────────

export class ApiError extends Error {
  status: number
  code?: string
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function merchantApi<T = any>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init
  const res = await fetch(path, {
    ...rest,
    cache: "no-store",
    credentials: "same-origin",
    headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...(headers || {}) },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  })
  let data: any = null
  try {
    data = await res.json()
  } catch {
    // non-JSON response
  }
  if (!res.ok || !data?.success) {
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status, data?.code)
  }
  return data as T
}

// ───────────────────────── formatting ─────────────────────────

export const formatPKR = (amount: number | null | undefined) =>
  `Rs. ${Math.round(Number(amount) || 0).toLocaleString("en-PK")}`

export const formatNumber = (value: number | null | undefined) => (Number(value) || 0).toLocaleString("en-PK")

export function formatDate(value: string | Date | null | undefined, withTime = false) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date)
}

export function timeAgo(value: string | Date | null | undefined) {
  if (!value) return "—"
  const diff = Date.now() - new Date(value).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

// ───────────────────────── status (typographic, no pills) ─────────────────────────

const STATUS_TONE: Record<string, { dot: string; text: string; label?: string }> = {
  ACTIVE: { dot: "bg-emerald-500", text: "text-emerald-700" },
  ISSUED: { dot: "bg-emerald-500", text: "text-emerald-700" },
  PAID: { dot: "bg-emerald-500", text: "text-emerald-700" },
  PAUSED: { dot: "bg-amber-500", text: "text-amber-700" },
  PENDING: { dot: "bg-amber-500", text: "text-amber-700", label: "Awaiting payment" },
  PENDING_INVOICE: { dot: "bg-amber-500", text: "text-amber-700", label: "Invoice pending" },
  UNDER_REVIEW: { dot: "bg-sky-500", text: "text-sky-700", label: "Under review" },
  INVOICED: { dot: "bg-sky-500", text: "text-sky-700", label: "Awaiting confirmation" },
  DRAW_READY: { dot: "bg-violet-500", text: "text-violet-700", label: "Ready for draw" },
  COMPLETED: { dot: "bg-slate-400", text: "text-slate-600", label: "Draw completed" },
  CANCELLED: { dot: "bg-rose-500", text: "text-rose-700" },
  ENDED: { dot: "bg-slate-400", text: "text-slate-500", label: "Ended" },
  TEST: { dot: "bg-fuchsia-500", text: "text-fuchsia-700", label: "Test" },
  // Merchant ticket states, derived from the ticket + its PakRaffle payment row.
  UNPAID: { dot: "bg-amber-500", text: "text-amber-700", label: "Unpaid" },
  CHECKOUT_OPEN: { dot: "bg-sky-500", text: "text-sky-700", label: "Checkout open" },
  ON_INVOICE: { dot: "bg-slate-400", text: "text-slate-500", label: "On invoice" },
  AWAITING_CONFIRMATION: { dot: "bg-sky-500", text: "text-sky-700", label: "Awaiting confirmation" },
  PAYMENT_FAILED: { dot: "bg-rose-500", text: "text-rose-700", label: "Payment failed" },
  PAYMENT_CANCELLED: { dot: "bg-rose-500", text: "text-rose-700", label: "Payment cancelled" },
}

export function statusLabel(status: string) {
  const tone = STATUS_TONE[status]
  if (tone?.label) return tone.label
  return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ")
}

export function StatusText({ status, className }: { status: string; className?: string }) {
  const tone = STATUS_TONE[status] || { dot: "bg-slate-400", text: "text-slate-500" }
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap", tone.text, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
      {statusLabel(status)}
    </span>
  )
}

export function Sep() {
  return <span className="text-slate-300 select-none px-1.5">·</span>
}

// ───────────────────────── layout primitives ─────────────────────────

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  // min-w-0 stops long unbreakable values (webhook URLs, script tags) from widening the grid
  // column a panel sits in — that is what pushed the dashboard past a phone screen.
  return <div className={cn("min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>{children}</div>
}

export function PanelHeader({
  title,
  description,
  action,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    // Wraps instead of stacking: a small action (refresh) stays beside the title, while a wide one
    // (New campaign) drops to its own right-aligned line on a phone.
    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 border-b border-slate-200 px-5 py-4">
      <div className="min-w-0 flex-1 basis-[12rem]">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      {action && <div className="ml-auto flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  )
}

export function Metric({
  label,
  value,
  hint,
  accent = false,
  className,
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  accent?: boolean
  className?: string
}) {
  return (
    <Panel className={cn("p-3.5 sm:p-4", className)}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 sm:text-[11px]">{label}</p>
      <p
        className={cn(
          "mt-1.5 font-mono text-xl font-semibold tabular-nums sm:mt-2 sm:text-2xl",
          accent ? "text-emerald-600" : "text-slate-900",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-500 sm:mt-1 sm:text-xs">{hint}</p>}
    </Panel>
  )
}

export function EmptyState({ icon: Icon, title, children }: { icon: any; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-slate-800">{title}</p>
      {children && <div className="mt-1 max-w-sm text-xs text-slate-500">{children}</div>}
    </div>
  )
}

// ───────────────────────── form primitives ─────────────────────────

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string
  hint?: React.ReactNode
  error?: string | null
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-xs font-medium text-slate-700">{label}</span>
      {children}
      {error ? (
        <span className="block text-xs text-rose-600">{error}</span>
      ) : hint ? (
        <span className="block text-[11px] text-slate-500">{hint}</span>
      ) : null}
    </label>
  )
}

const inputBase =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50 disabled:text-slate-500"

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputBase, props.className)} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputBase, "min-h-[84px] resize-y", props.className)} />
}

/** Native arrow removed so the chevron looks the same on every OS; drawn as an inline SVG. */
const selectChevron: React.CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.75rem center",
  backgroundSize: "16px",
}

export function SelectInput({ style, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{ ...selectChevron, ...style }}
      className={cn(inputBase, "cursor-pointer appearance-none pr-10", props.className)}
    />
  )
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm shadow-emerald-600/20",
  secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger: "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
}

export function Btn({
  variant = "primary",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        buttonVariants[variant],
        className,
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}

export function Alert({ tone = "error", children }: { tone?: "error" | "info" | "success"; children: React.ReactNode }) {
  const tones = {
    error: "border-rose-200 bg-rose-50 text-rose-700",
    info: "border-sky-200 bg-sky-50 text-sky-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  }
  return <div className={cn("rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed", tones[tone])}>{children}</div>
}

/**
 * The webhook checklist. Shopify's admin dropdown lists friendly event names while the topic
 * it actually sends is a path like orders/create — both are shown so nobody has to guess.
 */
export function TopicList({ topics, className }: { topics: WebhookTopic[]; className?: string }) {
  return (
    <ul className={cn("divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200", className)}>
      {topics.map((entry) => (
        <li key={entry.topic} className="flex flex-col gap-1.5 bg-white px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800">
              {entry.adminLabel}
              {!entry.required && <span className="ml-1.5 font-normal text-slate-400">optional</span>}
            </p>
            <p className="text-[11px] leading-relaxed text-slate-500">{entry.purpose}</p>
          </div>
          <code className="w-fit shrink-0 rounded-md bg-slate-50 px-2 py-1 font-mono text-[11px] text-emerald-700 ring-1 ring-inset ring-slate-200">
            {entry.topic}
          </code>
        </li>
      ))}
    </ul>
  )
}

export function CopyField({
  label,
  value,
  secret = false,
  wrap = false,
}: {
  label: string
  value: string
  secret?: boolean
  /** Long snippets (e.g. a script tag) wrap instead of scrolling sideways. */
  wrap?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [revealed, setRevealed] = useState(!secret)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable (insecure context) — user can still select the text
    }
  }

  return (
    <div className="min-w-0 space-y-1.5">
      <span className="text-xs font-medium text-slate-700">{label}</span>
      <div className="flex min-w-0 items-stretch gap-2">
        <code
          onClick={() => setRevealed(true)}
          className={`min-w-0 flex-1 cursor-text select-all rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-emerald-700 ${
            wrap ? "break-all whitespace-pre-wrap" : "overflow-x-auto whitespace-nowrap"
          }`}
        >
          {revealed ? value : "•".repeat(Math.min(32, value.length))}
        </code>
        <button
          type="button"
          onClick={copy}
          className="inline-flex w-11 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-500 transition hover:text-emerald-600"
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
