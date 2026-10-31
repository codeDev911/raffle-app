"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, KeyRound, LogOut, RefreshCw, Search, Webhook } from "lucide-react"
import {
  Alert,
  Btn,
  CopyField,
  Field,
  Panel,
  PanelHeader,
  Sep,
  StatusText,
  TextArea,
  TextInput,
  TopicList,
  formatDate,
  formatPKR,
  merchantApi,
} from "../ui"
import type { MeResponse, StoreDTO } from "./types"
import { INTAKE_QUESTIONS, describeIntakeAnswer } from "@/lib/merchants/intake"
import { WEBHOOK_TOPICS } from "@/lib/merchants/webhook-topics"

export function SettingsTab({
  me,
  onStoreChanged,
  onLogout,
}: {
  me: MeResponse
  onStoreChanged: (store: StoreDTO) => Promise<void> | void
  onLogout: () => Promise<void> | void
}) {
  const [form, setForm] = useState({ name: "", contactEmail: "", contactPhone: "", payoutDetails: "" })
  const [secretInput, setSecretInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [rotating, setRotating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const [shopifyBusy, setShopifyBusy] = useState(false)
  const [shopifyNotice, setShopifyNotice] = useState<string | null>(null)

  useEffect(() => {
    setForm({
      name: me.store.name,
      contactEmail: me.store.contactEmail,
      contactPhone: me.store.contactPhone,
      payoutDetails: me.store.payoutDetails || "",
    })
  }, [me.store])

  const set =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setNotice(null)
    setRevealedSecret(null)
    try {
      const data = await merchantApi<{ store: StoreDTO; webhookSecret: string | null }>("/api/merchants/me/settings", {
        method: "PATCH",
        json: {
          ...form,
          payoutDetails: form.payoutDetails.trim() || null,
          ...(secretInput.trim() ? { webhookSecret: secretInput.trim() } : {}),
        },
      })
      setSecretInput("")
      await onStoreChanged(data.store)
      if (data.webhookSecret) setRevealedSecret(data.webhookSecret)
      setNotice("Settings saved")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const regenerate = async () => {
    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      const data = await merchantApi<{ store: StoreDTO; webhookSecret: string | null }>("/api/merchants/me/settings", {
        method: "PATCH",
        json: { regenerateWebhookSecret: true },
      })
      setSecretInput("")
      await onStoreChanged(data.store)
      if (data.webhookSecret) setRevealedSecret(data.webhookSecret)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const confirmShopify = async () => {
    setShopifyBusy(true)
    setError(null)
    setShopifyNotice(null)
    try {
      const data = await merchantApi<{ store: StoreDTO }>("/api/merchants/me/shopify", {
        method: "POST",
        json: { action: "confirm" },
      })
      await onStoreChanged(data.store)
      setShopifyNotice("Setup confirmed — qualifying orders will mint tickets.")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setShopifyBusy(false)
    }
  }

  const resetShopify = async () => {
    if (!window.confirm("Reset the Shopify setup? The checklist comes back until you confirm it again.")) return
    setShopifyBusy(true)
    setError(null)
    setShopifyNotice(null)
    try {
      const data = await merchantApi<{ store: StoreDTO }>("/api/merchants/me/shopify", {
        method: "POST",
        json: { action: "reset" },
      })
      await onStoreChanged(data.store)
      setShopifyNotice("Setup reset")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setShopifyBusy(false)
    }
  }

  const rotateKey = async () => {
    setRotating(true)
    setError(null)
    setNewApiKey(null)
    try {
      const data = await merchantApi<{ store: StoreDTO; apiKey: string }>("/api/merchants/me/rotate-key", { method: "POST" })
      await onStoreChanged(data.store)
      setNewApiKey(data.apiKey)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRotating(false)
    }
  }

  const widgetTag =
    me.integration.widgetSnippet ||
    (me.integration.widgetUrl ? `<script async src="${me.integration.widgetUrl}"></script>` : "")

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {/* Shopify connection */}
      <Panel className="xl:col-span-2">
        <PanelHeader
          title="Shopify setup"
          description={
            me.store.shopifyConnected
              ? `Set up on ${me.store.storeUrl} — webhooks verify against your signing secret.`
              : "Copy the webhook URL and the widget tag into your Shopify admin. Two minutes, one time."
          }
          action={
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
              <span className={`h-1.5 w-1.5 rounded-full ${me.store.shopifyConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
              {me.store.shopifyConnected ? "Connected" : "Not connected"}
            </span>
          }
        />

        <div className="space-y-5 p-5">
          {shopifyNotice && <Alert tone="success">{shopifyNotice}</Alert>}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="min-w-0 space-y-3">
              <CopyField label="Webhook URL" value={me.integration.webhookUrl} />
              <div className="space-y-2">
                <span className="text-xs font-medium text-slate-700">One webhook per event</span>
                <TopicList topics={WEBHOOK_TOPICS} />
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Pick the dropdown label on the left; Shopify delivers the topic on the right. Order creation mints the
                  ticket and fires the congratulations popup · cancellations and refunds void it.
                </p>
              </div>
            </div>

            <div className="min-w-0 space-y-3">
              <CopyField label="Storefront widget" value={widgetTag} wrap />
              <p className="text-[11px] leading-relaxed text-slate-500">
                Online Store → Themes → Edit code → <span className="font-mono text-slate-600">theme.liquid</span> — paste it
                just before <span className="font-mono text-slate-600">&lt;/head&gt;</span>.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
            <p className="mb-1.5 font-semibold text-slate-800">Shopify admin · 2 minutes</p>
            <ol className="list-decimal space-y-1 pl-4">
              <li>Settings → Notifications → Webhooks → Create webhook, one per topic above (JSON format).</li>
              <li>Copy the signing secret Shopify shows and paste it into Store profile → Shopify webhook signing secret.</li>
              <li>Add the widget tag to theme.liquid so shoppers see their free entry unlock in the cart and under the product details.</li>
            </ol>
          </div>

          <div className="flex flex-wrap gap-2">
            {me.store.shopifyConnected ? (
              <Btn variant="secondary" loading={shopifyBusy} onClick={resetShopify}>
                <RefreshCw className="h-4 w-4" /> Reset setup
              </Btn>
            ) : (
              <Btn loading={shopifyBusy} onClick={confirmShopify}>
                <CheckCircle2 className="h-4 w-4" /> I&apos;ve added both
              </Btn>
            )}
          </div>
        </div>

        <div className="grid gap-3 border-t border-slate-200 px-5 py-4 text-xs text-slate-500 sm:grid-cols-3">
          <p>
            Base ticket fee <span className="font-mono tabular-nums text-slate-700">{formatPKR(me.integration.entryFee)}</span>
            <span className="text-slate-400"> · linked raffles use their own price</span>
          </p>
          <p>
            API key <span className="font-mono text-slate-700">{me.store.apiKeyPrefix}</span>
          </p>
          <p>
            Records <span className="font-mono text-slate-700">{me.integration.storage}</span>
          </p>
        </div>
      </Panel>

      {/* Store profile */}
      <Panel>
        <PanelHeader title="Store profile" description="Contact and payout details used by the PakRaffle team" />
        <form onSubmit={save} className="space-y-4 p-5">
          {error && <Alert>{error}</Alert>}
          {notice && <Alert tone="success">{notice}</Alert>}
          {revealedSecret && (
            <Alert tone="info">
              New webhook secret — paste it into Shopify (Settings → Notifications → Webhooks → API secret) or deliveries will
              be rejected.
              <div className="mt-2">
                <CopyField label="Webhook signing secret" value={revealedSecret} secret />
              </div>
            </Alert>
          )}

          <Field label="Store name">
            <TextInput required minLength={2} maxLength={80} value={form.name} onChange={set("name")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact email">
              <TextInput required type="email" value={form.contactEmail} onChange={set("contactEmail")} />
            </Field>
            <Field label="WhatsApp number">
              <TextInput required value={form.contactPhone} onChange={set("contactPhone")} className="font-mono" />
            </Field>
          </div>
          <Field label="Raast / IBFT payout details">
            <TextArea value={form.payoutDetails} onChange={set("payoutDetails")} placeholder="Bank · Account title · IBAN / Raast ID" />
          </Field>

          <Field
            label="Shopify webhook signing secret"
            hint="Paste the secret from Shopify to keep signatures verifying. Leave blank to keep the current one."
          >
            <TextInput
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              placeholder={me.store.webhookSecretPreview}
              className="font-mono"
              autoComplete="off"
            />
          </Field>

          <div className="flex flex-wrap gap-2">
            <Btn type="submit" loading={saving}>
              Save settings
            </Btn>
            <Btn type="button" variant="secondary" onClick={regenerate} disabled={saving}>
              <RefreshCw className="h-4 w-4" /> Regenerate secret
            </Btn>
          </div>
        </form>
      </Panel>

      {/* Store profile — answers collected by the welcome wizard */}
      <Panel>
        <PanelHeader
          title="Store profile"
          description="The answers you gave when you joined"
          action={
            <Link
              href="/merchants/onboarding?step=tally"
              className="text-xs font-medium text-emerald-700 transition hover:text-emerald-600"
            >
              Update answers
            </Link>
          }
        />
        <dl className="divide-y divide-slate-200">
          {INTAKE_QUESTIONS.map((question) => (
            <div key={question.key} className="flex items-start justify-between gap-4 px-5 py-3 text-sm">
              <dt className="text-slate-600">
                Q{question.number} · {question.label}
              </dt>
              <dd className="text-right font-medium text-slate-900">
                {describeIntakeAnswer(question.key, me.store.intake?.answers)}
              </dd>
            </div>
          ))}
        </dl>
      </Panel>

      {/* Account */}
      <Panel>
        <PanelHeader title="Account" description="Store status, credentials and session" />
        <div className="space-y-5 p-5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-600">Store status</span>
            <StatusText status={me.store.status} />
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-600">Connected</span>
            <span className="font-mono tabular-nums text-slate-700">{formatDate(me.store.createdAt)}</span>
          </div>
          {me.store.status === "PAUSED" && (
            <Alert>
              PakRaffle has paused this store. Webhooks are ignored and campaigns cannot resume. Contact{" "}
              <a href={`https://wa.me/923377155722`} className="underline">
                support
              </a>
              .
            </Alert>
          )}

          <div className="space-y-2 border-t border-slate-200 pt-5">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <KeyRound className="h-4 w-4 text-emerald-600" /> API key
            </p>
            <p className="text-xs leading-relaxed text-slate-500">
              Your key logs you into this dashboard and authenticates the API. Rotating it immediately signs you out of every
              other session.
            </p>
            {newApiKey && <CopyField label="New API key — shown once" value={newApiKey} />}
            <Btn variant="danger" loading={rotating} onClick={rotateKey}>
              Rotate API key
            </Btn>
          </div>

          <div className="space-y-2 border-t border-slate-200 pt-5">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <Webhook className="h-4 w-4 text-emerald-600" /> Customer-facing
            </p>
            <p className="text-xs text-slate-500">
              Share the ticket lookup so buyers can check their entry by order number or phone.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/lookup/store-ticket"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50"
              >
                <Search className="h-3.5 w-3.5" /> Open ticket lookup
              </Link>
              <Btn variant="ghost" onClick={onLogout}>
                <LogOut className="h-4 w-4" /> Log out
              </Btn>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}
