import { NextRequest, NextResponse } from "next/server"
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
      payment?.metadata && typeof payment?.metadata === "object" ? (payment?.metadata as Record<string, any>) : {}

      
    
    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment?.id },
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

        let is = isParticipated?.entries.filter((entry:any)=> entry.id == payment?.userId)


        if(is && is?.length > 0){
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
                userId:payment?.userId,
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


// this call back is only for our e-wallet manually configurations
export async function PUT(request: NextRequest) {
  // Handle GET callback (for return URL)
  try {
     const body = await request.json()
    // Update raffle current entries and create entry of
    
    let payment = await prisma.payment.update({
      where:{
        id:body.paymentId,
      },
      data:{
        status:body.status as PaymentStatus,
      }
      ,include:{
        user:{
          select:{
            name:true,
            email:true,
          }
        }
      }
    })

    


    let raffle=await prisma.raffle.update({
      where: {
        id:body.raffleId,
      },
      data: {
        currentEntries: {
          increment: body.quantity,
        },
        entries:{
          create:{
            userId:payment?.userId,
            totalCost:payment.amount,
            paymentId:payment.id,
            quantity:body.quantity                
          }
          }
      },
      select:{
        title:true,
        price:true
      }
    })


    // Add commission via the refferral link
    if(body.referralLinkId){
      await fetch(`${process.env.NEXT_PUBLIC_PARTNER_APP_URL}/api/partner/commissions`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.NEXT_PUBLIC_API_KEY_TO_PARTNER || "",
        },
        body: JSON.stringify({
          customerName : payment.user.name,
          ticketPrice : raffle.price / 100, // convert from paisa to currency unit
          customerEmail : payment.user.email,
          referralLinkId : body.referralLinkId,
          transactionId : payment.transactionId,
          status :"PAID",
        }),
    })
  }else{
      // check if user is the referral of the partner  create a commission, otherwise leave it free.
       await fetch(`${process.env.NEXT_PUBLIC_PARTNER_APP_URL}/api/partner/commissions`,{
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.NEXT_PUBLIC_API_KEY_TO_PARTNER || "",
        },
        body: JSON.stringify({
          userId: payment.userId,
          customerName : payment.user.name,
          ticketPrice : raffle.price / 100, // convert from paisa to currency unit
          customerEmail : payment.user.email, 
          transactionId : payment.transactionId,
        }),
    })
    }


    // Send email to update user 
    
     fetch(`${process.env.EMAIL_API_URL}/send-template-email`,{
      method:"POST",
      body:JSON.stringify({
          to: payment.user.email,
          subject: "Payment initiated - Pakraffle",
          senderType: "payments" ,
          templateType: "payment" ,
          templateData: {
            userName:payment.user.name,
            transactionId:payment.transactionId,
            amount:payment.amount / 100, // From paisa to PKR 
            paymentMethod:payment.method,
            status:"confirmed",
            raffleTitle:raffle.title,
          }
      })
    }).then(res=>res).then(data=>data).catch(e=>console.log(e))

  return NextResponse.json({ success: true, message: "Payment updated successfully" })
  } catch (error) {
    
    return NextResponse.json({ error: "Invalid callback" }, { status: 400 })
  }

}
