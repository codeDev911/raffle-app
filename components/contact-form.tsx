"use client"

import { useState } from "react"
import { Send, CheckCircle2, Loader2 } from "lucide-react"

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "Ticket Payment & Receipt Verification",
    orderId: "",
    message: "",
  })
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
      <div className="p-8 text-center space-y-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-base sm:text-lg font-bold text-gray-900">Message Received Successfully</h4>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
            Thank you, {formData.name || "Customer"}. Your inquiry has been routed to our support desk. We will contact you via WhatsApp or email within 15 to 30 minutes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFormData({
              name: "",
              email: "",
              phone: "",
              category: "Ticket Payment & Receipt Verification",
              orderId: "",
              message: "",
            })
            setStatus("idle")
          }}
          className="text-xs font-bold text-emerald-800 hover:underline pt-2 inline-block"
        >
          Send Another Message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            Full Name <span className="text-emerald-700">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Muhammad Ali"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            Phone / WhatsApp Number <span className="text-emerald-700">*</span>
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="03XX XXXXXXX"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            Email Address <span className="text-emerald-700">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="name@example.com"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            Ticket / Order ID (Optional)
          </label>
          <input
            type="text"
            value={formData.orderId}
            onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
            placeholder="e.g. TKT-98214"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
          Inquiry Department <span className="text-emerald-700">*</span>
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-colors text-gray-800"
        >
          <option value="Ticket Payment & Receipt Verification">Ticket Payment & Receipt Verification</option>
          <option value="Draw Schedule & 100% Target Ticket Rule">Draw Schedule & 100% Target Ticket Rule</option>
          <option value="Prize Claim & Handover Logistics">Prize Claim & Handover Logistics</option>
          <option value="Account & Profile Questions">Account & Profile Questions</option>
          <option value="Partnership & Collaboration">Partnership & Collaboration</option>
          <option value="Other Inquiries">Other Inquiries</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
          Your Message <span className="text-emerald-700">*</span>
        </label>
        <textarea
          required
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Please describe your question or issue in detail..."
          className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-colors resize-none"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending Message...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Inquiry</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
