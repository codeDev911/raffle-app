"use client"

import { useCallback, useEffect, useState } from "react"
import { AlertCircle, ArrowRightLeft, CheckCircle2, RefreshCw, Undo2 } from "lucide-react"
import {
  Alert,
  ApiError,
  Btn,
  EmptyState,
  Metric,
  Panel,
  PanelHeader,
  formatDate,
  formatPKR,
  merchantApi,
  timeAgo,
} from "@/components/merchants/ui"
import type { RefundDTO, StoreDTO } from "./types"
import { GUIDES, GuideStrip } from "./guides"

/** Colours for the money trail, so a merchant can see at a glance whose step is next. */
const STATUS_TONE: Record<string, string> = {
  CREDITED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REQUESTED: "bg-amber-50 text-amber-700 ring-amber-200",
  APPROVED: "bg-sky-50 text-sky-700 ring-sky-200",
  PAID: "bg-slate-100 text-slate-700 ring-slate-300",
  REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
}

/** "4 Nov, 3:12 pm" plus the gap, which is the number that answers "was it instant?". */
function latency(from: string | number | null | undefined) {
  if (from === null || from === undefined) return null
  const ms = Number(from)
  if (ms < 1000) return "under a second"
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)} min`
  return `${Math.round(ms / 3_600_000)} h`
}

export function RefundsTab({ store }: { store: StoreDTO }) {
  const [requests, setRequests] = useState<RefundDTO[]>([])
  const [totals, setTotals] = useState({ creditsAvailable: 0, creditsApplied: 0, payoutWaiting: 0, paidOut: 0, countAwaitingStaff: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await merchantApi<{
        requests: RefundDTO[]
        creditsAvailable: number
        creditsApplied: number
        payoutWaiting: number
        paidOut: number
        countAwaitingStaff: number
      }>("/api/merchants/me/refunds")
      setRequests(data.requests)
      setTotals({
        creditsAvailable: data.creditsAvailable,
        creditsApplied: data.creditsApplied,
        payoutWaiting: data.payoutWaiting,
        paidOut: data.paidOut,
        countAwaitingStaff: data.countAwaitingStaff,
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load your refunds")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  /** A credit that has not been spent yet can still be turned into a payout, and back. */
  const switchSettlement = async (row: RefundDTO, to: "CREDIT" | "PAYOUT") => {
    setBusy(true)
    setError(null)
    try {
      await merchantApi(`/api/merchants/me/refunds/${row.id}`, { method: "PATCH", json: { settlement: to } })
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not change that refund")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Credits available" value={formatPKR(totals.creditsAvailable)} hint="Taken off your next batch automatically" accent />
        <Metric label="Already applied" value={formatPKR(totals.creditsApplied)} hint="Credits spent on past invoices" />
        <Metric label="Awaiting PakRaffle" value={formatPKR(totals.payoutWaiting)} hint={totals.countAwaitingStaff ? `${totals.countAwaitingStaff} payout request(s)` : "Nothing waiting"} />
        <Metric label="Paid out" value={formatPKR(totals.paidOut)} hint="Transferred to your payout details" />
      </div>

      <Alert tone="info">
        <strong>Refunds follow Shopify — there is nothing to request.</strong> When an order is cancelled or refunded in Shopify, that webhook voids the ticket, marks its payment refunded, withdraws
        the shopper from the draw and raises this credit, all in the same call. So record the return in Shopify and it lands here in seconds — no form, no email, no waiting on the desk.
      </Alert>

      <GuideStrip guides={[GUIDES.refunds, GUIDES.invoice]} />

      {error && <Alert tone="error">{error}</Alert>}

      <Panel>
        <PanelHeader
          title="Your refunds and credits"
          description="Nothing to file here: these rows are raised by Shopify's own cancellation and refund events. Each one shows when Shopify reported it, when we received it, and what PakRaffle did."
          action={
            <Btn variant="secondary" onClick={load} loading={loading}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Btn>
          }
        />
        {requests.length === 0 ? (
          <EmptyState icon={Undo2} title="No refunds yet">
            Returned and refunded orders will be listed here with their full trail.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-slate-100">
            {requests.map((row) => {
              const expandedRow = expanded === row.id
              return (
                <li key={row.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {row.orderName || row.ticketNumber}
                        <span className="ml-2 font-mono text-[11px] font-normal text-slate-500">{row.ticketNumber}</span>
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{row.reason}</p>
                      <p className="mt-1.5 text-xs">
                        <span className="font-mono tabular-nums font-semibold text-emerald-700">{formatPKR(row.netAmount)}</span>{" "}
                        <span className="text-slate-500">{row.settlement === "CREDIT" ? "credit" : "payout"} · billed {formatPKR(row.grossAmount)} − {formatPKR(row.gatewayCost)} processor charge</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${STATUS_TONE[row.status] || "bg-slate-50 text-slate-600 ring-slate-200"}`}>
                        {row.statusLabel}
                      </span>
                      <span className="text-[11px] text-slate-500">{row.source === "WEBHOOK" ? "detected from Shopify" : row.source === "MERCHANT" ? "you requested" : "raised by PakRaffle"}</span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                    <span>
                      Shopify event: <strong className="font-normal text-slate-700">{row.shopifyEventAt ? formatDate(row.shopifyEventAt, true) : "not reported"}</strong>
                    </span>
                    <span>
                      Received: <strong className="font-normal text-slate-700">{formatDate(row.receivedAt, true)}</strong>
                      {latency(row.detectedInMs) ? <span className="text-emerald-700"> · {latency(row.detectedInMs)} later</span> : null}
                    </span>
                    <span>
                      Actioned: <strong className="font-normal text-slate-700">{row.actionedAt ? formatDate(row.actionedAt, true) : "—"}</strong>
                    </span>
                    {row.applied && (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> credit applied to an invoice
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpanded(expandedRow ? null : row.id)}
                      className="text-xs font-medium text-slate-600 underline-offset-2 hover:text-emerald-700 hover:underline"
                    >
                      {expandedRow ? "Hide timeline" : `Timeline (${row.events.length})`}
                    </button>
                    {!row.applied && row.settlement === "CREDIT" && row.status === "CREDITED" && (
                      <Btn variant="ghost" className="h-8 min-h-8 px-2.5 py-1 text-xs" onClick={() => switchSettlement(row, "PAYOUT")} loading={busy}>
                        <ArrowRightLeft className="h-3.5 w-3.5" /> Convert to payout
                      </Btn>
                    )}
                    {!row.applied && row.settlement === "PAYOUT" && row.status === "REQUESTED" && (
                      <Btn variant="ghost" className="h-8 min-h-8 px-2.5 py-1 text-xs" onClick={() => switchSettlement(row, "CREDIT")} loading={busy}>
                        <ArrowRightLeft className="h-3.5 w-3.5" /> Keep as credit instead
                      </Btn>
                    )}
                    <span className="ml-auto text-[11px] text-slate-400">{timeAgo(row.receivedAt)}</span>
                  </div>

                  {expandedRow && (
                    <ol className="mt-3 space-y-2 border-l border-slate-200 pl-4">
                      {row.events.map((event, index) => (
                        <li key={`${event.at}-${index}`} className="relative text-xs">
                          <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                          <p className="font-medium text-slate-800">{event.label}</p>
                          {event.detail && <p className="mt-0.5 text-slate-500">{event.detail}</p>}
                          <p className="mt-0.5 font-mono text-[10.5px] text-slate-400">{formatDate(event.at, true)}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Panel>

      <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        A ticket cannot be withdrawn once its draw has run — that result is already published and audited. Credits are applied whole: a credit larger than the current batch stays open for the
        next one, and can be converted to a payout at any time before it is spent
        {String(store.payoutDetails || "").trim()
          ? ` — payouts go to ${store.payoutDetails}.`
          : " — add your Raast ID or bank account under Settings if you want a payout instead of a credit."}
      </p>
    </div>
  )
}
