"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { RefreshCw, Search, Ticket, Wallet } from "lucide-react"
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
  refreshKey,
  onSettled,
}: {
  campaigns: CampaignDTO[]
  settlementAccounts: SettlementAccount[]
  entryFee: number
  refreshKey: number
  onSettled: () => Promise<void> | void
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

  // Tickets still waiting for money: not on a batch invoice, not simulated, not yet settled.
  // A rejected transfer drops the ticket back to ISSUED, so the same button turns into "Pay again".
  const canPay = (entry: EntryDTO) => entry.status === "ISSUED" && !entry.invoiceId && !entry.isTest
  const rejected = (entry: EntryDTO) =>
    entry.paymentStatus === "FAILED" || entry.paymentStatus === "REFUNDED" || entry.paymentStatus === "CANCELLED"

  return (
    <Panel>
      <PanelHeader
        title="Live Entry Feed"
        description={
          <>
            <span className="font-mono tabular-nums text-slate-300">{formatNumber(total)}</span> ticket{total === 1 ? "" : "s"} match
            <span className="px-1.5 text-slate-600">·</span>pay any ticket on its own, or settle the batch later
            <span className="px-1.5 text-slate-600">·</span>auto-refreshes every 15s
          </>
        }
        action={
          <Btn variant="ghost" className="px-3" onClick={() => reload()} aria-label="Refresh">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Btn>
        }
      />

      <div className="grid gap-3 border-b border-slate-800 px-5 py-4 md:grid-cols-[1fr_200px_160px_auto] md:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
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
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-400">
          <input
            type="checkbox"
            checked={includeTest}
            onChange={(e) => setIncludeTest(e.target.checked)}
            className="h-4 w-4 rounded border-slate-700 bg-[#0B0F19] accent-emerald-500"
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
              variant={rejected(entry) ? "primary" : "secondary"}
              className="min-h-0 px-3 py-1.5 text-xs"
              onClick={() => setPaying(entry)}
            >
              <Wallet className="h-3.5 w-3.5 text-emerald-400" /> {rejected(entry) ? "Pay again" : "Pay now"}
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
        onClose={() => setPaying(null)}
        onSubmitted={async () => {
          await onSettled()
          await reload()
        }}
      />
    </Panel>
  )
}
