"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import NextImage from "next/image"
import { AlertTriangle, Check, ChevronRight, ExternalLink, ImagePlus, Maximize, Megaphone, Receipt, RotateCcw, RotateCw, Settings as SettingsIcon, Ticket, Upload, X } from "lucide-react"
import { GUIDES, GuideStrip } from "./guides"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, Btn, EmptyState, Field, Panel, PanelHeader, SelectInput, Sep, TextInput, formatNumber, formatPKR, merchantApi } from "../ui"
import type { CampaignCreativeDTO, CampaignDTO, InvoiceDTO, SettlementAccount } from "./types"

/**
 * Campaign details — the storefront creative.
 *
 * A campaign's rule decides who wins a ticket; this tab decides who *sees* the offer. The seller
 * uploads two images (a wide banner and a square popup), then switches on the surfaces each one may
 * appear on. Nothing here changes pricing, rules or tickets: the PATCH route only accepts creative
 * fields, which is why a half-filled form can never damage a billing-relevant column.
 */

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"]
const MAX_BYTES = 8 * 1024 * 1024

type Slot = "banner" | "popup"

interface Draft {
  bannerUrl: string | null
  popupUrl: string | null
  pageSlug: string
  ctaUrl: string
  showBannerHome: boolean
  showPopupHome: boolean
  showBannerProduct: boolean
  showPopupProduct: boolean
  showCustomPage: boolean
}

/** The widget-facing payload, minus the shape's null-vs-empty-string wobble. */
function toDraft(creative?: CampaignCreativeDTO | null): Draft {
  return {
    bannerUrl: creative?.bannerUrl ?? null,
    popupUrl: creative?.popupUrl ?? null,
    pageSlug: creative?.pageSlug ?? "",
    ctaUrl: creative?.ctaUrl ?? "",
    showBannerHome: Boolean(creative?.showBannerHome),
    showPopupHome: Boolean(creative?.showPopupHome),
    showBannerProduct: Boolean(creative?.showBannerProduct),
    showPopupProduct: Boolean(creative?.showPopupProduct),
    showCustomPage: Boolean(creative?.showCustomPage),
  }
}

const SLOT_COPY: Record<Slot, { title: string; spec: string; use: string; want: number }> = {
  banner: {
    title: "Banner — wide",
    spec: "1200 × 400 px (3:1) works best",
    use: "Painted inside the product-page card, and across the home or custom page as a strip.",
    want: 3,
  },
  popup: {
    title: "Popup — square",
    spec: "800 × 800 px (1:1) works best",
    use: "Shown once per visit in the campaign popup, next to the rule and the draw date.",
    want: 1,
  },
}

/** Only the natural size the browser measured can warn about a crop. */
type Sizes = Partial<Record<Slot, { w: number; h: number }>>

function ratioNote(kind: Slot, size?: { w: number; h: number }) {
  if (!size || !size.h) return null
  const ratio = size.w / size.h
  const target = SLOT_COPY[kind].want
  const label = `${size.w} × ${size.h}px`
  if (Math.min(size.w, size.h) < 500) return { warn: true, text: `${label} is low resolution — it will soften on a large screen. Re-upload a bigger file.` }
  if (Math.abs(ratio - target) / target > 0.18) {
    return {
      warn: true,
      text: `${label} is ${ratio.toFixed(2)}:1. The widget fills its frame, so a ${target}:1 image keeps your artwork uncropped.`,
    }
  }
  return { warn: false, text: `${label} — good shape for this slot.` }
}

export function CampaignDetailsTab({
  campaigns,
  invoices,
  storeUrl,
  initialCampaignId,
  entryFee,
  settlementAccounts,
  safepayEnabled,
  onChanged,
  onNavigate,
}: {
  campaigns: CampaignDTO[]
  invoices: InvoiceDTO[]
  storeUrl: string
  initialCampaignId?: string | null
  entryFee: number
  settlementAccounts: SettlementAccount[]
  safepayEnabled: boolean
  onChanged: () => Promise<void> | void
  onNavigate: (tab: string, params?: Record<string, string>) => void
}) {
  const [campaignId, setCampaignId] = useState<string>("")
  const [draft, setDraft] = useState<Draft>(toDraft(null))
  const [sizes, setSizes] = useState<Sizes>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<Slot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [cropKind, setCropKind] = useState<Slot | null>(null)
  const [cropFile, setCropFile] = useState<File | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  const campaign = campaigns.find((c) => c.id === campaignId) || campaigns[0] || null
  // Change detector for the load effect below; deliberately the raw DTO, so a background refresh that
  // did not alter the creative never overwrites an edit in progress.
  const signature = JSON.stringify(campaign?.creative ?? null)

  // Load the stored creative whenever the selected campaign (or its saved creative) changes. An
  // in-progress edit survives a background refresh because the signature is unchanged.
  useEffect(() => {
    if (campaign) setDraft(toDraft(campaign.creative))
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign?.id, signature])

  // Choosing a different campaign is a different form, so forget the previous one's save stamp. The
  // stamp itself survives a save, because onChanged() refreshes the list right afterwards.
  useEffect(() => {
    setSavedAt(null)
  }, [campaign?.id])

  useEffect(() => {
    if (!campaignId && initialCampaignId && campaigns.some((c) => c.id === initialCampaignId)) setCampaignId(initialCampaignId)
  }, [campaignId, initialCampaignId, campaigns])

  useEffect(() => {
    if (!campaignId && campaign) setCampaignId(campaign.id)
  }, [campaign, campaignId])

  // Compared against the *normalised* form (nulls become empty strings), not the raw DTO, otherwise a
  // freshly loaded campaign with no creative would read as unsaved work.
  const pristine = useMemo(() => JSON.stringify(toDraft(campaign?.creative)), [campaign])
  const dirty = useMemo(() => JSON.stringify(draft) !== pristine, [draft, pristine])

  const bannerOn = draft.showBannerHome || draft.showBannerProduct
  const popupOn = draft.showPopupHome || draft.showPopupProduct
  const locked = campaign?.status === "COMPLETED"

  const storeHome = `https://${String(storeUrl || "").replace(/^https?:\/\//i, "").replace(/\/.*$/, "")}/`

  const patch = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((prev) => ({ ...prev, [key]: value }))

  /** Removing an image must not leave a placement switched on: the server would reject the save. */
  const clearImage = (kind: Slot) =>
    setDraft((prev) =>
      kind === "banner"
        ? { ...prev, bannerUrl: null, showBannerHome: false, showBannerProduct: false, showCustomPage: prev.popupUrl ? prev.showCustomPage : false }
        : { ...prev, popupUrl: null, showPopupHome: false, showPopupProduct: false, showCustomPage: prev.bannerUrl ? prev.showCustomPage : false },
    )

  function upload(kind: Slot, file: File | null) {
    if (!file || !campaign) return
    setError(null)
    if (!ACCEPTED.includes(file.type)) {
      setError("That file is not an image. Use a JPG, PNG, WebP or AVIF.")
      return
    }
    if (file.size > MAX_BYTES) {
      setError(`That image is ${(file.size / 1048576).toFixed(1)} MB. Upload 8 MB or less — we resize long edges to 2000px anyway.`)
      return
    }
    setCropKind(kind)
    setCropFile(file)
    setCropSrc(URL.createObjectURL(file))
  }

  async function finishCrop(blob: Blob) {
    if (!cropKind || !cropFile) return
    const kind = cropKind
    const file = new File([blob], cropFile.name || "image.jpg", { type: cropFile.type || "image/jpeg" })
    setCropKind(null)
    setCropFile(null)
    setCropSrc(null)
    setUploading(kind)
    try {
      const form = new FormData()
      form.append("file", file)
      form.append("kind", kind)
      const res = await merchantApi<{ image: { url: string } }>("/api/merchants/me/upload", { method: "POST", body: form })
      setDraft((prev) => (kind === "banner" ? { ...prev, bannerUrl: res.image.url } : { ...prev, popupUrl: res.image.url }))
      setSizes((prev) => ({ ...prev, [kind]: undefined }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(null)
    }
  }

  async function save() {
    if (!campaign) return
    setSaving(true)
    setError(null)
    try {
      const res = await merchantApi<{ campaign: CampaignDTO }>(`/api/merchants/me/campaigns/${campaign.id}/creative`, {
        method: "PATCH",
        json: draft,
      })
      setDraft(toDraft(res.campaign.creative))
      setSizes({})
      setSavedAt(new Date())
      await onChanged()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (campaigns.length === 0) {
    return (
      <Panel>
        <PanelHeader title="Campaign details" description="Storefront banner, popup and where they appear" />
        <EmptyState icon={Megaphone} title="No campaigns yet">
          Creative belongs to a campaign. Create one under Campaigns first, then come back to upload the artwork that sells it.
        </EmptyState>
      </Panel>
    )
  }

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="Campaign details"
          description="Upload the artwork that sells the draw, then choose exactly which pages show it."
          action={
            <div className="flex items-center gap-2">
              <SelectInput
                aria-label="Campaign"
                className="min-w-[13rem] max-w-[18rem]"
                value={campaign?.id || ""}
                onChange={(event) => setCampaignId(event.target.value)}
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} · {c.status}
                  </option>
                ))}
              </SelectInput>
              <a
                href={`${storeHome}?pakraffle_debug=1`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-emerald-700"
              >
                Preview store <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          }
        />

        <GuideStrip guides={[GUIDES.campaign, GUIDES.shopify]} className="mx-5 mt-4" />

        {locked && (
          <div className="px-5 pb-2">
            <Alert tone="info">
              <span className="inline-flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                This campaign has drawn its winner, so its storefront creative is locked. Create a new campaign to advertise again.
              </span>
            </Alert>
          </div>
        )}

        {campaign && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 pb-4 pt-4 text-xs text-slate-500">
            <span className="font-mono text-emerald-700">{campaign.ruleSummary}</span>
            {campaign.prize && <span>Prize: {campaign.prize.title}</span>}
            {draft.showCustomPage && draft.pageSlug && (
              <span>
                Custom page:{" "}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">/pages/{draft.pageSlug}</code>
              </span>
            )}
          </div>
        )}
      </Panel>

      {/* ── live context ──────────────────────────────────────────────────── */}
      <ContextStrip
        campaign={campaign}
        invoices={invoices.filter((i) => i.campaignId === campaign?.id)}
        entryFee={entryFee}
        settlementAccounts={settlementAccounts}
        safepayEnabled={safepayEnabled}
        onNavigate={onNavigate}
      />

      {error && (
        <Alert>{error}</Alert>
      )}

      {/* ── artwork ─────────────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {(["banner", "popup"] as Slot[]).map((kind) => (
          <CreativeSlot
            key={kind}
            kind={kind}
            url={kind === "banner" ? draft.bannerUrl : draft.popupUrl}
            size={sizes[kind]}
            uploading={uploading === kind}
            disabled={Boolean(locked) || uploading !== null}
            onPick={(file) => void upload(kind, file)}
            onClear={() => clearImage(kind)}
            onMeasured={(size) => setSizes((prev) => ({ ...prev, [kind]: size }))}
          />
        ))}
      </div>

      {/* ── placements ──────────────────────────────────────────────────────── */}
      <Panel>
        <PanelHeader
          title="Where should it appear?"
          description="The cart page is never decorated — it is the till, not the shop window."
        />

        <div className="divide-y divide-slate-200">
          <Placement
            title="Banner on my home page"
            hint="Sits in the page flow, just under the hero."
            checked={draft.showBannerHome}
            disabled={Boolean(locked) || !draft.bannerUrl}
            blockedHint="Upload the wide banner first."
            onChange={(next) => patch("showBannerHome", next)}
          />
          <Placement
            title="Popup on my home page"
            hint="Opens once per visit, a couple of seconds after the page settles."
            checked={draft.showPopupHome}
            disabled={Boolean(locked) || !draft.popupUrl}
            blockedHint="Upload the square popup first."
            onChange={(next) => patch("showPopupHome", next)}
          />
          <Placement
            title="Banner on product pages"
            hint="Painted at the top of the buying-rule card beside the Add to cart button."
            checked={draft.showBannerProduct}
            disabled={Boolean(locked) || !draft.bannerUrl}
            blockedHint="Upload the wide banner first."
            onChange={(next) => patch("showBannerProduct", next)}
          />
          <Placement
            title="Popup on product pages"
            hint="Shows the campaign image, the rule and the draw date before the shopper decides."
            checked={draft.showPopupProduct}
            disabled={Boolean(locked) || !draft.popupUrl}
            blockedHint="Upload the square popup first."
            onChange={(next) => patch("showPopupProduct", next)}
          />
          <Placement
            title="Both on one custom page"
            hint="Any page you built under Online Store › Pages."
            checked={draft.showCustomPage}
            disabled={Boolean(locked) || (!draft.bannerUrl && !draft.popupUrl)}
            blockedHint="Upload at least one image first."
            onChange={(next) => patch("showCustomPage", next)}
          />
        </div>

        <div className="grid gap-4 border-t border-slate-200 px-5 py-4 sm:grid-cols-2">
          <Field
            label="Page name (the part after /pages/)"
            hint={
              draft.showCustomPage
                ? `Creative appears on ${storeHome}pages/${(draft.pageSlug || "your-page").trim().toLowerCase().replace(/\s+/g, "-")}`
                : "Switch the custom page on to name it."
            }
          >
            <TextInput
              value={draft.pageSlug}
              disabled={!draft.showCustomPage || Boolean(locked)}
              placeholder="summer-sale"
              onChange={(event) => patch("pageSlug", event.target.value)}
            />
          </Field>
          <Field label="Where the click goes" hint="A store path such as /collections/summer, or a full https:// link. Leave empty and the banner is not clickable.">
            <TextInput
              value={draft.ctaUrl}
              disabled={Boolean(locked)}
              placeholder="/collections/summer"
              onChange={(event) => patch("ctaUrl", event.target.value)}
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 px-5 py-4">
          <Btn onClick={save} loading={saving} disabled={!dirty || Boolean(locked)}>
            <Check className="h-4 w-4" /> Save changes
          </Btn>
          <Btn variant="ghost" disabled={!dirty || saving} onClick={() => setDraft(toDraft(campaign?.creative))}>
            Discard
          </Btn>
          <p className="ml-auto text-xs text-slate-500">
            {saving
              ? "Saving…"
              : dirty
                ? "Unsaved changes"
                : savedAt
                  ? `Saved at ${savedAt.toLocaleTimeString()}`
                  : bannerOn || popupOn
                    ? "Live on the storefront"
                    : "Nothing is switched on yet"}
          </p>
        </div>

      {cropKind && cropSrc && cropFile && (
        <CropModal
          kind={cropKind}
          src={cropSrc}
          file={cropFile}
          onConfirm={finishCrop}
          onCancel={() => {
            setCropKind(null)
            setCropFile(null)
            setCropSrc(null)
            if (cropSrc) URL.revokeObjectURL(cropSrc)
          }}
        />
      )}

      </Panel>
    </div>
  )
}

// ───────────────────────── live context strip ─────────────────────────

/**
 * Three compact cards showing live counts from Entries, Invoices and Settings, scoped to the
 * selected campaign. Read-only — clicking a card navigates to the dedicated tab pre-filtered.
 */
function ContextStrip({
  campaign,
  invoices,
  entryFee,
  settlementAccounts,
  safepayEnabled,
  onNavigate,
}: {
  campaign: CampaignDTO | null
  invoices: InvoiceDTO[]
  entryFee: number
  settlementAccounts: SettlementAccount[]
  safepayEnabled: boolean
  onNavigate: (tab: string, params?: Record<string, string>) => void
}) {
  if (!campaign) return null

  const openInvoices = invoices.filter((i) => i.status !== "PAID")
  const paidInvoices = invoices.filter((i) => i.status === "PAID")
  const totalDue = openInvoices.reduce((sum, i) => sum + i.amountDue, 0)
  const latestOpenId = openInvoices[0]?.id

  const pct = campaign.maxEntries
    ? Math.min(100, Math.round((campaign.currentEntries / campaign.maxEntries) * 100))
    : null

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {/* ── Entries card ──────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => onNavigate("entries", { campaign: campaign.id })}
        className="group flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-200 hover:shadow-md"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Ticket className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Entries</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-emerald-500" />
        </div>

        <div>
          <p className="font-mono text-lg font-semibold tabular-nums text-slate-900">
            {formatNumber(campaign.currentEntries)}
            {campaign.maxEntries ? (
              <>
                <span className="text-slate-400"> / </span>
                <span className="text-slate-500">{formatNumber(campaign.maxEntries)}</span>
              </>
            ) : null}
          </p>
          {pct !== null && (
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn("h-full rounded-full transition-all", campaign.capReached ? "bg-amber-500" : "bg-emerald-500")}
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
          <span className="font-mono tabular-nums">
            {formatNumber(campaign.billableEntries)} × {formatPKR(entryFee)}
          </span>
          {campaign.testEntries > 0 && (
            <>
              <Sep />
              <span>{campaign.testEntries} test</span>
            </>
          )}
        </div>
      </button>

      {/* ── Invoices card ─────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => onNavigate("invoices", latestOpenId ? { open: latestOpenId } : undefined)}
        className="group flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-200 hover:shadow-md"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Receipt className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Invoices</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-emerald-500" />
        </div>

        <p className="font-mono text-lg font-semibold tabular-nums text-slate-900">
          {formatPKR(totalDue)}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
          {openInvoices.length > 0 ? (
            <span className="font-medium text-amber-700">
              {openInvoices.length} open
            </span>
          ) : invoices.length > 0 ? (
            <span className="font-medium text-emerald-700">
              {paidInvoices.length} paid
            </span>
          ) : (
            <span>No invoices yet</span>
          )}
          {openInvoices.length > 0 && paidInvoices.length > 0 && (
            <>
              <Sep />
              <span>{paidInvoices.length} paid</span>
            </>
          )}
        </div>
      </button>

      {/* ── Settings card ─────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => onNavigate("settings")}
        className="group flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-200 hover:shadow-md"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <SettingsIcon className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Settings</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:text-emerald-500" />
        </div>

        <p className="font-mono text-lg font-semibold tabular-nums text-slate-900">
          {formatPKR(entryFee)}
          <span className="ml-1 text-xs font-normal text-slate-500">/ ticket</span>
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
          {safepayEnabled ? (
            <span className="font-medium text-emerald-700">Card checkout on</span>
          ) : (
            <span className="font-medium text-slate-500">Transfer only</span>
          )}
          {settlementAccounts.length > 0 && (
            <>
              <Sep />
              <span className="truncate">
                {settlementAccounts.slice(0, 2).map((a) => a.label).join(", ")}
                {settlementAccounts.length > 2 && ` +${settlementAccounts.length - 2}`}
              </span>
            </>
          )}
        </div>
      </button>
    </div>
  )
}

// ───────────────────────── image crop modal ─────────────────────────

interface CropModalProps {
  kind: Slot
  src: string
  file: File
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

function CropModal({ kind, src, file, onConfirm, onCancel }: CropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [imageReady, setImageReady] = useState(false)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [flipped, setFlipped] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 })

  const targetRatio = SLOT_COPY[kind].want
  const VP_SIZE = 480

  useEffect(() => {
    let active = true
    setImageReady(false)
    const img = new window.Image()
    img.onload = () => {
      if (!active) return
      imageRef.current = img
      const scaleToFit = Math.max(VP_SIZE / img.naturalWidth, VP_SIZE / img.naturalHeight)
      setScale(scaleToFit)
      setOffset({ x: 0, y: 0 })
      setRotation(0)
      setZoom(1)
      setFlipped(false)
      setImageReady(true)
    }
    img.onerror = () => {
      if (active) setImageReady(false)
    }
    img.src = src
    return () => {
      active = false
    }
  }, [src, targetRatio])

  const targetSize = useMemo(() => {
    const maxDim = 2000
    const sourceWidth = imageRef.current?.naturalWidth || 1200
    const sourceHeight = imageRef.current?.naturalHeight || 400
    const dim = Math.min(Math.max(sourceWidth, sourceHeight), maxDim)
    return kind === "banner" ? { w: Math.round(dim * targetRatio), h: dim } : { w: dim, h: dim }
  }, [imageReady, kind, targetRatio])

  // Frame dimensions in viewport pixels (centered, filling the viewport at target ratio)
  const frame = useMemo(() => {
    const w = VP_SIZE
    const h = VP_SIZE / targetRatio
    const x = 0
    const y = (VP_SIZE - h) / 2
    return { x, y, w, h }
  }, [targetRatio])

  // Pointer drag handlers
  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    setDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    setOffset({ x: dragStartRef.current.ox + dx, y: dragStartRef.current.oy + dy })
  }
  const onPointerUp = () => setDragging(false)

  // Image CSS transform
  const imgTransform = imageReady
    ? `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale * zoom * (flipped ? -1 : 1)}, ${scale * zoom}) rotate(${rotation}deg)`
    : ""

  // Canvas rendering (for the final crop blob)
  useEffect(() => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image || !imageReady) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = targetSize.w
    canvas.height = targetSize.h

    // Compute the source region that maps to the frame in the viewport.
    const sz = scale * zoom
    const srcW = frame.w / sz
    const srcH = frame.h / sz
    const srcCX = image.naturalWidth / 2 - offset.x / sz
    const srcCY = image.naturalHeight / 2 - offset.y / sz

    ctx.clearRect(0, 0, targetSize.w, targetSize.h)
    ctx.save()
    ctx.translate(targetSize.w / 2, targetSize.h / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    if (flipped) ctx.scale(-1, 1)
    ctx.drawImage(
      image,
      srcCX - srcW / 2,
      srcCY - srcH / 2,
      srcW,
      srcH,
      -targetSize.w / 2,
      -targetSize.h / 2,
      targetSize.w,
      targetSize.h
    )
    ctx.restore()
  }, [imageReady, offset, rotation, scale, targetSize, zoom, flipped, frame])

  const accentColor = kind === "banner" ? "#059669" : "#2563eb"

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onCancel() }}>
      <DialogContent className="p-0 sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">Crop {kind === "banner" ? "banner" : "popup"} image</DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Drag to position, rotate and zoom. The highlighted frame shows exactly what shoppers will see.
          </DialogDescription>
        </DialogHeader>

        {/* Viewport */}
        <div className="flex-1 flex items-center justify-center overflow-hidden bg-slate-100 px-4 py-2">
          <div
            className="relative overflow-hidden bg-slate-900 cursor-grab active:cursor-grabbing select-none touch-none"
            style={{ width: VP_SIZE, height: VP_SIZE, maxWidth: "100%", maxHeight: "60vh" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {/* Image layer */}
            {imageReady && imageRef.current && (
              <img
                src={src}
                alt=""
                draggable={false}
                className="absolute pointer-events-none"
                style={{
                  left: "50%",
                  top: "50%",
                  width: imageRef.current.naturalWidth * scale,
                  height: imageRef.current.naturalHeight * scale,
                  transform: imgTransform,
                  transformOrigin: "center center",
                }}
              />
            )}

            {/* Overlay: darkened outside with frame cutout */}
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute"
                style={{
                  left: frame.x,
                  top: frame.y,
                  width: frame.w,
                  height: frame.h,
                  boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.55)",
                  border: `2px solid ${accentColor}`,
                }}
              >
                {/* Rule of thirds */}
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/25" />
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/25" />
                <div className="absolute top-1/3 left-0 right-0 h-px bg-white/25" />
                <div className="absolute top-2/3 left-0 right-0 h-px bg-white/25" />

                {/* Corner label */}
                <div className="absolute -top-7 left-0">
                  <span className="rounded bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    {kind === "banner" ? "Banner 3:1" : "Popup 1:1"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden canvas for crop output */}
        <canvas ref={canvasRef} className="hidden" />

        <div className="border-t bg-slate-50 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>{Math.round(file.size / 1024)} KB · {imageRef.current?.naturalWidth} × {imageRef.current?.naturalHeight}px</span>
            <Sep />
            <span>Output: {targetSize.w} × {targetSize.h}px</span>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setRotation((r) => r - 90)} disabled={dragging} className="p-1.5 hover:bg-slate-200 rounded"><RotateCcw className="h-4 w-4" /></button>
            <button type="button" onClick={() => setRotation((r) => r + 90)} disabled={dragging} className="p-1.5 hover:bg-slate-200 rounded"><RotateCw className="h-4 w-4" /></button>
            <button type="button" onClick={() => setFlipped((f) => !f)} disabled={dragging} className="p-1.5 hover:bg-slate-200 rounded" title="Flip horizontal"><Maximize className="h-4 w-4" /></button>
            <div className="h-[24px] w-[1px] bg-slate-300 mx-1" />
            <button type="button" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} disabled={dragging} className="p-1.5 hover:bg-slate-200 rounded">−</button>
            <span className="text-xs font-mono text-slate-600">{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => setZoom((z) => Math.min(3, z + 0.1))} disabled={dragging} className="p-1.5 hover:bg-slate-200 rounded">+</button>
          </div>
        </div>

        <div className="border-t bg-slate-50 px-6 py-3 flex items-center justify-between">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded">Cancel</button>
          <button type="button" onClick={() => {
            const canvas = canvasRef.current
            if (!canvas) return
            canvas.toBlob((blob) => {
              if (blob) onConfirm(blob)
            }, "image/jpeg", 0.92)
          }} disabled={dragging || !imageReady} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded disabled:opacity-50">
            Use this crop
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ───────────────────────── one upload slot ─────────────────────────

function CreativeSlot({
  kind,
  url,
  size,
  uploading,
  disabled,
  onPick,
  onClear,
  onMeasured,
}: {
  kind: Slot
  url: string | null
  size?: { w: number; h: number }
  uploading: boolean
  disabled: boolean
  onPick: (file: File | null) => void
  onClear: () => void
  onMeasured: (size: { w: number; h: number }) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const copy = SLOT_COPY[kind]
  const note = ratioNote(kind, size)

  return (
    <Panel className="overflow-hidden">
      <PanelHeader title={copy.title} description={copy.use} />

      <div className="px-5 py-4">
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-xl border border-dashed bg-slate-50",
            kind === "banner" ? "aspect-[3/1]" : "aspect-square",
            url ? "border-slate-200" : "border-slate-300",
          )}
        >
          {url ? (
            <>
              <NextImage src={url} alt="" fill sizes="(max-width: 1024px) 100vw, 480px" className="object-cover" unoptimized onLoad={(event) => onMeasured({ w: event.currentTarget.naturalWidth, h: event.currentTarget.naturalHeight })} />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-white/85 px-3 py-2 backdrop-blur">
                <span className="truncate font-mono text-[11px] text-slate-600">{size ? `${size.w} × ${size.h}px` : "measuring…"}</span>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={disabled}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:text-emerald-700 disabled:opacity-50"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={onClear}
                    disabled={disabled}
                    aria-label={`Remove the ${kind} image`}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 transition hover:border-rose-200 hover:text-rose-600 disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              className="group flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400 transition hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? <Upload className="h-6 w-6 animate-pulse" /> : <ImagePlus className="h-6 w-6" />}
              <span className="text-xs font-semibold">{uploading ? "Uploading…" : "Upload image"}</span>
              <span className="text-[11px] text-slate-400 group-hover:text-emerald-700">{copy.spec}</span>
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="sr-only"
          onChange={(event) => {
            onPick(event.target.files?.[0] || null)
            event.target.value = ""
          }}
        />

        <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
          JPG, PNG, WebP or AVIF, up to 8 MB. Long edges are resized to 2000px on upload.
          {note && (
            <span className={cn("mt-1 block font-medium", note.warn ? "text-amber-700" : "text-emerald-700")}>
              {note.warn && <AlertTriangle className="mr-1 inline h-3 w-3 align-[-2px]" />}
              {note.text}
            </span>
          )}
        </p>
      </div>
    </Panel>
  )
}

// ───────────────────────── one placement switch ─────────────────────────

function Placement({
  title,
  hint,
  blockedHint,
  checked,
  disabled,
  onChange,
}: {
  title: string
  hint: string
  blockedHint: string
  checked: boolean
  disabled: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className={cn("mt-0.5 text-xs", disabled && !checked ? "text-amber-700" : "text-slate-500")}>{disabled ? blockedHint : hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-40",
          checked ? "bg-emerald-600" : "bg-slate-200",
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  )
}
