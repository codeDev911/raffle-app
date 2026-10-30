"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ReceiptText, RefreshCw, Search, Ticket, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, Btn, EmptyState, Panel, PanelHeader, SelectInput, TextInput, formatNumber, merchantApi } from "../ui"
import { EntryPaymentDialog } from "./entry-payment"
import { EntriesTable } from "./shared"
import type { CampaignDTO, EntryDTO, SettlementAccount } from "./types"

const POLL_MS = 15_000

/** Polls the entry ledger while the tab is visible so new webhook mints appear live. */
export function useEntryFeed(params: Record<string, string | undefined>, refreshKey = 0) {
  const [entries, setEntries] = useState<EntryDTO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString()
  const requestId = useRef(0)

  const load = useCallback(async () => {
    const id = ++requestId.current
    try {
      const data = await merchantApi<{ entries: EntryDTO[]; total: number }>(`/api/merchants/me/entries?${query}`)
      if (id !== requestId.current) return // a newer request superseded this one
      setEntries(data.entries)
      setTotal(data.total)
      setError(null)
    } catch (err: any) {
      if (id === requestId.current) setError(err.message)
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [query])

  useEffect(() => {
    setLoading(true)
    load()
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load()
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [load, refreshKey])

  return { entries, total, loading, error, reload: load }
}

export function EntriesTab({
  campaigns,
  settlementAccounts,
  entryFee,
  safepayEnabled,
  refreshKey,
  onSettled,
  onOpenInvoice,
}: {
  campaigns: CampaignDTO[]
  settlementAccounts: SettlementAccount[]
  entryFee: number
  /** Hosted card checkout available — the primary way to pay a single ticket. */
  safepayEnabled: boolean
  refreshKey: number
  onSettled: () => Promise<void> | void
  /** Jump to the batch invoice that has to be paid again. */
  onOpenInvoice: (invoiceId: string) => void
}) {
  const [campaignId, setCampaignId] = useState("")
  const [status, setStatus] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [includeTest, setIncludeTest] = useState(true)
  const [paying, setPaying] = useState<EntryDTO | null>(null)

  // Debounce free-text search so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const { entries, total, loading, error, reload } = useEntryFeed(
    { campaignId, status, search, includeTest: includeTest ? "true" : undefined, take: "200" },
    refreshKey,
  )
  const titles = Object.fromEntries(campaigns.map((c) => [c.id, c.title]))
  const prices = Object.fromEntries(campaigns.map((c) => [c.id, c.ticketPrice]))

  // PakRaffle could not verify the last transfer: the ticket is payable again, whether the ledger
  // already dropped it back to ISSUED or it is still parked on INVOICED.
  const rejected = (entry: EntryDTO) =>
    entry.status !== "PAID" &&
    entry.status !== "CANCELLED" &&
    (entry.paymentStatus === "FAILED" || entry.paymentStatus === "REFUNDED" || entry.paymentStatus === "CANCELLED")
  const canPay = (entry: EntryDTO) =>
    !entry.isTest &&
    !entry.invoiceId &&
    (entry.status === "ISSUED" || rejected(entry) || entry.checkoutOpen)

  return (
    <Panel>
      <PanelHeader
        title="Live Entry Feed"
        description={
          <>
            <span className="font-mono tabular-nums text-slate-700">{formatNumber(total)}</span> ticket{total === 1 ? "" : "s"} match
            <span className="px-1.5 text-slate-400">·</span>pay any ticket on its own, or settle the batch later
            <span className="px-1.5 text-slate-400">·</span>auto-refreshes every 15s
          </>
        }
        action={
          <Btn variant="ghost" className="px-3" onClick={() => reload()} aria-label="Refresh">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Btn>
        }
      />

      <div className="grid gap-3 border-b border-slate-200 px-5 py-4 md:grid-cols-[1fr_200px_160px_auto] md:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <TextInput
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Ticket, order, customer or phone"
            className="pl-10"
          />
        </div>
        <SelectInput value={campaignId} onChange={(e) => setCampaignId(e.target.value)} aria-label="Campaign">
          <option value="">All campaigns</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </SelectInput>
        <SelectInput value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">Any status</option>
          <option value="ISSUED">Unpaid</option>
          <option value="INVOICED">Payment submitted</option>
          <option value="PAID">Confirmed</option>
          <option value="CANCELLED">Voided</option>
        </SelectInput>
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={includeTest}
            onChange={(e) => setIncludeTest(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 bg-slate-50 accent-emerald-500"
          />
          Show test tickets
        </label>
      </div>

      {error && (
        <div className="px-5 pt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <EntriesTable
        entries={entries}
        campaignTitles={titles}
        renderActions={(entry) =>
          canPay(entry) ? (
            <Btn
              variant={rejected(entry) || entry.checkoutOpen ? "primary" : "secondary"}
              className="min-h-0 px-3 py-1.5 text-xs"
              onClick={() => setPaying(entry)}
            >
              <Wallet className="h-3.5 w-3.5 text-emerald-600" />{" "}
              {rejected(entry) ? "Pay again" : entry.checkoutOpen ? "Resume payment" : "Pay now"}
            </Btn>
          ) : rejected(entry) && entry.invoiceId ? (
            // A batch ticket stays on its invoice: reopening the invoice is the way to pay again.
            <Btn
              variant="primary"
              className="min-h-0 px-3 py-1.5 text-xs"
              onClick={() => onOpenInvoice(entry.invoiceId as string)}
            >
              <ReceiptText className="h-3.5 w-3.5 text-emerald-600" /> Resubmit invoice
            </Btn>
          ) : entry.paymentStatus === "PENDING" || entry.paymentStatus === "PROCESSING" ? (
            <span className="text-[11px] text-slate-500">Waiting for PakRaffle</span>
          ) : entry.status === "ISSUED" && entry.invoiceId ? (
            <span className="text-[11px] text-slate-500">On invoice</span>
          ) : null
        }
        emptyState={
          <EmptyState icon={Ticket} title={loading ? "Loading tickets…" : "No tickets yet"}>
            {!loading && "Tickets appear here as soon as Shopify reports a qualifying fulfilled order. Try the simulator to see one."}
          </EmptyState>
        }
      />

      <EntryPaymentDialog
        entry={paying}
        amount={paying ? prices[paying.campaignId] ?? entryFee : entryFee}
        settlementAccounts={settlementAccounts}
        safepayEnabled={safepayEnabled}
        onClose={() => setPaying(null)}
        onSubmitted={async () => {
          await onSettled()
          await reload()
        }}
      />
    </Panel>
  )
}
