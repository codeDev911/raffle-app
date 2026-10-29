"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Gift,
  Loader2,
  Lock,
  Pause,
  Play,
  RefreshCw,
  ShieldAlert,
  ShoppingBag,
  Store as StoreIcon,
  Ticket,
  Trophy,
  XCircle,
} from "lucide-react"
import {
  PAYMENT_METHOD_LABELS,
  type CampaignDTO,
  type EntryDTO,
  type InvoiceDTO,
  type StoreDTO,
} from "@/components/merchants/dashboard/types"

const TOKEN_KEY = "merchantsAdminToken"

interface StoreRow extends StoreDTO {
  campaigns: number
}

interface CampaignRow extends CampaignDTO {
  storeName: string
  winner: EntryDTO | null
}

interface Overview {
  stats: {
    stores: number
    activeStores: number
    activeCampaigns: number
    drawReady: number
    issuedEntries: number
    revenueCollected: number
    awaitingReview: number
    awaitingReviewAmount: number
    outstandingAmount: number
  }
  stores: StoreRow[]
  campaigns: CampaignRow[]
  invoices: InvoiceDTO[]
}

interface InvoiceDetail {
  invoice: InvoiceDTO
  entries: EntryDTO[]
  store: { id: string; name: string; storeUrl: string; contactEmail: string } | null
  settlementAccounts: { key: string; label: string; accountName: string; accountNumber: string; iban?: string }[]
}

const formatPKR = (n: number | null | undefined) => `Rs. ${Math.round(Number(n) || 0).toLocaleString("en-PK")}`
const formatNumber = (n: number | null | undefined) => (Number(n) || 0).toLocaleString("en-PK")
const formatDate = (value: string | Date | null | undefined) =>
  !value ? "—" : new Intl.DateTimeFormat("en-PK", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value))

const STATUS_TONE: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  ISSUED: "bg-emerald-100 text-emerald-800",
  PAID: "bg-emerald-100 text-emerald-800",
  DRAW_READY: "bg-violet-100 text-violet-800",
  COMPLETED: "bg-slate-200 text-slate-700",
  UNDER_REVIEW: "bg-sky-100 text-sky-800",
  INVOICED: "bg-sky-100 text-sky-800",
  PENDING: "bg-amber-100 text-amber-900",
  PENDING_INVOICE: "bg-amber-100 text-amber-900",
  PAUSED: "bg-amber-100 text-amber-900",
  CANCELLED: "bg-rose-100 text-rose-800",
}

const statusText = (status: string) =>
  status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ")

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="secondary" className={`rounded-full font-semibold ${STATUS_TONE[status] || "bg-slate-100 text-slate-700"}`}>
      {statusText(status)}
    </Badge>
  )
}

const TABS = [
  { key: "review", label: "Settlement Review", icon: ClipboardList },
  { key: "draws", label: "Draws", icon: Trophy },
  { key: "stores", label: "Stores", icon: StoreIcon },
] as const

type TabKey = (typeof TABS)[number]["key"]

export default function MerchantsAdminClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paramTab = searchParams.get("tab") as TabKey | null

  const [tab, setTab] = useState<TabKey>("review")
  const [data, setData] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [tokenRequired, setTokenRequired] = useState(false)
  const [reviewId, setReviewId] = useState<string | null>(null)

  useEffect(() => {
    if (paramTab && TABS.some((t) => t.key === paramTab)) setTab(paramTab)
  }, [paramTab])

  const changeTab = (key: TabKey) => {
    setTab(key)
    router.replace(key === "review" ? "/admin/merchants" : `/admin/merchants?tab=${key}`, { scroll: false })
  }

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
      // non-JSON response
    }
    if (!res.ok || !json?.success) {
      const err: any = new Error(json?.error || `Request failed (${res.status})`)
      err.status = res.status
      err.code = json?.code
      if (res.status === 401 && json?.code === "ADMIN_TOKEN_REQUIRED") setTokenRequired(true)
      throw err
    }
    setTokenRequired(false)
    return json as T
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await request<Overview>("/api/admin/merchants"))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [request])

  useEffect(() => {
    load()
  }, [load])

  const provideToken = () => {
    const value = window.prompt("Enter the MERCHANT_ADMIN_TOKEN for this environment")
    if (value === null) return
    sessionStorage.setItem(TOKEN_KEY, value.trim())
    load()
  }

  // The draw route returns no body worth keeping, but must still surface 401 → token prompt.
  const runDraw = async (campaignId: string) => {
    await request(`/api/admin/merchants/campaigns/${campaignId}/draw`, { method: "POST" })
  }

  const runAction = async (id: string, action: () => Promise<void>, successMessage: string) => {
    setBusy(id)
    setError(null)
    setNotice(null)
    try {
      await action()
      setNotice(successMessage)
      await load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusy(null)
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-red-600" />
      </div>
    )
  }

  const stats = data?.stats

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Merchant Connect</h1>
          <p className="text-sm text-slate-500 mt-1">
            Shopify lucky draw partners · verify settlements, run draws and control store access.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="rounded-xl gap-1.5">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {tokenRequired && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-amber-900 inline-flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              Merchant admin APIs require the <span className="font-mono">MERCHANT_ADMIN_TOKEN</span> value from the server
              environment.
            </p>
            <Button size="sm" onClick={provideToken} className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white">
              Enter token
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="p-4 text-sm text-rose-800 inline-flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </CardContent>
        </Card>
      )}
      {notice && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-4 text-sm text-emerald-800 inline-flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {notice}
          </CardContent>
        </Card>
      )}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Stores" value={formatNumber(stats.stores)} hint={`${formatNumber(stats.activeStores)} active`} />
          <Stat label="Tickets minted" value={formatNumber(stats.issuedEntries)} hint={`${formatNumber(stats.activeCampaigns)} active campaigns`} />
          <Stat label="Awaiting review" value={formatNumber(stats.awaitingReview)} hint={formatPKR(stats.awaitingReviewAmount)} tone="sky" />
          <Stat label="Revenue collected" value={formatPKR(stats.revenueCollected)} hint={`${formatPKR(stats.outstandingAmount)} outstanding`} tone="emerald" />
        </div>
      )}

      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => changeTab(item.key)}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              tab === item.key ? "border-red-600 text-red-700" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <item.icon className="h-4 w-4" /> {item.label}
            {item.key === "review" && stats ? (
              <span className="font-mono tabular-nums text-xs text-slate-400">{formatNumber(stats.awaitingReview)}</span>
            ) : null}
            {item.key === "draws" && stats ? (
              <span className="font-mono tabular-nums text-xs text-slate-400">{formatNumber(stats.drawReady)}</span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "review" && (
        <Card className="border-slate-200 shadow-2xs">
          <CardContent className="p-0">
            <SectionTitle icon={ClipboardList} title="Batch invoices" note="newest first" />
            {(data?.invoices || []).length === 0 ? (
              <EmptyRow text="No invoices generated yet." />
            ) : (
              <div className="divide-y divide-slate-100">
                {data!.invoices.map((inv) => (
                  <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-semibold text-slate-900">{inv.invoiceNumber}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {inv.storeName} <span className="text-slate-300">·</span> {inv.campaignTitle}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="font-mono tabular-nums">{formatNumber(inv.totalEntries)}</span> tickets ×{" "}
                        <span className="font-mono tabular-nums">{formatPKR(inv.unitPrice)}</span>
                        {inv.transactionRef && (
                          <>
                            {" "}<span className="text-slate-300">·</span> ref <span className="font-mono">{inv.transactionRef}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">{formatPKR(inv.amountDue)}</span>
                      <StatusBadge status={inv.status} />
                      {inv.status === "UNDER_REVIEW" && (
                        <Button size="sm" onClick={() => setReviewId(inv.id)} className="rounded-lg gap-1.5">
                          Review payment
                        </Button>
                      )}
                      {inv.status === "PENDING" && (
                        <Button size="sm" variant="outline" onClick={() => setReviewId(inv.id)} className="rounded-lg gap-1.5">
                          Open
                        </Button>
                      )}
                      {inv.status === "PAID" && inv.paymentProof && (
                        <a href={inv.paymentProof} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">
                          <ExternalLink className="h-3.5 w-3.5" /> receipt
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "draws" && (
        <Card className="border-slate-200 shadow-2xs">
          <CardContent className="p-0">
            <SectionTitle icon={Trophy} title="Campaigns" note="draws run on the paid, verified ticket pool" />
            {(data?.campaigns || []).length === 0 ? (
              <EmptyRow text="No campaigns yet." />
            ) : (
              <div className="divide-y divide-slate-100">
                {data!.campaigns.map((c) => (
                  <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{c.title}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {c.storeName} <span className="text-slate-300">·</span> {c.ruleSummary}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 inline-flex items-center gap-1.5 flex-wrap">
                        <Ticket className="h-3.5 w-3.5" />
                        <span className="font-mono tabular-nums">{formatNumber(c.currentEntries)}</span>
                        {c.maxEntries ? <span className="text-slate-400">/ {formatNumber(c.maxEntries)}</span> : null}
                        <span className="text-slate-300">·</span> draw {formatDate(c.endDate)}
                        {c.prize && (
                          <>
                            <span className="text-slate-300">·</span>
                            <Gift className="h-3.5 w-3.5" /> {c.prize.title}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {c.winner ? (
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Winner</p>
                          <p className="font-mono text-xs tabular-nums font-semibold text-violet-700">{c.winner.ticketNumber}</p>
                          <p className="text-xs text-slate-600">{c.winner.customerName}</p>
                        </div>
                      ) : (
                        <span className="font-mono text-sm tabular-nums text-slate-900">{formatPKR(c.billableAmount)}</span>
                      )}
                      <StatusBadge status={c.status} />
                      {c.status === "DRAW_READY" && (
                        <Button
                          size="sm"
                          disabled={busy === c.id}
                          onClick={() => runAction(c.id, () => runDraw(c.id), `Draw completed for “${c.title}”`)}
                          className="rounded-lg bg-violet-600 hover:bg-violet-700 text-white gap-1.5"
                        >
                          {busy === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />} Run draw
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "stores" && (
        <Card className="border-slate-200 shadow-2xs">
          <CardContent className="p-0">
            <SectionTitle icon={StoreIcon} title="Connected stores" note="pausing a store stops webhook minting" />
            {(data?.stores || []).length === 0 ? (
              <EmptyRow text="No stores connected yet. Share the Merchant Connect landing page." />
            ) : (
              <div className="divide-y divide-slate-100">
                {data!.stores.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{s.name}</p>
                      <p className="text-xs text-slate-500 inline-flex items-center gap-1.5">
                        <a
                          href={`https://${s.storeUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono hover:text-red-700 inline-flex items-center gap-1"
                        >
                          {s.storeUrl} <ExternalLink className="h-3 w-3" />
                        </a>
                        <span className="text-slate-300">·</span>
                        <span className="font-mono">{s.apiKeyPrefix}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {s.contactEmail} <span className="text-slate-300">·</span>
                        <span className="font-mono">{s.contactPhone}</span> <span className="text-slate-300">·</span>{" "}
                        <span className="font-mono tabular-nums">{formatNumber(s.campaigns)}</span> campaigns
                        {s.payoutDetails && (
                          <>
                            <span className="text-slate-300">·</span> {s.payoutDetails.slice(0, 40)}
                            {s.payoutDetails.length > 40 ? "…" : ""}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={s.status} />
                      <Button
                        size="sm"
                        variant={s.status === "ACTIVE" ? "outline" : "default"}
                        disabled={busy === s.id}
                        onClick={() =>
                          runAction(
                            s.id,
                            () =>
                              request(`/api/admin/merchants/stores/${s.id}`, {
                                method: "PATCH",
                                body: JSON.stringify({ status: s.status === "ACTIVE" ? "PAUSED" : "ACTIVE" }),
                              }).then(() => undefined),
                            `${s.name} ${s.status === "ACTIVE" ? "paused" : "reactivated"}`,
                          )
                        }
                        className={`rounded-lg gap-1.5 ${s.status === "ACTIVE" ? "" : "bg-red-600 hover:bg-red-700 text-white"}`}
                      >
                        {busy === s.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : s.status === "ACTIVE" ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                        {s.status === "ACTIVE" ? "Pause" : "Activate"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-slate-400 inline-flex items-center gap-1.5">
        <Lock className="h-3.5 w-3.5" /> Merchant Connect <Link href="/merchants" className="hover:text-slate-600">landing</Link>
        <span>·</span>
        <Link href="/lookup/store-ticket" className="hover:text-slate-600">ticket lookup</Link>
        <span>·</span>
        <span className="inline-flex items-center gap-1"><ShoppingBag className="h-3.5 w-3.5" /> data served from the merchant store</span>
      </p>

      {reviewId && (
        <ReviewDialog
          invoiceId={reviewId}
          request={request}
          busy={busy === reviewId}
          onClose={() => setReviewId(null)}
          onDone={async (message) => {
            setReviewId(null)
            setNotice(message)
            await load()
          }}
        />
      )}
    </div>
  )
}

function Stat({ label, value, hint, tone = "slate" }: { label: string; value: string; hint?: string; tone?: string }) {
  const tones: Record<string, string> = {
    slate: "text-slate-900",
    emerald: "text-emerald-700",
    sky: "text-sky-700",
  }
  return (
    <Card className="border-slate-200 shadow-2xs">
      <CardContent className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className={`mt-1.5 font-mono text-xl font-bold tabular-nums ${tones[tone]}`}>{value}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      </CardContent>
    </Card>
  )
}

function SectionTitle({ icon: Icon, title, note }: { icon: any; title: string; note?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
      <p className="text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-400" /> {title}
      </p>
      {note && <p className="text-xs text-slate-400">{note}</p>}
    </div>
  )
}

function EmptyRow({ text }: { text: string }) {
  return <p className="px-4 py-10 text-center text-sm text-slate-500">{text}</p>
}

function ReviewDialog({
  invoiceId,
  request,
  busy,
  onClose,
  onDone,
}: {
  invoiceId: string
  request: <T>(path: string, init?: RequestInit) => Promise<T>
  busy: boolean
  onClose: () => void
  onDone: (message: string) => Promise<void>
}) {
  const [detail, setDetail] = useState<InvoiceDetail | null>(null)
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    request<InvoiceDetail>(`/api/admin/merchants/invoices/${invoiceId}`)
      .then(setDetail)
      .catch((err) => setError(err.message))
  }, [invoiceId, request])

  const review = async (action: "approve" | "reject") => {
    setError(null)
    try {
      await request(`/api/admin/merchants/invoices/${invoiceId}`, {
        method: "PATCH",
        body: JSON.stringify({ action, adminNotes: notes.trim() || null }),
      })
      await onDone(
        action === "approve"
          ? `Payment approved · ${detail?.invoice.campaignTitle || "campaign"} is now draw-ready`
          : "Payment rejected and returned to the merchant",
      )
    } catch (err: any) {
      setError(err.message)
    }
  }

  const invoice = detail?.invoice

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 overflow-y-auto">
      <Card className="w-full max-w-2xl my-auto border-slate-200 shadow-lg">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-mono tabular-nums">{invoice?.invoiceNumber || "Invoice"}</h2>
              <p className="text-xs text-slate-500">
                {invoice?.storeName} <span className="text-slate-300">·</span> {invoice?.campaignTitle}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-500">
              <XCircle className="h-5 w-5" />
            </Button>
          </div>

          {error && <p className="text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}
          {!detail && !error && <p className="py-8 text-center text-sm text-slate-500">Loading invoice…</p>}

          {detail && invoice && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <MiniStat label="Tickets" value={formatNumber(invoice.totalEntries)} />
                <MiniStat label="Rate" value={formatPKR(invoice.unitPrice)} />
                <MiniStat label="Amount due" value={formatPKR(invoice.amountDue)} strong />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm space-y-1">
                <p className="text-slate-700">
                  <span className="text-slate-500">Method:</span>{" "}
                  <span className="font-semibold">{PAYMENT_METHOD_LABELS[invoice.paymentMethod || ""] || invoice.paymentMethod || "—"}</span>
                </p>
                <p className="text-slate-700">
                  <span className="text-slate-500">Transaction ref:</span>{" "}
                  <span className="font-mono">{invoice.transactionRef || "—"}</span>
                </p>
                {detail.store && (
                  <p className="text-slate-700">
                    <span className="text-slate-500">Merchant:</span> {detail.store.name}
                    <span className="text-slate-300"> · </span>
                    <a href={`mailto:${detail.store.contactEmail}`} className="text-red-700 hover:underline">
                      {detail.store.contactEmail}
                    </a>
                  </p>
                )}
                {invoice.paymentProof && (
                  <a
                    href={invoice.paymentProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-red-700 font-semibold hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open uploaded receipt
                  </a>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Itemised tickets <span className="font-mono normal-case text-slate-400">({detail.entries.length})</span>
                </p>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                  {detail.entries.map((e) => (
                    <div key={e.id} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                      <span className="font-mono tabular-nums text-violet-700 font-semibold">{e.ticketNumber}</span>
                      <span className="font-mono tabular-nums text-slate-500">{e.orderName || `#${e.shopifyOrderId}`}</span>
                      <span className="truncate text-slate-700">{e.customerName}</span>
                      <span className="font-mono tabular-nums text-slate-500">
                        {e.itemCount}× · {formatPKR(e.orderAmount)}
                      </span>
                    </div>
                  ))}
                  {detail.entries.length === 0 && <p className="px-3 py-6 text-center text-slate-500">No tickets on this invoice.</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Admin notes (required to reject)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Transaction ID not found in our Meezan statement"
                  className="rounded-xl border-slate-300"
                />
              </div>

              <div className="flex flex-wrap gap-2 justify-end pt-1">
                <Button variant="outline" onClick={onClose} className="rounded-xl">
                  Close
                </Button>
                <Button
                  variant="outline"
                  disabled={busy || invoice.status !== "UNDER_REVIEW"}
                  onClick={() => review("reject")}
                  className="rounded-xl border-rose-300 text-rose-700 hover:bg-rose-50 gap-1.5"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
                <Button
                  disabled={busy || !["PENDING", "UNDER_REVIEW"].includes(invoice.status)}
                  onClick={() => review("approve")}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Approve & unlock draw
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MiniStat({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
      <p className={`font-mono text-base font-bold tabular-nums ${strong ? "text-emerald-700" : "text-slate-900"}`}>{value}</p>
    </div>
  )
}
