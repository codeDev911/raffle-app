"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Banknote, Check, CircleDollarSign, Clock, Search, ShieldAlert, Undo2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  EmptyState,
  KpiTile,
  Notice,
  Panel,
  PageSkeleton,
  RefreshButton,
  StatusBadge,
  TokenGate,
  formatAgo,
  useAdminApi,
} from "../_shared"
import type { RefundAdminDTO } from "./types"

const FILTERS = [
  { key: "", label: "All" },
  { key: "REQUESTED", label: "Awaiting you" },
  { key: "APPROVED", label: "Approved" },
  { key: "PAID", label: "Paid out" },
  { key: "CREDITED", label: "Credits" },
  { key: "REJECTED", label: "Rejected" },
]

const money = (amount: number) => `Rs ${(Number(amount) || 0).toLocaleString("en-PK")}`

/**
 * The payout queue. Credits never appear as work here: they apply themselves to the merchant's next
 * batch, so this screen exists for the one decision a human must own — sending real money out.
 */
export default function RefundsAdminClient() {
  const [reloadKey, setReloadKey] = useState(0)
  const { request, tokenRequired, askForToken } = useAdminApi(reloadKey)
  const [rows, setRows] = useState<RefundAdminDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [search, setSearch] = useState("")
  const [notice, setNotice] = useState<{ kind: "error" | "success"; text: string } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const query = filter ? `?status=${filter}` : ""
      const data = await request<{ requests: RefundAdminDTO[] }>(`/api/admin/merchant-refunds${query}`)
      setRows(data.requests || [])
    } catch (err: any) {
      setNotice({ kind: "error", text: err.message || "Could not load refund requests" })
    } finally {
      setLoading(false)
    }
  }, [request, filter])

  useEffect(() => {
    load()
  }, [load])

  const decide = async (id: string, action: "APPROVE" | "REJECT" | "PAID") => {
    const note =
      action === "REJECT" ? window.prompt("Why is this refund not approved? The merchant reads this.") ?? "" : ""
    if (action === "REJECT" && !note.trim()) return
    setBusyId(id)
    setNotice(null)
    try {
      await request("/api/admin/merchant-refunds", { method: "PATCH", body: JSON.stringify({ id, action, note: note || undefined }) })
      setNotice({
        kind: "success",
        text: action === "APPROVE" ? "Payout approved — transfer it, then mark it paid." : action === "PAID" ? "Marked as paid out." : "Refund rejected, the merchant can see why.",
      })
      await load()
    } catch (err: any) {
      setNotice({ kind: "error", text: err.message || "That decision could not be saved" })
    } finally {
      setBusyId(null)
    }
  }

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((row) =>
      [row.storeName, row.ticketNumber, row.orderName, row.shopifyOrderId, row.reason].join(" ").toLowerCase().includes(needle),
    )
  }, [rows, search])

  const totals = useMemo(
    () => ({
      awaiting: rows.filter((r) => r.status === "REQUESTED").reduce((sum, r) => sum + r.netAmount, 0),
      approved: rows.filter((r) => r.status === "APPROVED").reduce((sum, r) => sum + r.netAmount, 0),
      paid: rows.filter((r) => r.status === "PAID").reduce((sum, r) => sum + r.netAmount, 0),
      credits: rows.filter((r) => r.settlement === "CREDIT" && r.status === "CREDITED").reduce((sum, r) => sum + r.netAmount, 0),
    }),
    [rows],
  )

  if (tokenRequired) return <TokenGate onProvide={() => askForToken() && setReloadKey((k) => k + 1)} />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/merchants" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-700">
            <ArrowLeft className="h-3.5 w-3.5" /> Merchant Connect
          </Link>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Merchant refunds &amp; credits</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Shopify cancellations and refunds void tickets and raise credits automatically. Only payouts need you.
          </p>
        </div>
        <RefreshButton onClick={() => setReloadKey((k) => k + 1)} busy={loading} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile label="Awaiting approval" value={money(totals.awaiting)} hint="payout requests" icon={Clock} tone="amber" />
        <KpiTile label="Approved, not sent" value={money(totals.approved)} hint="transfer then mark paid" icon={ShieldAlert} tone="sky" />
        <KpiTile label="Paid out" value={money(totals.paid)} hint="settled" icon={Check} tone="emerald" />
        <KpiTile label="Credits in circulation" value={money(totals.credits)} hint="apply to the next invoice" icon={CircleDollarSign} />
      </div>

      {notice && <Notice kind={notice.kind} children={notice.text} onDismiss={() => setNotice(null)} />}

      <Panel
        title="Refund ledger"
        subtitle={`${visible.length} of ${rows.length} request(s)`}
        icon={Undo2}
        bodyClassName="p-0"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Store, ticket, order…"
                className="h-8 w-44 rounded-lg border border-slate-200 bg-white pl-8 pr-2 text-xs outline-none focus:border-slate-300"
              />
            </div>
            {FILTERS.map((entry) => (
              <button
                key={entry.key}
                type="button"
                onClick={() => setFilter(entry.key)}
                className={`h-8 rounded-lg px-2.5 text-xs font-medium transition ${
                  filter === entry.key ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {entry.label}
              </button>
            ))}
          </div>
        }
      >
        {loading ? (
          <PageSkeleton label="Loading refund requests…" />
        ) : visible.length === 0 ? (
          <EmptyState icon={Undo2} title={filter ? "Nothing in this state" : "No refunds yet"} hint="Rows appear the moment Shopify reports a cancellation or refund." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {visible.map((row) => (
              <li key={row.id} className="flex flex-col gap-3 px-4 py-3.5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                    {row.storeName || "Store"}
                    <StatusBadge status={row.status} />
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-medium text-slate-600">
                      {row.settlement === "CREDIT" ? "credit" : "payout"}
                    </span>
                    <span className="font-mono text-xs font-normal text-slate-500">{row.ticketNumber}</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {row.reason} · order {row.orderName || row.shopifyOrderId}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Billed {money(row.grossAmount)} · <strong className="font-semibold text-slate-700">{money(row.netAmount)} to return</strong>{" "}
                    <span className="text-slate-400">(processor charge {money(row.gatewayCost)} already paid)</span>
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {row.source === "WEBHOOK" ? "Detected from Shopify" : row.source === "MERCHANT" ? "Requested by merchant" : "Raised by staff"} · received{" "}
                    {formatAgo(row.receivedAt)}
                    {row.shopifyEventAt ? ` · Shopify event ${formatAgo(row.shopifyEventAt)}` : ""}
                    {row.creditInvoiceId ? " · credit applied to an invoice" : ""}
                  </p>
                  {row.payoutDetails && row.settlement === "PAYOUT" && (
                    <p className="mt-1 font-mono text-[11px] text-slate-600">Payout to: {row.payoutDetails}</p>
                  )}
                  {row.note && <p className="mt-1 max-w-prose text-[11px] italic text-slate-500">“{row.note}”</p>}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {row.status === "REQUESTED" && (
                    <>
                      <Button size="sm" className="rounded-lg" disabled={busyId === row.id} onClick={() => decide(row.id, "APPROVE")}>
                        <Check className="mr-1 h-3.5 w-3.5" /> Approve payout
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50" disabled={busyId === row.id} onClick={() => decide(row.id, "REJECT")}>
                        <X className="mr-1 h-3.5 w-3.5" /> Not approved
                      </Button>
                    </>
                  )}
                  {row.status === "APPROVED" && (
                    <Button size="sm" variant="secondary" className="rounded-lg" disabled={busyId === row.id} onClick={() => decide(row.id, "PAID")}>
                      <ShieldAlert className="mr-1 h-3.5 w-3.5" /> Mark transferred
                    </Button>
                  )}
                  {row.status === "CREDITED" && !row.creditInvoiceId && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700">
                      <Banknote className="h-3.5 w-3.5" /> settles itself on the next batch
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
