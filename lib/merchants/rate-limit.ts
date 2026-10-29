// Lightweight in-memory fixed-window rate limiter for abuse-prone public endpoints
// (API-key login, public ticket lookup). Per-instance only — good enough to blunt
// brute-force and scraping without adding infrastructure.
import { MerchantError } from "./errors"

const buckets = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    if (buckets.size > 5000) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k)
    }
    return { ok: true, retryAfter: 0 }
  }

  bucket.count++
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }
  }
  return { ok: true, retryAfter: 0 }
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  )
}

/** Throws a 429 MerchantError when the caller exceeds `limit` requests per window. */
export function enforceRateLimit(req: Request, bucket: string, limit: number, windowMs: number) {
  const { ok, retryAfter } = rateLimit(`${bucket}:${clientIp(req.headers)}`, limit, windowMs)
  if (!ok) {
    throw new MerchantError(`Too many attempts. Try again in ${retryAfter}s.`, 429, "RATE_LIMITED")
  }
}
