// Request payload schemas for Merchant Connect. Every API input is parsed here before it
// reaches the service layer, so services can trust their arguments.
import { z } from "zod"
import { PAYMENT_METHODS, RULE_TYPES } from "./types"

const trimmed = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, { message: `${label} must be at least ${min} characters` })
    .max(max, { message: `${label} must be at most ${max} characters` })

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null))

const phone = z
  .string()
  .trim()
  .regex(/^[+\d][\d\s-]{9,17}$/, { message: "Enter a valid phone / WhatsApp number" })

const webhookSecret = z
  .string()
  .trim()
  .min(16, { message: "Webhook signing secret must be at least 16 characters" })
  .max(200)

const positiveInt = (label: string, max = 10_000_000) =>
  z.coerce
    .number()
    .int({ message: `${label} must be a whole number` })
    .min(1, { message: `${label} must be at least 1` })
    .max(max, { message: `${label} is too large` })

/** Accepts ["a","b"] or "a, b" and returns a de-duplicated list of non-empty tokens. */
const productFilters = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .nullable()
  .transform((value) => {
    const list = Array.isArray(value) ? value : String(value || "").split(",")
    return Array.from(new Set(list.map((v) => v.trim()).filter(Boolean))).slice(0, 25)
  })

export const connectStoreSchema = z.object({
  name: trimmed(2, 80, "Store name"),
  storeUrl: trimmed(4, 255, "Store URL"),
  contactEmail: z.string().trim().toLowerCase().email({ message: "Enter a valid email address" }),
  contactPhone: phone,
  payoutDetails: optionalText(500),
  webhookSecret: webhookSecret.optional().nullable(),
})

export const loginSchema = z.object({
  apiKey: z.string().trim().min(20, { message: "Enter your full API key" }).max(200),
})

export const updateSettingsSchema = z.object({
  name: trimmed(2, 80, "Store name").optional(),
  contactEmail: z.string().trim().toLowerCase().email({ message: "Enter a valid email address" }).optional(),
  contactPhone: phone.optional(),
  payoutDetails: optionalText(500),
  /**
   * Public store logo. Merchants paste either "https://…" or a bare "cdn.shopify.com/…"; an empty
   * string or null clears it, which is why the blank case maps to null instead of being dropped.
   */
  logoUrl: z
    .string()
    .trim()
    .max(600, { message: "Logo URL is too long" })
    .optional()
    .nullable()
    .transform((v) =>
      v === undefined ? undefined : v === null || v === "" ? null : /^https?:\/\//i.test(v) ? v : `https://${v.replace(/^\/\//, "")}`,
    )
    .refine((v) => v === undefined || v === null || /^https:\/\/[^/?]+\.[a-z]{2,}/i.test(v), {
      message: "Enter a full image URL, e.g. https://cdn.example.com/logo.png",
    }),
  webhookSecret: webhookSecret.optional(),
  regenerateWebhookSecret: z.boolean().optional(),
})

export const createCampaignSchema = z.object({
  title: trimmed(3, 120, "Campaign title"),
  raffleId: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  ruleType: z.enum(RULE_TYPES),
  minQuantity: positiveInt("Minimum quantity", 10_000).optional().nullable(),
  minAmount: positiveInt("Minimum order value").optional().nullable(),
  productFilters,
  maxEntries: positiveInt("Max entries", 1_000_000).optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date({ message: "Enter a valid end date" }),
})

export const updateCampaignSchema = z.object({
  action: z.enum(["pause", "resume"]).optional(),
  title: trimmed(3, 120, "Campaign title").optional(),
  endDate: z.coerce.date().optional(),
  maxEntries: positiveInt("Max entries", 1_000_000).optional().nullable(),
})

export const generateInvoiceSchema = z.object({
  campaignId: z.string().trim().min(1, { message: "campaignId is required" }),
})

/**
 * Creative images normally come back from our own upload endpoint, but a seller may equally paste a
 * Shopify CDN link. Either way the stored value is an https URL, and an empty string clears the slot
 * — which is why blank maps to null instead of being dropped from the patch.
 */
const creativeImage = (label: string) =>
  z
    .string()
    .trim()
    .max(600, { message: `${label} image URL is too long` })
    .optional()
    .nullable()
    .transform((v) =>
      v === undefined ? undefined : v === null || v === "" ? null : /^https?:\/\//i.test(v) ? v : `https://${v.replace(/^\/\//, "")}`,
    )
    .refine((v) => v === undefined || v === null || /^https:\/\/[^/?]+\.[a-z]{2,}/i.test(v), {
      message: `Enter a full ${label.toLowerCase()} image URL, e.g. https://cdn.example.com/banner.jpg`,
    })

/**
 * The page the seller points at, however they paste it: "promo", "promo/", "/pages/promo" and a full
 * storefront URL all mean the same handle. The widget compares this against the live URL.
 */
const pageHandle = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((v) => {
    if (v === undefined) return undefined
    if (v === null) return null
    const cleaned = v
      .replace(/^https?:\/\/[^/]+/i, "")
      .replace(/^\/?(?:en(?:-[a-z]{2})?\/)?(?:pages|products|collections)\//i, "")
      .replace(/[?#].*$/, "")
      .replace(/^\/+|\/+$/g, "")
      .toLowerCase()
    return cleaned ? cleaned.slice(0, 120) : null
  })
  .refine((v) => v === undefined || v === null || /^[a-z0-9][a-z0-9_-]*$/.test(v), {
    message: "Page name can only contain letters, numbers, hyphens or underscores",
  })

/** Checkboxes arrive as booleans from fetch and as "true"/"false" from plain form encoders. */
const toggle = z
  .union([z.boolean(), z.string(), z.number()])
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined
    if (typeof v === "boolean") return v
    if (typeof v === "number") return v === 1
    return v === "true" || v === "1"
  })

/**
 * Where the creative sends the shopper: a path on their own storefront ("/collections/summer") or a
 * full https URL. Protocol-relative and scheme URLs are refused here, long before anything is echoed
 * into an <a href> on a live theme.
 */
const ctaTarget = z
  .string()
  .trim()
  .max(400, { message: "Destination is too long" })
  .optional()
  .nullable()
  .transform((v) => (v === undefined ? undefined : v === null || v === "" ? null : v))
  .refine((v) => {
    if (v === undefined || v === null) return true
    if (v.charAt(0) === "/") return v.charAt(1) !== "/"
    return /^https:\/\/[^/?]+\.[a-z]{2,}/i.test(v)
  }, { message: "Use a store path like /collections/summer, or a full https:// link" })

/**
 * Everything the "Campaign details" tab writes. Each field is optional so a partial save works, and
 * the cross-field rules (an enabled placement needs its image, a custom page needs its handle) are
 * checked in the service against the merged state — never against half a payload.
 */
export const updateCreativeSchema = z.object({
  bannerUrl: creativeImage("Banner"),
  popupUrl: creativeImage("Popup"),
  showBannerHome: toggle,
  showPopupHome: toggle,
  showBannerProduct: toggle,
  showPopupProduct: toggle,
  showCustomPage: toggle,
  pageSlug: pageHandle,
  ctaUrl: ctaTarget,
})

export const submitPaymentSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHODS),
  transactionRef: trimmed(4, 100, "Transaction reference"),
  paymentProof: z.string().trim().url({ message: "Upload a payment receipt" }).max(1000),
})

export const simulateOrderSchema = z.object({
  orderId: z.string().trim().max(64).optional(),
  itemCount: positiveInt("Item count", 500),
  unitPrice: z.coerce.number().min(0).max(10_000_000),
  customerName: z.string().trim().max(80).optional(),
  customerPhone: z.string().trim().max(20).optional(),
  customerCity: z.string().trim().max(60).optional(),
  customerEmail: z.string().trim().email().max(120).optional().or(z.literal("")),
  productTitle: z.string().trim().max(120).optional(),
  sku: z.string().trim().max(64).optional(),
})

export const adminStoreStatusSchema = z.object({
  status: z.enum(["ACTIVE", "PAUSED"]),
})

/**
 * Admin governance over a campaign. Only the minting stage is writable here: once a campaign is
 * awaiting its invoice, draw-ready or completed, its lifecycle belongs to settlement and the draw.
 */
export const adminCampaignStatusSchema = z.object({
  status: z.enum(["ACTIVE", "PAUSED"]),
})

/** Settlement note kept on the invoice record (empty string clears it). */
export const adminInvoiceNoteSchema = z.object({
  adminNotes: z.string().trim().max(2000),
})

/** Staff decision on a payout. Credits need no decision — they apply themselves to the next batch. */
export const refundDecisionSchema = z.object({
  id: z.string().trim().min(1, { message: "id is required" }),
  action: z.enum(["APPROVE", "REJECT", "PAID"]),
  note: z.string().trim().max(800).optional(),
})

/** An unspent credit can still be switched into a payout request, and back. */
export const refundSettlementSchema = z.object({
  settlement: z.enum(["CREDIT", "PAYOUT"]),
})
