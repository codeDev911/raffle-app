import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PaymobPayment } from "@/lib/payments"
import { PaymentStatus } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const paymob = new PaymobPayment()

    // Verify callback
    if (!paymob.verifyCallback(body)) {
      console.error("Invalid callback data")
      return NextResponse.json({ error: "Invalid callback" }, { status: 400 })
    }

    const webhookData = paymob.processWebhookData(body)
        
    // Find payment by merchant order ID
    const payment = await prisma.payment.findFirst({
      where: {
        OR:[
          {transactionId: webhookData.orderId},
          {id:webhookData.paymentId}
        ],
      },
      include: {
        user: true,
      },
    })

    if (!payment) {
      console.error("Payment not found for order:", webhookData.orderId)
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Safely handle metadata
    const existingMetadata =
      payment.metadata && typeof payment.metadata === "object" ? (payment.metadata as Record<string, any>) : {}

      
    
    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: webhookData.status as PaymentStatus,
        gatewayRef: webhookData.transactionId.toString(),
        metadata: {
          ...existingMetadata,
          paymobTransactionId: webhookData.transactionId,
          paymobStatus: body.success ? "success" : "failed",
        },
      },
    })

    
    // If payment is successful, create raffle entries
    if (webhookData.status === "COMPLETED" ) {
      const raffleId = existingMetadata.raffleId as string
      const quantity = existingMetadata.quantity as number
      

      if (raffleId && quantity) {
         

        // Find raffle (is the user already participated?)
        let isParticipated = await prisma.raffle.findFirst({
          where:{
            id:raffleId,      
          },
          include:{
            entries:true,
          }
        })

        let is = isParticipated?.entries.filter((entry:any)=> entry.id == payment.userId)


        if(is && is.length > 0){
          console.log("Already participated");
          
          return NextResponse.json({message:"User already participated"},{status:400})
        }

        // Update raffle current entries and create entry of
        await prisma.raffle.update({
          where: {
            id:raffleId,
          },
          data: {
            currentEntries: {
              increment: quantity,
            },
            entries:{
              create:{
                userId:payment.userId,
                totalCost:updatedPayment.amount,
                paymentId:updatedPayment.id,
                quantity:quantity                
              }
            }
          },
        })

      } else {
        console.error("Missing raffleId or quantity in payment metadata")
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Callback processing error:", error)
    return NextResponse.json({ error: "Callback processing failed" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Handle GET callback (for return URL)
  const url = new URL(request.url)
  const paymentId = url.searchParams.get("paymentId")
  const success = url.searchParams.get("success")

  if (paymentId) {
    // Redirect to payment result page
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/result?paymentId=${paymentId}&success=${success}`
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.json({ error: "Invalid callback" }, { status: 400 })
}
