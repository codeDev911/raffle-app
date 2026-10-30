import { type NextRequest, NextResponse } from "next/server"
import {
  OAUTH_STATE_COOKIE,
  buildGoogleAuthUrl,
  createOAuthState,
  googleRedirectUri,
  isGoogleConfigured,
  publicOrigin,
  safeNextPath,
} from "@/lib/auth/google"

export const dynamic = "force-dynamic"

// GET /api/auth/google/login?mode=merchant&next=/merchants — start the Google OAuth redirect.
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("mode") === "user" ? "user" : "merchant"
  const fallback = mode === "merchant" ? "/merchants" : "/raffles"
  const next = safeNextPath(req.nextUrl.searchParams.get("next"), fallback)

  if (!isGoogleConfigured()) {
    const target = new URL(mode === "merchant" ? "/auth/merchant/login" : "/auth/login", publicOrigin(req))
    target.searchParams.set("error", "Google sign-in is not configured yet. Use email and password instead.")
    return NextResponse.redirect(target)
  }

  const { token, maxAge } = await createOAuthState({ next, mode })
  const authUrl = await buildGoogleAuthUrl({ redirectUri: googleRedirectUri(req), state: token })

  const response = NextResponse.redirect(authUrl)
  response.cookies.set(OAUTH_STATE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // must survive the cross-site redirect back from Google
    path: "/api/auth/google",
    maxAge,
  })
  return response
}
