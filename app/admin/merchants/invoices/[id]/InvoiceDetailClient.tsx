"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Landmark,
  Layers,
  Loader2,
  Receipt,
  Search,
  Store as StoreIcon,
  Ticket,
  Users,
  Wallet,
} from "lucide-react"
import type { CampaignDTO, EntryDTO, InvoiceDTO, SettlementAccount, StoreDTO } from "@/components/merchants/dashboard/types"
import {
  DetailHeader,
  Field,
  KpiTile,
  Notice,
  Panel,
  PaymentChip,
  StatusBadge,
  TokenGate,
  formatAgo,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPKR,
  plural,
  useAdminApi,
} from "../../_shared"

interface Detail {
  invoice: InvoiceDTO
  entries: EntryDTO[]
  store: StoreDTO | null
  settlementAccounts: SettlementAccount[]
  campaign: (CampaignDTO & { storeName: string | null }) | null
}

export default function InvoiceDetailClient({ params }: { params: { id: string } }) {
  const invoiceId = params.id

  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const [notes, setNotes] = useState("")
  const [notesDirty, setNotesDirty] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)

  const { request, tokenRequired, askForToken } = useAdminApi()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await request<Detail & { success: boolean }>(`/api/admin/merchants/invoices/${invoiceId}`)
      setDetail(data)
      setNotes(data.invoice.adminNotes ?? "")
      setNotesDirty(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [request, invoiceId])

  useEffect(() => {
    load()
  }, [load])

  const saveNotes = async () => {
    setSavingNotes(true)
    setError(null)
    try {
      await request(`/api/admin/merchants/invoices/${invoiceId}`, {
        method: "PATCH",
        body: JSON.stringify({ adminNotes: notes }),
      })
      setNotice(notes.trim() ? "Settlement note saved." : "Settlement note cleared.")
      setNotesDirty(false)
      await load()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSavingNotes(false)
    }
  }

  const filteredEntries = useMemo(() => {
    if (!detail) return []
    const q = query.toLowerCase().trim()
    if (!q) return detail.entries
    return detail.entries.filter((e) =>
      [e.ticketNumber, e.orderName, e.customerName, e.customerEmail, e.customerPhone, e.shopifyOrderId, e.status, e.paymentStatus]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q)),
    )
  }, [detail, query])

  if (loading && !detail)
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-red-600" />
        <p className="text-sm font-medium text-slate-500">Loading settlement…</p>
      </div>
    )

  if (!detail)
    return (
      <div className="space-y-4">
        {tokenRequired && <TokenGate onProvide={() => askForToken() && load()} />}
        <Notice kind="error">{error || "This settlement could not be loaded."}</Notice>
        <Button variant="outline" onClick={load} className="rounded-xl gap-1.5">
          <Loader2 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Try again
        </Button>
      </div>
    )

  const { invoice, store, campaign, entries } = detail
  const confirmed = entries.filter((e) => e.status === "PAID" || e.paymentStatus === "COMPLETED").length
  const rejected = entries.filter((e) => e.paymentStatus === "FAILED" || e.paymentStatus === "REFUNDED").length
  const awaiting = entries.length - confirmed - rejected
  const lineCountMatches = entries.length === invoice.totalEntries
  const priceMatches = !campaign || invoice.unitPrice === campaign.ticketPrice
  const expectedTotal = invoice.totalEntries * invoice.unitPrice
  const amountMatches = expectedTotal === invoice.amountDue
  const matchingAccounts = detail.settlementAccounts.filter((a) => invoice.paymentMethod && a.methods.includes(invoice.paymentMethod))

  return (
    <div className="space-y-5">
      <DetailHeader
        backHref="/admin/merchants"
        backLabel="Merchant Connect"
        crumbs={`${store?.name ?? "Store"} / Settlement`}
        title={<span className="font-mono">{invoice.invoiceNumber}</span>}
        badge={<StatusBadge status={invoice.status} />}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <Wallet className="h-4 w-4 text-slate-400" />
              <span className="font-mono font-bold tabular-nums text-slate-900">{formatPKR(invoice.amountDue)}</span>
            </span>
            <span className="text-slate-300">·</span>
            <span>
              <Link href={`/admin/merchants/${invoice.storeId}`} className="font-semibold text-slate-700 hover:text-red-700 hover:underline">
                {store?.name ?? "Unknown store"}
              </Link>
              <span className="text-slate-300"> · </span>
              <Link href={`/admin/merchants/campaigns/${invoice.campaignId}`} className="text-slate-700 hover:text-red-700 hover:underline">
                {invoice.campaignTitle ?? "campaign"}
              </Link>
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-mono tabular-nums">{formatNumber(invoice.totalEntries)}</span> × <span className="font-mono tabular-nums">{formatPKR(invoice.unitPrice)}</span>
          </span>
        }
        actions={
          <>
            {invoice.checkoutOpen && invoice.checkoutUrl && (
              <Button size="sm" className="h-9 gap-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700" asChild>
                <a href={invoice.checkoutUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" /> Resume checkout
                </a>
              </Button>
            )}
            {invoice.status === "UNDER_REVIEW" && (
              <Button size="sm" variant="outline" className="h-9 gap-1.5 rounded-lg border-red-200 text-red-700 hover:bg-red-50" asChild>
                <Link href="/admin/payments">
                  <CheckCircle2 className="h-4 w-4" /> Confirm in Payments
                </Link>
              </Button>
            )}
            {invoice.paymentProof && (
              <Button size="sm" variant="outline" className="h-9 gap-1.5 rounded-lg" asChild>
                <a href={invoice.paymentProof} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4" /> Receipt
                </a>
              </Button>
            )}
          </>
        }
      />

      {tokenRequired && <TokenGate onProvide={() => askForToken() && load()} />}
      {error && <Notice kind="error" onDismiss={() => setError(null)}>{error}</Notice>}
      {notice && <Notice kind="success" onDismiss={() => setNotice(null)}>{notice}</Notice>}

      {/* Integrity / state band */}
      <div className="space-y-2">
        {invoice.paymentFailed && (
          <Notice kind="error">
            A transfer against this batch was rejected by PakRaffle. The tickets have dropped back to payable and the merchant must pay and resubmit —
            until then the draw stays locked.
          </Notice>
        )}
        {invoice.status === "UNDER_REVIEW" && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            <Clock className="h-4 w-4 shrink-0" />
            <p className="min-w-0">
              <b>Waiting on confirmation.</b> {plural(awaiting, "ticket")} submitted {formatAgo(invoice.submittedAt ?? invoice.createdAt)} —
              each ticket has its own payment row under <Link href="/admin/payments" className="font-semibold underline-offset-2 hover:underline">Payments</Link>. Confirming them settles this batch automatically.
            </p>
          </div>
        )}
        {invoice.status === "PENDING" && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <Receipt className="h-4 w-4 shrink-0" />
            <p className="min-w-0">
              <b>Raised, not yet submitted.</b> The merchant has {invoice.checkoutOpen ? "an open card checkout or" : "manual transfer details and"} 30 minutes of
              checkout life per attempt; nothing is owed by PakRaffle yet.
            </p>
          </div>
        )}
        {invoice.status === "PAID" && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <p className="min-w-0">
              <b>Settled {formatDate(invoice.paidAt)}.</b> {plural(confirmed, "ticket")} confirmed of {formatNumber(entries.length)} in this batch, all in the draw pool.
              {campaign && campaign.status === "DRAW_READY" && (
                <> Run the draw from the <Link href={`/admin/merchants/campaigns/${campaign.id}`} className="font-semibold underline-offset-2 hover:underline">campaign page</Link>.</>
              )}
            </p>
          </div>
        )}

        {!lineCountMatches && (
          <Notice kind="error">
            Ledger mismatch: this invoice bills {formatNumber(invoice.totalEntries)} tickets but {formatNumber(entries.length)} ledger lines currently point at it.
            Read the batch total from the invoice itself, and treat this page as the ground truth for what is attached before confirming any money.
          </Notice>
        )}
      </div>

      {/* KPI band */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <KpiTile label="Amount due" value={formatPKR(invoice.amountDue)} hint={amountMatches ? `${formatNumber(invoice.totalEntries)} × ${formatPKR(invoice.unitPrice)}` : `line total is ${formatPKR(expectedTotal)}`} icon={Wallet} tone={invoice.status === "PAID" ? "emerald" : "amber"} />
        <KpiTile label="Tickets in batch" value={formatNumber(invoice.totalEntries)} hint={`${formatNumber(entries.length)} lines attached`} icon={Ticket} tone="slate" />
        <KpiTile label="Confirmed" value={formatNumber(confirmed)} hint="paid or payment completed" icon={CheckCircle2} tone="emerald" />
        <KpiTile label="Awaiting review" value={formatNumber(awaiting)} hint={rejected ? `${formatNumber(rejected)} rejected` : "no rejections"} icon={Clock} tone={awaiting ? "sky" : "slate"} />
        <KpiTile label="Method" value={invoice.paymentMethod ? <span className="text-base">{invoice.paymentMethod}</span> : "—"} hint={invoice.transactionRef ? `ref ${invoice.transactionRef}` : "no reference yet"} icon={Landmark} tone="violet" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Evidence */}
        <Panel title="Payment evidence" subtitle="What the merchant handed over" icon={FileText} className="lg:col-span-2">
          <dl className="grid gap-x-6 sm:grid-cols-2">
            <Field label="Method">{invoice.paymentMethod || "not submitted"}</Field>
            <Field label="Transaction ref">{invoice.transactionRef ? <span className="font-mono text-xs">{invoice.transactionRef}</span> : "—"}</Field>
            <Field label="Gateway tracker">{invoice.gatewayRef ? <span className="font-mono text-xs">{invoice.gatewayRef}</span> : "manual transfer (no card session)"}</Field>
            <Field label="Collected by gateway">{invoice.gatewayAmount ? formatPKR(invoice.gatewayAmount / 100) : "—"}</Field>
            <Field label="Hosted checkout">
              <span className={`inline-flex items-center gap-1.5 font-semibold ${invoice.checkoutOpen ? "text-sky-700" : "text-slate-500"}`}>
                {invoice.checkoutOpen ? <ExternalLink className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                {invoice.checkoutOpen ? "open — resumable" : "closed"}
              </span>
            </Field>
            <Field label="Receipt">{invoice.paymentProof ? <a href={invoice.paymentProof} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-red-700 hover:underline">open screenshot <ExternalLink className="h-3.5 w-3.5" /></a> : "none uploaded"}</Field>
            <Field label="Raised">{formatDateTime(invoice.createdAt)}</Field>
            <Field label="Submitted">{formatDateTime(invoice.submittedAt)}</Field>
            <Field label="Paid">{formatDateTime(invoice.paidAt)}</Field>
            <Field label="Age of invoice">{formatAgo(invoice.createdAt)}</Field>
          </dl>

          {invoice.paymentProof && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Uploaded screenshot</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={invoice.paymentProof}
                alt={`Payment receipt for ${invoice.invoiceNumber}`}
                className="max-h-64 w-auto rounded-xl border border-slate-200 object-contain"
              />
            </div>
          )}

          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Money verification</p>
            <ul className="mt-2 space-y-1.5 text-xs">
              <li className="flex items-start gap-2">
                {amountMatches ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> : <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />}
                <span className="text-slate-600">
                  <span className="font-mono tabular-nums">{formatNumber(invoice.totalEntries)}</span> × <span className="font-mono tabular-nums">{formatPKR(invoice.unitPrice)}</span> ={" "}
                  <span className="font-mono tabular-nums">{formatPKR(expectedTotal)}</span> against a due amount of{" "}
                  <span className="font-mono tabular-nums">{formatPKR(invoice.amountDue)}</span>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                {priceMatches ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> : <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />}
                <span className="text-slate-600">
                  Batch unit price {priceMatches ? "matches" : "differs from"} the campaign&apos;s current ticket price
                  {campaign ? <> (<span className="font-mono tabular-nums">{formatPKR(campaign.ticketPrice)}</span>)</> : null}. A difference is normal after the price was changed
                  post-invoice, but worth reading before confirming.
                </span>
              </li>
              {invoice.gatewayAmount ? (
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span className="text-slate-600">
                    Card session was opened for <span className="font-mono tabular-nums">{formatPKR(invoice.gatewayAmount / 100)}</span>; a capture only settles when it matches exactly.
                  </span>
                </li>
              ) : null}
            </ul>
          </div>
        </Panel>

        {/* Notes */}
        <Panel title="Admin note" subtitle="Internal only — never shown to the merchant" icon={Users}>
          <Textarea
            value={notes}
            rows={7}
            onChange={(e) => {
              setNotes(e.target.value)
              setNotesDirty(e.target.value !== (invoice.adminNotes ?? ""))
            }}
            placeholder="Reconciliation remarks, follow-ups, exceptions…"
            className="resize-y text-sm"
          />
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-[11px] text-slate-500">
              {notesDirty ? "unsaved changes" : invoice.adminNotes ? "note on record" : "no note yet"}
            </p>
            <div className="flex items-center gap-2">
              {notes !== (invoice.adminNotes ?? "") && (
                <Button size="sm" variant="outline" onClick={() => { setNotes(invoice.adminNotes ?? ""); setNotesDirty(false) }} disabled={savingNotes} className="h-8 rounded-lg">
                  Reset
                </Button>
              )}
              <Button size="sm" onClick={saveNotes} disabled={!notesDirty || savingNotes} className="h-8 gap-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-500">
                {savingNotes ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Save note
              </Button>
            </div>
          </div>
          <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
            Confirming or rejecting the money itself happens in <Link href="/admin/payments" className="font-semibold text-red-700 hover:underline">Payments</Link>, which then settles
            these tickets. This page never moves a rupee.
          </p>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Store + campaign */}
        <Panel title="Parties" subtitle="Who owes what to whom" icon={StoreIcon}>
          <dl className="divide-y divide-slate-100">
            <Field label="Store">
              <Link href={`/admin/merchants/${invoice.storeId}`} className="font-semibold text-slate-900 hover:text-red-700 hover:underline">
                {store?.name ?? "Unknown store"}
              </Link>
            </Field>
            <Field label="Domain">
              {store ? (
                <a href={`https://${store.storeUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono text-xs text-slate-700 hover:text-red-700">
                  {store.storeUrl} <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                "—"
              )}
            </Field>
            <Field label="Store status">{store ? <StatusBadge status={store.status} /> : "—"}</Field>
            <Field label="Contact">
              {store ? <>{store.contactEmail} <span className="text-slate-300">·</span> <span className="font-mono">{store.contactPhone}</span></> : "—"}
            </Field>
            <Field label="Payout details">{store?.payoutDetails || "not recorded"}</Field>
            <Field label="Campaign">
              <Link href={`/admin/merchants/campaigns/${invoice.campaignId}`} className="inline-flex items-center gap-1.5 text-slate-900 hover:text-red-700 hover:underline">
                <Layers className="h-4 w-4 text-slate-400" />
                <span className="font-semibold">{invoice.campaignTitle ?? "campaign"}</span>
              </Link>
            </Field>
            {campaign && (
              <Field label="Campaign stage">
                <span className="inline-flex flex-wrap items-center gap-2">
                  <StatusBadge status={campaign.status} />
                  <span className="text-[11px] text-slate-500">{formatNumber(campaign.currentEntries)} live tickets · draw {formatDate(campaign.endDate)}</span>
                </span>
              </Field>
            )}
          </dl>
        </Panel>

        {/* Pay-in accounts */}
        <Panel title="Pay-in accounts" subtitle="Where this batch should have been transferred" icon={Landmark} className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {detail.settlementAccounts.map((account) => {
              const match = matchingAccounts.some((m) => m.key === account.key)
              return (
                <div key={account.key} className={`rounded-xl border p-3 ${match ? "border-red-200 bg-red-50/50" : "border-slate-200 bg-white"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{account.label}</p>
                    {match && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">declared method</span>}
                  </div>
                  <dl className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Title</dt>
                      <dd className="text-right font-medium text-slate-800">{account.accountName}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Account</dt>
                      <dd className="text-right font-mono text-slate-800">{account.accountNumber}</dd>
                    </div>
                    {account.iban && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">IBAN</dt>
                        <dd className="text-right font-mono text-slate-800 break-all">{account.iban}</dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Methods</dt>
                      <dd className="text-right font-mono text-[11px] text-slate-600">{account.methods.join(", ")}</dd>
                    </div>
                  </dl>
                </div>
              )
            })}
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            These are the published PakRaffle collection accounts (from the server environment). Manual transfers are reconciled here against the transaction reference the
            merchant submitted.
          </p>
        </Panel>
      </div>

      {/* Ledger */}
      <Panel
        title="Batch ledger"
        subtitle={`${formatNumber(filteredEntries.length)} ticket line${filteredEntries.length === 1 ? "" : "s"} billed in this invoice`}
        icon={Ticket}
        bodyClassName="p-0"
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ticket, order, customer, status…" className="h-9 w-56 rounded-lg pl-8 text-xs" />
          </div>
        }
      >
        {filteredEntries.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">
            {entries.length === 0 ? "No ticket line is attached to this invoice." : "No ledger line matches the search."}
          </p>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[940px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Ticket</th>
                    <th className="px-4 py-2.5 font-semibold">Order</th>
                    <th className="px-4 py-2.5 font-semibold">Customer</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Items</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Order value</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Fee</th>
                    <th className="px-4 py-2.5 font-semibold">Ticket status</th>
                    <th className="px-4 py-2.5 font-semibold">Payment</th>
                    <th className="px-4 py-2.5 font-semibold">Issued</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEntries.map((e) => (
                    <tr key={e.id} className={e.isTest ? "bg-slate-50/60" : "hover:bg-slate-50/70"}>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <span className="font-mono text-xs font-semibold tabular-nums text-slate-900">{e.ticketNumber}</span>
                        {e.isTest && <span className="ml-1.5 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">SIM</span>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-xs text-slate-600">{e.orderName || e.shopifyOrderId}</td>
                      <td className="px-4 py-2.5">
                        <p className="text-xs font-semibold text-slate-800">{e.customerName}</p>
                        <p className="text-[11px] text-slate-500">{e.customerEmail || e.customerPhone || "—"}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono text-xs tabular-nums text-slate-700">{formatNumber(e.itemCount)}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono text-xs tabular-nums text-slate-700">{formatPKR(e.orderAmount)}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right font-mono text-xs tabular-nums text-slate-700">{formatPKR(invoice.unitPrice)}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={e.status} /></td>
                      <td className="px-4 py-2.5"><PaymentChip status={e.paymentStatus} /></td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-[11px] text-slate-500">{formatDate(e.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-slate-200 bg-slate-50 text-xs">
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-600" colSpan={5}>
                      {formatNumber(filteredEntries.length)} line{filteredEntries.length === 1 ? "" : "s"} shown
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold tabular-nums text-slate-900">
                      {formatPKR(filteredEntries.length * invoice.unitPrice)}
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-slate-500" colSpan={3}>
                      at {formatPKR(invoice.unitPrice)} per ticket
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {filteredEntries.map((e) => (
                <div key={e.id} className={`p-4 ${e.isTest ? "bg-slate-50/60" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold tabular-nums text-slate-900">
                        {e.ticketNumber}
                        {e.isTest && <span className="ml-1.5 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">SIM</span>}
                      </p>
                      <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{e.customerName}</p>
                      <p className="text-[11px] text-slate-500">{e.orderName || e.shopifyOrderId} · {formatNumber(e.itemCount)} items · {formatPKR(e.orderAmount)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <StatusBadge status={e.status} />
                      <PaymentChip status={e.paymentStatus} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Panel>
    </div>
  )
}
