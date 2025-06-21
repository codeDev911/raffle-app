import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PaymobPayment } from "@/lib/payments"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-paymob-signature") || ""

    const paymob = new PaymobPayment()

    
    const webhookData = JSON.parse(body)
    const transactionData = paymob.processWebhookData(webhookData)

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { transactionId: transactionData.orderId },
    })

    if (!payment) {
      console.error("Payment not found:", transactionData.orderId)
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (transactionData.status === "successful") {
      // Payment successful
      await prisma.$transaction(async (tx) => {
        // Update payment status - KEEP IT SIMPLE
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "COMPLETED",
            gatewayRef: transactionData.transactionId,
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

      console.log("Payment completed successfully:", transactionData.orderId)
    } else if (transactionData.status === "failed") {
      // Payment failed - KEEP IT SIMPLE
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          gatewayRef: transactionData.transactionId,
        },
      })

      console.log("Payment failed:", transactionData.orderId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
