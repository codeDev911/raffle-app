import { prisma } from "@/lib/prisma";
import { PaymobPayment } from "@/lib/payments";
import { generateOrderId } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import { safepaySettings } from "@/lib/merchants/safepay";

// Credentials and host come from the environment (see lib/merchants/safepay.ts), so switching
// between sandbox and live is a config change and no key is ever committed.
const USE_LIVE_SAFEPAY = process.env.SAFEPAY_ENV?.trim().toLowerCase() === "production";

const safepay = require('@sfpy/node-core')(process.env.SAFEPAY_SECRET || "", {
  authType: 'secret',
  host: USE_LIVE_SAFEPAY ? 'https://api.getsafepay.com' : 'https://sandbox.api.getsafepay.com'
});
  
const initiatePaymentSchema = z.object({
  raffleId: z.string(),
  quantity: z.number().min(1).max(10),
  method: z.enum(["CARD", "EASYPAISA", "JAZZCASH"]),
});


const EwalletsInitiate = async (body:any, user: any) => {
  try {
    
    const user = await getUser()
    if(!user){
      return NextResponse.json({"Error":"Authentication required"},{status:401})
    }
    
    const orderId = generateOrderId();
    console.log(body);
    
    let raffle = await prisma.raffle.findFirst({
      where:{
        AND:[
          {id:body.raffleId},
          {status:"ACTIVE"}, 
        ]
      },
      select:{
        price:true,
        id:true,
        status:true,
        title:true,
        totalEntries:true,
        currentEntries:true,
        endDate:true,
      }
    })
    
    if (!raffle) {
      return NextResponse.json(
        { error: "Raffle not found" },
        { status: 404 }
      );
    }
    if (raffle.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Raffle not available" },
        { status: 400 }
      );
    }
    if (raffle.currentEntries + body.quantity > raffle.totalEntries) {
      return NextResponse.json(
        { error: "Not enough entries available" },
        { status: 400 }
      );
    }

    // Find raffle (is the user already participated?)
    let isParticipated = await prisma.raffle.findFirst({
      where:{
        id:body.raffleId,      
      },
      include:{
        entries:true,
      }
    })

    let is = isParticipated?.entries.filter((entry:any)=> entry.id == user?.id)


    if(is && is?.length > 0){
      console.log("Already participated");
      
      return NextResponse.json({message:"User already participated"},{status:400})
    }


    let totalAmount = (raffle.price * body.quantity) / 100 // Convert from paisa to PKR


    const returlUrl = `/payment/pay?method=${body.method.toLowerCase()}&orderId=${orderId}&q=${body.quantity}&refId=${body.raffleId}&tam=${totalAmount}&refTit=${raffle.title}&endDate=${raffle.endDate}&procFee=0${body.referralLinkId ? `&refLinkId=${body.referralLinkId}` : ""}`;
    return NextResponse.json({
      success: true,
      paymentId: null,
      paymentUrl: returlUrl,
      paymobOrderId: null,
    });
     

  } catch (error) {
    console.log(error);
    
    return NextResponse.json({"Server error":error},{"status":500})
  }
}

const PaymobInitiate = async (request: NextRequest, user: any) => {
  try {
    const body = await request.json();

    // Handle both 'method' and 'paymentMethod' field names
    const paymentData = {
      raffleId: body.raffleId,
      quantity: body.quantity,
      method: body.method || body.paymentMethod,
    };

    const { raffleId, quantity, method } =
      initiatePaymentSchema.parse(paymentData);

    // Get raffle details
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
    });

    if (!raffle || raffle.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Raffle not available" },
        { status: 400 }
      );
    }

    if (raffle.currentEntries + quantity > raffle.totalEntries) {
      return NextResponse.json(
        { error: "Not enough entries available" },
        { status: 400 }
      );
    }

    const totalAmount = (raffle.price * quantity) / 100; // Convert from paisa to PKR
    const orderId = generateOrderId();

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
    });

    // Create return URL with payment ID
    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback?paymentId=${payment.id}&orderId=${orderId}`;

    // Initialize Paymob payment
    const paymob = new PaymobPayment();

    const paymentResult = await paymob.createPayment({
      amount: totalAmount,
      orderId,
      customerEmail: user.email,
      customerPhone: user.phone || "03000000000",
      customerName: user.name,
      paymentMethod: method,
      returnUrl,
    });

    // Update payment with Paymob order ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionId: paymentResult.orderId.toString(),
      },
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      paymentUrl: paymentResult.paymentUrl,
      paymobOrderId: paymentResult.orderId,
    });
  } catch (error) {
    console.error("Initiate payment error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error: "Payment initiation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};

const SafepayInitiate = async(body:any,user:any = null)=>{
  // try {
  const { raffleId, quantity,method} = body;

  const raffle = await prisma.raffle.findUnique({
    where: { id: raffleId },
    select:{
      price:true,
      id:true,
      status:true,
      title:true,
      totalEntries:true,
      currentEntries:true
    }
  })

  
    if (!raffle || raffle.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Raffle not available" },
        { status: 400 }
      );
    }

    if (raffle.currentEntries + quantity > raffle.totalEntries) {
      return NextResponse.json(
        { error: "Not enough entries available" },
        { status: 400 }
      );
    }

    const totalAmount = raffle.price * quantity// Convert from paisa to PKR
    const orderId = generateOrderId();

    // Create payment record
    // const payment = await prisma.payment.create({
    //   data: {
    //     userId: user.id,
    //     amount: raffle.price * quantity, // Store in paisa
    //     method,
    //     transactionId: orderId,
    //     status: "PENDING",
    //     metadata: {
    //       raffleId,
    //       quantity,
    //       raffleName: raffle.title,
    //     },
    //   },
    // });

    const payment = {
      id:"sad"
    }
    // Create return URL with payment ID
    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback?paymentId=${payment.id}&orderId=${orderId}`;



  const safepayConfig = safepaySettings()
  if (!safepayConfig) {
    return NextResponse.json({ error: "Card payments are not configured" }, { status: 503 })
  }

  const response = safepay.payments.session.setup({
    "merchant_api_key": safepayConfig.apiKey,
    "intent": "CYBERSOURCE",
    "mode": "payment",
    "entry_mode": "raw",
    "currency": safepayConfig.currency,
    "amount": totalAmount,
    "metadata": {
      "order_id": orderId
    },
    "include_fees": false
  })
  
  const tracker = await response
  
  const TRACKER_TOKEN = tracker.data.tracker.token
  // Now create authentation to get Auth Token
  var requestOptions: RequestInit = {
  method: 'POST',
  redirect: 'follow',
  headers:{
    'X-SFPY-MERCHANT-SECRET': safepayConfig.secret
  }
};
  return fetch(`${safepayConfig.apiHost}/client/passport/v1/token`, requestOptions)
  .then(response => response)
  .then(async(result) => {
    
   const checkoutURL = safepay.checkout.createCheckoutUrl({
    env:"sandbox",
    // this the tracker.token from the payment session response
    tracker: TRACKER_TOKEN,
    // the authentication token
    tbt: (await result.json()).data  ,
    // either production or sandbox
    environment: safepayConfig.environment,
    // attach a source, like your website domain or mobile app bundle identifier (or "mobile" for mobile webview)
    source: "Pakraffle.com",
    // the success URL to redirect your customer to after payment complete
    redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/callback`,
    // the cancel URL to redirect your customer to after the customer cancels the checkout session
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/callback`,

  })
 
  return NextResponse.json(
    {
      success: true,
      paymentId: payment.id,
      paymentUrl: checkoutURL,
      paymobOrderId: "",
    }
    ,{status:200})
  }
)
  .catch(error =>
    NextResponse.json({ error: "Failed to initiate Safepay payment", details: error }, { status: 500 })
  );
  

  

  // } catch (error) {
  //   console.log(error);
    
  //   return NextResponse.json({"errors":error},{status:500})
  // }
}

export  {
    PaymobInitiate,
    SafepayInitiate,
    EwalletsInitiate
}