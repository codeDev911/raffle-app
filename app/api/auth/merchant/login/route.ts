import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, createSession } from "@/lib/auth"
import { z } from "zod"

const merchantLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const dynamic = "force-dynamic"

// POST /api/auth/merchant/login — merchant email/password login into the unified session.
// Any active account may sign in here: retail buyers who own (or are about to connect) a
// store use the same credentials, and connecting a store promotes them to MERCHANT.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = merchantLoginSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Invalid merchant credentials" }, { status: 401 })
    }

    // Google-only accounts have no password hash and must use the Google button.
    if (!user.password) {
      return NextResponse.json(
        { error: "This account uses Google sign-in. Continue with Google instead.", code: "USE_GOOGLE" },
        { status: 401 },
      )
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid merchant credentials" }, { status: 401 })
    }

    await createSession(user.id, user.role)

    // Where the merchant lands depends on the store attached to this account and whether the
    // welcome wizard (store + Shopify connect + intake form) was finished.
    let hasStore = false
    let onboardingCompleted = false
    try {
      const store = await prisma.merchantStore.findFirst({
        where: { ownerId: user.id },
        select: { id: true, onboardingCompletedAt: true },
      })
      hasStore = Boolean(store)
      onboardingCompleted = Boolean(store?.onboardingCompletedAt)
    } catch {
      // merchant tables not pushed yet
    }

    return NextResponse.json({
      message: "Merchant login successful",
      hasStore,
      onboardingCompleted,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Merchant login error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
