"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { KeyRound, LogOut, RefreshCw, Search, Webhook } from "lucide-react"
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
  formatDate,
  formatPKR,
  merchantApi,
} from "../ui"
import type { MeResponse, StoreDTO } from "./types"

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

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {/* Integration */}
      <Panel className="xl:col-span-2">
        <PanelHeader
          title="Shopify Integration"
          description="Point your store's webhooks here. PakRaffle only acts on requests signed with your secret."
        />
        <div className="grid gap-5 p-5 md:grid-cols-2">
          <CopyField label="Webhook URL" value={me.integration.webhookUrl} />
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-300">Subscribe to these topics</span>
            <div className="flex flex-wrap gap-1.5">
              {me.integration.topics.map((topic) => (
                <code key={topic} className="rounded-lg border border-slate-800 bg-[#0B0F19] px-2 py-1 font-mono text-[11px] text-emerald-300">
                  {topic}
                </code>
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              orders/fulfilled mints tickets · orders/cancelled and refunds/create void them before settlement.
            </p>
          </div>
        </div>
        <div className="grid gap-3 border-t border-slate-800 px-5 py-4 text-xs text-slate-500 sm:grid-cols-3">
          <p>
            Base ticket fee <span className="font-mono tabular-nums text-slate-300">{formatPKR(me.integration.entryFee)}</span>
            <span className="text-slate-600"> · linked raffles use their own price</span>
          </p>
          <p>
            API key <span className="font-mono text-slate-300">{me.store.apiKeyPrefix}</span>
          </p>
          <p>
            Records <span className="font-mono text-slate-300">{me.integration.storage}</span>
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

      {/* Account */}
      <Panel>
        <PanelHeader title="Account" description="Store status, credentials and session" />
        <div className="space-y-5 p-5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-400">Store status</span>
            <StatusText status={me.store.status} />
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-400">Connected</span>
            <span className="font-mono tabular-nums text-slate-300">{formatDate(me.store.createdAt)}</span>
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

          <div className="space-y-2 border-t border-slate-800 pt-5">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <KeyRound className="h-4 w-4 text-emerald-400" /> API key
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

          <div className="space-y-2 border-t border-slate-800 pt-5">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Webhook className="h-4 w-4 text-emerald-400" /> Customer-facing
            </p>
            <p className="text-xs text-slate-500">
              Share the ticket lookup so buyers can check their entry by order number or phone.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/lookup/store-ticket"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
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
