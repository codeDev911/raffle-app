"use client"

import type React from "react"
import { useState } from "react"
import { CheckCircle2, CircleSlash, Copy, FlaskConical, Send, Trash2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, Btn, EmptyState, Field, Panel, PanelHeader, Sep, TextInput, formatNumber, formatPKR, merchantApi } from "../ui"
import type { CampaignDTO, IngestOutcome, WebhookResult } from "./types"

interface SimulationResponse {
  payload: Record<string, any>
  headers: Record<string, string>
  result: WebhookResult
}

const PRESETS = [
  { key: "two", label: "2 items", hint: "Small basket", itemCount: 2, unitPrice: 1500 },
  { key: "four", label: "4 items", hint: "Upsized basket", itemCount: 4, unitPrice: 1500 },
  { key: "custom", label: "Custom", hint: "Your own order", itemCount: 3, unitPrice: 2000 },
] as const

type PresetKey = (typeof PRESETS)[number]["key"]

export function SimulatorTab({
  campaigns,
  onSimulated,
}: {
  campaigns: CampaignDTO[]
  onSimulated: () => Promise<void> | void
}) {
  const [preset, setPreset] = useState<PresetKey>("four")
  const [form, setForm] = useState({
    itemCount: "4",
    unitPrice: "1500",
    customerName: "Ayesha Khan",
    customerPhone: "03001234567",
    customerCity: "Lahore",
    productTitle: "",
    sku: "",
    orderId: "",
  })
  const [running, setRunning] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [last, setLast] = useState<SimulationResponse | null>(null)

  const activeCount = campaigns.filter((c) => c.status === "ACTIVE").length
  const subtotal = (Number(form.itemCount) || 0) * (Number(form.unitPrice) || 0)

  const choosePreset = (key: PresetKey) => {
    const p = PRESETS.find((x) => x.key === key)!
    setPreset(key)
    if (key !== "custom") setForm((f) => ({ ...f, itemCount: String(p.itemCount), unitPrice: String(p.unitPrice) }))
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreset("custom")
    setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  const run = async (e: React.FormEvent) => {
    e.preventDefault()
    setRunning(true)
    setError(null)
    setNotice(null)
    try {
      const data = await merchantApi<SimulationResponse>("/api/merchants/me/simulate", {
        method: "POST",
        json: {
          itemCount: Number(form.itemCount),
          unitPrice: Number(form.unitPrice),
          customerName: form.customerName || undefined,
          customerPhone: form.customerPhone || undefined,
          customerCity: form.customerCity || undefined,
          productTitle: form.productTitle || undefined,
          sku: form.sku || undefined,
          orderId: form.orderId || undefined,
        },
      })
      setLast(data)
      await onSimulated()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRunning(false)
    }
  }

  const clearTests = async () => {
    setClearing(true)
    setError(null)
    try {
      const data = await merchantApi<{ deleted: number }>("/api/merchants/me/simulate", { method: "DELETE" })
      setNotice(`${data.deleted} test ticket${data.deleted === 1 ? "" : "s"} removed`)
      await onSimulated()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
      <Panel>
        <PanelHeader
          title="Webhook Simulator"
          description="Sends a signed orders/fulfilled payload through the live pipeline · tickets are flagged test and never billed"
        />
        <form onSubmit={run} className="space-y-4 p-5">
          {activeCount === 0 && <Alert tone="info">No active campaigns — the simulated order will be accepted but no ticket can mint.</Alert>}

          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => choosePreset(p.key)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left transition",
                  preset === p.key ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-slate-300",
                )}
              >
                <p className={cn("text-xs font-semibold", preset === p.key ? "text-emerald-700" : "text-slate-800")}>{p.label}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">{p.hint}</p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Items">
              <TextInput type="number" min={1} max={500} required value={form.itemCount} onChange={set("itemCount")} className="font-mono tabular-nums" />
            </Field>
            <Field label="Unit price (Rs.)">
              <TextInput type="number" min={0} required value={form.unitPrice} onChange={set("unitPrice")} className="font-mono tabular-nums" />
            </Field>
          </div>
          <p className="-mt-1 text-xs text-slate-500">
            Subtotal <span className="font-mono tabular-nums text-slate-700">{formatPKR(subtotal)}</span>
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Customer">
              <TextInput value={form.customerName} onChange={set("customerName")} maxLength={80} />
            </Field>
            <Field label="Phone">
              <TextInput value={form.customerPhone} onChange={set("customerPhone")} maxLength={20} className="font-mono" />
            </Field>
            <Field label="City" hint="Saved as the customer's location">
              <TextInput value={form.customerCity} onChange={set("customerCity")} maxLength={60} placeholder="Lahore" />
            </Field>
            <Field label="Product title" hint="Tests product filters">
              <TextInput value={form.productTitle} onChange={set("productTitle")} maxLength={120} placeholder="Lawn Suit" />
            </Field>
            <Field label="SKU">
              <TextInput value={form.sku} onChange={set("sku")} maxLength={64} className="font-mono" />
            </Field>
          </div>

          <Field label="Order ID" hint="Optional · reuse an ID to see duplicate protection">
            <TextInput value={form.orderId} onChange={set("orderId")} maxLength={64} placeholder="auto-generated" className="font-mono" />
          </Field>

          {error && <Alert>{error}</Alert>}
          {notice && <Alert tone="success">{notice}</Alert>}

          <div className="flex gap-2">
            <Btn type="submit" loading={running} className="flex-1">
              <Send className="h-4 w-4" /> Fire webhook
            </Btn>
            <Btn type="button" variant="danger" loading={clearing} onClick={clearTests} aria-label="Clear test tickets">
              <Trash2 className="h-4 w-4" />
            </Btn>
          </div>
        </form>
      </Panel>

      <Panel>
        <PanelHeader title="Pipeline result" description={last ? last.result.message : "Fire a webhook to inspect each step"} />
        {!last ? (
          <EmptyState icon={FlaskConical} title="Nothing simulated yet">
            Try the 2-item preset against a “Buy 3+ items” campaign, then the 4-item preset — the first is rejected, the second mints a ticket.
          </EmptyState>
        ) : (
          <div className="space-y-5 p-5">
            <div className="space-y-2">
              {(last.result.outcomes || []).length === 0 && (
                <p className="text-sm text-slate-600">{last.result.message}</p>
              )}
              {(last.result.outcomes || []).map((o) => (
                <OutcomeRow key={o.campaignId} outcome={o} />
              ))}
            </div>

            <JsonBlock title="Signed headers" value={last.headers} />
            <JsonBlock
              title={`Payload · order ${last.payload.name || last.payload.id} · ${formatNumber(
                (last.payload.line_items || []).reduce((s: number, li: any) => s + (li.quantity || 0), 0),
              )} items`}
              value={last.payload}
              collapsed
            />
          </div>
        )}
      </Panel>
    </div>
  )
}

function OutcomeRow({ outcome }: { outcome: IngestOutcome }) {
  const issued = outcome.result === "ISSUED"
  const duplicate = outcome.result === "DUPLICATE"
  const Icon = issued ? CheckCircle2 : duplicate ? Copy : outcome.result === "CAP_REACHED" ? CircleSlash : XCircle
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3",
        issued ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50",
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", issued ? "text-emerald-600" : duplicate ? "text-sky-700" : "text-rose-700")} />
      <div className="min-w-0 text-sm">
        <p className="truncate font-medium text-slate-900">{outcome.campaignTitle}</p>
        {"ticketNumber" in outcome ? (
          <p className="text-xs text-slate-600">
            {issued ? "Ticket minted" : "Already issued for this order"}
            <Sep />
            <span className="font-mono tabular-nums text-emerald-700">{outcome.ticketNumber}</span>
          </p>
        ) : (
          <p className="text-xs text-slate-600">{outcome.reason}</p>
        )}
      </div>
    </div>
  )
}

function JsonBlock({ title, value, collapsed = false }: { title: string; value: unknown; collapsed?: boolean }) {
  const [open, setOpen] = useState(!collapsed)
  return (
    <div>
      <button type="button" onClick={() => setOpen((v) => !v)} className="mb-2 text-xs font-medium text-slate-700 hover:text-slate-900">
        {open ? "▾" : "▸"} {title}
      </button>
      {open && (
        <pre className="max-h-72 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-[11px] leading-relaxed text-slate-600">
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  )
}
