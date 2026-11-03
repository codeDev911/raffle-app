"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  ExternalLink,
  Gift,
  Inbox,
  Layers,
  Loader2,
  Pause,
  Play,
  Receipt,
  Search,
  SlidersHorizontal,
  Store as StoreIcon,
  Ticket,
  Trophy,
  Users,
  Wallet,
} from "lucide-react"
import type { CampaignDTO, EntryDTO, InvoiceDTO, StoreDTO } from "@/components/merchants/dashboard/types"
import {
  CAMPAIGN_HINT,
  DetailHeader,
  ENTRY_HINT,
  Field,
  KpiTile,
  Notice,
  Panel,
  PaymentChip,
  StatusBadge,
  TokenGate,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPKR,
  plural,
  useAdminApi,
} from "../../_shared"

interface Detail {
  campaign: CampaignDTO & { storeName: string }
  store: StoreDTO | null
  winner: EntryDTO | null
  entries: EntryDTO[]
  invoices: InvoiceDTO[]
  ledger: {
    total: number
    paid: number
    invoiced: number
    issued: number
    cancelled: number
    test: number
    live: number
    liveAmount: number
    paymentRejected: number
    drawPool: number
  }
}

const PAGE_SIZE = 60

const ENTRY_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "PAID", label: "Paid" },
  { value: "INVOICED", label: "Invoiced" },
  { value: "ISSUED", label: "Issued" },
  { value: "CANCELLED", label: "Voided" },
] as const

function daysLeft(end: string | Date) {
  const diff = new Date(end).getTime() - Date.now()
  return Math.ceil(diff / 86_400_000)
}

export default function CampaignDetailClient({ params }: { params: { id: string } }) {
  const campaignId = params.id

  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [entryStatus, setEntryStatus] = useState<string>("ALL")
  const [showTest, setShowTest] = useState(false)
  const [visible, setVisible] = useState(PAGE_SIZE)

  const [drawOpen, setDrawOpen] = useState(false)
  const [drawing, setDrawing] = useState(false)

  const { request, tokenRequired, askForToken } = useAdminApi()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setDetail(await request<Detail & { success: boolean }>(`/api/admin/merchants/campaigns/${campaignId}`))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [request, campaignId])

  useEffect(() => {
    load()
  }, [load])

  const act = async (key: string, action: () => Promise<void>, success: string) => {
    setBusy(key)
    setError(null)
    setNotice(null)
    try {
      await action()
      setNotice(success)
      await load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusy(null)
    }
  }

  const toggleStatus = () => {
    if (!detail) return
    const c = detail.campaign
    const next = c.status === "ACTIVE" ? "PAUSED" : "ACTIVE"
    act(
      "status",
      () =>
        request(`/api/admin/merchants/campaigns/${campaignId}`, {
          method: "PATCH",
          body: JSON.stringify({ status: next }),
        }).then(() => undefined),
      next === "PAUSED" ? "Campaign paused — qualifying orders will no longer mint tickets." : "Campaign resumed — minting is live again.",
    )
  }

  const runDraw = async () => {
    setDrawing(true)
    setError(null)
    try {
      const res = await request<{ winner: EntryDTO; success: boolean }>(`/api/admin/merchants/campaigns/${campaignId}/draw`, {
        method: "POST",
      })
      setDrawOpen(false)
      setNotice(`Winner drawn: ${res.winner?.ticketNumber ?? "recorded"}${res.winner?.customerName ? ` — ${res.winner.customerName}` : ""}.`)
      await load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDrawing(false)
    }
  }

  const filteredEntries = useMemo(() => {
    if (!detail) return []
    const q = query.toLowerCase().trim()
    return detail.entries.filter((e) => {
      if (!showTest && e.isTest && entryStatus !== "TEST") return false
      if (entryStatus === "TEST") {
        if (!e.isTest) return false
      } else if (entryStatus !== "ALL" && e.status !== entryStatus) return false
      if (!q) return true
      return [e.ticketNumber, e.orderName, e.customerName, e.customerEmail, e.customerPhone, e.customerCity, e.shopifyOrderId]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    })
  }, [detail, query, entryStatus, showTest])

  useEffect(() => {
    setVisible(PAGE_SIZE)
  }, [query, entryStatus, showTest])

  if (loading && !detail)
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-red-600" />
        <p className="text-sm font-medium text-slate-500">Loading campaign record…</p>
      </div>
    )

  if (!detail)
    return (
      <div className="space-y-4">
        {tokenRequired && <TokenGate onProvide={() => askForToken() && load()} />}
        <Notice kind="error">{error || "This campaign could not be loaded."}</Notice>
        <Button variant="outline" onClick={load} className="rounded-xl gap-1.5">
          <Loader2 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Try again
        </Button>
      </div>
    )

  const { campaign, store, ledger, winner } = detail
  const mintable = campaign.status === "ACTIVE" || campaign.status === "PAUSED"
  const remaining = daysLeft(campaign.endDate)
  const progress = campaign.maxEntries ? Math.min(100, Math.round((campaign.currentEntries / campaign.maxEntries) * 100)) : null
  const invoicedTotal = detail.invoices.reduce((acc, i) => acc + i.amountDue, 0)
  const entryCountByStatus = (value: string) => detail.entries.filter((e) => e.status === value && (showTest || !e.isTest)).length
  const testCount = detail.entries.filter((e) => e.isTest).length

  return (
    <div className="space-y-5">
      <DetailHeader
        backHref="/admin/merchants?tab=campaigns"
        backLabel="Merchant Connect"
        crumbs={`${store?.name ?? "Store"} / Campaign`}
        title={campaign.title}
        badge={<StatusBadge status={campaign.status} />}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <StoreIcon className="h-4 w-4 text-slate-400" />
              <Link href={`/admin/merchants/${campaign.storeId}`} className="font-semibold text-slate-700 hover:text-red-700 hover:underline">
                {store?.name ?? "Unknown store"}
              </Link>
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" /> {campaign.ruleSummary}
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-mono tabular-nums">{formatPKR(campaign.ticketPrice)}</span> per ticket
            <span className="text-slate-300">·</span>
            <span className="font-mono text-xs text-slate-400">{campaign.id}</span>
          </span>
        }
        actions={
          <>
            {campaign.status === "DRAW_READY" && (
              <Button size="sm" onClick={() => setDrawOpen(true)} className="h-9 gap-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700">
                <Trophy className="h-4 w-4" /> Run draw
              </Button>
            )}
            {mintable && (
              <Button size="sm" variant="outline" disabled={busy === "status"} onClick={toggleStatus} className={`h-9 gap-1.5 rounded-lg ${campaign.status === "ACTIVE" ? "border-amber-200 text-amber-800 hover:bg-amber-50" : "border-emerald-200 text-emerald-800 hover:bg-emerald-50"}`}>
                {busy === "status" ? <Loader2 className="h-4 w-4 animate-spin" /> : campaign.status === "ACTIVE" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {campaign.status === "ACTIVE" ? "Pause minting" : "Resume minting"}
              </Button>
            )}
            {store && (
              <Button size="sm" variant="outline" className="h-9 gap-1.5 rounded-lg" asChild>
                <a href={`https://${store.storeUrl}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" /> Storefront
                </a>
              </Button>
            )}
          </>
        }
      />

      {tokenRequired && <TokenGate onProvide={() => askForToken() && load()} />}
      {error && <Notice kind="error" onDismiss={() => setError(null)}>{error}</Notice>}
      {notice && <Notice kind="success" onDismiss={() => setNotice(null)}>{notice}</Notice>}

      {/* Stage explanation */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-2xs">
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${campaign.status === "COMPLETED" ? "bg-slate-100 text-slate-600" : campaign.status === "DRAW_READY" ? "bg-violet-50 text-violet-600" : campaign.status === "PENDING_INVOICE" ? "bg-amber-50 text-amber-600" : campaign.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
          {campaign.status === "COMPLETED" || campaign.status === "DRAW_READY" ? <Trophy className="h-4 w-4" /> : campaign.status === "PENDING_INVOICE" ? <Receipt className="h-4 w-4" /> : <Ticket className="h-4 w-4" />}
        </span>
        <p className="min-w-0 text-slate-600">
          <span className="font-semibold text-slate-900">{CAMPAIGN_HINT[campaign.status] || "Campaign"}</span>
          {campaign.status === "ACTIVE" && !campaign.isAcceptingEntries && (
            <span className="ml-1 text-rose-700">
              — but it is not minting right now ({campaign.capReached ? "ticket cap reached" : remaining <= 0 ? "end date passed" : "window closed"}).
            </span>
          )}
          {campaign.status === "PENDING_INVOICE" && (
            <span className="ml-1">— confirm the matching transfers in <Link href="/admin/payments" className="font-semibold text-red-700 hover:underline">Payments</Link> to arm the draw.</span>
          )}
          {campaign.status === "DRAW_READY" && (
            <span className="ml-1">— {formatNumber(ledger.drawPool)} paid ticket{ledger.drawPool === 1 ? "" : "s"} in the pool.</span>
          )}
        </p>
      </div>

      {/* KPI band */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiTile label="Live tickets" value={formatNumber(ledger.live)} hint={`${formatNumber(ledger.cancelled)} voided excluded`} icon={Ticket} tone="slate" />
        <KpiTile label="Draw pool" value={formatNumber(ledger.drawPool)} hint="paid, verified, non-test" icon={Trophy} tone="violet" />
        <KpiTile label="Not billed" value={formatNumber(ledger.issued)} hint={`${formatPKR(campaign.billableAmount)} at this price`} icon={Inbox} tone={ledger.issued ? "amber" : "slate"} />
        <KpiTile label="Awaiting money" value={formatNumber(ledger.invoiced)} hint={plural(detail.invoices.filter((i) => i.status !== "PAID").length, "open invoice")} icon={Receipt} tone={ledger.invoiced ? "rose" : "slate"} />
        <KpiTile label="Lifetime billable" value={formatPKR(ledger.liveAmount)} hint={`Rs ${formatNumber(campaign.ticketPrice)} × ${formatNumber(ledger.live)}`} icon={Wallet} tone="emerald" />
        <KpiTile label="Invoiced to date" value={formatPKR(invoicedTotal)} hint={plural(detail.invoices.length, "invoice")} icon={ClipboardList} tone="sky" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Rule */}
        <Panel title="Minting rule" subtitle="What a Shopify order must satisfy to earn a ticket" icon={SlidersHorizontal} className="lg:col-span-2">
          <dl className="grid gap-x-6 sm:grid-cols-2">
            <Field label="Rule type">
              <Badge variant="secondary" className="rounded-md bg-slate-100 font-mono text-[11px] text-slate-700">
                {campaign.ruleType.replace(/_/g, " ")}
              </Badge>
            </Field>
            <Field label="Human summary">{campaign.ruleSummary}</Field>
            <Field label="Minimum quantity">{campaign.minQuantity ? `${campaign.minQuantity} item(s)` : "—"}</Field>
            <Field label="Minimum amount">{campaign.minAmount ? formatPKR(campaign.minAmount) : "—"}</Field>
            <Field label="Ticket price">{formatPKR(campaign.ticketPrice)}</Field>
            <Field label="Ticket cap">
              {campaign.maxEntries ? (
                <span className="inline-flex items-center gap-2">
                  <span className="font-mono tabular-nums">{formatNumber(campaign.currentEntries)} / {formatNumber(campaign.maxEntries)}</span>
                  {progress !== null && (
                    <span className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                      <span className={`block h-full rounded-full ${progress >= 100 ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${progress}%` }} />
                    </span>
                  )}
                </span>
              ) : (
                "Continuous — no cap"
              )}
            </Field>
            <Field label="Window">
              <span className="inline-flex flex-wrap items-center gap-1.5">
                {formatDate(campaign.startDate)} <span className="text-slate-400">→</span> {formatDate(campaign.endDate)}
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${remaining <= 0 ? "bg-slate-100 text-slate-600" : remaining <= 3 ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-700"}`}>
                  {remaining <= 0 ? "window closed" : `${remaining} day${remaining === 1 ? "" : "s"} left`}
                </span>
              </span>
            </Field>
            <Field label="Minting status">
              <span className={`inline-flex items-center gap-1.5 font-semibold ${campaign.isAcceptingEntries ? "text-emerald-700" : "text-amber-700"}`}>
                {campaign.isAcceptingEntries ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                {campaign.isAcceptingEntries ? "Accepting qualifying orders" : "Not accepting new tickets"}
              </span>
            </Field>
          </dl>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Product filter</p>
            {campaign.productFilters.length === 0 ? (
              <p className="mt-1.5 text-sm text-slate-600">No restriction — every qualifying order in the store earns a ticket.</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {campaign.productFilters.map((filter) => (
                  <span key={filter} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-700">
                    {filter}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-2 text-[11px] text-slate-500">
              Matching is separator-insensitive and case-folded against SKU, product id and title, so “PS5 “ and “ps5 ” behave the same.
            </p>
          </div>
        </Panel>

        {/* Prize */}
        <Panel title="Prize" subtitle="The raffle this campaign feeds" icon={Gift}>
          {campaign.prize ? (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {campaign.prize.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={campaign.prize.image} alt={campaign.prize.title} className="h-36 w-full object-cover" />
                ) : (
                  <div className="flex h-36 items-center justify-center text-slate-300">
                    <Gift className="h-8 w-8" />
                  </div>
                )}
              </div>
              <p className="text-sm font-semibold leading-snug text-slate-900">{campaign.prize.title}</p>
              <dl className="divide-y divide-slate-100">
                <Field label="Prize value">{formatPKR(campaign.prize.prizeValuePkr)}</Field>
                <Field label="Category">{campaign.prize.category || "—"}</Field>
                <Field label="Retail ticket">{campaign.prize.ticketPricePkr ? formatPKR(campaign.prize.ticketPricePkr) : "not set"}</Field>
                <Field label="Raffle closes">{formatDate(campaign.prize.endDate)}</Field>
              </dl>
              {campaign.raffleId && (
                <Button size="sm" variant="outline" className="w-full rounded-xl gap-1.5" asChild>
                  <Link href={`/admin/raffles/${campaign.raffleId}`}>
                    <Layers className="h-4 w-4" /> Open the raffle record
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">No raffle is linked to this campaign.</p>
              <p className="text-[11px] text-slate-500">
                Merchant campaigns created before the prize picker existed keep <span className="font-mono">raffleId</span> null; tickets still mint and settle, but no prize image is shown here.
              </p>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Store */}
        <Panel title="Store" subtitle="The partner account that owns this campaign" icon={StoreIcon}>
          {store ? (
            <>
              <dl className="divide-y divide-slate-100">
                <Field label="Name">
                  <Link href={`/admin/merchants/${store.id}`} className="font-semibold text-slate-900 hover:text-red-700 hover:underline">
                    {store.name}
                  </Link>
                </Field>
                <Field label="Domain">
                  <a href={`https://${store.storeUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono text-xs text-slate-700 hover:text-red-700">
                    {store.storeUrl} <ExternalLink className="h-3 w-3" />
                  </a>
                </Field>
                <Field label="Store status">
                  <span className="inline-flex items-center gap-2">
                    <StatusBadge status={store.status} />
                    {store.status === "PAUSED" && <span className="text-[11px] text-amber-700">webhooks will not mint</span>}
                  </span>
                </Field>
                <Field label="Contact">
                  {store.contactEmail} <span className="text-slate-300">·</span> <span className="font-mono">{store.contactPhone}</span>
                </Field>
                <Field label="Integration">
                  <span className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className={`rounded-md px-2 py-0.5 text-[11px] ${store.shopifyConnected ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>
                      {store.shopifyConnected ? "Shopify connected" : "Shopify not connected"}
                    </Badge>
                    <Badge variant="secondary" className={`rounded-md px-2 py-0.5 text-[11px] ${store.shopifyWebhooksReady ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                      {store.shopifyWebhooksReady ? "webhooks" : "no webhooks"}
                    </Badge>
                    <Badge variant="secondary" className={`rounded-md px-2 py-0.5 text-[11px] ${store.shopifyScriptInstalled ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                      {store.shopifyScriptInstalled ? "widget" : "no widget"}
                    </Badge>
                  </span>
                </Field>
                <Field label="API key">{store.apiKeyPrefix}</Field>
              </dl>
              <Button size="sm" variant="outline" className="mt-3 w-full rounded-xl gap-1.5" asChild>
                <Link href={`/admin/merchants/${store.id}`}>
                  <Users className="h-4 w-4" /> Full partner record
                </Link>
              </Button>
            </>
          ) : (
            <p className="text-sm text-slate-500">The owning store record is no longer available.</p>
          )}
        </Panel>

        {/* Invoices */}
        <Panel title="Invoices" subtitle="Batches raised against this campaign" icon={Receipt} className="lg:col-span-2">
          {detail.invoices.length === 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">No invoice has been raised yet.</p>
              <p className="text-[11px] text-slate-500">
                {formatNumber(ledger.issued)} unbilled ticket{ledger.issued === 1 ? "" : "s"} worth {formatPKR(campaign.billableAmount)} will be billed when the merchant generates the batch from their dashboard.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {detail.invoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/admin/merchants/invoices/${inv.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:bg-slate-50/70"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-slate-900">{inv.invoiceNumber}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      <span className="font-mono tabular-nums">{formatNumber(inv.totalEntries)}</span> tickets ×{" "}
                      <span className="font-mono tabular-nums">{formatPKR(inv.unitPrice)}</span>
                      {inv.paymentMethod && <> <span className="text-slate-300">·</span> {inv.paymentMethod}</>}
                      {inv.paidAt ? <> <span className="text-slate-300">·</span> paid {formatDate(inv.paidAt)}</> : inv.submittedAt ? <> <span className="text-slate-300">·</span> submitted {formatDate(inv.submittedAt)}</> : null}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {inv.paymentFailed && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800">
                        <AlertTriangle className="h-3 w-3" /> rejected
                      </span>
                    )}
                    {inv.checkoutOpen && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-800">
                        <Clock className="h-3 w-3" /> checkout open
                      </span>
                    )}
                    <span className="font-mono text-sm font-bold tabular-nums text-slate-900">{formatPKR(inv.amountDue)}</span>
                    <StatusBadge status={inv.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* Winner */}
      {winner && (
        <Panel title="Winner" subtitle={`Drawn ${formatDateTime(campaign.drawnAt)}`} icon={Trophy}>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Ticket</p>
              <p className="font-mono text-lg font-bold tabular-nums text-violet-700">{winner.ticketNumber}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Customer</p>
              <p className="text-sm font-semibold text-slate-900">{winner.customerName}</p>
              <p className="text-xs text-slate-500">
                {winner.customerPhone || "no phone"} <span className="text-slate-300">·</span> {winner.customerCity || "no city"} <span className="text-slate-300">·</span> {winner.customerEmail || "no email"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Qualifying order</p>
              <p className="text-sm text-slate-900">
                {winner.orderName || winner.shopifyOrderId} <span className="text-slate-300">·</span> <span className="font-mono tabular-nums">{formatNumber(winner.itemCount)}</span> items <span className="text-slate-300">·</span>{" "}
                <span className="font-mono tabular-nums">{formatPKR(winner.orderAmount)}</span>
              </p>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" className="h-9 gap-1.5 rounded-lg" asChild>
                <Link href="/winners" target="_blank">
                  <ExternalLink className="h-4 w-4" /> Public winners page
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="h-9 gap-1.5 rounded-lg" asChild>
                <Link href="/admin/customers">
                  <Users className="h-4 w-4" /> Customer directory
                </Link>
              </Button>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            The pick is made with a CSPRNG over the paid, non-test pool and is final — the campaign is locked to COMPLETED once written.
          </p>
        </Panel>
      )}

      {/* Ledger */}
      <Panel
        title="Ticket ledger"
        subtitle={`${plural(filteredEntries.length, "ticket", "tickets")} of ${plural(detail.entries.length, "ticket", "tickets")}${testCount ? ` · ${formatNumber(testCount)} simulator tickets` : ""} · Issued means not yet billed`}
        icon={Ticket}
        bodyClassName="p-0 sm:p-0"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ticket, order, customer…" className="h-9 w-48 rounded-lg pl-8 text-xs" />
            </div>
            <button
              type="button"
              onClick={() => setShowTest((v) => !v)}
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition ${showTest ? "border-slate-300 bg-slate-100 text-slate-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
            >
              <Inbox className="h-3.5 w-3.5" /> {showTest ? "Showing simulator" : "Hide simulator"}
            </button>
          </div>
        }
      >
        <div className="flex flex-wrap gap-1.5 border-b border-slate-100 px-4 py-3">
          {ENTRY_FILTERS.map((f) => {
            const count = f.value === "ALL" ? detail.entries.length : entryCountByStatus(f.value)
            const active = entryStatus === f.value
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setEntryStatus(f.value)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${active ? "border-red-300 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                {f.label}
                <span className={`font-mono text-[10px] tabular-nums ${active ? "text-red-500" : "text-slate-400"}`}>{count}</span>
              </button>
            )
          })}
          {testCount > 0 && (
            <button
              type="button"
              onClick={() => setEntryStatus("TEST")}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${entryStatus === "TEST" ? "border-red-300 bg-red-50 text-red-700" : "border-dashed border-slate-300 bg-white text-slate-500 hover:bg-slate-50"}`}
            >
              Simulator
              <span className="font-mono text-[10px] tabular-nums text-slate-400">{testCount}</span>
            </button>
          )}
        </div>

        {filteredEntries.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">
            {detail.entries.length === 0 ? "No ticket has been minted on this campaign yet." : "No ticket matches this filter."}
          </p>
        ) : (
          <>
            {/* Desktop ledger */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Ticket</th>
                    <th className="px-4 py-2.5 font-semibold">Order</th>
                    <th className="px-4 py-2.5 font-semibold">Customer</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Items</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Order value</th>
                    <th className="px-4 py-2.5 font-semibold">Ticket</th>
                    <th className="px-4 py-2.5 font-semibold">Payment</th>
                    <th className="px-4 py-2.5 font-semibold">Invoice</th>
                    <th className="px-4 py-2.5 font-semibold">Issued</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEntries.slice(0, visible).map((e) => {
                    const isWinner = campaign.winnerEntryId === e.id
                    return (
                      <tr key={e.id} className={isWinner ? "bg-violet-50/60" : e.isTest ? "bg-slate-50/60" : "hover:bg-slate-50/70"}>
                        <td className="whitespace-nowrap px-4 py-2.5">
                          <span className="font-mono text-xs font-semibold tabular-nums text-slate-900">{e.ticketNumber}</span>
                          {isWinner && <Trophy className="ml-1.5 inline h-3.5 w-3.5 text-violet-600" />}
                          {e.isTest && <span className="ml-1.5 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">SIM</span>}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-xs text-slate-600">{e.orderName || e.shopifyOrderId}</td>
                        <td className="px-4 py-2.5">
                          <p className="text-xs font-semibold text-slate-800">{e.customerName}</p>
                          <p className="text-[11px] text-slate-500">
                            {e.customerPhone || "—"} {e.customerCity ? <span className="text-slate-300">·</span> : null} {e.customerCity}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono text-xs tabular-nums text-slate-700">{formatNumber(e.itemCount)}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono text-xs tabular-nums text-slate-700">{formatPKR(e.orderAmount)}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={e.status} /></td>
                        <td className="px-4 py-2.5"><PaymentChip status={e.paymentStatus} /></td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-xs">
                          {e.invoiceId ? (
                            <Link href={`/admin/merchants/invoices/${e.invoiceId}`} className="font-mono text-xs text-slate-700 hover:text-red-700 hover:underline">
                              {detail.invoices.find((i) => i.id === e.invoiceId)?.invoiceNumber ?? "invoice"}
                            </Link>
                          ) : (
                            <span className="text-slate-400" title="Not part of any batch invoice — this ticket was billed on its own">no batch</span>
                          )}
                          {e.checkoutOpen && <span className="ml-1.5 rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-800">checkout open</span>}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-[11px] text-slate-500">{formatDate(e.createdAt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile ledger */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredEntries.slice(0, visible).map((e) => {
                const isWinner = campaign.winnerEntryId === e.id
                return (
                  <div key={e.id} className={`p-4 ${isWinner ? "bg-violet-50/60" : e.isTest ? "bg-slate-50/60" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-bold tabular-nums text-slate-900">
                          {e.ticketNumber}
                          {e.isTest && <span className="ml-1.5 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">SIM</span>}
                        </p>
                        <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{e.customerName}</p>
                        <p className="text-[11px] text-slate-500">{e.orderName || e.shopifyOrderId} · {formatNumber(e.itemCount)} items · {formatPKR(e.orderAmount)}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">{e.customerPhone || "no phone"} {e.customerCity ? `· ${e.customerCity}` : ""}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <StatusBadge status={e.status} />
                        <PaymentChip status={e.paymentStatus} />
                        {isWinner && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">
                            <Trophy className="h-3 w-3" /> winner
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">
                      {e.status !== "PAID" ? `${ENTRY_HINT[e.status] || ""} ` : ""}
                      {e.cancelledReason ? `· ${e.cancelledReason} ` : ""}· issued {formatDate(e.createdAt)}
                    </p>
                  </div>
                )
              })}
            </div>

            {filteredEntries.length > visible && (
              <div className="border-t border-slate-100 p-4 text-center">
                <Button variant="outline" size="sm" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="rounded-xl">
                  Show {Math.min(PAGE_SIZE, filteredEntries.length - visible)} more of {formatNumber(filteredEntries.length - visible)} hidden
                </Button>
              </div>
            )}
          </>
        )}
      </Panel>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> campaign created {formatDateTime(campaign.createdAt)}</span>
        <span className="inline-flex items-center gap-1"><Ticket className="h-3.5 w-3.5" /> {formatNumber(ledger.total)} ledger lines in this response</span>
        {ledger.paymentRejected > 0 && (
          <span className="inline-flex items-center gap-1 text-rose-600"><AlertTriangle className="h-3.5 w-3.5" /> {formatNumber(ledger.paymentRejected)} ticket(s) had a rejected transfer</span>
        )}
      </div>

      {/* Draw confirmation */}
      <Dialog open={drawOpen} onOpenChange={(open) => !open && !drawing && setDrawOpen(false)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-violet-600" /> Execute the draw
            </DialogTitle>
            <DialogDescription>One winner is picked uniformly at random from the paid, verified tickets. This cannot be undone.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-sm font-semibold text-slate-900">{campaign.title}</p>
              <p className="mt-0.5 text-xs text-slate-600">
                {store?.name} · {campaign.ruleSummary} · draw {formatDate(campaign.endDate)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Draw pool", value: ledger.drawPool, note: "paid, non-test", strong: true },
                { label: "Awaiting money", value: ledger.invoiced, note: "excluded" },
                { label: "Unbilled", value: ledger.issued, note: "excluded" },
                { label: "Voided", value: ledger.cancelled, note: "excluded" },
              ].map((tile) => (
                <div key={tile.label} className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{tile.label}</p>
                  <p className={`mt-1 font-mono text-lg tabular-nums ${tile.strong ? "font-bold text-violet-700" : "text-slate-900"}`}>{formatNumber(tile.value)}</p>
                  <p className="text-[11px] text-slate-500">{tile.note}</p>
                </div>
              ))}
            </div>
            {ledger.drawPool === 0 ? (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> No paid ticket is eligible — settle the invoice first. The service refuses an empty pool.
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                The campaign moves to COMPLETED, the winner ticket is stamped on the record and the result is published to the public winners page.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDrawOpen(false)} disabled={drawing}>
              Cancel
            </Button>
            <Button onClick={runDraw} disabled={drawing || ledger.drawPool === 0} className="gap-1.5 bg-violet-600 text-white hover:bg-violet-700">
              {drawing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />} Run draw now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
