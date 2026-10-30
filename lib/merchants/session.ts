// Merchant + admin request authentication for Merchant Connect API routes.
//
// Merchants authenticate with either:
//   - an httpOnly `merchant_session` JWT cookie (legacy API-key dashboard login), bound to the
//     current API key so rotating the key revokes every existing session,
//   - the unified `session` cookie issued by /auth/merchant/login or Google sign-in, which
//     resolves the store owned by that account, or
//   - `Authorization: Bearer prk_live_…` (server-to-server / custom integrations).
import { cookies } from "next/headers"
import { decrypt, encrypt, getSession } from "@/lib/auth"
import { MERCHANT_SESSION_COOKIE } from "./config"
import { getMerchantDb } from "./db"
import { MerchantError, unauthorized } from "./errors"
import { authenticateApiKey, getStoreById } from "./services/stores"
import type { MerchantStore } from "./types"
import { safeEqual } from "./utils"

const SESSION_TTL_MS = 24 * 60 * 60 * 1000 // matches the JWT expiry set in lib/auth.encrypt

const keyId = (store: MerchantStore) => store.apiKeyHash.slice(0, 16)     // first 16 hex chars

/** The logged-in account behind the unified `session` cookie, if any. */
export async function getMerchantAccount(): Promise<{ id: string; email: string; name: string; role: string } | null> {
  try {
    const session = await getSession()
    if (!session || typeof session.userId !== "string") return null
    return {
      id: session.userId,
      email: String(session.email || ""),
      name: String(session.name || ""),
      role: String(session.role || ""),
    }
  } catch {
    return null // invalid / expired
  }
}

/** Store owned by an account signed in with email/password or Google. */
export async function getStoreForAccount(userId: string): Promise<MerchantStore | null> {
  if (!userId) return null
  try {
    const db = await getMerchantDb()
    return await db.merchantStore.findFirst({ where: { ownerId: userId } })
  } catch {
    return null // merchant tables not pushed yet
  }
}

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
  if (token) {
    try {
      const payload = await decrypt(token)
      if (payload?.kind === "merchant" && typeof payload.merchantStoreId === "string") {
        const store = await getStoreById(payload.merchantStoreId)
        if (store && typeof payload.kid === "string" && safeEqual(payload.kid, keyId(store))) return store
      }
    } catch {
      // expired or tampered token — fall through to the account session
    }
  }

  // Email/password or Google session: resolve the store this account owns.
  const account = await getMerchantAccount()
  if (account) return getStoreForAccount(account.id)
  return null
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
