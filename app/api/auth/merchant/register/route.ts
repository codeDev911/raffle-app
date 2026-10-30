import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, createSession } from "@/lib/auth"
import { z } from "zod"

const merchantRegisterSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  storeName: z.string().trim().max(80).optional().or(z.literal("")),
  storeUrl: z.string().trim().max(255).optional().or(z.literal("")),
})

export const dynamic = "force-dynamic"

// POST /api/auth/merchant/register — create a merchant account (email + password).
// The store itself is connected afterwards from the dashboard, which links it to this user.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, password, storeName, storeUrl } = merchantRegisterSchema.parse(body)

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Log in instead." },
        { status: 409 },
      )
    }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: "MERCHANT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    // The pending store details are handed to the onboarding dialog via the redirect,
    // so a merchant never has to type their domain twice.
    await createSession(user.id, user.role)

    return NextResponse.json({
      message: "Merchant account created",
      user,
      pendingStore: storeName || storeUrl ? { name: storeName || "", storeUrl: storeUrl || "" } : null,
    })
  } catch (error) {
    console.error("Merchant registration error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
