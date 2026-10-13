import { type NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
  try {
    const formData = await request.formData()

    const receipt = formData.get("receipt") as File
    const orderId = formData.get("orderId") as string
    const raffleId = formData.get("raffleId") as string
    const paymentMethod = formData.get("paymentMethod") as string
    const totalAmount = formData.get("totalAmount") as string
    const quantity = formData.get("quantity") as string
    const raffleName = formData.get("raffleName") as string
    const referralLinkId = formData.get("referralLinkId") as string

    // Validate required fields
    if (!receipt || !orderId || !raffleId || !paymentMethod) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Validate file type
    if (!receipt.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Please upload an image." },
        { status: 400 },
      )
    }

    // Convert file to buffer
    const bytes = await receipt.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create organized folder structure: receipts/{paymentMethod}/{orderId}
    const folderPath = `receipts/${paymentMethod.toLowerCase()}`
    const publicId = `${folderPath}/${orderId}`

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            public_id: publicId,
            folder: folderPath,
            overwrite: true,
            transformation: [
              { width: 1000, height: 1000, crop: "limit" }, // Limit size for optimization
              { quality: "auto" }, // Auto quality optimization
              { format: "auto" }, // Auto format optimization
            ],
            tags: [paymentMethod, orderId, raffleId, "receipt"], // Add tags for easy searching
          },
          (error:any, result:any) => {
            if (error) reject(error)
            else resolve(result)
          },
        )
        .end(buffer)
    })

    const cloudinaryResult = uploadResult as any

    let normalizedMethod = paymentMethod.toUpperCase()
    if (normalizedMethod === "SADAPAY") {
      normalizedMethod = "SAYAPAY"
    }

    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: Number(totalAmount) * 100, // Convert from PKR to paisa
        method: normalizedMethod as any, // Cast to PaymentMethod enum type
        transactionId: orderId,
        currency: "PKR",
        status: "PENDING",

        metadata: {
          raffleId,
          quantity: parseInt(quantity, 10),
          receiptUrl: cloudinaryResult.secure_url,
          receiptPublicId: cloudinaryResult.public_id,
          folder: folderPath,
          raffleName,
          referralLinkId : referralLinkId || null, // Store referral link ID if provided
        },
        
      },
    })



    // Sending email addres to the user
    
    fetch(`${process.env.EMAIL_API_URL}/send-template-email`,{
      method:"POST",
      body:JSON.stringify({
          to: user.email,
          subject: "Payment status - Pakraffle",
          senderType: "payments" ,
          templateType: "payment" ,
          templateData: {
            userName:user.name,
            transactionId:orderId,
            amount:totalAmount, 
            paymentMethod:paymentMethod,
            status:"underreview",
            raffleTitle:raffleName,
          }
      })
    }).then(res=>res)
    .then(data=>data)
    .catch(e=>console.log(e))
 
    // Return success response with receipt URL
    return NextResponse.json({
      success: true,
      message: "Payment submitted successfully",
      data: {
        orderId,
        receiptUrl: cloudinaryResult.secure_url,
        receiptId: cloudinaryResult.public_id,
        submittedAt: new Date().toISOString(),
        status: "pending_verification",
        folder: folderPath,
      },
    })
  } catch (error) {
    console.error("Payment submission error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload receipt. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
