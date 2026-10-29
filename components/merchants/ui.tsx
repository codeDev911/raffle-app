"use client"

// Merchant Connect UI kit — deep slate workspace (#0B0F19 / #111827), emerald operational
// highlights (#10B981), border-slate-800, monospace tabular figures for all numbers.
import type React from "react"
import { useState } from "react"
import { Check, Copy, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
  ACTIVE: { dot: "bg-emerald-400", text: "text-emerald-400" },
  ISSUED: { dot: "bg-emerald-400", text: "text-emerald-400" },
  PAID: { dot: "bg-emerald-400", text: "text-emerald-300" },
  PAUSED: { dot: "bg-amber-400", text: "text-amber-300" },
  PENDING: { dot: "bg-amber-400", text: "text-amber-300", label: "Awaiting payment" },
  PENDING_INVOICE: { dot: "bg-amber-400", text: "text-amber-300", label: "Invoice pending" },
  UNDER_REVIEW: { dot: "bg-sky-400", text: "text-sky-300", label: "Under review" },
  INVOICED: { dot: "bg-sky-400", text: "text-sky-300", label: "Awaiting confirmation" },
  DRAW_READY: { dot: "bg-violet-400", text: "text-violet-300", label: "Ready for draw" },
  COMPLETED: { dot: "bg-slate-400", text: "text-slate-300", label: "Draw completed" },
  CANCELLED: { dot: "bg-rose-400", text: "text-rose-300" },
  ENDED: { dot: "bg-slate-500", text: "text-slate-400", label: "Ended" },
  TEST: { dot: "bg-fuchsia-400", text: "text-fuchsia-300", label: "Test" },
  // Merchant ticket states, derived from the ticket + its PakRaffle payment row.
  UNPAID: { dot: "bg-amber-400", text: "text-amber-300", label: "Unpaid" },
  ON_INVOICE: { dot: "bg-slate-500", text: "text-slate-400", label: "On invoice" },
  AWAITING_CONFIRMATION: { dot: "bg-sky-400", text: "text-sky-300", label: "Awaiting confirmation" },
  PAYMENT_FAILED: { dot: "bg-rose-400", text: "text-rose-300", label: "Payment failed" },
  PAYMENT_CANCELLED: { dot: "bg-rose-400", text: "text-rose-300", label: "Payment cancelled" },
}

export function statusLabel(status: string) {
  const tone = STATUS_TONE[status]
  if (tone?.label) return tone.label
  return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ")
}

export function StatusText({ status, className }: { status: string; className?: string }) {
  const tone = STATUS_TONE[status] || { dot: "bg-slate-500", text: "text-slate-400" }
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap", tone.text, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
      {statusLabel(status)}
    </span>
  )
}

export function Sep() {
  return <span className="text-slate-600 select-none px-1.5">·</span>
}

// ───────────────────────── layout primitives ─────────────────────────

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl border border-slate-800 bg-[#111827]", className)}>{children}</div>
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
    <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  )
}

export function Metric({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  accent?: boolean
}) {
  return (
    <Panel className="p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className={cn("mt-2 font-mono text-2xl font-semibold tabular-nums", accent ? "text-emerald-400" : "text-slate-100")}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </Panel>
  )
}

export function EmptyState({ icon: Icon, title, children }: { icon: any; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-[#0B0F19] text-slate-500">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-slate-200">{title}</p>
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
      <span className="text-xs font-medium text-slate-300">{label}</span>
      {children}
      {error ? (
        <span className="block text-xs text-rose-400">{error}</span>
      ) : hint ? (
        <span className="block text-[11px] text-slate-500">{hint}</span>
      ) : null}
    </label>
  )
}

const inputBase =
  "w-full rounded-xl border border-slate-800 bg-[#0B0F19] px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60"

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputBase, props.className)} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputBase, "min-h-[84px] resize-y", props.className)} />
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputBase, "appearance-none pr-8", props.className)} />
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-emerald-500 text-[#0B0F19] hover:bg-emerald-400 shadow-sm shadow-emerald-500/20",
  secondary: "border border-slate-700 bg-slate-800/60 text-slate-100 hover:bg-slate-800",
  ghost: "text-slate-300 hover:bg-slate-800/70 hover:text-slate-100",
  danger: "border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
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
    error: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    info: "border-sky-500/30 bg-sky-500/10 text-sky-200",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  }
  return <div className={cn("rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed", tones[tone])}>{children}</div>
}

export function CopyField({ label, value, secret = false }: { label: string; value: string; secret?: boolean }) {
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
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-slate-300">{label}</span>
      <div className="flex items-stretch gap-2">
        <code
          onClick={() => setRevealed(true)}
          className="flex-1 cursor-text select-all overflow-x-auto whitespace-nowrap rounded-xl border border-slate-800 bg-[#0B0F19] px-3.5 py-2.5 font-mono text-xs text-emerald-300"
        >
          {revealed ? value : "•".repeat(Math.min(32, value.length))}
        </code>
        <button
          type="button"
          onClick={copy}
          className="inline-flex w-11 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/60 text-slate-300 transition hover:text-emerald-300"
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
