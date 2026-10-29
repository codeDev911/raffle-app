"use client"

import Link from "next/link"
import { ArrowRight, ExternalLink, Inbox, Radio, Ticket } from "lucide-react"
import {
  EmptyState,
  Metric,
  Panel,
  PanelHeader,
  Sep,
  StatusText,
  formatDate,
  formatNumber,
  formatPKR,
} from "../ui"
import { useEntryFeed } from "./entries"
import { CampaignProgress, EntriesTable } from "./shared"
import type { CampaignDTO, InvoiceDTO, MeResponse } from "./types"

export function OverviewTab({
  me,
  campaigns,
  invoices,
  onOpenCampaigns,
  onOpenInvoices,
}: {
  me: MeResponse
  campaigns: CampaignDTO[]
  invoices: InvoiceDTO[]
  onOpenCampaigns: () => void
  onOpenInvoices: () => void
}) {
  const open = campaigns.filter((c) => c.status === "ACTIVE" || c.status === "PAUSED")
  const active = campaigns.filter((c) => c.status === "ACTIVE" && !c.ended && !c.capReached)
  const unbilledTickets = open.reduce((sum, c) => sum + c.billableEntries, 0)
  const unbilledAmount = open.reduce((sum, c) => sum + c.billableAmount, 0)
  const drawReady = campaigns.filter((c) => c.status === "DRAW_READY")
  const outstanding = invoices.filter((i) => i.status !== "PAID")
  const outstandingAmount = outstanding.reduce((sum, i) => sum + i.amountDue, 0)
  const ticketsPaid = campaigns.reduce((sum, c) => sum + (c.currentEntries - c.billableEntries), 0)

  const { entries } = useEntryFeed({ take: "8" })
  const titles = Object.fromEntries(campaigns.map((c) => [c.id, c.title]))
  const nextDraw = [...campaigns]
    .filter((c) => c.status !== "COMPLETED" && !c.ended)
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())[0]

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Active campaigns" value={formatNumber(active.length)} hint={`${formatNumber(campaigns.length)} total`} accent />
        <Metric label="Tickets unbilled" value={formatNumber(unbilledTickets)} hint="settled per batch" />
        <Metric label="Unbilled amount" value={formatPKR(unbilledAmount)} hint={`at ${formatPKR(me.integration.entryFee)} / ticket`} />
        <Metric label="Awaiting settlement" value={formatNumber(outstanding.length)} hint={formatPKR(outstandingAmount) + " due"} />
        <Metric label="Tickets in draw pool" value={formatNumber(ticketsPaid)} hint="paid & verified" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Panel>
          <PanelHeader
            title="Live Entry Feed"
            description={
              <>
                Newest tickets <Sep /> auto-refreshes every 15s
              </>
            }
            action={
              <Link href="/merchants/dashboard?tab=entries" className="text-xs text-emerald-400 hover:underline">
                View all
              </Link>
            }
          />
          <EntriesTable
            entries={entries}
            campaignTitles={titles}
            dense
            emptyState={
              <EmptyState icon={Radio} title="Waiting for the first ticket">
                Fire the webhook simulator to watch a ticket mint end-to-end before your store goes live.
              </EmptyState>
            }
          />
        </Panel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Batch invoices" description={outstanding.length ? `${formatNumber(outstanding.length)} awaiting payment` : "All settled"} />
            {outstanding.length === 0 ? (
              <EmptyState icon={Inbox} title="No open invoices">
                Close a campaign batch with “Review & Settle Batch Invoice”.
              </EmptyState>
            ) : (
              <div className="divide-y divide-slate-800">
                {outstanding.slice(0, 4).map((inv) => (
                  <button key={inv.id} type="button" onClick={onOpenInvoices} className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition hover:bg-slate-800/30">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs tabular-nums text-slate-200">{inv.invoiceNumber}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{inv.campaignTitle}</p>
                      <StatusText status={inv.status} className="mt-1" />
                    </div>
                    <span className="shrink-0 font-mono text-sm tabular-nums text-emerald-400">{formatPKR(inv.amountDue)}</span>
                  </button>
                ))}
              </div>
            )}
          </Panel>

          <Panel>
            <PanelHeader
              title="Campaigns"
              description={
                <>
                  <span className="font-mono tabular-nums text-slate-300">{formatNumber(active.length)}</span> minting
                  {drawReady.length > 0 && (
                    <>
                      <Sep />
                      <span className="font-mono tabular-nums text-violet-300">{formatNumber(drawReady.length)}</span> draw-ready
                    </>
                  )}
                </>
              }
            />
            {campaigns.length === 0 ? (
              <div className="px-5 py-6">
                <p className="text-sm text-slate-400">No campaigns yet.</p>
                <button type="button" onClick={onOpenCampaigns} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:underline">
                  Build your first lucky draw <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {campaigns.slice(0, 3).map((c) => (
                  <div key={c.id} className="px-5 py-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-slate-100">{c.title}</p>
                      <StatusText status={c.ended ? "ENDED" : c.capReached ? "PAUSED" : c.status} />
                    </div>
                    <CampaignProgress campaign={c} compact />
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Next draw</p>
            {nextDraw ? (
              <p className="mt-2 text-sm text-slate-200">
                {nextDraw.title}
                <span className="block text-xs text-slate-500">
                  <span className="font-mono tabular-nums">{formatDate(nextDraw.endDate)}</span>
                  <Sep />
                  <Ticket className="inline h-3.5 w-3.5" /> {formatNumber(nextDraw.currentEntries)} entries
                </span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Nothing scheduled</p>
            )}
            <a
              href="/lookup/store-ticket"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Share ticket lookup with customers
            </a>
          </Panel>
        </div>
      </div>
    </div>
  )
}
