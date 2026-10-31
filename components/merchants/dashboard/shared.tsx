"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { Sep, StatusText, formatNumber, formatPKR, timeAgo } from "../ui"
import type { CampaignDTO, EntryDTO } from "./types"

/** "Entries Minted: 42/100" with a thin emerald progress rule (continuous campaigns show ∞). */
export function CampaignProgress({ campaign, compact = false }: { campaign: CampaignDTO; compact?: boolean }) {
  const cap = campaign.maxEntries
  const pct = cap ? Math.min(100, Math.round((campaign.currentEntries / cap) * 100)) : null
  return (
    <div className={cn("space-y-1.5", compact ? "min-w-[140px]" : "")}>
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-slate-500">Entries minted</span>
        <span className="font-mono tabular-nums text-slate-800">
          {formatNumber(campaign.currentEntries)}
          <span className="text-slate-400">/</span>
          {cap ? formatNumber(cap) : "∞"}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full transition-all", campaign.capReached ? "bg-amber-500" : "bg-emerald-500")}
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
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
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
  // Opening the card page created no payment, so the ticket is simply payable again — until the
  // session's own lifetime runs out.
  if (entry.checkoutOpen) return "CHECKOUT_OPEN"
  return entry.invoiceId ? "ON_INVOICE" : "UNPAID"
}

/** A rejected transfer the merchant can re-send on its own (batch tickets go through the invoice). */
export function paymentFailed(entry: EntryDTO) {
  return (
    entry.status !== "PAID" &&
    entry.status !== "CANCELLED" &&
    (entry.paymentStatus === "FAILED" || entry.paymentStatus === "REFUNDED")
  )
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
    <>
      {/* Phones: one card per ticket, because seven columns never fit a 375px screen. */}
      <ul className="divide-y divide-slate-200 md:hidden">
        {entries.map((entry) => {
          const actions = renderActions?.(entry)
          return (
            <li key={entry.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-[11px] tabular-nums text-emerald-700">{entry.ticketNumber}</p>
                  <p className="truncate text-sm text-slate-800">{entry.customerName}</p>
                  {(entry.customerPhone || entry.customerCity) && (
                    <p className="truncate font-mono text-[11px] tabular-nums text-slate-500">
                      {entry.customerPhone || "—"}
                      {entry.customerCity && (
                        <>
                          <span className="px-1 text-slate-400">·</span>
                          <span className="font-sans">{entry.customerCity}</span>
                        </>
                      )}
                    </p>
                  )}
                </div>
                <span className="shrink-0">
                  <StatusText status={entryStatusKey(entry)} />
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                <span className="font-mono tabular-nums text-slate-700">{entry.orderName || `#${entry.shopifyOrderId}`}</span>
                <Sep />
                <span className="font-mono tabular-nums">
                  {entry.itemCount} item{entry.itemCount === 1 ? "" : "s"} · {formatPKR(entry.orderAmount)}
                </span>
                <Sep />
                <span>{timeAgo(entry.createdAt)}</span>
                {entry.isTest && <StatusText status="TEST" />}
              </div>

              {!dense && (
                <p className="mt-1 truncate text-[11px] text-slate-500">{campaignTitles[entry.campaignId] || "—"}</p>
              )}
              {paymentFailed(entry) && (
                <p className="mt-1 text-[11px] text-slate-500">
                  {entry.invoiceId ? "transfer not verified · resubmit the invoice" : "transfer not verified"}
                </p>
              )}
              {entry.cancelledReason && <p className="mt-1 text-[11px] text-slate-500">{entry.cancelledReason}</p>}

              {actions ? <div className="mt-2">{actions}</div> : null}
            </li>
          )
        })}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
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
        <tbody className="divide-y divide-slate-200">
          {entries.map((entry) => (
            <tr key={entry.id} className="text-slate-700 transition hover:bg-slate-100">
              <td className="whitespace-nowrap px-5 py-3 font-mono text-xs tabular-nums text-emerald-700">
                {entry.ticketNumber}
              </td>
              <td className="whitespace-nowrap px-3 py-3 font-mono text-xs tabular-nums text-slate-700">
                {entry.orderName || `#${entry.shopifyOrderId}`}
              </td>
              <td className="max-w-[180px] px-3 py-3">
                <p className="truncate text-slate-800">{entry.customerName}</p>
                {(entry.customerPhone || entry.customerCity) && (
                  <p className="truncate font-mono text-[11px] tabular-nums text-slate-500">
                    {entry.customerPhone || "—"}
                    {entry.customerCity && (
                      <>
                        <span className="px-1 text-slate-400">·</span>
                        <span className="font-sans">{entry.customerCity}</span>
                      </>
                    )}
                  </p>
                )}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-right font-mono text-xs tabular-nums">
                <span className="text-slate-600">{entry.itemCount} item{entry.itemCount === 1 ? "" : "s"}</span>
                <span className="px-1.5 text-slate-400">·</span>
                <span className="text-slate-800">{formatPKR(entry.orderAmount)}</span>
              </td>
              {!dense && (
                <td className="max-w-[180px] truncate px-3 py-3 text-xs text-slate-600">
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
    </>
  )
}
