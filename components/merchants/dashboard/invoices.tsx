"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { CheckCircle2, FileText, ImageUp, Receipt, ShieldAlert } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  Alert,
  Btn,
  CopyField,
  EmptyState,
  Field,
  Panel,
  PanelHeader,
  SelectInput,
  Sep,
  StatusText,
  TextInput,
  formatDate,
  formatNumber,
  formatPKR,
  merchantApi,
} from "../ui"
import { dialogClass } from "./campaigns"
import { entryStatusKey } from "./shared"
import { PAYMENT_METHOD_LABELS, type InvoiceDTO, type InvoiceDetail } from "./types"

const MAX_RECEIPT_BYTES = 8 * 1024 * 1024

export function InvoicesTab({
  invoices,
  openInvoiceId,
  onOpenHandled,
  onChanged,
}: {
  invoices: InvoiceDTO[]
  openInvoiceId: string | null
  onOpenHandled: () => void
  onChanged: () => Promise<void> | void
}) {
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    if (openInvoiceId) {
      setSelected(openInvoiceId)
      onOpenHandled()
    }
  }, [openInvoiceId, onOpenHandled])

  const outstanding = invoices.filter((i) => i.status !== "PAID").reduce((sum, i) => sum + i.amountDue, 0)

  return (
    <>
      <Panel>
        <PanelHeader
          title="Batch Invoices"
          description={
            <>
              Outstanding <span className="font-mono tabular-nums text-slate-300">{formatPKR(outstanding)}</span>
              <Sep />
              pay via Raast, IBFT or wallet and upload the receipt for verification
            </>
          }
        />
        {invoices.length === 0 ? (
          <EmptyState icon={Receipt} title="No invoices yet">
            Close a campaign batch with “Review & Settle Batch Invoice” to bill its fulfilled-order tickets.
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-2.5 font-medium">Invoice</th>
                  <th className="px-3 py-2.5 font-medium">Campaign</th>
                  <th className="px-3 py-2.5 text-right font-medium">Tickets</th>
                  <th className="px-3 py-2.5 text-right font-medium">Amount</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 text-right font-medium">Issued</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelected(inv.id)}
                    className="cursor-pointer text-slate-300 transition hover:bg-slate-800/30"
                  >
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs tabular-nums text-slate-100">{inv.invoiceNumber}</td>
                    <td className="max-w-[220px] truncate px-3 py-3 text-slate-300">{inv.campaignTitle || "—"}</td>
                    <td className="px-3 py-3 text-right font-mono text-xs tabular-nums">{formatNumber(inv.totalEntries)}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-100">{formatPKR(inv.amountDue)}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <StatusText status={inv.status} />
                      {inv.status === "PENDING" && inv.adminNotes && (
                        <p className="mt-0.5 text-[11px] text-rose-300">Payment rejected · resubmit</p>
                      )}
                      {inv.status === "PENDING" && !inv.adminNotes && inv.submittedAt && (
                        <p className="mt-0.5 text-[11px] text-rose-300">Transfer failed · resubmit</p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right text-xs text-slate-500">{formatDate(inv.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <InvoiceDetailDialog
        invoiceId={selected}
        onClose={() => setSelected(null)}
        onSubmitted={async () => {
          await onChanged()
        }}
      />
    </>
  )
}

function InvoiceDetailDialog({
  invoiceId,
  onClose,
  onSubmitted,
}: {
  invoiceId: string | null
  onClose: () => void
  onSubmitted: () => Promise<void> | void
}) {
  const [detail, setDetail] = useState<InvoiceDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ paymentMethod: "RAAST", transactionRef: "", paymentProof: "" })
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!invoiceId) return
    setDetail(null)
    setError(null)
    setSubmitError(null)
    setForm({ paymentMethod: "RAAST", transactionRef: "", paymentProof: "" })
    merchantApi<InvoiceDetail>(`/api/merchants/me/invoices/${invoiceId}`)
      .then(setDetail)
      .catch((err) => setError(err.message))
  }, [invoiceId])

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) return setSubmitError("Upload the receipt as an image (screenshot or photo).")
    if (file.size > MAX_RECEIPT_BYTES) return setSubmitError("Receipt image must be under 8 MB.")
    setUploading(true)
    setSubmitError(null)
    try {
      const body = new FormData()
      body.append("file", file)
      body.append("folder", "merchant-invoices")
      const data = await merchantApi<{ url: string }>("/api/upload/cloudinary", { method: "POST", body })
      setForm((f) => ({ ...f, paymentProof: data.url }))
    } catch (err: any) {
      setSubmitError(err.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invoiceId) return
    if (!form.paymentProof) return setSubmitError("Upload your payment receipt first.")
    setSubmitting(true)
    setSubmitError(null)
    try {
      const data = await merchantApi<InvoiceDetail>(`/api/merchants/me/invoices/${invoiceId}`, { method: "PATCH", json: form })
      setDetail(data)
      await onSubmitted()
    } catch (err: any) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const invoice = detail?.invoice
  const matchingAccounts = detail?.settlementAccounts.filter((a) => a.methods.includes(form.paymentMethod)) ?? []
  const accounts = matchingAccounts.length > 0 ? matchingAccounts : detail?.settlementAccounts.slice(0, 1) ?? []

  return (
    <Dialog open={Boolean(invoiceId)} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={cn(dialogClass, "sm:max-w-2xl")}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg text-slate-100">
            <FileText className="h-5 w-5 text-emerald-400" />
            <span className="font-mono tabular-nums">{invoice?.invoiceNumber || "Invoice"}</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {invoice ? (
              <>
                {invoice.campaignTitle}
                <Sep />
                issued {formatDate(invoice.createdAt)}
                <Sep />
                <StatusText status={invoice.status} />
              </>
            ) : (
              "Loading invoice…"
            )}
          </DialogDescription>
        </DialogHeader>

        {error && <Alert>{error}</Alert>}

        {invoice && detail && (
          <div className="space-y-5">
            {/* Summary */}
            <div className="grid grid-cols-3 divide-x divide-slate-800 rounded-xl border border-slate-800 bg-[#0B0F19]">
              <Figure label="Tickets" value={formatNumber(invoice.totalEntries)} />
              <Figure label="Rate" value={formatPKR(invoice.unitPrice)} />
              <Figure label="Amount due" value={formatPKR(invoice.amountDue)} accent />
            </div>

            {/* Itemised ledger */}
            <div>
              <p className="mb-2 text-xs font-medium text-slate-300">Itemised tickets</p>
              <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-slate-800/70">
                    {detail.entries.map((entry) => (
                      <tr key={entry.id} className="text-slate-300">
                        <td className="whitespace-nowrap px-3 py-2 font-mono tabular-nums text-emerald-300">{entry.ticketNumber}</td>
                        <td className="whitespace-nowrap px-3 py-2 font-mono tabular-nums">{entry.orderName || `#${entry.shopifyOrderId}`}</td>
                        <td className="max-w-[160px] truncate px-3 py-2 text-slate-400">{entry.customerName}</td>
                        <td className="whitespace-nowrap px-3 py-2">
                          <StatusText status={entryStatusKey(entry)} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right font-mono tabular-nums">{formatPKR(invoice.unitPrice)}</td>
                      </tr>
                    ))}
                    {detail.entries.length === 0 && (
                      <tr>
                        <td className="px-3 py-4 text-center text-slate-500">No billable tickets remain on this invoice.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {invoice.status === "PAID" && (
              <Alert tone="success">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Payment verified {formatDate(invoice.paidAt, true)}. Your campaign is ready for the draw.
                </span>
              </Alert>
            )}

            {invoice.status === "UNDER_REVIEW" && (
              <Alert tone="info">
                Payment submitted {formatDate(invoice.submittedAt, true)}
                <Sep />
                {PAYMENT_METHOD_LABELS[invoice.paymentMethod || ""] || invoice.paymentMethod}
                <Sep />
                ref <span className="font-mono">{invoice.transactionRef}</span>. One payment per customer is now waiting in
                PakRaffle&apos;s confirmation queue — usually a few hours. Wrong reference? Resubmit below.
              </Alert>
            )}

            {invoice.status === "PENDING" && invoice.submittedAt && (
              <Alert>
                <span className="inline-flex items-start gap-2">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  PakRaffle marked the transfer submitted {formatDate(invoice.submittedAt, true)} as failed, so these tickets are
                  unpaid again. Send the amount once more and resubmit the reference and receipt below.
                </span>
              </Alert>
            )}

            {invoice.paymentProof && (invoice.status !== "PENDING" || invoice.submittedAt) && (
              <a href={invoice.paymentProof} target="_blank" rel="noopener noreferrer" className="inline-flex text-xs text-emerald-400 hover:underline">
                View submitted receipt
              </a>
            )}

            {(invoice.status === "PENDING" || invoice.status === "UNDER_REVIEW") && (
              <form onSubmit={submit} className="space-y-4 border-t border-slate-800 pt-5">
                {invoice.adminNotes && (
                  <Alert>
                    <span className="inline-flex items-start gap-2">
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                      Previous payment was rejected: {invoice.adminNotes}
                    </span>
                  </Alert>
                )}

                <Field label="Payment method">
                  <SelectInput value={form.paymentMethod} onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}>
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </SelectInput>
                </Field>

                {accounts.map((account) => (
                  <div key={account.key} className="space-y-3 rounded-xl border border-slate-800 bg-[#0B0F19] p-4">
                    <p className="text-xs font-semibold text-slate-200">
                      {account.label}
                      <Sep />
                      <span className="font-normal text-slate-400">{account.accountName}</span>
                    </p>
                    <CopyField label="Account number" value={account.accountNumber} />
                    {account.iban && <CopyField label="IBAN" value={account.iban} />}
                    <CopyField label="Reference (add to transfer note)" value={invoice.invoiceNumber} />
                  </div>
                ))}

                <Field label="Transaction ID / reference">
                  <TextInput
                    required
                    minLength={4}
                    maxLength={100}
                    value={form.transactionRef}
                    onChange={(e) => setForm((f) => ({ ...f, transactionRef: e.target.value }))}
                    placeholder="e.g. 0123456789"
                    className="font-mono"
                  />
                </Field>

                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-300">Payment receipt</span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) upload(file)
                      e.target.value = ""
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex w-full items-center gap-3 rounded-xl border border-dashed border-slate-700 bg-[#0B0F19] px-4 py-3 text-left text-sm text-slate-400 transition hover:border-emerald-500/50 disabled:opacity-60"
                  >
                    {form.paymentProof ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.paymentProof} alt="Receipt" className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <ImageUp className="h-5 w-5 text-slate-500" />
                    )}
                    <span>
                      {uploading ? "Uploading…" : form.paymentProof ? "Receipt attached · click to replace" : "Upload screenshot of the transfer"}
                    </span>
                  </button>
                </div>

                {submitError && <Alert>{submitError}</Alert>}

                <Btn type="submit" className="w-full" loading={submitting} disabled={uploading}>
                  {invoice.status === "UNDER_REVIEW" || invoice.submittedAt
                    ? "Resubmit payment details"
                    : "Submit payment for verification"}
                </Btn>
              </form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Figure({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-4 py-3">
      <p className="text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className={cn("mt-1 font-mono text-lg font-semibold tabular-nums", accent ? "text-emerald-400" : "text-slate-100")}>{value}</p>
    </div>
  )
}
