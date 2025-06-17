import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { EasyPaisaPayment, JazzCashPayment } from "@/lib/payments"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pp_TxnRefNo, pp_ResponseCode, pp_ResponseMessage, ...otherData } = body

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { transactionId: pp_TxnRefNo },
      include: { user: true },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Verify payment with gateway
    let paymentGateway
    if (payment.method === "EASYPAISA") {
      paymentGateway = new EasyPaisaPayment()
    } else {
      paymentGateway = new JazzCashPayment()
    }

    const isValid = await paymentGateway.verifyPayment(body)

    if (isValid && pp_ResponseCode === "000") {
      // Payment successful
      await prisma.$transaction(async (tx) => {
        // Update payment status
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "COMPLETED",
            gatewayRef: body.pp_TxnId || body.pp_AuthCode,
          },
        })

        // Create raffle entries
        const metadata = payment.metadata as any
        await tx.entry.create({
          data: {
            userId: payment.userId,
            raffleId: metadata.raffleId,
            quantity: metadata.quantity,
            totalCost: payment.amount,
            paymentId: payment.id,
          },
        })

        // Update raffle current entries
        await tx.raffle.update({
          where: { id: metadata.raffleId },
          data: {
            currentEntries: {
              increment: metadata.quantity,
            },
          },
        })
      })

      return NextResponse.json({
        success: true,
        message: "Payment successful! Your entries have been added.",
      })
    } else {
      // Payment failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          gatewayRef: body.pp_TxnId || body.pp_AuthCode,
        },
      })

      return NextResponse.json({
        success: false,
        message: pp_ResponseMessage || "Payment failed",
      })
    }
  } catch (error) {
    console.error("Payment callback error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
