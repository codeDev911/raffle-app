"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Pencil,
  Play,
  RefreshCw,
  ShieldAlert,
  ShieldOff,
  ShoppingBag,
  Store as StoreIcon,
  Ticket,
  Trophy,
  UserCheck,
  UserX,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { type CampaignDTO, type EntryDTO, type InvoiceDTO, type StoreDTO } from "@/components/merchants/dashboard/types"

const TOKEN_KEY = "merchantsAdminToken"

interface OwnerInfo {
  id: string
  name: string | null
  email: string
  isActive: boolean
}

interface StoreRow extends StoreDTO {
  campaigns: number
  owner: OwnerInfo | null
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
  { key: "review", label: "Settlements", icon: ClipboardList },
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

  // Store settings editor
  const [editing, setEditing] = useState<StoreRow | null>(null)
  const [editForm, setEditForm] = useState({ name: "", contactEmail: "", contactPhone: "", payoutDetails: "" })
  const [editSaving, setEditSaving] = useState(false)

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

  const openEditor = (s: StoreRow) => {
    setEditForm({
      name: s.name,
      contactEmail: s.contactEmail,
      contactPhone: s.contactPhone,
      payoutDetails: s.payoutDetails || "",
    })
    setEditing(s)
  }

  const saveEditor = async () => {
    if (!editing) return
    setEditSaving(true)
    setError(null)
    try {
      await request(`/api/admin/merchants/stores/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editForm.name,
          contactEmail: editForm.contactEmail,
          contactPhone: editForm.contactPhone,
          payoutDetails: editForm.payoutDetails || null,
        }),
      })
      setNotice(`${editing.name} settings updated`)
      setEditing(null)
      await load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setEditSaving(false)
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
            Shopify lucky draw partners · payments are confirmed in{" "}
            <Link href="/admin/payments" className="text-red-700 hover:underline">
              Payments
            </Link>
            , draws run here.
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
          <Stat label="Awaiting confirmation" value={formatNumber(stats.awaitingReview)} hint={formatPKR(stats.awaitingReviewAmount)} tone="sky" />
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
            <SectionTitle icon={ClipboardList} title="Batch invoices" note="confirm the matching payments in Admin → Payments" />
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
                        <Link
                          href="/admin/payments"
                          className="text-xs font-medium text-red-700 hover:underline inline-flex items-center gap-1"
                        >
                          Confirm payments <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
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
            <SectionTitle icon={StoreIcon} title="Connected stores" note="pausing a store stops webhook minting · suspending blocks the merchant account" />
            {(data?.stores || []).length === 0 ? (
              <EmptyRow text="No stores connected yet. Share the Merchant Connect landing page." />
            ) : (
              <div className="divide-y divide-slate-100">
                {data!.stores.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        <Link href={`/admin/merchants/${s.id}`} className="hover:text-red-700 hover:underline">{s.name}</Link>
                      </p>
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
                      {s.owner ? (
                        <p className="text-xs mt-1 inline-flex items-center gap-1.5 flex-wrap">
                          <span className="text-slate-500">Account:</span>
                          <span className="font-medium text-slate-700">{s.owner.name || s.owner.email}</span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              s.owner.isActive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {s.owner.isActive ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                            {s.owner.isActive ? "Active" : "Suspended"}
                          </span>
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1">No linked account</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={s.status} />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditor(s)}
                        className="rounded-lg gap-1.5"
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </Button>
                      {s.owner ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy === `acct-${s.owner.id}`}
                          onClick={() =>
                            runAction(
                              `acct-${s.owner!.id}`,
                              () =>
                                request(`/api/admin/users/${s.owner!.id}`, {
                                  method: "PATCH",
                                  body: JSON.stringify({ isActive: !s.owner!.isActive }),
                                }).then(() => undefined),
                              s.owner!.isActive
                                ? `Account ${s.owner!.email} suspended`
                                : `Account ${s.owner!.email} reactivated`,
                            )
                          }
                          className={`rounded-lg gap-1.5 ${
                            s.owner.isActive
                              ? "border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                              : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                          }`}
                        >
                          {busy === `acct-${s.owner.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : s.owner.isActive ? (
                            <ShieldOff className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                          {s.owner.isActive ? "Suspend account" : "Reactivate"}
                        </Button>
                      ) : null}
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

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit store details</DialogTitle>
            <DialogDescription>
              {editing?.storeUrl} · credentials and status are managed from the store row.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="store-name">Store name</Label>
              <Input
                id="store-name"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="store-email">Contact email</Label>
              <Input
                id="store-email"
                type="email"
                value={editForm.contactEmail}
                onChange={(e) => setEditForm((f) => ({ ...f, contactEmail: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="store-phone">Contact phone</Label>
              <Input
                id="store-phone"
                value={editForm.contactPhone}
                onChange={(e) => setEditForm((f) => ({ ...f, contactPhone: e.target.value }))}
                placeholder="+92 300 1234567"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="store-payout">Payout details</Label>
              <Textarea
                id="store-payout"
                value={editForm.payoutDetails}
                onChange={(e) => setEditForm((f) => ({ ...f, payoutDetails: e.target.value }))}
                placeholder="Bank / wallet details used for settlements"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={editSaving}>
              Cancel
            </Button>
            <Button onClick={saveEditor} disabled={editSaving || !editForm.name.trim()} className="bg-red-600 hover:bg-red-700 text-white gap-1.5">
              {editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="text-xs text-slate-400 inline-flex items-center gap-1.5">
        <Lock className="h-3.5 w-3.5" /> Merchant Connect <Link href="/merchants" className="hover:text-slate-600">landing</Link>
        <span>·</span>
        <Link href="/lookup/store-ticket" className="hover:text-slate-600">ticket lookup</Link>
        <span>·</span>
        <span className="inline-flex items-center gap-1"><ShoppingBag className="h-3.5 w-3.5" /> data served from the merchant store</span>
      </p>
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

