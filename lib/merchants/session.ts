// Merchant + admin request authentication for Merchant Connect API routes.
//
// Merchants authenticate with either:
//   - an httpOnly `merchant_session` JWT cookie (dashboard), bound to the current API key
//     so rotating the key revokes every existing session, or
//   - `Authorization: Bearer prk_live_…` (server-to-server / custom integrations).
import { cookies } from "next/headers"
import { decrypt, encrypt, getSession } from "@/lib/auth"
import { MERCHANT_SESSION_COOKIE } from "./config"
import { MerchantError, unauthorized } from "./errors"
import { authenticateApiKey, getStoreById } from "./services/stores"
import type { MerchantStore } from "./types"
import { safeEqual } from "./utils"

const SESSION_TTL_MS = 24 * 60 * 60 * 1000 // matches the JWT expiry set in lib/auth.encrypt

const keyId = (store: MerchantStore) => store.apiKeyHash.slice(0, 16)

export async function createMerchantSession(store: MerchantStore) {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  const token = await encrypt({ kind: "merchant", merchantStoreId: store.id, kid: keyId(store) })
  const cookieStore = await cookies()
  cookieStore.set(MERCHANT_SESSION_COOKIE, token, {
    expires: expiresAt,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })
}

export async function clearMerchantSession() {
  const cookieStore = await cookies()
  cookieStore.delete(MERCHANT_SESSION_COOKIE)
}

export async function getAuthenticatedStore(req: Request): Promise<MerchantStore | null> {
  const authHeader = req.headers.get("authorization") || ""
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authenticateApiKey(authHeader.slice(7).trim())
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(MERCHANT_SESSION_COOKIE)?.value
  if (!token) return null

  try {
    const payload = await decrypt(token)
    if (payload?.kind !== "merchant" || typeof payload.merchantStoreId !== "string") return null
    const store = await getStoreById(payload.merchantStoreId)
    if (!store || typeof payload.kid !== "string" || !safeEqual(payload.kid, keyId(store))) return null
    return store
  } catch {
    return null // expired or tampered token
  }
}

export async function requireMerchant(req: Request): Promise<MerchantStore> {
  const store = await getAuthenticatedStore(req)
  if (!store) throw unauthorized("Please log in to your merchant dashboard")
  return store
}

/**
 * Admin guard. Accepts an ADMIN user session, or the admin panel's request header.
 * When MERCHANT_ADMIN_TOKEN is configured, the header must also carry that token
 * (x-admin-token), which closes the gap left by the panel's client-side-only login.
 */
export async function requireAdmin(req: Request): Promise<void> {
  try {
    const session = await getSession()
    if (session?.role === "ADMIN") return
  } catch {
    // invalid / expired user session — fall through to header checks
  }

  const configuredToken = process.env.MERCHANT_ADMIN_TOKEN
  if (configuredToken) {
    const provided = req.headers.get("x-admin-token") || ""
    if (provided && safeEqual(provided, configuredToken)) return
    throw new MerchantError("Admin token required", 401, "ADMIN_TOKEN_REQUIRED")
  }

  if (req.headers.get("x-admin-request") === "true") return
  throw new MerchantError("Admin access required", 403, "FORBIDDEN")
}
