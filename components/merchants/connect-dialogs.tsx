"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ShieldAlert, Store } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, Btn, CopyField, Field, TextArea, TextInput, merchantApi } from "./ui"

const dialogClass =
  "max-h-[92vh] overflow-y-auto border-slate-200 bg-white text-slate-900 sm:max-w-xl sm:rounded-2xl [&>button]:text-slate-600"

interface Credentials {
  apiKey: string
  webhookSecret: string
  webhookUrl: string
  storeUrl: string
}

export function ConnectStoreDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial?: { name?: string; storeUrl?: string }
}) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: initial?.name || "",
    storeUrl: initial?.storeUrl || "",
    contactEmail: "",
    contactPhone: "",
    payoutDetails: "",
    webhookSecret: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<Credentials | null>(null)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await merchantApi<any>("/api/merchants/connect", {
        method: "POST",
        json: { ...form, webhookSecret: form.webhookSecret.trim() || undefined },
      })
      setCredentials({
        apiKey: data.credentials.apiKey,
        webhookSecret: data.credentials.webhookSecret,
        webhookUrl: data.webhookUrl,
        storeUrl: data.store.storeUrl,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (!credentials ? onOpenChange(v) : v && onOpenChange(v))}>
      <DialogContent className={dialogClass}>
        {credentials ? (
          <div className="space-y-5">
            <DialogHeader>
              <DialogTitle className="text-lg text-slate-900">Store connected</DialogTitle>
              <DialogDescription className="text-slate-600">
                <span className="font-mono text-emerald-700">{credentials.storeUrl}</span> is live on PakRaffle Merchant Connect.
              </DialogDescription>
            </DialogHeader>

            <Alert tone="error">
              <span className="inline-flex items-start gap-2">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                Save your API key now — it is shown only once. You need it to log in to the dashboard.
              </span>
            </Alert>

            <CopyField label="API key (dashboard login)" value={credentials.apiKey} />
            <CopyField label="Webhook URL" value={credentials.webhookUrl} />
            <CopyField label="Webhook signing secret" value={credentials.webhookSecret} secret />

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
              <p className="mb-1.5 font-semibold text-slate-800">Shopify setup · 2 minutes</p>
              <ol className="list-decimal space-y-1 pl-4">
                <li>Shopify Admin → Settings → Notifications → Webhooks → Create webhook.</li>
                <li>
                  Event <span className="font-mono text-slate-800">Order fulfillment</span> · Format JSON · URL above.
                </li>
                <li>
                  Add <span className="font-mono text-slate-800">Order cancellation</span> and{" "}
                  <span className="font-mono text-slate-800">Refund create</span> to auto-void tickets.
                </li>
                <li>Copy Shopify&apos;s signing secret into Dashboard → Settings so signatures verify.</li>
              </ol>
            </div>

            <Btn className="w-full" onClick={() => router.push("/merchants/dashboard")}>
              Open merchant dashboard <ArrowRight className="h-4 w-4" />
            </Btn>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg text-slate-900">
                <Store className="h-5 w-5 text-emerald-600" /> Connect your Shopify store
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Free to connect. You only pay per ticket on orders you actually ship.
              </DialogDescription>
            </DialogHeader>

            {error && <Alert>{error}</Alert>}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Store name">
                <TextInput required value={form.name} onChange={set("name")} placeholder="Zubair Apparel" />
              </Field>
              <Field label="Shopify domain">
                <TextInput
                  required
                  value={form.storeUrl}
                  onChange={set("storeUrl")}
                  placeholder="mystore.myshopify.com"
                  className="font-mono"
                />
              </Field>
              <Field label="Contact email">
                <TextInput required type="email" value={form.contactEmail} onChange={set("contactEmail")} placeholder="owner@store.pk" />
              </Field>
              <Field label="WhatsApp number">
                <TextInput required value={form.contactPhone} onChange={set("contactPhone")} placeholder="0300 1234567" />
              </Field>
            </div>

            <Field label="Raast / IBFT payout details" hint="Optional · used for refunds and prize coordination">
              <TextArea value={form.payoutDetails} onChange={set("payoutDetails")} placeholder="Bank · Account title · IBAN / Raast ID" />
            </Field>

            <Field
              label="Shopify webhook signing secret"
              hint="Optional · leave blank and we generate one. You can paste Shopify's secret later in Settings."
            >
              <TextInput value={form.webhookSecret} onChange={set("webhookSecret")} placeholder="Paste from Shopify → Webhooks" className="font-mono" />
            </Field>

            <Btn type="submit" loading={loading} className="w-full">
              Connect store <ArrowRight className="h-4 w-4" />
            </Btn>

            <p className="text-center text-[11px] text-slate-500">
              Connecting while signed in links the store to your merchant account.{" "}
              <button
                type="button"
                onClick={() => router.push("/auth/merchant/login")}
                className="text-slate-600 transition hover:text-emerald-600"
              >
                Sign in first
              </button>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
