import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createSession } from "@/lib/auth"
import {
  OAUTH_STATE_COOKIE,
  exchangeCodeForProfile,
  googleRedirectUri,
  isGoogleConfigured,
  publicOrigin,
  readOAuthState,
} from "@/lib/auth/google"

export const dynamic = "force-dynamic"

function failure(origin: string, mode: "merchant" | "user", message: string) {
  const target = new URL(mode === "merchant" ? "/auth/merchant/login" : "/auth/login", origin)
  target.searchParams.set("error", message)
  const response = NextResponse.redirect(target)
  response.cookies.delete(OAUTH_STATE_COOKIE)
  return response
}

// GET /api/auth/google/callback — verify state, exchange the code and open a session.
export async function GET(req: NextRequest) {
  const origin = publicOrigin(req)
  const params = req.nextUrl.searchParams

  const state = await readOAuthState(req.cookies.get(OAUTH_STATE_COOKIE)?.value)
  const mode = state?.mode || "merchant"

  if (!isGoogleConfigured()) return failure(origin, mode, "Google sign-in is not configured yet.")

  // Google reports user cancellations and errors here instead of the code.
  const oauthError = params.get("error")
  if (oauthError) {
    return failure(origin, mode, oauthError === "access_denied" ? "Google sign-in was cancelled." : "Google sign-in failed.")
  }

  const code = params.get("code")
  const returnedState = params.get("state")
  if (!code) return failure(origin, mode, "Google did not return an authorization code.")
  // The signed cookie is the source of truth; the echoed state must match it.
  if (!state || !returnedState || returnedState !== req.cookies.get(OAUTH_STATE_COOKIE)?.value) {
    return failure(origin, mode, "Sign-in session expired. Please try again.")
  }

  try {
    const profile = await exchangeCodeForProfile(code, googleRedirectUri(req))

    // 1. Known Google identity, 2. known email (link the provider), 3. brand-new account.
    let user = await prisma.user.findFirst({ where: { OR: [{ googleId: profile.sub }, { email: profile.email }] } })

    if (user) {
      if (!user.isActive) return failure(origin, mode, "This account has been disabled. Contact support.")

      // Link the Google identity to the existing account on first Google sign-in.
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: profile.sub,
            image: user.image || profile.picture || null,
            emailVerified: user.emailVerified || new Date(),
          },
        })
      }
    } else {
      user = await prisma.user.create({
        data: {
          name: profile.name,
          email: profile.email,
          role: mode === "merchant" ? "MERCHANT" : "USER",
          googleId: profile.sub,
          image: profile.picture || null,
          emailVerified: profile.emailVerified ? new Date() : null,
        },
      })
    }

    await createSession(user.id, user.role)

    // Merchants with a connected, onboarded store go straight to the workspace; the rest
    // continue (or resume) the welcome wizard.
    let destination = state.next
    if (mode === "merchant" && (destination === "/merchants" || destination === "/merchants/onboarding")) {
      let store: { onboardingCompletedAt: Date | null } | null = null
      try {
        store = await prisma.merchantStore.findFirst({
          where: { ownerId: user.id },
          select: { onboardingCompletedAt: true },
        })
      } catch {
        // merchant tables not pushed yet — fall back to the onboarding wizard
      }
      destination = store?.onboardingCompletedAt ? "/merchants/dashboard" : "/merchants/onboarding"
    }

    const response = NextResponse.redirect(new URL(destination, origin))
    response.cookies.delete(OAUTH_STATE_COOKIE)
    return response
  } catch (error) {
    console.error("Google OAuth callback error:", error)
    return failure(origin, mode, "Google sign-in failed. Please try again.")
  }
}
