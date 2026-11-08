"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, Flag, Loader2, ShieldAlert } from "lucide-react"
import { CONTAINER, Mesh, PANEL, SHELL } from "@/components/marketing/kit"
import { COMPLAINT_ENDPOINT, emailField, submitToFormbold } from "@/lib/forms"
import { SUPPORT_EMAIL } from "@/lib/support-links"

// The reason travels as its own field so the complaints inbox can be triaged without opening
// every message.
const COMPLAINT_REASONS = [
  "Seller is not honouring the draw or prize",
  "Prize promised but never delivered",
  "Suspected fake or misleading campaign",
  "Payment or refund problem with the seller",
  "Unfair or unclear qualifying rule",
  "Something else",
]

const FIELD =
  "w-full rounded-2xl border border-slate-900/10 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
const CONTEXT_FIELD = `${FIELD} bg-slate-50 font-mono text-[12.5px] text-slate-700`

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{children}</span>
}

export default function MakeComplaintClient() {
  const searchParams = useSearchParams()

  // Seller details arrive via the query string when someone clicks "Report this seller" on a ticket.
  const [form, setForm] = useState({
    seller: searchParams.get("seller") || "",
    domain: searchParams.get("domain") || "",
    ticket: searchParams.get("ticket") || "",
    order: searchParams.get("order") || "",
    campaign: searchParams.get("campaign") || "",
    name: "",
    contact: "",
    reason: COMPLAINT_REASONS[0],
    details: "",
  })
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle")
  const [error, setError] = useState<string | null>(null)

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus("submitting")
    setError(null)

    if (!COMPLAINT_ENDPOINT) {
      setError("Complaints are temporarily unavailable. Please report to PakRaffle support at " + SUPPORT_EMAIL + ".")
      setStatus("idle")
      return
    }

    try {
      await submitToFormbold(COMPLAINT_ENDPOINT, {
        name: form.name,
        // Reporters type an email or a WhatsApp number; only a real address goes in `email`.
        email: emailField(form.contact),
        reporterContact: form.contact,
        sellerName: form.seller,
        sellerDomain: form.domain,
        ticketNumber: form.ticket,
        orderName: form.order,
        campaignTitle: form.campaign,
        reason: form.reason,
        message: form.details,
        subject: `Seller complaint — ${form.seller || form.domain || "unknown store"}`,
      })
      setStatus("success")
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't file that complaint. Please try again.")
      setStatus("idle")
    }
  }

  return (
    <div className={SHELL}>
      <section className="relative overflow-hidden border-b border-slate-900/5">
        <Mesh tone="sky" />
        <div className={`${CONTAINER} relative pb-10 pt-24 sm:pb-14 sm:pt-28`}>
          <div className="mx-auto max-w-2xl">
            <Link
              href="/lookup/store-ticket"
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to ticket lookup
            </Link>

            <div className="mt-5 flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <div>
                <h1 className="font-display text-[1.9rem] font-semibold leading-[1.05] tracking-[-0.03em] text-slate-900 sm:text-[2.3rem]">
                  Report a seller
                </h1>
                <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-slate-600">
                  Tell PakRaffle what went wrong with a Merchant Connect store. We review every report against the
                  seller&apos;s account — your message is confidential and never shown to them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${CONTAINER} pb-20 pt-10`}>
        <div className="mx-auto max-w-2xl">
          {status === "success" ? (
            <div className={`${PANEL} p-8 text-center`}>
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold tracking-tight text-slate-900">Complaint received</h2>
              <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-slate-600">
                Thank you. Our trust &amp; safety team will review your report
                {form.seller ? (
                  <>
                    {" "}about <span className="font-semibold text-slate-800">{form.seller}</span>
                  </>
                ) : null}
                . We only contact you if we need more detail.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
                <Link
                  href="/lookup/store-ticket"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-emerald-600 px-6 text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  Check another ticket
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("idle")
                    setForm((prev) => ({ ...prev, name: "", contact: "", reason: COMPLAINT_REASONS[0], details: "" }))
                  }}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-slate-900/10 px-5 text-sm font-semibold text-slate-700 transition hover:bg-white"
                >
                  File another report
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className={`${PANEL} space-y-5 p-6 sm:p-7`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Seller &amp; ticket</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <Label>Seller name</Label>
                  <input type="text" required value={form.seller} onChange={set("seller")} placeholder="Store name" className={CONTEXT_FIELD} />
                </label>
                <label className="space-y-1.5">
                  <Label>Seller domain / link</Label>
                  <input type="text" value={form.domain} onChange={set("domain")} placeholder="brand.myshopify.com" className={CONTEXT_FIELD} />
                </label>
                <label className="space-y-1.5">
                  <Label>Ticket number</Label>
                  <input type="text" value={form.ticket} onChange={set("ticket")} placeholder="PKR-SHOPIFY-XXXX" className={CONTEXT_FIELD} />
                </label>
                <label className="space-y-1.5">
                  <Label>Order number</Label>
                  <input type="text" value={form.order} onChange={set("order")} placeholder="#1042" className={CONTEXT_FIELD} />
                </label>
              </div>

              <label className="block space-y-1.5">
                <Label>Campaign</Label>
                <input type="text" value={form.campaign} onChange={set("campaign")} placeholder="Draw or campaign title" className={CONTEXT_FIELD} />
              </label>

              <div className="mt-2 border-t border-slate-900/5 pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">About you</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <Label>Your name</Label>
                  <input type="text" required value={form.name} onChange={set("name")} placeholder="e.g. Ayesha Khan" className={FIELD} />
                </label>
                <label className="space-y-1.5">
                  <Label>Email or WhatsApp</Label>
                  <input type="text" required value={form.contact} onChange={set("contact")} placeholder="name@example.com or 03XX XXXXXXX" className={FIELD} />
                </label>
              </div>

              <label className="block space-y-1.5">
                <Label>What went wrong?</Label>
                <div className="relative">
                  <select value={form.reason} onChange={set("reason")} className={`${FIELD} cursor-pointer appearance-none pr-10`}>
                    {COMPLAINT_REASONS.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                  <svg
                    aria-hidden
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </label>

              <label className="block space-y-1.5">
                <Label>Details</Label>
                <textarea
                  required
                  rows={5}
                  value={form.details}
                  onChange={set("details")}
                  placeholder="Describe what happened — dates, what you were promised, and any order or payment reference."
                  className={`${FIELD} min-h-[130px] resize-y leading-relaxed`}
                />
              </label>

              {error && (
                <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-[12.5px] font-medium leading-relaxed text-rose-700">
                  {error}{" "}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="font-semibold underline underline-offset-2"
                  >
                    Email our complaints desk
                  </a>
                  .
                </p>
              )}

              <div className="flex flex-col gap-2.5 border-t border-slate-900/5 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-[18rem] text-[11px] leading-relaxed text-slate-500">
                  Delivery, returns and refunds stay between you and the store — but we act on draw and prize conduct.
                </p>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-[0_14px_34px_-16px_rgba(5,150,105,0.9)] transition hover:bg-emerald-500 disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Filing complaint
                    </>
                  ) : (
                    <>
                      <Flag className="h-4 w-4" />
                      Submit complaint
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
