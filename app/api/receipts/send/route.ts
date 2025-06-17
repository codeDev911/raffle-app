import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json()

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            city: true,
          },
        },
        entries: {
          include: {
            raffle: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Here you would integrate with your email service (SendGrid, Resend, etc.)
    // For now, we'll simulate sending the email
    console.log(`Sending receipt to ${payment.user.email} for payment ${payment.id}`)

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: `Receipt sent to ${payment.user.email}`,
    })
  } catch (error) {
    console.error("Error sending receipt:", error)
    return NextResponse.json({ error: "Failed to send receipt" }, { status: 500 })
  }
}
