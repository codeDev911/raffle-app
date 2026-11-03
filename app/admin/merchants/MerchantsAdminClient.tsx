"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  Ban,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  ExternalLink,
  Gift,
  Layers,
  Loader2,
  Lock,
  Pause,
  Pencil,
  Play,
  Receipt,
  Search,
  ShieldOff,
  ShoppingBag,
  SlidersHorizontal,
  Store as StoreIcon,
  Ticket,
  Trophy,
  UserCheck,
  Users,
  Wallet,
  X,
} from "lucide-react"
import type { CampaignDTO, EntryDTO, InvoiceDTO, StoreDTO } from "@/components/merchants/dashboard/types"
import {
  CAMPAIGN_HINT,
  KpiTile,
  Notice,
  StatusBadge,
  TokenGate,
  formatAgo,
  formatDate,
  formatNumber,
  formatPKR,
  plural,
  useAdminApi,
} from "./_shared"

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

/** Preview pulled before a draw is executed, so an irreversible action is never a blind click. */
interface DrawPreview {
  campaign: CampaignRow
  ledger: { total: number; paid: number; invoiced: number; issued: number; cancelled: number; test: number; live: number; liveAmount: number; drawPool: number }
  entries: EntryDTO[]
  winner: EntryDTO | null
}

const TABS = [
  { key: "settlements", label: "Settlements", icon: ClipboardList },
  { key: "campaigns", label: "Campaigns", icon: Trophy },
  { key: "stores", label: "Stores", icon: StoreIcon },
] as const

type TabKey = (typeof TABS)[number]["key"]

/** Settlements are worked top-down: anything waiting on a human comes before anything finished. */
const SETTLEMENT_RANK: Record<string, number> = { UNDER_REVIEW: 0, PENDING: 1, PAID: 2 }

const STATUS_FILTERS: Record<TabKey, Array<{ value: string; label: string }>> = {
  settlements: [
    { value: "ALL", label: "All" },
    { value: "UNDER_REVIEW", label: "Under review" },
    { value: "PENDING", label: "Pending" },
    { value: "PAID", label: "Paid" },
  ],
  campaigns: [
    { value: "ALL", label: "All" },
    { value: "ACTIVE", label: "Active" },
    { value: "PAUSED", label: "Paused" },
    { value: "PENDING_INVOICE", label: "Pending invoice" },
    { value: "DRAW_READY", label: "Draw ready" },
    { value: "COMPLETED", label: "Completed" },
  ],
  stores: [
    { value: "ALL", label: "All" },
    { value: "ACTIVE", label: "Active" },
    { value: "PAUSED", label: "Paused" },
  ],
}

export default function MerchantsAdminClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paramTab = searchParams.get("tab") as TabKey | null

  const [tab, setTab] = useState<TabKey>("settlements")
  const [data, setData] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("ALL")

  const { request, tokenRequired, askForToken } = useAdminApi()

  // Store settings editor
  const [editing, setEditing] = useState<StoreRow | null>(null)
  const [editForm, setEditForm] = useState({ name: "", contactEmail: "", contactPhone: "", payoutDetails: "" })
  const [editSaving, setEditSaving] = useState(false)

  // Draw confirmation
  const [drawTarget, setDrawTarget] = useState<CampaignRow | null>(null)
  const [drawPreview, setDrawPreview] = useState<DrawPreview | null>(null)
  const [drawLoading, setDrawLoading] = useState(false)
  const [drawing, setDrawing] = useState(false)

  useEffect(() => {
    if (paramTab && TABS.some((t) => t.key === paramTab)) setTab(paramTab)
  }, [paramTab])

  const changeTab = (key: TabKey) => {
    setTab(key)
    setStatus("ALL")
    setQuery("")
    router.replace(key === "settlements" ? "/admin/merchants" : `/admin/merchants?tab=${key}`, { scroll: false })
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await request<Overview & { success: boolean }>("/api/admin/merchants"))
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
    if (askForToken()) load()
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

  // ---- derived views --------------------------------------------------------

  /** Per-store rollup, so the Stores tab answers "how much is this partner worth to us". */
  const storeAgg = useMemo(() => {
    const map = new Map<string, { tickets: number; revenue: number; outstanding: number; invoices: number; campaigns: number; drawReady: number }>()
    for (const s of data?.stores || [])
      map.set(s.id, { tickets: 0, revenue: 0, outstanding: 0, invoices: 0, campaigns: 0, drawReady: 0 })
    for (const c of data?.campaigns || []) {
      const row = map.get(c.storeId)
      if (!row) continue
      row.tickets += c.currentEntries
      row.campaigns += 1
      if (c.status === "DRAW_READY") row.drawReady += 1
    }
    for (const inv of data?.invoices || []) {
      const row = map.get(inv.storeId)
      if (!row) continue
      row.invoices += 1
      if (inv.status === "PAID") row.revenue += inv.amountDue
      else row.outstanding += inv.amountDue
    }
    return map
  }, [data])

  const normalize = (value: string) => value.toLowerCase().trim()

  const filteredSettlements = useMemo(() => {
    const list = [...(data?.invoices || [])]
    const q = normalize(query)
    const rows = list.filter((inv) => {
      if (status !== "ALL" && inv.status !== status) return false
      if (!q) return true
      return [inv.invoiceNumber, inv.storeName, inv.campaignTitle, inv.transactionRef, inv.gatewayRef, inv.paymentMethod]
        .filter(Boolean)
        .some((field) => normalize(String(field)).includes(q))
    })
    return rows.sort((a, b) => (SETTLEMENT_RANK[a.status] ?? 3) - (SETTLEMENT_RANK[b.status] ?? 3))
  }, [data, query, status])

  const filteredCampaigns = useMemo(() => {
    const q = normalize(query)
    return (data?.campaigns || []).filter((c) => {
      if (status !== "ALL" && c.status !== status) return false
      if (!q) return true
      return [c.title, c.storeName, c.ruleSummary, c.prize?.title]
        .filter(Boolean)
        .some((field) => normalize(String(field)).includes(q))
    })
  }, [data, query, status])

  const filteredStores = useMemo(() => {
    const q = normalize(query)
    return (data?.stores || []).filter((s) => {
      if (status !== "ALL" && s.status !== status) return false
      if (!q) return true
      return [s.name, s.storeUrl, s.contactEmail, s.contactPhone, s.apiKeyPrefix, s.owner?.email, s.owner?.name]
        .filter(Boolean)
        .some((field) => normalize(String(field)).includes(q))
    })
  }, [data, query, status])

  const counts = useMemo(() => {
    const byStatus = (rows: Array<{ status: string }>) =>
      rows.reduce<Record<string, number>>((acc, row) => {
        acc[row.status] = (acc[row.status] || 0) + 1
        return acc
      }, {})
    return {
      settlements: byStatus(data?.invoices || []),
      campaigns: byStatus(data?.campaigns || []),
      stores: byStatus(data?.stores || []),
    }
  }, [data])

  const tabCount = (key: TabKey) =>
    key === "settlements" ? (data?.invoices || []).length : key === "campaigns" ? (data?.campaigns || []).length : (data?.stores || []).length

  const actionableSettlements = (data?.stats.awaitingReview || 0) + (data?.invoices || []).filter((i) => i.status === "PENDING").length
  const drawReadyCount = data?.stats.drawReady || 0

  // ---- store settings -------------------------------------------------------

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

  // ---- draw -----------------------------------------------------------------

  const openDrawDialog = async (c: CampaignRow) => {
    setDrawTarget(c)
    setDrawPreview(null)
    setError(null)
    setDrawLoading(true)
    try {
      const detail = await request<DrawPreview & { success: boolean }>(`/api/admin/merchants/campaigns/${c.id}`)
      setDrawPreview({ campaign: detail.campaign, ledger: detail.ledger, entries: detail.entries, winner: detail.winner })
    } catch (err: any) {
      setError(err.message)
      setDrawTarget(null)
    } finally {
      setDrawLoading(false)
    }
  }

  const confirmDraw = async () => {
    if (!drawTarget) return
    setDrawing(true)
    setError(null)
    try {
      const res = await request<{ winner: EntryDTO; success: boolean }>(`/api/admin/merchants/campaigns/${drawTarget.id}/draw`, {
        method: "POST",
      })
      const winner = res.winner
      setNotice(
        `Draw executed for “${drawTarget.title}” — winner ${winner?.ticketNumber ?? "recorded"}${winner?.customerName ? ` (${winner.customerName})` : ""}.`,
      )
      setDrawTarget(null)
      setDrawPreview(null)
      await load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDrawing(false)
    }
  }

  // ---- render ---------------------------------------------------------------

  if (loading && !data) return <PageBlock label="Loading merchant records…" />

  const stats = data?.stats
  const invoiceTotal = (data?.invoices || []).reduce((acc, i) => acc + i.amountDue, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <ShoppingBag className="h-3.5 w-3.5" /> Merchant Connect
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Partner operations</h1>
          <p className="mt-1 text-sm text-slate-500">
            Shopify lucky-draw partners — stores, campaigns and settlements. Money is confirmed in{" "}
            <Link href="/admin/payments" className="font-semibold text-red-700 hover:underline">
              Payments
            </Link>
            ; draws and governance run here.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-slate-400 sm:inline">updated {formatAgo(new Date())}</span>
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="rounded-xl gap-1.5">
            <Loader2 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {tokenRequired && <TokenGate onProvide={provideToken} />}
      {error && <Notice kind="error" onDismiss={() => setError(null)}>{error}</Notice>}
      {notice && <Notice kind="success" onDismiss={() => setNotice(null)}>{notice}</Notice>}

      {/* KPI band */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <KpiTile label="Stores" value={formatNumber(stats.stores)} hint={`${formatNumber(stats.activeStores)} active · ${(data?.stores || []).filter((s) => s.status === "PAUSED").length} paused`} icon={StoreIcon} tone="slate" onClick={() => changeTab("stores")} />
          <KpiTile label="Campaigns" value={formatNumber((data?.campaigns || []).length)} hint={`${formatNumber(stats.activeCampaigns)} minting · ${(data?.campaigns || []).filter((c) => c.status === "PAUSED").length} paused`} icon={Layers} tone="sky" onClick={() => changeTab("campaigns")} />
          <KpiTile label="Draw ready" value={formatNumber(drawReadyCount)} hint={drawReadyCount ? "Settled and waiting to be drawn" : "Nothing to draw right now"} icon={Trophy} tone="violet" onClick={() => { changeTab("campaigns"); setStatus("DRAW_READY") }} />
          <KpiTile label="Tickets minted" value={formatNumber(stats.issuedEntries)} hint={`Rs ${formatNumber(invoiceTotal)} invoiced lifetime`} icon={Ticket} tone="slate" />
          <KpiTile label="Awaiting review" value={formatNumber(stats.awaitingReview)} hint={formatPKR(stats.awaitingReviewAmount)} icon={ClipboardList} tone={stats.awaitingReview ? "amber" : "slate"} onClick={() => { changeTab("settlements"); setStatus("UNDER_REVIEW") }} />
          <KpiTile label="Collected" value={formatPKR(stats.revenueCollected)} hint={`${formatPKR(stats.outstandingAmount)} outstanding`} icon={Wallet} tone="emerald" onClick={() => changeTab("settlements")} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 pb-px">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => changeTab(item.key)}
            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition ${
              tab === item.key ? "border-red-600 text-red-700" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] tabular-nums text-slate-600">
              {formatNumber(tabCount(item.key))}
            </span>
            {item.key === "settlements" && actionableSettlements > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">{actionableSettlements} to work</span>
            )}
            {item.key === "campaigns" && drawReadyCount > 0 && (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">{drawReadyCount} ready</span>
            )}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs sm:p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              tab === "settlements" ? "Invoice no, store, campaign, reference…" : tab === "campaigns" ? "Campaign, store, prize, rule…" : "Store, domain, email, phone, key…"
            }
            className="rounded-xl pl-9 pr-9"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Clear search">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Status
          </span>
          {STATUS_FILTERS[tab].map((option) => {
            const source = tab === "settlements" ? counts.settlements : tab === "campaigns" ? counts.campaigns : counts.stores
            const count = option.value === "ALL" ? tabCount(tab) : source[option.value] || 0
            const active = status === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  active ? "border-red-300 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {option.label}
                <span className={`font-mono text-[10px] tabular-nums ${active ? "text-red-500" : "text-slate-400"}`}>{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {tab === "settlements" && <SettlementsTab rows={filteredSettlements} busy={busy} load={load} setError={setError} setNotice={setNotice} />}
      {tab === "campaigns" && (
        <CampaignsTab
          rows={filteredCampaigns}
          busy={busy}
          onDraw={openDrawDialog}
          onToggle={(c) =>
            runAction(
              `camp-${c.id}`,
              () =>
                request(`/api/admin/merchants/campaigns/${c.id}`, {
                  method: "PATCH",
                  body: JSON.stringify({ status: c.status === "ACTIVE" ? "PAUSED" : "ACTIVE" }),
                }).then(() => undefined),
              `${c.title} ${c.status === "ACTIVE" ? "paused — no new tickets" : "resumed"}`,
            )
          }
        />
      )}
      {tab === "stores" && (
        <StoresTab
          rows={filteredStores}
          agg={storeAgg}
          busy={busy}
          onEdit={openEditor}
          onToggle={(s) =>
            runAction(
              s.id,
              () =>
                request(`/api/admin/merchants/stores/${s.id}`, {
                  method: "PATCH",
                  body: JSON.stringify({ status: s.status === "ACTIVE" ? "PAUSED" : "ACTIVE" }),
                }).then(() => undefined),
              `${s.name} ${s.status === "ACTIVE" ? "paused — webhooks will not mint" : "reactivated"}`,
            )
          }
          onAccount={(s) =>
            runAction(
              `acct-${s.owner!.id}`,
              () =>
                request(`/api/admin/users/${s.owner!.id}`, {
                  method: "PATCH",
                  body: JSON.stringify({ isActive: !s.owner!.isActive }),
                }).then(() => undefined),
              `Account ${s.owner!.email} ${s.owner!.isActive ? "suspended" : "reactivated"}`,
            )
          }
        />
      )}

      {/* Store settings dialog */}
      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit store details</DialogTitle>
            <DialogDescription>{editing?.storeUrl} · credentials and status are managed from the store row.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="store-name">Store name</Label>
              <Input id="store-name" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} maxLength={80} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="store-email">Contact email</Label>
              <Input id="store-email" type="email" value={editForm.contactEmail} onChange={(e) => setEditForm((f) => ({ ...f, contactEmail: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="store-phone">Contact phone</Label>
              <Input id="store-phone" value={editForm.contactPhone} onChange={(e) => setEditForm((f) => ({ ...f, contactPhone: e.target.value }))} placeholder="+92 300 1234567" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="store-payout">Payout details</Label>
              <Textarea id="store-payout" rows={3} value={editForm.payoutDetails} onChange={(e) => setEditForm((f) => ({ ...f, payoutDetails: e.target.value }))} placeholder="Bank / wallet details used for settlements" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={editSaving}>
              Cancel
            </Button>
            <Button onClick={saveEditor} disabled={editSaving || !editForm.name.trim()} className="bg-red-600 text-white hover:bg-red-700 gap-1.5">
              {editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Draw confirmation */}
      <Dialog open={Boolean(drawTarget)} onOpenChange={(open) => !open && !drawing && (setDrawTarget(null), setDrawPreview(null))}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-violet-600" /> Execute the draw
            </DialogTitle>
            <DialogDescription>
              One winner is picked uniformly at random from the paid, verified tickets. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {drawLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" /> Reading the ticket pool…
            </div>
          ) : drawPreview ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-sm font-semibold text-slate-900">{drawPreview.campaign.title}</p>
                <p className="mt-0.5 text-xs text-slate-600">
                  {drawPreview.campaign.storeName} · {drawPreview.campaign.ruleSummary} · draw {formatDate(drawPreview.campaign.endDate)}
                </p>
                {drawPreview.campaign.prize && (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                    <Gift className="h-3.5 w-3.5 text-slate-400" /> {drawPreview.campaign.prize.title} · {formatPKR(drawPreview.campaign.prize.prizeValuePkr)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MiniStat label="Draw pool" value={formatNumber(drawPreview.ledger.drawPool)} note="paid, non-test" strong />
                <MiniStat label="Invoiced" value={formatNumber(drawPreview.ledger.invoiced)} note="awaiting money" />
                <MiniStat label="Unbilled" value={formatNumber(drawPreview.ledger.issued)} note="not in the pool" />
                <MiniStat label="Voided" value={formatNumber(drawPreview.ledger.cancelled)} note="excluded" />
              </div>

              {drawPreview.ledger.drawPool === 0 ? (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  No paid ticket is eligible. Settle the invoice first — the draw will refuse an empty pool.
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  The winner is written to the campaign record and published on the public winners page.
                </p>
              )}
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setDrawTarget(null)} disabled={drawing}>
              Cancel
            </Button>
            <Button
              onClick={confirmDraw}
              disabled={drawing || drawLoading || !drawPreview || drawPreview.ledger.drawPool === 0}
              className="gap-1.5 bg-violet-600 text-white hover:bg-violet-700"
            >
              {drawing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
              Run draw now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="inline-flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
        <Lock className="h-3.5 w-3.5" />
        Merchant Connect <Link href="/merchants" className="hover:text-slate-600">landing</Link>
        <span>·</span>
        <Link href="/lookup/store-ticket" className="hover:text-slate-600">ticket lookup</Link>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          <ShoppingBag className="h-3.5 w-3.5" /> data served from the merchant store
        </span>
      </p>
    </div>
  )
}

// ---- tab renderers ----------------------------------------------------------

function PageBlock({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <Loader2 className="h-6 w-6 animate-spin text-red-600" />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  )
}

function MiniStat({ label, value, note, strong }: { label: string; value: string; note?: string; strong?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-1 font-mono text-lg tabular-nums ${strong ? "font-bold text-violet-700" : "text-slate-900"}`}>{value}</p>
      {note && <p className="text-[11px] text-slate-500">{note}</p>}
    </div>
  )
}

function EmptyBlock({ text, hint }: { text: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center">
      <p className="text-sm font-semibold text-slate-700">{text}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

function OpenLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
    >
      {label} <ChevronRight className="h-3.5 w-3.5" />
    </Link>
  )
}

function SettlementsTab({
  rows,
  busy,
  load,
  setError,
  setNotice,
}: {
  rows: InvoiceDTO[]
  busy: string | null
  load: () => Promise<void>
  setError: (v: string | null) => void
  setNotice: (v: string | null) => void
}) {
  const [open, setOpen] = useState<string | null>(null)

  if (rows.length === 0)
    return <EmptyBlock text="No invoices match this view." hint="Invoices are raised by the merchant from their dashboard once tickets have accumulated." />

  return (
    <div className="space-y-2.5">
      {rows.map((inv) => {
        const actionable = inv.status === "UNDER_REVIEW" || inv.paymentFailed
        return (
          <Card key={inv.id} className={`overflow-hidden border shadow-2xs ${actionable ? "border-amber-200" : "border-slate-200"}`}>
            <CardContent className="p-0">
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <span className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:flex ${inv.status === "PAID" ? "bg-emerald-50 text-emerald-600" : inv.status === "UNDER_REVIEW" ? "bg-sky-50 text-sky-600" : "bg-amber-50 text-amber-600"}`}>
                    <Receipt className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/merchants/invoices/${inv.id}`} className="font-mono text-sm font-bold text-slate-900 hover:text-red-700 hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                      <StatusBadge status={inv.status} />
                      {inv.paymentFailed && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800">
                          <AlertTriangle className="h-3 w-3" /> transfer rejected
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-600">
                      <Link href={`/admin/merchants/${inv.storeId}`} className="font-semibold text-slate-700 hover:text-red-700 hover:underline">
                        {inv.storeName}
                      </Link>
                      <span className="text-slate-300"> · </span>
                      <Link href={`/admin/merchants/campaigns/${inv.campaignId}`} className="hover:text-red-700 hover:underline">
                        {inv.campaignTitle}
                      </Link>
                    </p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Ticket className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-mono tabular-nums">{formatNumber(inv.totalEntries)}</span> ×{" "}
                        <span className="font-mono tabular-nums">{formatPKR(inv.unitPrice)}</span>
                      </span>
                      {inv.paymentMethod && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="font-semibold text-slate-600">{inv.paymentMethod}</span>
                        </>
                      )}
                      {inv.transactionRef && (
                        <>
                          <span className="text-slate-300">·</span> ref <span className="font-mono">{inv.transactionRef}</span>
                        </>
                      )}
                      <span className="text-slate-300">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {inv.paidAt ? `paid ${formatDate(inv.paidAt)}` : inv.submittedAt ? `submitted ${formatDate(inv.submittedAt)}` : `raised ${formatDate(inv.createdAt)}`}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                  <span className="font-mono text-lg font-bold tabular-nums text-slate-900">{formatPKR(inv.amountDue)}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {inv.status === "UNDER_REVIEW" && (
                      <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-lg border-red-200 text-red-700 hover:bg-red-50" asChild>
                        <Link href="/admin/payments">
                          {busy === inv.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wallet className="h-3.5 w-3.5" />} Confirm payments
                        </Link>
                      </Button>
                    )}
                    {inv.paymentProof && (
                      <a href={inv.paymentProof} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
                        <ExternalLink className="h-3.5 w-3.5" /> receipt
                      </a>
                    )}
                    <button type="button" onClick={() => setOpen(open === inv.id ? null : inv.id)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                      {open === inv.id ? "Hide" : "Preview"}
                    </button>
                    <OpenLink href={`/admin/merchants/invoices/${inv.id}`} label="Open" />
                  </div>
                </div>
              </div>

              {open === inv.id && (
                <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Attached to this batch</p>
                  <dl className="grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2 lg:grid-cols-3">
                    {inv.gatewayRef && (
                      <div className="flex justify-between gap-2"><dt className="text-slate-500">Safepay tracker</dt><dd className="font-mono text-slate-800">{inv.gatewayRef}</dd></div>
                    )}
                    {inv.gatewayAmount ? (
                      <div className="flex justify-between gap-2"><dt className="text-slate-500">Requested</dt><dd className="font-mono text-slate-800">{formatPKR(inv.gatewayAmount / 100)}</dd></div>
                    ) : null}
                    <div className="flex justify-between gap-2"><dt className="text-slate-500">Checkout</dt><dd className="font-mono text-slate-800">{inv.checkoutOpen ? "open" : "closed"}</dd></div>
                    {inv.adminNotes && (
                      <div className="flex justify-between gap-2"><dt className="text-slate-500">Admin note</dt><dd className="max-w-[14rem] truncate text-slate-800">{inv.adminNotes}</dd></div>
                    )}
                  </dl>
                  <p className="mt-2 text-[11px] text-slate-500">
                    Open the settlement page for the full ledger of {plural(inv.totalEntries, "ticket")} and the pay-in accounts.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function CampaignsTab({
  rows,
  busy,
  onDraw,
  onToggle,
}: {
  rows: CampaignRow[]
  busy: string | null
  onDraw: (c: CampaignRow) => void
  onToggle: (c: CampaignRow) => void
}) {
  if (rows.length === 0) return <EmptyBlock text="No campaigns match this view." hint="Merchants create campaigns from their dashboard once the store is connected." />

  return (
    <div className="space-y-2.5">
      {rows.map((c) => {
        const mintable = c.status === "ACTIVE" || c.status === "PAUSED"
        const progress = c.maxEntries ? Math.min(100, Math.round((c.currentEntries / c.maxEntries) * 100)) : null
        return (
          <Card key={c.id} className="overflow-hidden border border-slate-200 shadow-2xs">
            <CardContent className="p-0">
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <span className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:flex ${c.status === "DRAW_READY" ? "bg-violet-50 text-violet-600" : c.status === "COMPLETED" ? "bg-slate-100 text-slate-500" : c.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                    {c.status === "COMPLETED" || c.status === "DRAW_READY" ? <Trophy className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/merchants/campaigns/${c.id}`} className="max-w-full truncate text-sm font-bold text-slate-900 hover:text-red-700 hover:underline">
                        {c.title}
                      </Link>
                      <StatusBadge status={c.status} />
                      {c.status === "ACTIVE" && !c.isAcceptingEntries && (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800">{c.capReached ? "cap reached" : c.ended ? "window closed" : "not minting"}</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      <Link href={`/admin/merchants/${c.storeId}`} className="font-semibold text-slate-700 hover:text-red-700 hover:underline">
                        {c.storeName}
                      </Link>
                      <span className="text-slate-300"> · </span>
                      <span className="inline-flex items-center gap-1">
                        <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" /> {c.ruleSummary}
                      </span>
                      <span className="text-slate-300"> · </span>
                      <span className="font-mono tabular-nums">{formatPKR(c.ticketPrice)}</span>/ticket
                    </p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Ticket className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-mono tabular-nums text-slate-700">{formatNumber(c.currentEntries)}</span>
                        {c.maxEntries ? <span className="font-mono text-slate-400">/ {formatNumber(c.maxEntries)}</span> : <span className="text-slate-400">continuous</span>}
                      </span>
                      {c.billableEntries > 0 && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="font-semibold text-amber-700">{formatNumber(c.billableEntries)} not billed · {formatPKR(c.billableAmount)}</span>
                        </>
                      )}
                      {c.testEntries > 0 && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-400">{formatNumber(c.testEntries)} test</span>
                        </>
                      )}
                      <span className="text-slate-300">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" /> draw {formatDate(c.endDate)}
                      </span>
                      {c.prize && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="inline-flex items-center gap-1 truncate">
                            <Gift className="h-3.5 w-3.5 text-slate-400" /> {c.prize.title}
                          </span>
                        </>
                      )}
                    </p>
                    <p className="mt-1 text-[11px] italic text-slate-400">{CAMPAIGN_HINT[c.status]}</p>

                    {progress !== null && (
                      <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${progress >= 100 ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                  {c.winner ? (
                    <div className="text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Winner</p>
                      <p className="font-mono text-xs font-bold tabular-nums text-violet-700">{c.winner.ticketNumber}</p>
                      <p className="text-xs text-slate-600">{c.winner.customerName}</p>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold tabular-nums text-slate-900">
                        {formatPKR(c.billableEntries ? c.billableAmount : c.currentEntries * c.ticketPrice)}
                      </span>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">
                        {c.billableEntries ? "awaiting invoice" : "ticket value billed"}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    {c.status === "DRAW_READY" && (
                      <Button size="sm" onClick={() => onDraw(c)} disabled={busy === `camp-${c.id}`} className="h-8 gap-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700">
                        <Trophy className="h-3.5 w-3.5" /> Run draw
                      </Button>
                    )}
                    {mintable && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy === `camp-${c.id}`}
                        onClick={() => onToggle(c)}
                        className={`h-8 gap-1.5 rounded-lg ${c.status === "ACTIVE" ? "border-amber-200 text-amber-800 hover:bg-amber-50" : "border-emerald-200 text-emerald-800 hover:bg-emerald-50"}`}
                      >
                        {busy === `camp-${c.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : c.status === "ACTIVE" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        {c.status === "ACTIVE" ? "Pause" : "Resume"}
                      </Button>
                    )}
                    <OpenLink href={`/admin/merchants/campaigns/${c.id}`} label="Details" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function StoresTab({
  rows,
  agg,
  busy,
  onEdit,
  onToggle,
  onAccount,
}: {
  rows: StoreRow[]
  agg: Map<string, { tickets: number; revenue: number; outstanding: number; invoices: number; campaigns: number; drawReady: number }>
  busy: string | null
  onEdit: (s: StoreRow) => void
  onToggle: (s: StoreRow) => void
  onAccount: (s: StoreRow) => void
}) {
  if (rows.length === 0) return <EmptyBlock text="No stores match this view." hint="Share the Merchant Connect landing page to bring partners in." />

  return (
    <div className="space-y-2.5">
      {rows.map((s) => {
        const roll = agg.get(s.id) || { tickets: 0, revenue: 0, outstanding: 0, invoices: 0, campaigns: 0, drawReady: 0 }
        return (
          <Card key={s.id} className={`overflow-hidden border shadow-2xs ${s.status === "PAUSED" ? "border-amber-200" : "border-slate-200"}`}>
            <CardContent className="p-0">
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <span className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:flex ${s.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                    <StoreIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/merchants/${s.id}`} className="text-sm font-bold text-slate-900 hover:text-red-700 hover:underline">
                        {s.name}
                      </Link>
                      <StatusBadge status={s.status} />
                      {!s.shopifyConnected && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">setup incomplete</span>
                      )}
                      {s.shopifyWebhooksReady && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">webhooks live</span>
                      )}
                    </div>
                    <p className="mt-1 inline-flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      <a href={`https://${s.storeUrl}`} target="_blank" rel="noopener noreferrer" className="font-mono hover:text-red-700 hover:underline">
                        {s.storeUrl}
                      </a>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono">{s.apiKeyPrefix}</span>
                      <span className="text-slate-300">·</span>
                      <span>{s.contactEmail}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono">{s.contactPhone}</span>
                    </p>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <Layers className="h-3.5 w-3.5 text-slate-400" /> <b className="font-mono tabular-nums">{roll.campaigns}</b> {roll.campaigns === 1 ? "campaign" : "campaigns"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <Ticket className="h-3.5 w-3.5 text-slate-400" /> <b className="font-mono tabular-nums">{formatNumber(roll.tickets)}</b> {roll.tickets === 1 ? "ticket" : "tickets"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <Wallet className="h-3.5 w-3.5" /> <b className="font-mono tabular-nums">{formatPKR(roll.revenue)}</b> paid
                      </span>
                      {roll.outstanding > 0 && (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                          <Receipt className="h-3.5 w-3.5" /> {formatPKR(roll.outstanding)} outstanding
                        </span>
                      )}
                      {roll.drawReady > 0 && (
                        <span className="inline-flex items-center gap-1 font-semibold text-violet-700">
                          <Trophy className="h-3.5 w-3.5" /> {roll.drawReady} to draw
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      {s.owner ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-1">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-medium text-slate-700">{s.owner.name || s.owner.email}</span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${s.owner.isActive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                            {s.owner.isActive ? <UserCheck className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
                            {s.owner.isActive ? "active" : "suspended"}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">No linked account</span>
                      )}
                      {s.payoutDetails && <span className="max-w-[16rem] truncate text-slate-400" title={s.payoutDetails}>payout: {s.payoutDetails}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                  <span className="text-[11px] text-slate-400">joined {formatDate(s.createdAt)}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(s)} className="h-8 gap-1.5 rounded-lg">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    {s.owner && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy === `acct-${s.owner.id}`}
                        onClick={() => onAccount(s)}
                        className={`h-8 gap-1.5 rounded-lg ${s.owner.isActive ? "border-rose-200 text-rose-700 hover:bg-rose-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}
                      >
                        {busy === `acct-${s.owner.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : s.owner.isActive ? <ShieldOff className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        {s.owner.isActive ? "Suspend" : "Reactivate"}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={s.status === "ACTIVE" ? "outline" : "default"}
                      disabled={busy === s.id}
                      onClick={() => onToggle(s)}
                      className={`h-8 gap-1.5 rounded-lg ${s.status === "ACTIVE" ? "border-amber-200 text-amber-800 hover:bg-amber-50" : "bg-red-600 text-white hover:bg-red-700"}`}
                    >
                      {busy === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : s.status === "ACTIVE" ? <Ban className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      {s.status === "ACTIVE" ? "Pause store" : "Activate"}
                    </Button>
                    <OpenLink href={`/admin/merchants/${s.id}`} label="Open" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
