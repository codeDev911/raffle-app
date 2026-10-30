// Google OAuth 2.0 (Authorization Code flow) for merchant accounts.
// Implemented with plain fetch + jose so no extra dependency is required.
import { encrypt, decrypt } from "@/lib/auth"

const AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
const TOKEN_URL = "https://oauth2.googleapis.com/token"
const USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

export const OAUTH_STATE_COOKIE = "google_oauth_state"
export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000 // 10 minutes

export interface GoogleProfile {
  sub: string
  email: string
  emailVerified: boolean
  name: string
  picture?: string | null
}

export function googleCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
  return { clientId, clientSecret, configured: Boolean(clientId && clientSecret) }
}

export function isGoogleConfigured() {
  return googleCredentials().configured
}

/** Absolute callback URL. Must be registered verbatim in the Google Cloud console. */
export function googleRedirectUri(req?: Request) {
  const configured = process.env.GOOGLE_REDIRECT_URI?.trim()
  if (configured) return configured
  const base = (process.env.NEXT_PUBLIC_BASE_URL?.trim() || (req ? new URL(req.url).origin : "")).replace(/\/+$/, "")
  return `${base}/api/auth/google/callback`
}

/**
 * Origin for post-login redirects. The dev server binds 0.0.0.0, so request.url can report
 * that internal address — prefer the configured base URL, then the forwarded host headers.
 */
export function publicOrigin(req: Request) {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim()
  if (configured) return configured.replace(/\/+$/, "")

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host")
  if (host) {
    const proto =
      req.headers.get("x-forwarded-proto") ||
      (/^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(host) ? "http" : "https")
    return `${proto}://${host}`
  }
  return new URL(req.url).origin
}

/** Only same-origin relative paths are allowed as post-login destinations. */
export function safeNextPath(next: unknown, fallback: string) {
  const value = typeof next === "string" ? next.trim() : ""
  if (!value.startsWith("/") || value.startsWith("//")) return fallback
  return value
}

export async function buildGoogleAuthUrl({ redirectUri, state }: { redirectUri: string; state: string }) {
  const { clientId } = googleCredentials()
  const params = new URLSearchParams({
    client_id: clientId || "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
    include_granted_scopes: "true",
  })
  return `${AUTHORIZE_URL}?${params.toString()}`
}

/** Signed, short-lived state token — the nonce binds the callback to this browser. */
export async function createOAuthState({ next, mode }: { next: string; mode: "merchant" | "user" }) {
  const nonce = crypto.randomUUID()
  const token = await encrypt({ kind: "google_oauth_state", nonce, next, mode })
  return { token, nonce, maxAge: Math.floor(OAUTH_STATE_TTL_MS / 1000) }
}

export async function readOAuthState(token: string | undefined) {
  if (!token) return null
  try {
    const payload = await decrypt(token)
    if (payload?.kind !== "google_oauth_state") return null
    return {
      nonce: String(payload.nonce),
      next: safeNextPath(payload.next, "/merchants"),
      mode: payload.mode === "merchant" ? ("merchant" as const) : ("user" as const),
    }
  } catch {
    return null // expired or tampered
  }
}

export async function exchangeCodeForProfile(code: string, redirectUri: string): Promise<GoogleProfile> {
  const { clientId, clientSecret } = googleCredentials()
  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId || "",
      client_secret: clientSecret || "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  })

  if (!tokenRes.ok) {
    const detail = await tokenRes.text().catch(() => "")
    throw new Error(`Google token exchange failed (${tokenRes.status}): ${detail.slice(0, 200)}`)
  }

  const tokens = (await tokenRes.json()) as { access_token?: string }
  if (!tokens.access_token) throw new Error("Google token exchange returned no access token")

  const infoRes = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    cache: "no-store",
  })
  if (!infoRes.ok) throw new Error(`Google userinfo failed (${infoRes.status})`)

  const info = (await infoRes.json()) as {
    sub?: string
    email?: string
    email_verified?: boolean
    name?: string
    picture?: string
  }
  if (!info.sub || !info.email) throw new Error("Google account did not expose an email address")

  return {
    sub: info.sub,
    email: String(info.email).trim().toLowerCase(),
    emailVerified: Boolean(info.email_verified),
    name: (info.name || String(info.email).split("@")[0]).slice(0, 80),
    picture: info.picture || null,
  }
}
