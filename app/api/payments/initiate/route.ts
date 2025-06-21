import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { PaymobPayment } from "@/lib/payments"
import { generateOrderId } from "@/lib/utils"
import { z } from "zod"

const initiatePaymentSchema = z.object({
  raffleId: z.string(),
  quantity: z.number().min(1).max(10),
  method: z.enum(["CARD", "EASYPAISA", "JAZZCASH"]),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()

    // Handle both 'method' and 'paymentMethod' field names
    const paymentData = {
      raffleId: body.raffleId,
      quantity: body.quantity,
      method: body.method || body.paymentMethod,
    }

    const { raffleId, quantity, method } = initiatePaymentSchema.parse(paymentData)

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
    console.log({orderId});
    
    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: raffle.price * quantity, // Store in paisa
        method,
        transactionId: orderId,
        status: "PENDING",
        metadata: {
          raffleId,
          quantity,
          raffleName: raffle.title,
        },
      },
    })

    // Create return URL with payment ID
    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback?paymentId=${payment.id}&orderId=${orderId}`

    // Initialize Paymob payment
    const paymob = new PaymobPayment()

    const paymentResult = await paymob.createPayment({
      amount: totalAmount,
      orderId,
      customerEmail: user.email,
      customerPhone: user.phone || "03000000000",
      customerName: user.name,
      paymentMethod: method,
      returnUrl,
    })


    // Update payment with Paymob order ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionId: paymentResult.orderId.toString(),
      },
    })

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      paymentUrl: paymentResult.paymentUrl,
      paymobOrderId: paymentResult.orderId,
    })
  } catch (error) {
    console.error("Initiate payment error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 },
      )
    }
    return NextResponse.json(
      {
        error: "Payment initiation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
