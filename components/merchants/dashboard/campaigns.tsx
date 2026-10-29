"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { CalendarClock, FileText, Gift, Pause, Pencil, Play, Plus, Sparkles, Trophy } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { describeRule, validateRuleConfig } from "@/lib/merchants/rules"
import { cn } from "@/lib/utils"
import {
  Alert,
  Btn,
  EmptyState,
  Field,
  Panel,
  PanelHeader,
  SelectInput,
  Sep,
  TextInput,
  formatDate,
  formatNumber,
  formatPKR,
  merchantApi,
} from "../ui"
import { CampaignProgress, CampaignStatus } from "./shared"
import type { CampaignDTO, InvoiceDTO, InvoicePreview, PrizeDTO, RuleType } from "./types"

export const dialogClass =
  "max-h-[92vh] overflow-y-auto border-slate-800 bg-[#111827] text-slate-100 sm:max-w-xl sm:rounded-2xl [&>button]:text-slate-400"

const RULE_OPTIONS: { value: RuleType; label: string; hint: string }[] = [
  { value: "MIN_QUANTITY", label: "Minimum items", hint: "Buy 3+ items" },
  { value: "MIN_AMOUNT", label: "Minimum spend", hint: "Spend Rs. 5,000+" },
  { value: "MIN_QUANTITY_AND_AMOUNT", label: "Items and spend", hint: "Both thresholds" },
  { value: "ALL_ORDERS", label: "All orders", hint: "Every fulfilled order" },
]

const toDateInput = (value: string | Date) => {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10)
}

/** Date inputs give midnight UTC; campaigns should run until the end of the chosen day. */
const endOfDayIso = (value: string) => (value ? new Date(`${value}T23:59:59`).toISOString() : null)

const numOrNull = (value: string) => (value.trim() === "" ? null : Number(value))

// ───────────────────────── campaigns tab ─────────────────────────

export function CampaignsTab({
  campaigns,
  entryFee,
  storeActive,
  onChanged,
  onInvoiceCreated,
  onOpenInvoices,
}: {
  campaigns: CampaignDTO[]
  entryFee: number
  storeActive: boolean
  onChanged: () => Promise<void> | void
  onInvoiceCreated: (invoice: InvoiceDTO) => void
  onOpenInvoices: () => void
}) {
  const [builderOpen, setBuilderOpen] = useState(false)
  const [editing, setEditing] = useState<CampaignDTO | null>(null)
  const [settling, setSettling] = useState<CampaignDTO | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const toggle = async (campaign: CampaignDTO) => {
    const action = campaign.status === "ACTIVE" ? "pause" : "resume"
    if (action === "resume" && campaign.ended) {
      setEditing(campaign)
      return
    }
    setBusyId(campaign.id)
    setError(null)
    try {
      await merchantApi(`/api/merchants/me/campaigns/${campaign.id}`, { method: "PATCH", json: { action } })
      await onChanged()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && <Alert>{error}</Alert>}
      {!storeActive && (
        <Alert tone="info">Your store is paused by PakRaffle. Existing campaigns are frozen and new ones cannot be created.</Alert>
      )}

      <Panel>
        <PanelHeader
          title="Active Campaigns"
          description="Each qualifying fulfilled order mints one ticket · billed per batch at the linked raffle's ticket price"
          action={
            <Btn onClick={() => setBuilderOpen(true)} disabled={!storeActive}>
              <Plus className="h-4 w-4" /> New campaign
            </Btn>
          }
        />

        {campaigns.length === 0 ? (
          <EmptyState icon={Sparkles} title="No campaigns yet">
            Link a PakRaffle prize and set a spend rule. Tickets start minting on the next fulfilled order.
          </EmptyState>
        ) : (
          <div className="divide-y divide-slate-800">
            {campaigns.map((c) => {
              const editable = c.status === "ACTIVE" || c.status === "PAUSED"
              return (
                <div key={c.id} className="grid gap-5 px-5 py-5 lg:grid-cols-[1fr_220px_auto] lg:items-center">
                  <div className="flex min-w-0 gap-4">
                    <PrizeThumb prize={c.prize} />
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h4 className="truncate font-semibold text-slate-100">{c.title}</h4>
                        <CampaignStatus campaign={c} />
                      </div>
                      <p className="text-sm text-emerald-300">{c.ruleSummary}</p>
                      <p className="text-xs text-slate-500">
                        {c.prize ? (
                          <>
                            {c.prize.title}
                            <Sep />
                            <span className="font-mono tabular-nums">{formatPKR(c.prize.prizeValuePkr)}</span>
                          </>
                        ) : (
                          "PakRaffle-assigned prize"
                        )}
                        <Sep />
                        Draw {formatDate(c.endDate)}
                        <Sep />
                        <span className="font-mono tabular-nums">{formatPKR(c.ticketPrice)}</span> / ticket
                      </p>
                      {editable && c.billableEntries > 0 && (
                        <p className="text-xs text-slate-400">
                          Unbilled <span className="font-mono tabular-nums text-slate-200">{formatNumber(c.billableEntries)}</span>
                          <span className="text-slate-600"> × </span>
                          <span className="font-mono tabular-nums">{formatPKR(c.ticketPrice)}</span>
                          <span className="text-slate-600"> = </span>
                          <span className="font-mono tabular-nums text-slate-200">{formatPKR(c.billableAmount)}</span>
                          {c.testEntries > 0 && (
                            <>
                              <Sep />
                              <span className="font-mono tabular-nums">{c.testEntries}</span> test
                            </>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <CampaignProgress campaign={c} />

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    {editable && (
                      <>
                        <Btn variant="ghost" className="px-3" onClick={() => setEditing(c)} aria-label="Edit campaign">
                          <Pencil className="h-4 w-4" />
                        </Btn>
                        <Btn
                          variant="secondary"
                          loading={busyId === c.id}
                          disabled={!storeActive}
                          onClick={() => toggle(c)}
                        >
                          {c.status === "ACTIVE" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          {c.status === "ACTIVE" ? "Pause" : "Resume"}
                        </Btn>
                        <Btn onClick={() => setSettling(c)} disabled={c.billableEntries === 0}>
                          <FileText className="h-4 w-4" /> Review & Settle Batch Invoice
                        </Btn>
                      </>
                    )}
                    {c.status === "PENDING_INVOICE" && (
                      <Btn variant="secondary" onClick={onOpenInvoices}>
                        <FileText className="h-4 w-4" /> View invoice
                      </Btn>
                    )}
                    {c.status === "DRAW_READY" && (
                      <span className="text-xs text-slate-400">Paid · PakRaffle will run the draw on {formatDate(c.endDate)}</span>
                    )}
                    {c.status === "COMPLETED" && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
                        <Trophy className="h-4 w-4 text-amber-300" /> Drawn {formatDate(c.drawnAt)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Panel>

      <CampaignBuilderDialog
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        entryFee={entryFee}
        onCreated={async () => {
          setBuilderOpen(false)
          await onChanged()
        }}
      />
      <EditCampaignDialog
        campaign={editing}
        onClose={() => setEditing(null)}
        onSaved={async () => {
          setEditing(null)
          await onChanged()
        }}
      />
      <SettleInvoiceDialog
        campaign={settling}
        onClose={() => setSettling(null)}
        onCreated={async (invoice) => {
          setSettling(null)
          await onChanged()
          onInvoiceCreated(invoice)
        }}
      />
    </div>
  )
}

function PrizeThumb({ prize }: { prize: PrizeDTO | null }) {
  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-[#0B0F19]">
      {prize?.image ? (
        <Image src={prize.image} alt={prize.title} fill sizes="56px" className="object-cover" unoptimized />
      ) : (
        <Gift className="h-5 w-5 text-slate-600" />
      )}
    </div>
  )
}

// ───────────────────────── campaign builder ─────────────────────────

function CampaignBuilderDialog({
  open,
  onOpenChange,
  entryFee,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  entryFee: number
  onCreated: () => Promise<void> | void
}) {
  const defaultEnd = toDateInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  const [prizes, setPrizes] = useState<PrizeDTO[] | null>(null)
  const [prizeError, setPrizeError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: "",
    raffleId: "",
    ruleType: "MIN_QUANTITY" as RuleType,
    minQuantity: "3",
    minAmount: "5000",
    productFilters: "",
    capped: true,
    maxEntries: "100",
    endDate: defaultEnd,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || prizes) return
    merchantApi<{ prizes: PrizeDTO[] }>("/api/merchants/prizes")
      .then((data) => setPrizes(data.prizes))
      .catch((err) => setPrizeError(err.message))
  }, [open, prizes])

  const set =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  const needsQty = form.ruleType === "MIN_QUANTITY" || form.ruleType === "MIN_QUANTITY_AND_AMOUNT"
  const needsAmt = form.ruleType === "MIN_AMOUNT" || form.ruleType === "MIN_QUANTITY_AND_AMOUNT"
  const filters = form.productFilters.split(",").map((s) => s.trim()).filter(Boolean)
  const preview = describeRule({
    ruleType: form.ruleType,
    minQuantity: needsQty ? Number(form.minQuantity) || 0 : null,
    minAmount: needsAmt ? Number(form.minAmount) || 0 : null,
    productFilters: filters,
  })
  const selectedPrize = prizes?.find((p) => p.id === form.raffleId) || null
  // A linked raffle is billed at its own ticket price; the flat fee only applies without a prize.
  const ticketPrice = selectedPrize?.ticketPricePkr || entryFee

  const choosePrize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prize = prizes?.find((p) => p.id === e.target.value)
    setForm((f) => ({
      ...f,
      raffleId: e.target.value,
      title: f.title || (prize ? `${prize.title} Lucky Draw` : f.title),
      endDate: prize?.endDate && new Date(prize.endDate).getTime() > Date.now() ? toDateInput(prize.endDate) : f.endDate,
    }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const ruleError = validateRuleConfig({
      ruleType: form.ruleType,
      minQuantity: needsQty ? numOrNull(form.minQuantity) : null,
      minAmount: needsAmt ? numOrNull(form.minAmount) : null,
    })
    if (ruleError) return setError(ruleError)

    setLoading(true)
    try {
      await merchantApi("/api/merchants/me/campaigns", {
        method: "POST",
        json: {
          title: form.title,
          raffleId: form.raffleId || null,
          ruleType: form.ruleType,
          minQuantity: needsQty ? numOrNull(form.minQuantity) : null,
          minAmount: needsAmt ? numOrNull(form.minAmount) : null,
          productFilters: filters,
          maxEntries: form.capped ? numOrNull(form.maxEntries) : null,
          endDate: endOfDayIso(form.endDate),
        },
      })
      setForm((f) => ({ ...f, title: "", raffleId: "", productFilters: "" }))
      await onCreated()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(dialogClass, "sm:max-w-2xl")}>
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-slate-100">
              <Sparkles className="h-5 w-5 text-emerald-400" /> New lucky draw campaign
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Customers who meet the rule get a ticket when their order is fulfilled.
            </DialogDescription>
          </DialogHeader>

          {error && <Alert>{error}</Alert>}

          <Field label="Linked PakRaffle prize" error={prizeError}>
            <SelectInput value={form.raffleId} onChange={choosePrize}>
              <option value="">{prizes ? "PakRaffle assigns a prize" : "Loading prizes…"}</option>
              {prizes?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {formatPKR(p.prizeValuePkr)}
                </option>
              ))}
            </SelectInput>
          </Field>

          {selectedPrize && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#0B0F19] p-3">
              <PrizeThumb prize={selectedPrize} />
              <div className="min-w-0 text-xs">
                <p className="truncate text-sm font-medium text-slate-100">{selectedPrize.title}</p>
                <p className="text-slate-500">
                  {selectedPrize.category || "Prize"}
                  <Sep />
                  <span className="font-mono tabular-nums">{formatPKR(selectedPrize.prizeValuePkr)}</span>
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {selectedPrize.ticketPricePkr > 0 ? "Ticket price" : "Base ticket fee"}{" "}
                  <span className="font-mono tabular-nums text-emerald-300">{formatPKR(ticketPrice)}</span>
                </p>
              </div>
            </div>
          )}

          <Field label="Campaign title">
            <TextInput required minLength={3} maxLength={120} value={form.title} onChange={set("title")} placeholder="Eid Basket Booster" />
          </Field>

          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-300">Qualification rule</span>
            <div className="grid gap-2 sm:grid-cols-4">
              {RULE_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setForm((f) => ({ ...f, ruleType: opt.value }))}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left transition",
                    form.ruleType === opt.value
                      ? "border-emerald-500/60 bg-emerald-500/10"
                      : "border-slate-800 bg-[#0B0F19] hover:border-slate-700",
                  )}
                >
                  <p className={cn("text-xs font-semibold", form.ruleType === opt.value ? "text-emerald-300" : "text-slate-200")}>
                    {opt.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{opt.hint}</p>
                </button>
              ))}
            </div>
          </div>

          {(needsQty || needsAmt) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {needsQty && (
                <Field label="Minimum items">
                  <TextInput type="number" min={1} required value={form.minQuantity} onChange={set("minQuantity")} className="font-mono tabular-nums" />
                </Field>
              )}
              {needsAmt && (
                <Field label="Minimum subtotal (Rs.)">
                  <TextInput type="number" min={1} required value={form.minAmount} onChange={set("minAmount")} className="font-mono tabular-nums" />
                </Field>
              )}
            </div>
          )}

          <Field
            label="Product filter"
            hint="Optional · comma-separated SKUs, product IDs or title keywords. Leave blank to count every item."
          >
            <TextInput value={form.productFilters} onChange={set("productFilters")} placeholder="lawn-suit, SKU-1042" className="font-mono" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-300">Entry limit</span>
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-800 bg-[#0B0F19] p-1">
                {[
                  { v: true, label: "Capped" },
                  { v: false, label: "Continuous" },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, capped: opt.v }))}
                    className={cn(
                      "rounded-lg py-1.5 text-xs font-medium transition",
                      form.capped === opt.v ? "bg-slate-800 text-slate-100" : "text-slate-500 hover:text-slate-300",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {form.capped && (
                <TextInput
                  type="number"
                  min={1}
                  required
                  value={form.maxEntries}
                  onChange={set("maxEntries")}
                  className="font-mono tabular-nums"
                  aria-label="Maximum entries"
                />
              )}
            </div>
            <Field label="Draw date (campaign end)">
              <TextInput type="date" required min={toDateInput(new Date())} value={form.endDate} onChange={set("endDate")} className="font-mono" />
            </Field>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0B0F19] p-4 text-xs">
            <p className="text-slate-500">Rule preview</p>
            <p className="mt-1 text-sm font-medium text-emerald-300">{preview}</p>
            <p className="mt-2 text-slate-500">
              <span className="font-mono tabular-nums text-slate-300">{formatPKR(ticketPrice)}</span> per ticket
              <Sep />
              {form.capped && Number(form.maxEntries) > 0 ? (
                <>
                  max <span className="font-mono tabular-nums text-slate-300">{formatPKR(ticketPrice * Number(form.maxEntries))}</span> at cap
                </>
              ) : (
                "no entry cap"
              )}
              <Sep />
              one ticket per order
            </p>
          </div>

          <Btn type="submit" loading={loading} className="w-full">
            Launch campaign
          </Btn>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ───────────────────────── edit campaign ─────────────────────────

function EditCampaignDialog({
  campaign,
  onClose,
  onSaved,
}: {
  campaign: CampaignDTO | null
  onClose: () => void
  onSaved: () => Promise<void> | void
}) {
  const [form, setForm] = useState({ title: "", endDate: "", capped: true, maxEntries: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!campaign) return
    setError(null)
    setForm({
      title: campaign.title,
      endDate: toDateInput(campaign.endDate),
      capped: campaign.maxEntries !== null,
      maxEntries: campaign.maxEntries ? String(campaign.maxEntries) : "",
    })
  }, [campaign])

  if (!campaign) return null
  const resumeAfterSave = campaign.status === "PAUSED" && campaign.ended

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await merchantApi(`/api/merchants/me/campaigns/${campaign.id}`, {
        method: "PATCH",
        json: {
          title: form.title,
          endDate: endOfDayIso(form.endDate),
          maxEntries: form.capped ? numOrNull(form.maxEntries) : null,
          ...(resumeAfterSave ? { action: "resume" } : {}),
        },
      })
      await onSaved()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={Boolean(campaign)} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={dialogClass}>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-slate-100">
              <CalendarClock className="h-5 w-5 text-emerald-400" /> Edit campaign
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {campaign.ruleSummary}
              <Sep />
              rules and pricing are locked once a campaign launches.
            </DialogDescription>
          </DialogHeader>
          {error && <Alert>{error}</Alert>}
          {campaign.ended && <Alert tone="info">This campaign has passed its end date. Set a new draw date to keep minting tickets.</Alert>}

          <Field label="Campaign title">
            <TextInput required minLength={3} maxLength={120} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Draw date (campaign end)">
              <TextInput
                type="date"
                required
                min={toDateInput(new Date())}
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="font-mono"
              />
            </Field>
            <Field label="Entry cap" hint={`Minimum ${formatNumber(campaign.currentEntries)} · leave blank for continuous`}>
              <TextInput
                type="number"
                min={Math.max(1, campaign.currentEntries)}
                value={form.maxEntries}
                onChange={(e) => setForm((f) => ({ ...f, maxEntries: e.target.value, capped: e.target.value.trim() !== "" }))}
                placeholder="Continuous"
                className="font-mono tabular-nums"
              />
            </Field>
          </div>
          <Btn type="submit" loading={loading} className="w-full">
            {resumeAfterSave ? "Save and resume" : "Save changes"}
          </Btn>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ───────────────────────── settle batch invoice ─────────────────────────

function SettleInvoiceDialog({
  campaign,
  onClose,
  onCreated,
}: {
  campaign: CampaignDTO | null
  onClose: () => void
  onCreated: (invoice: InvoiceDTO) => Promise<void> | void
}) {
  const [preview, setPreview] = useState<InvoicePreview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!campaign) return
    setPreview(null)
    setError(null)
    merchantApi<{ preview: InvoicePreview }>(`/api/merchants/me/campaigns/${campaign.id}`)
      .then((data) => setPreview(data.preview))
      .catch((err) => setError(err.message))
  }, [campaign])

  const lines = useMemo(
    () =>
      preview
        ? [
            { label: "Fulfilled-order tickets", value: formatNumber(preview.totalEntries) },
            { label: "Rate per ticket", value: formatPKR(preview.unitPrice) },
          ]
        : [],
    [preview],
  )

  if (!campaign) return null

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await merchantApi<{ invoice: InvoiceDTO }>("/api/merchants/me/invoices", {
        method: "POST",
        json: { campaignId: campaign.id },
      })
      await onCreated(data.invoice)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={Boolean(campaign)} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={dialogClass}>
        <div className="space-y-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg text-slate-100">
              <FileText className="h-5 w-5 text-emerald-400" /> Review & settle batch
            </DialogTitle>
            <DialogDescription className="text-slate-400">{campaign.title}</DialogDescription>
          </DialogHeader>

          {error && <Alert>{error}</Alert>}

          {!preview && !error && <p className="py-6 text-center text-sm text-slate-500">Calculating batch…</p>}

          {preview && (
            <>
              <div className="rounded-xl border border-slate-800 bg-[#0B0F19]">
                {lines.map((line) => (
                  <div key={line.label} className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-sm">
                    <span className="text-slate-400">{line.label}</span>
                    <span className="font-mono tabular-nums text-slate-200">{line.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-4">
                  <span className="text-sm font-medium text-slate-200">Amount due</span>
                  <span className="font-mono text-2xl font-semibold tabular-nums text-emerald-400">{formatPKR(preview.amountDue)}</span>
                </div>
              </div>

              <Alert tone="info">
                Generating the invoice closes this campaign to new entries. Test tickets are excluded. Once paid and verified,
                the campaign becomes draw-ready.
              </Alert>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Btn variant="secondary" className="flex-1" onClick={onClose}>
                  Keep collecting
                </Btn>
                <Btn className="flex-1" loading={loading} disabled={!preview.canGenerate} onClick={generate}>
                  Generate invoice
                </Btn>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
