import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { EasyPaisaPayment, JazzCashPayment } from "@/lib/payments"
import { generateOrderId } from "@/lib/utils"
import { z } from "zod"

const initiatePaymentSchema = z.object({
  raffleId: z.string(),
  quantity: z.number().min(1).max(10),
  method: z.enum(["EASYPAISA", "JAZZCASH"]),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { raffleId, quantity, method } = initiatePaymentSchema.parse(body)

    // Get raffle details
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
    })

    if (!raffle || raffle.status !== "ACTIVE") {
      return NextResponse.json({ error: "Raffle not available" }, { status: 400 })
    }

    if (raffle.currentEntries + quantity > raffle.totalEntries) {
      return NextResponse.json({ error: "Not enough entries available" }, { status: 400 })
    }

    const totalAmount = (raffle.price * quantity) / 100 // Convert from paisa to PKR
    const orderId = generateOrderId()

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: raffle.price * quantity, // Store in paisa
        method,
        transactionId: orderId,
        metadata: {
          raffleId,
          quantity,
          raffleName: raffle.title,
        },
      },
    })

    // Initialize payment gateway
    let paymentGateway
    if (method === "EASYPAISA") {
      paymentGateway = new EasyPaisaPayment()
    } else {
      paymentGateway = new JazzCashPayment()
    }

    const paymentData = await paymentGateway.initiatePayment({
      amount: totalAmount,
      orderId,
      customerEmail: user.email,
      customerPhone: user.phone || "",
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`,
    })

    return NextResponse.json({
      paymentId: payment.id,
      paymentUrl: paymentData.url,
      paymentData: paymentData.data,
    })
  } catch (error) {
    console.error("Initiate payment error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
