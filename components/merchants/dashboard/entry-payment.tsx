"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { CheckCircle2, ImageUp, Wallet } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Alert, Btn, CopyField, Field, SelectInput, Sep, TextInput, formatPKR, merchantApi } from "../ui"
import { dialogClass } from "./campaigns"
import { PAYMENT_METHOD_LABELS, type EntryDTO, type SettlementAccount } from "./types"

const MAX_RECEIPT_BYTES = 8 * 1024 * 1024

/**
 * Pays a single ticket without waiting for the batch invoice. The payment is filed against the
 * Shopify customer's PakRaffle account, so it is confirmed in Admin → Payments like any purchase.
 */
export function EntryPaymentDialog({
  entry,
  amount,
  settlementAccounts,
  onClose,
  onSubmitted,
}: {
  entry: EntryDTO | null
  amount: number
  settlementAccounts: SettlementAccount[]
  onClose: () => void
  onSubmitted: () => Promise<void> | void
}) {
  const [form, setForm] = useState({ paymentMethod: "RAAST", transactionRef: "", paymentProof: "" })
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Keyed on the id: the entry feed polls every 15s and hands back fresh objects mid-typing.
  const entryId = entry?.id ?? null
  useEffect(() => {
    if (!entryId) return
    setForm({ paymentMethod: "RAAST", transactionRef: "", paymentProof: "" })
    setError(null)
    setDone(false)
  }, [entryId])

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) return setError("Upload the receipt as an image (screenshot or photo).")
    if (file.size > MAX_RECEIPT_BYTES) return setError("Receipt image must be under 8 MB.")
    setUploading(true)
    setError(null)
    try {
      const body = new FormData()
      body.append("file", file)
      body.append("folder", "merchant-entries")
      const data = await merchantApi<{ url: string }>("/api/upload/cloudinary", { method: "POST", body })
      setForm((f) => ({ ...f, paymentProof: data.url }))
    } catch (err: any) {
      setError(err.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!entry) return
    if (!form.paymentProof) return setError("Upload your payment receipt first.")
    setSubmitting(true)
    setError(null)
    try {
      await merchantApi(`/api/merchants/me/entries/${entry.id}/pay`, { method: "POST", json: form })
      setDone(true)
      await onSubmitted()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const matchingAccounts = settlementAccounts.filter((a) => a.methods.includes(form.paymentMethod))
  const accounts = matchingAccounts.length > 0 ? matchingAccounts : settlementAccounts.slice(0, 1)

  return (
    <Dialog open={Boolean(entry)} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={cn(dialogClass, "sm:max-w-lg")}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg text-slate-100">
            <Wallet className="h-5 w-5 text-emerald-400" />
            <span className="font-mono tabular-nums">{entry?.ticketNumber || "Ticket"}</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {entry ? (
              <>
                {entry.customerName}
                <Sep />
                {entry.orderName || `#${entry.shopifyOrderId}`}
                <Sep />
                <span className="font-mono tabular-nums text-emerald-300">{formatPKR(amount)}</span>
              </>
            ) : (
              "Loading ticket…"
            )}
          </DialogDescription>
        </DialogHeader>

        {done && entry && (
          <div className="space-y-4">
            <Alert tone="success">
              <span className="inline-flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                Payment submitted. PakRaffle will confirm it and add the raffle entry to {entry.customerName}&apos;s
                account.
              </span>
            </Alert>
            <Btn variant="secondary" className="w-full" onClick={onClose}>
              Close
            </Btn>
          </div>
        )}

        {!done && entry && (
          <form onSubmit={submit} className="space-y-4">
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
                <CopyField label="Reference (add to transfer note)" value={entry.ticketNumber} />
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

            {error && <Alert>{error}</Alert>}

            <Btn type="submit" className="w-full" loading={submitting} disabled={uploading}>
              Submit {formatPKR(amount)} payment
            </Btn>

            <p className="text-[11px] leading-relaxed text-slate-500">
              This payment is recorded under {entry.customerName}&apos;s PakRaffle account. Confirmation is manual — usually
              within a few hours.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
