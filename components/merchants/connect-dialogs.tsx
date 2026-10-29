"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, KeyRound, ShieldAlert, Store } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, Btn, CopyField, Field, TextArea, TextInput, merchantApi } from "./ui"

const dialogClass =
  "max-h-[92vh] overflow-y-auto border-slate-800 bg-[#111827] text-slate-100 sm:max-w-xl sm:rounded-2xl [&>button]:text-slate-400"

interface Credentials {
  apiKey: string
  webhookSecret: string
  webhookUrl: string
  storeUrl: string
}

export function ConnectStoreDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    storeUrl: "",
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
              <DialogTitle className="text-lg text-slate-100">Store connected</DialogTitle>
              <DialogDescription className="text-slate-400">
                <span className="font-mono text-emerald-300">{credentials.storeUrl}</span> is live on PakRaffle Merchant Connect.
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

            <div className="rounded-xl border border-slate-800 bg-[#0B0F19] p-4 text-xs leading-relaxed text-slate-400">
              <p className="mb-1.5 font-semibold text-slate-200">Shopify setup · 2 minutes</p>
              <ol className="list-decimal space-y-1 pl-4">
                <li>Shopify Admin → Settings → Notifications → Webhooks → Create webhook.</li>
                <li>
                  Event <span className="font-mono text-slate-200">Order fulfillment</span> · Format JSON · URL above.
                </li>
                <li>
                  Add <span className="font-mono text-slate-200">Order cancellation</span> and{" "}
                  <span className="font-mono text-slate-200">Refund create</span> to auto-void tickets.
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
              <DialogTitle className="flex items-center gap-2 text-lg text-slate-100">
                <Store className="h-5 w-5 text-emerald-400" /> Connect your Shopify store
              </DialogTitle>
              <DialogDescription className="text-slate-400">
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
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function MerchantLoginDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter()
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await merchantApi("/api/merchants/login", { method: "POST", json: { apiKey } })
      router.push("/merchants/dashboard")
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogClass}>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-slate-100">
              <KeyRound className="h-5 w-5 text-emerald-400" /> Merchant login
            </DialogTitle>
            <DialogDescription className="text-slate-400">Use the API key issued when you connected your store.</DialogDescription>
          </DialogHeader>
          {error && <Alert>{error}</Alert>}
          <Field label="API key">
            <TextInput
              required
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="prk_live_…"
              className="font-mono"
            />
          </Field>
          <Btn type="submit" loading={loading} className="w-full">
            Open dashboard <ArrowRight className="h-4 w-4" />
          </Btn>
        </form>
      </DialogContent>
    </Dialog>
  )
}
