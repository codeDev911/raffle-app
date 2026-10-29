import crypto from "crypto"
import { TICKET_PREFIX } from "./config"

/**
 * Normalizes a store URL into a bare lowercase shop domain.
 * "https://MyStore.myshopify.com/admin" -> "mystore.myshopify.com"
 */
export function normalizeStoreDomain(input: string): string {
  let value = String(input || "").trim().toLowerCase()
  value = value.replace(/^[a-z]+:\/\//, "")
  value = value.split(/[/?#]/)[0]
  value = value.replace(/:\d+$/, "")
  return value
}

export function isValidStoreDomain(domain: string): boolean {
  return /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(domain)
}

/**
 * Normalizes Pakistani phone numbers to 92XXXXXXXXXX (digits only) so that
 * "0300-1234567", "+92 300 1234567" and "923001234567" all match.
 */
export function normalizePhone(input?: string | null): string | null {
  if (!input) return null
  let digits = String(input).replace(/\D/g, "")
  if (!digits) return null
  if (digits.startsWith("0092")) digits = digits.slice(2)
  if (digits.startsWith("0") && digits.length === 11) digits = `92${digits.slice(1)}`
  if (digits.length === 10 && digits.startsWith("3")) digits = `92${digits}`
  return digits.length >= 7 ? digits : null
}

export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex")
}

export function generateApiKey(): string {
  return `prk_live_${crypto.randomBytes(24).toString("hex")}`
}

export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(24).toString("hex")}`
}

export function generateTicketNumber(): string {
  return `${TICKET_PREFIX}-${crypto.randomInt(1_000_000, 10_000_000)}`
}

export function generateInvoiceNumber(date = new Date()): string {
  const ym = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`
  return `INV-${ym}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`
}

/** Constant-time string comparison that tolerates different lengths. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(String(a))
  const bufB = Buffer.from(String(b))
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

/** "Muhammad Zubair Khan" -> "Muhammad K." */
export function maskName(name?: string | null): string {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "Verified Customer"
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`
}

/** "923001234567" -> "0300 •••• 567" */
export function maskPhone(phone?: string | null): string | null {
  const normalized = normalizePhone(phone)
  if (!normalized) return null
  const local = normalized.startsWith("92") ? `0${normalized.slice(2)}` : normalized
  return `${local.slice(0, 4)} •••• ${local.slice(-3)}`
}

export function maskSecret(secret?: string | null): string {
  const value = String(secret || "")
  if (value.length <= 10) return "••••••••"
  return `${value.slice(0, 8)}••••••••${value.slice(-4)}`
}

export function toInt(value: unknown, fallback: number | null = null): number | null {
  if (value === null || value === undefined || value === "") return fallback
  const n = Number(value)
  return Number.isFinite(n) ? Math.round(n) : fallback
}
