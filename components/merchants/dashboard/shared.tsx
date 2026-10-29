"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { StatusText, formatNumber, formatPKR, timeAgo } from "../ui"
import type { CampaignDTO, EntryDTO } from "./types"

/** "Entries Minted: 42/100" with a thin emerald progress rule (continuous campaigns show ∞). */
export function CampaignProgress({ campaign, compact = false }: { campaign: CampaignDTO; compact?: boolean }) {
  const cap = campaign.maxEntries
  const pct = cap ? Math.min(100, Math.round((campaign.currentEntries / cap) * 100)) : null
  return (
    <div className={cn("space-y-1.5", compact ? "min-w-[140px]" : "")}>
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-slate-500">Entries minted</span>
        <span className="font-mono tabular-nums text-slate-200">
          {formatNumber(campaign.currentEntries)}
          <span className="text-slate-600">/</span>
          {cap ? formatNumber(cap) : "∞"}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-slate-800">
        <div
          className={cn("h-full rounded-full transition-all", campaign.capReached ? "bg-amber-400" : "bg-emerald-500")}
          style={{ width: pct === null ? (campaign.currentEntries > 0 ? "100%" : "0%") : `${pct}%`, opacity: pct === null ? 0.35 : 1 }}
        />
      </div>
    </div>
  )
}

/** Campaign status with derived states (ended / cap reached) shown typographically. */
export function CampaignStatus({ campaign }: { campaign: CampaignDTO }) {
  if (campaign.status === "ACTIVE" && campaign.ended) return <StatusText status="ENDED" />
  if (campaign.status === "ACTIVE" && campaign.capReached) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        Cap reached
      </span>
    )
  }
  return <StatusText status={campaign.status} />
}

/**
 * What the merchant should read in the Status column. The fate of the PakRaffle payment wins over
 * the raw ledger status: a rejected transfer is actionable, "invoiced" is not.
 */
export function entryStatusKey(entry: EntryDTO): string {
  if (entry.status === "PAID") return "PAID"
  if (entry.status === "CANCELLED") return "CANCELLED"
  if (entry.paymentStatus === "FAILED" || entry.paymentStatus === "REFUNDED") return "PAYMENT_FAILED"
  if (entry.paymentStatus === "CANCELLED") return "PAYMENT_CANCELLED"
  if (entry.paymentStatus === "PENDING" || entry.paymentStatus === "PROCESSING") return "AWAITING_CONFIRMATION"
  return entry.invoiceId ? "ON_INVOICE" : "UNPAID"
}

/** A rejected transfer the merchant can re-send on its own (batch tickets go through the invoice). */
export function paymentFailed(entry: EntryDTO) {
  return entry.status !== "PAID" && (entry.paymentStatus === "FAILED" || entry.paymentStatus === "REFUNDED")
}

export function EntriesTable({
  entries,
  campaignTitles,
  emptyState,
  dense = false,
  renderActions,
}: {
  entries: EntryDTO[]
  campaignTitles: Record<string, string>
  emptyState: React.ReactNode
  dense?: boolean
  /** Per-row settlement control (only the Entries tab bills tickets). */
  renderActions?: (entry: EntryDTO) => React.ReactNode
}) {
  if (entries.length === 0) return <>{emptyState}</>
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500">
            <th className="px-5 py-2.5 font-medium">Ticket</th>
            <th className="px-3 py-2.5 font-medium">Order</th>
            <th className="px-3 py-2.5 font-medium">Customer</th>
            <th className="px-3 py-2.5 text-right font-medium">Basket</th>
            {!dense && <th className="px-3 py-2.5 font-medium">Campaign</th>}
            <th className="px-3 py-2.5 font-medium">Status</th>
            <th className="px-5 py-2.5 text-right font-medium">Minted</th>
            {renderActions && <th className="px-5 py-2.5 text-right font-medium">Payment</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {entries.map((entry) => (
            <tr key={entry.id} className="text-slate-300 transition hover:bg-slate-800/30">
              <td className="whitespace-nowrap px-5 py-3 font-mono text-xs tabular-nums text-emerald-300">
                {entry.ticketNumber}
              </td>
              <td className="whitespace-nowrap px-3 py-3 font-mono text-xs tabular-nums text-slate-300">
                {entry.orderName || `#${entry.shopifyOrderId}`}
              </td>
              <td className="max-w-[180px] px-3 py-3">
                <p className="truncate text-slate-200">{entry.customerName}</p>
                {(entry.customerPhone || entry.customerCity) && (
                  <p className="truncate font-mono text-[11px] tabular-nums text-slate-500">
                    {entry.customerPhone || "—"}
                    {entry.customerCity && (
                      <>
                        <span className="px-1 text-slate-600">·</span>
                        <span className="font-sans">{entry.customerCity}</span>
                      </>
                    )}
                  </p>
                )}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-right font-mono text-xs tabular-nums">
                <span className="text-slate-400">{entry.itemCount} item{entry.itemCount === 1 ? "" : "s"}</span>
                <span className="px-1.5 text-slate-600">·</span>
                <span className="text-slate-200">{formatPKR(entry.orderAmount)}</span>
              </td>
              {!dense && (
                <td className="max-w-[180px] truncate px-3 py-3 text-xs text-slate-400">
                  {campaignTitles[entry.campaignId] || "—"}
                </td>
              )}
              <td className="whitespace-nowrap px-3 py-3">
                <span className="inline-flex items-center gap-2">
                  <StatusText status={entryStatusKey(entry)} />
                  {entry.isTest && <StatusText status="TEST" />}
                </span>
                {paymentFailed(entry) && (
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {entry.invoiceId ? "transfer not verified · resubmit the invoice" : "transfer not verified"}
                  </p>
                )}
                {entry.cancelledReason && <p className="mt-0.5 text-[11px] text-slate-500">{entry.cancelledReason}</p>}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-right text-xs text-slate-500" title={new Date(entry.createdAt).toLocaleString()}>
                {timeAgo(entry.createdAt)}
              </td>
              {renderActions && <td className="whitespace-nowrap px-5 py-3 text-right">{renderActions(entry)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
