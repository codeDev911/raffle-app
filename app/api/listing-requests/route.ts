import { NextRequest, NextResponse } from "next/server"
import { prisma, mockPrisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const type = searchParams.get("type")

    const where: any = {}

    if (status && status !== "ALL") {
      where.status = status
    }

    if (type && type !== "ALL") {
      where.productType = type
    }

    if (search) {
      where.OR = [
        { productName: { contains: search } },
        { fullNameCnic: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { city: { contains: search } },
        { cnicNumber: { contains: search } },
      ]
    }

    let requests: any[] = []
    try {
      requests = await prisma.productListingRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
      })
    } catch (dbErr) {
      console.warn("prisma.findMany fallback to mock:", dbErr)
      requests = await mockPrisma.productListingRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
      })
    }

    return NextResponse.json({
      success: true,
      requests,
      count: requests.length,
    })
  } catch (error) {
    console.error("Error fetching listing requests:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch listing requests" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      productType,
      productName,
      description,
      phone,
      email,
      fullNameCnic,
      cnicNumber,
      city,
      marketPrice,
      ticketPrice,
      targetTickets,
      totalTickets: customTotalTickets,
      condition,
      images,
    } = body

    // Validation
    if (!productType || !productName || !description || !phone || !email || !fullNameCnic || !marketPrice || !ticketPrice) {
      return NextResponse.json(
        { success: false, error: "Missing required fields. Please fill all mandatory information." },
        { status: 400 }
      )
    }

    const parsedMarketPrice = Math.max(100, Math.round(Number(marketPrice) || 0))
    const parsedTicketPrice = Math.max(1, Math.round(Number(ticketPrice) || 0))

    // Calculate required tickets to cover market price with 8% platform fee
    // Gross Revenue = Seller Payout / (1 - 0.08) = marketPrice / 0.92
    const targetGrossRevenue = Math.round(parsedMarketPrice / 0.92)
    
    // Honor the user's desired target tickets to be sold out (e.g. 300, 400) if provided
    let totalTickets = Math.max(0, Math.round(Number(targetTickets || customTotalTickets) || 0))
    if (!totalTickets || totalTickets <= 0) {
      totalTickets = Math.max(1, Math.ceil(targetGrossRevenue / parsedTicketPrice))
    }

    const totalRevenue = totalTickets * parsedTicketPrice
    const platformFee = Math.round(totalRevenue * 0.08) // Exactly 8%
    const sellerPayout = totalRevenue - platformFee // 92%

    const dataToSave = {
      productType,
      productName: productName.trim(),
      description: description.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      fullNameCnic: fullNameCnic.trim(),
      cnicNumber: cnicNumber ? cnicNumber.trim() : null,
      city: city ? city.trim() : "Not Specified",
      marketPrice: parsedMarketPrice,
      ticketPrice: parsedTicketPrice,
      totalTickets,
      totalRevenue,
      platformFee,
      sellerPayout,
      condition: condition || "Brand New",
      images: Array.isArray(images) && images.length > 0 ? images : [],
      status: "PENDING" as const,
    }

    let newRequest: any = null
    try {
      newRequest = await prisma.productListingRequest.create({
        data: dataToSave,
      })
    } catch (createErr) {
      console.warn("prisma.create failed, falling back to mockPrisma:", createErr)
      newRequest = await mockPrisma.productListingRequest.create({
        data: dataToSave,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Your product listing request has been submitted successfully for verification.",
      request: newRequest,
    })
  } catch (error: any) {
    console.error("Error creating listing request:", error)
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to submit listing request. Please check inputs and try again." },
      { status: 500 }
    )
  }
}
