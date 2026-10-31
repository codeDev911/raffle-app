"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Gift,
  Loader2,
  Pause,
  Pencil,
  Play,
  RefreshCw,
  ShieldAlert,
  ShieldOff,
  Trophy,
  UserCheck,
  UserX,
} from "lucide-react"
import type { CampaignDTO, InvoiceDTO, StoreDTO } from "@/components/merchants/dashboard/types"

const TOKEN_KEY = "merchantsAdminToken"

interface OwnerInfo {
  id: string
  email: string
  name: string | null
  role: string
  isActive: boolean
}

interface Detail {
  store: StoreDTO
  owner: OwnerInfo | null
  campaigns: CampaignDTO[]
  invoices: InvoiceDTO[]
  stats: {
    campaigns: number
    activeCampaigns: number
    tickets: number
    revenueCollected: number
    outstanding: number
  }
}

const formatPKR = (n: number | null | undefined) => `Rs. ${Math.round(Number(n) || 0).toLocaleString("en-PK")}`
const formatNumber = (n: number | null | undefined) => (Number(n) || 0).toLocaleString("en-PK")
const formatDate = (value: string | Date | null | undefined) =>
  !value ? "—" : new Intl.DateTimeFormat("en-PK", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value))

const STATUS_TONE: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  PAID: "bg-emerald-100 text-emerald-800",
  DRAW_READY: "bg-violet-100 text-violet-800",
  COMPLETED: "bg-slate-200 text-slate-700",
  UNDER_REVIEW: "bg-sky-100 text-sky-800",
  INVOICED: "bg-sky-100 text-sky-800",
  ISSUED: "bg-emerald-100 text-emerald-800",
  PENDING: "bg-amber-100 text-amber-900",
  PENDING_INVOICE: "bg-amber-100 text-amber-900",
  PAUSED: "bg-amber-100 text-amber-900",
  CANCELLED: "bg-rose-100 text-rose-800",
}

const statusText = (status: string) => status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ")

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="secondary" className={`rounded-full font-semibold ${STATUS_TONE[status] || "bg-slate-100 text-slate-700"}`}>
      {statusText(status)}
    </Badge>
  )
}

export default function MerchantDetailClient({ params }: { params: { id: string } }) {
  const storeId = params.id

  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [tokenRequired, setTokenRequired] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", contactEmail: "", contactPhone: "", payoutDetails: "" })
  const [editSaving, setEditSaving] = useState(false)

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
      const data = await request<Detail & { success: boolean }>(`/api/admin/merchants/${storeId}`)
      setDetail(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [request, storeId])

  useEffect(() => {
    load()
  }, [load])

  const provideToken = () => {
    const value = window.prompt("Enter the MERCHANT_ADMIN_TOKEN for this environment")
    if (value === null) return
    sessionStorage.setItem(TOKEN_KEY, value.trim())
    load()
  }

  const runAction = async (key: string, action: () => Promise<void>, successMessage: string) => {
    setBusy(key)
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

  const openEditor = () => {
    if (!detail) return
    setEditForm({
      name: detail.store.name,
      contactEmail: detail.store.contactEmail,
      contactPhone: detail.store.contactPhone,
      payoutDetails: detail.store.payoutDetails || "",
    })
    setEditOpen(true)
  }

  const saveEditor = async () => {
    if (!detail) return
    setEditSaving(true)
    setError(null)
    try {
      await request(`/api/admin/merchants/stores/${detail.store.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editForm.name,
          contactEmail: editForm.contactEmail,
          contactPhone: editForm.contactPhone,
          payoutDetails: editForm.payoutDetails || null,
        }),
      })
      setNotice("Store settings updated")
      setEditOpen(false)
      await load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setEditSaving(false)
    }
  }

  if (loading && !detail) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-red-600" />
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline" size="sm" className="rounded-lg gap-1.5">
          <Link href="/admin/merchants?tab=stores">
            <ArrowLeft className="h-4 w-4" /> Back to Merchants
          </Link>
        </Button>
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="p-4 text-sm text-rose-800 inline-flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error || "Merchant not found."}
          </CardContent>
        </Card>
        {tokenRequired && (
          <Button size="sm" onClick={provideToken} className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white w-fit">
            Enter admin token
          </Button>
        )}
      </div>
    )
  }

  const { store, owner, campaigns, invoices, stats } = detail

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm" className="rounded-lg gap-1.5">
          <Link href="/admin/merchants?tab=stores">
            <ArrowLeft className="h-4 w-4" /> Back to Merchants
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={load} className="rounded-lg gap-1.5">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {tokenRequired && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-amber-900 inline-flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              Merchant admin APIs require the <span className="font-mono">MERCHANT_ADMIN_TOKEN</span> value from the server environment.
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

      {/* Store hero card */}
      <Card className="border-slate-200 shadow-2xs">
        <CardContent className="p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <StatusBadge status={store.status} />
                {owner ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      owner.isActive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {owner.isActive ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                    Account {owner.isActive ? "Active" : "Suspended"}
                  </span>
                ) : null}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{store.name}</h1>
              <p className="text-sm text-slate-500 mt-1 inline-flex items-center gap-1.5 flex-wrap">
                <a
                  href={`https://${store.storeUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono hover:text-red-700 inline-flex items-center gap-1"
                >
                  {store.storeUrl} <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <span className="text-slate-300">·</span> {store.platform}
                <span className="text-slate-300">·</span> connected {formatDate(store.createdAt)}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={openEditor} className="rounded-lg gap-1.5">
                <Pencil className="h-4 w-4" /> Edit details
              </Button>
              {owner ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy === "account"}
                  onClick={() =>
                    runAction(
                      "account",
                      () =>
                        request(`/api/admin/users/${owner.id}`, {
                          method: "PATCH",
                          body: JSON.stringify({ isActive: !owner.isActive }),
                        }).then(() => undefined),
                      owner.isActive ? `Account ${owner.email} suspended` : `Account ${owner.email} reactivated`,
                    )
                  }
                  className={`rounded-lg gap-1.5 ${
                    owner.isActive
                      ? "border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                      : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                  }`}
                >
                  {busy === "account" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : owner.isActive ? (
                    <ShieldOff className="h-4 w-4" />
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  )}
                  {owner.isActive ? "Suspend account" : "Reactivate account"}
                </Button>
              ) : null}
              <Button
                size="sm"
                variant={store.status === "ACTIVE" ? "outline" : "default"}
                disabled={busy === "store"}
                onClick={() =>
                  runAction(
                    "store",
                    () =>
                      request(`/api/admin/merchants/stores/${store.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ status: store.status === "ACTIVE" ? "PAUSED" : "ACTIVE" }),
                      }).then(() => undefined),
                    store.status === "ACTIVE" ? `${store.name} paused` : `${store.name} reactivated`,
                  )
                }
                className={`rounded-lg gap-1.5 ${store.status === "ACTIVE" ? "" : "bg-red-600 hover:bg-red-700 text-white"}`}
              >
                {busy === "store" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : store.status === "ACTIVE" ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {store.status === "ACTIVE" ? "Pause store" : "Activate store"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Store contact</p>
              <p className="text-slate-800 font-medium">{store.contactEmail}</p>
              <p className="text-slate-600 font-mono">{store.contactPhone}</p>
              {store.payoutDetails ? (
                <p className="text-slate-600 whitespace-pre-line text-xs pt-1 border-t border-slate-200/70 mt-2">
                  {store.payoutDetails}
                </p>
              ) : (
                <p className="text-slate-400 text-xs pt-1">No payout details on file</p>
              )}
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Owner account</p>
              {owner ? (
                <>
                  <p className="text-slate-800 font-medium">{owner.name || "Unnamed"}</p>
                  <p className="text-slate-600">{owner.email}</p>
                  <p className="text-xs text-slate-500">
                    Role <Badge variant="outline" className="ml-1 text-[10px]">{owner.role}</Badge>
                  </p>
                </>
              ) : (
                <p className="text-slate-400 text-sm">No linked account (store authenticated by API key)</p>
              )}
              <p className="text-xs text-slate-500 pt-1">
                API key <span className="font-mono">{store.apiKeyPrefix}</span> <span className="text-slate-300">·</span> secret{" "}
                <span className="font-mono">{store.webhookSecretPreview}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Stat label="Campaigns" value={formatNumber(stats.campaigns)} hint={`${formatNumber(stats.activeCampaigns)} active`} />
            <Stat label="Tickets minted" value={formatNumber(stats.tickets)} />
            <Stat label="Revenue collected" value={formatPKR(stats.revenueCollected)} tone="emerald" />
            <Stat label="Outstanding" value={formatPKR(stats.outstanding)} tone="amber" />
            <Stat
              label="Shopify"
              value={store.shopifyConnected ? "Connected" : "Manual"}
              hint={store.shopifyScriptInstalled ? "Widget installed" : "Widget not installed"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Campaigns */}
      <Card className="border-slate-200 shadow-2xs">
        <CardContent className="p-0">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
              <Trophy className="h-4 w-4 text-slate-400" /> Campaigns
            </p>
            <p className="text-xs text-slate-400">{formatNumber(campaigns.length)} total</p>
          </div>
          {campaigns.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">No campaigns for this store yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {campaigns.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{c.title}</p>
                    <p className="text-xs text-slate-500">{c.ruleSummary}</p>
                    <p className="text-xs text-slate-500 mt-0.5 inline-flex items-center gap-1.5 flex-wrap">
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
                    <span className="font-mono text-sm tabular-nums text-slate-900">{formatPKR(c.billableAmount)}</span>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card className="border-slate-200 shadow-2xs">
        <CardContent className="p-0">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-slate-400" /> Invoices
            </p>
            <p className="text-xs text-slate-400">
              settle under <Link href="/admin/merchants" className="text-red-700 hover:underline">Settlements</Link>
            </p>
          </div>
          {invoices.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">No invoices generated yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-slate-900">{inv.invoiceNumber}</p>
                    <p className="text-xs text-slate-500 truncate">{inv.campaignTitle || "—"}</p>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => !open && setEditOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit store details</DialogTitle>
            <DialogDescription>Credentials and status are managed from the action buttons above.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="detail-store-name">Store name</Label>
              <Input
                id="detail-store-name"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="detail-store-email">Contact email</Label>
              <Input
                id="detail-store-email"
                type="email"
                value={editForm.contactEmail}
                onChange={(e) => setEditForm((f) => ({ ...f, contactEmail: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="detail-store-phone">Contact phone</Label>
              <Input
                id="detail-store-phone"
                value={editForm.contactPhone}
                onChange={(e) => setEditForm((f) => ({ ...f, contactPhone: e.target.value }))}
                placeholder="+92 300 1234567"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="detail-store-payout">Payout details</Label>
              <Textarea
                id="detail-store-payout"
                value={editForm.payoutDetails}
                onChange={(e) => setEditForm((f) => ({ ...f, payoutDetails: e.target.value }))}
                placeholder="Bank / wallet details used for settlements"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editSaving}>
              Cancel
            </Button>
            <Button onClick={saveEditor} disabled={editSaving || !editForm.name.trim()} className="bg-red-600 hover:bg-red-700 text-white gap-1.5">
              {editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Stat({ label, value, hint, tone = "slate" }: { label: string; value: string; hint?: string; tone?: string }) {
  const tones: Record<string, string> = {
    slate: "text-slate-900",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
  }
  return (
    <Card className="border-slate-200 shadow-2xs">
      <CardContent className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className={`mt-1.5 font-mono text-lg font-bold tabular-nums ${tones[tone]}`}>{value}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      </CardContent>
    </Card>
  )
}
