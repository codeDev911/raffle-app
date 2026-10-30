import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { settleMerchantPayment, releaseMerchantPayment, refundPayment } from "@/lib/merchants/services/entry-payments"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {

    const { status,transactionId,referralLinkId } = await request.json()

    // Validate status
    const validStatuses = ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "REFUNDED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Check if payment exists and can be updated
    const existingPayment = await prisma.payment.findUnique({
      where: { id: params.id },
    })

    if (!existingPayment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // A verified payment is final except for one move: refunding it. Everything else stays locked
    // so a stray dropdown change can never un-verify money that has already been banked.
    if (existingPayment.status === "REFUNDED") {
      return NextResponse.json({ error: "This payment has already been refunded" }, { status: 400 })
    }
    if (existingPayment.status === "COMPLETED" && status !== "REFUNDED") {
      return NextResponse.json({ error: "A verified payment can only be refunded" }, { status: 400 })
    }

    // Merchant Connect payments settle their ticket *before* the status flips: if confirmation
    // fails the payment stays open and can be retried, instead of a paid ticket being locked out.
    if (status === "COMPLETED") {
      try {
        await settleMerchantPayment(params.id)
      } catch (error) {
        console.error("[MerchantConnect] settlement failed:", error)
        return NextResponse.json(
          { error: "Could not confirm this merchant entry. Please retry." },
          { status: 500 },
        )
      }
    }

    // A refund withdraws the customer from the draw: the raffle entry is deleted (and the raffle
    // counter put back) before the status flips, so a failure leaves a verified payment intact.
    if (status === "REFUNDED") {
      try {
        await refundPayment(params.id)
      } catch (error) {
        console.error("[Payments] refund failed:", error)
        return NextResponse.json(
          { error: "Could not withdraw this entry from the raffle. Please retry." },
          { status: 500 },
        )
      }
    }

    // A failed transfer hands the ticket back to the merchant: the entry returns to payable and
    // a batch invoice reopens, so the dashboard never sits on "Awaiting confirmation" forever.
    if (status === "FAILED") {
      try {
        await releaseMerchantPayment(params.id)
      } catch (error) {
        console.error("[MerchantConnect] release failed:", error)
        return NextResponse.json(
          { error: "Could not reopen this merchant entry. Please retry." },
          { status: 500 },
        )
      }
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: params.id },
      data: { status },
      include:{
        user:true
      },
      
    })


      fetch(`${process.env.EMAIL_API_URL}/send-template-email`,{
      method:"POST",
      body:JSON.stringify({
          to: updatedPayment.user.email,
          subject: "Payment status - Pakraffle",
          senderType: "payments" ,
          templateType: "payment" ,
          templateData: {
            userName:updatedPayment.user.name,
            transactionId:updatedPayment.transactionId,
            amount:updatedPayment.amount / 100, // From paisa to PKR 
            paymentMethod:updatedPayment.method,
            status:status.toLowerCase(),
            raffleTitle:"Raffle title",
        }
      })
    })
    .then(res=>res)
    .then(async(data)=>console.log(await data.json()))
    .catch(e=>console.log(e))
 

    return NextResponse.json(updatedPayment)
  } catch (error) {
    console.error("Error updating payment status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
