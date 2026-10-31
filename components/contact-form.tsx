"use client"

import { useState } from "react"
import { CheckCircle2, Loader2, Send } from "lucide-react"

const INPUT =
  "w-full rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"

const CATEGORIES = [
  "Ticket Payment & Receipt Verification",
  "Draw Schedule & 100% Target Ticket Rule",
  "Prize Claim & Handover Logistics",
  "Account & Profile Questions",
  "Partnership & Collaboration",
  "Other Inquiries",
]

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  category: CATEGORIES[0],
  orderId: "",
  message: "",
}

function Label({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="flex items-baseline justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
      {children}
      {required && <span className="font-mono text-[10px] normal-case tracking-normal text-emerald-700">required</span>}
    </span>
  )
}

export function ContactForm() {
  const [formData, setFormData] = useState(EMPTY)
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("submitting")

    // Simulate reliable dispatch
    setTimeout(() => {
      setStatus("success")
    }, 800)
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-emerald-500/25 bg-emerald-50/60 p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-700">Inquiry logged</p>
        <h4 className="mt-2 font-display text-xl font-semibold tracking-tight text-slate-900">
          Message received successfully
        </h4>
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-slate-600">
          Thank you, {formData.name || "Customer"}. Your inquiry has been routed to our support desk. We will contact
          you via WhatsApp or email within 15 to 30 minutes.
        </p>
        <button
          type="button"
          onClick={() => {
            setFormData(EMPTY)
            setStatus("idle")
          }}
          className="mt-5 inline-flex min-h-[40px] items-center justify-center rounded-xl border border-emerald-600/25 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <Label required>Full name</Label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Muhammad Ali"
            className={INPUT}
          />
        </label>

        <label className="space-y-1.5">
          <Label required>Phone / WhatsApp</Label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="03XX XXXXXXX"
            className={INPUT}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <Label required>Email address</Label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="name@example.com"
            className={INPUT}
          />
        </label>

        <label className="space-y-1.5">
          <Label>Ticket / order ID</Label>
          <input
            type="text"
            value={formData.orderId}
            onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
            placeholder="TKT-98214"
            className={`${INPUT} font-mono`}
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <Label required>Inquiry department</Label>
        <div className="relative">
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className={`${INPUT} cursor-pointer appearance-none pr-10`}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
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
        <Label required>Your message</Label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Describe your question or issue in detail — include the transaction ID if your payment needs verification."
          className={`${INPUT} min-h-[132px] resize-y leading-relaxed`}
        />
      </label>

      <div className="flex flex-col gap-3 border-t border-slate-900/5 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[16rem] text-[11px] leading-relaxed text-slate-500">
          We reply within 15 minutes on average, 7 days a week.
        </p>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_-16px_rgba(5,150,105,0.9)] transition hover:bg-emerald-500 disabled:opacity-50 sm:w-auto"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending message
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit inquiry
            </>
          )}
        </button>
      </div>
    </form>
  )
}
