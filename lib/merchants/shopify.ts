import crypto from "crypto"
import type { NormalizedOrder } from "./types"
import { safeEqual } from "./utils"

// Shopify webhook topics handled by the ingestion pipeline.
export const MINT_TOPICS = new Set(["orders/fulfilled", "orders/updated"])
export const CANCEL_TOPICS = new Set(["orders/cancelled", "refunds/create"])

/** Shopify signs the raw request body: base64(HMAC-SHA256(secret, body)). */
export function signShopifyPayload(rawBody: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64")
}

export function verifyShopifyHmac(rawBody: string, hmacHeader: string | null | undefined, secret: string): boolean {
  if (!hmacHeader || !secret) return false
  return safeEqual(signShopifyPayload(rawBody, secret), hmacHeader.trim())
}

function str(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const s = String(value).trim()
  return s ? s : null
}

function num(value: unknown): number {
  const n = parseFloat(String(value ?? ""))
  return Number.isFinite(n) ? n : 0
}

/** Maps a Shopify order payload into the platform-agnostic order shape. */
export function normalizeShopifyOrder(payload: any): NormalizedOrder {
  const customer = payload?.customer || {}
  const shipping = payload?.shipping_address || {}
  const billing = payload?.billing_address || {}

  const customerName =
    str([customer.first_name, customer.last_name].filter(Boolean).join(" ")) ||
    str(shipping.name) ||
    str(billing.name) ||
    "Store Customer"

  const lineItems = Array.isArray(payload?.line_items)
    ? payload.line_items.map((li: any) => ({
        title: str(li.title) || str(li.name) || "Item",
        sku: str(li.sku),
        productId: str(li.product_id),
        variantId: str(li.variant_id),
        quantity: Math.max(0, Math.round(num(li.current_quantity ?? li.quantity))),
        unitPrice: num(li.price),
      }))
    : []

  return {
    orderId: String(payload?.id ?? ""),
    orderName: str(payload?.name) || (payload?.order_number ? `#${payload.order_number}` : null),
    customerName,
    customerEmail: str(payload?.email) || str(payload?.contact_email) || str(customer.email),
    customerPhone: str(payload?.phone) || str(customer.phone) || str(shipping.phone) || str(billing.phone),
    customerCity:
      str(shipping.city) ||
      str(billing.city) ||
      str(customer.default_address?.city) ||
      str(payload?.customer?.addresses?.[0]?.city),
    subtotal: num(payload?.current_subtotal_price ?? payload?.subtotal_price ?? payload?.total_price),
    lineItems,
    fulfilled: String(payload?.fulfillment_status || "").toLowerCase() === "fulfilled",
    cancelled: Boolean(payload?.cancelled_at),
    financialStatus: str(payload?.financial_status),
  }
}

/** Extracts the order id from cancellation-type payloads (order object or refund object). */
export function extractCancelledOrderId(topic: string, payload: any): string | null {
  if (topic === "refunds/create") return str(payload?.order_id)
  return str(payload?.id)
}

export interface MockOrderInput {
  orderId?: string
  itemCount: number
  unitPrice: number
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  customerCity?: string
  productTitle?: string
  sku?: string
}

/** Builds a realistic Shopify `orders/fulfilled` payload for the dashboard simulator. */
export function buildMockShopifyOrder(input: MockOrderInput) {
  const orderNumber = crypto.randomInt(1000, 99999)
  const id = input.orderId?.trim() || String(5_000_000_000_000 + crypto.randomInt(0, 999_999_999))
  const quantity = Math.max(1, Math.round(input.itemCount))
  const unitPrice = Math.max(0, input.unitPrice)
  const subtotal = (quantity * unitPrice).toFixed(2)
  const [firstName, ...rest] = (input.customerName || "Test Customer").trim().split(/\s+/)
  const now = new Date().toISOString()

  return {
    id: Number.isNaN(Number(id)) ? id : Number(id),
    name: `#${orderNumber}`,
    order_number: orderNumber,
    email: input.customerEmail || "test.customer@example.com",
    phone: input.customerPhone || "+923001234567",
    currency: "PKR",
    financial_status: "paid",
    fulfillment_status: "fulfilled",
    cancelled_at: null,
    created_at: now,
    updated_at: now,
    subtotal_price: subtotal,
    current_subtotal_price: subtotal,
    total_price: subtotal,
    customer: {
      first_name: firstName,
      last_name: rest.join(" ") || null,
      email: input.customerEmail || "test.customer@example.com",
      phone: input.customerPhone || "+923001234567",
      default_address: input.customerCity ? { city: input.customerCity } : null,
    },
    shipping_address: {
      name: (input.customerName || "Test Customer").trim(),
      phone: input.customerPhone || "+923001234567",
      city: input.customerCity || null,
    },
    line_items: [
      {
        id: crypto.randomInt(1_000_000, 9_999_999),
        title: input.productTitle || "Simulated Product",
        sku: input.sku || "SIM-SKU-001",
        product_id: 7_000_000_000,
        variant_id: 4_000_000_000,
        quantity,
        current_quantity: quantity,
        price: unitPrice.toFixed(2),
      },
    ],
  }
}
