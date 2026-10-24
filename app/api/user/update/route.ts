import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser, hashPassword, verifyPassword } from "@/lib/auth"
import { z } from "zod"

export const dynamic = "force-dynamic"

const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, city, currentPassword, newPassword } = updateUserSchema.parse(body)

    // Check if email changed and if already taken
    if (email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })
      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json({ error: "This email is already associated with another account" }, { status: 400 })
      }
    }

    // Build update data
    const updateData: any = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      city: city ? city.trim() : null,
    }

    // Handle password change if requested
    if (newPassword && newPassword.trim().length > 0) {
      if (newPassword.trim().length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 })
      }

      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
      })

      if (fullUser && currentPassword) {
        const isMatch = await verifyPassword(currentPassword, fullUser.password)
        if (!isMatch) {
          return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
        }
      }

      updateData.password = await hashPassword(newPassword.trim())
    }

    // Update user in DB
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        role: true,
      },
    })

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Update profile error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update profile. Please try again." }, { status: 500 })
  }
}
