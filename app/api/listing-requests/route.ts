import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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

    const requests = await prisma.productListingRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

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

    const parsedMarketPrice = Math.max(1000, Math.round(Number(marketPrice) || 0))
    const parsedTicketPrice = Math.max(50, Math.round(Number(ticketPrice) || 0))

    // Calculate required tickets to cover market price with 8% platform fee
    // Seller wants net payout ~ marketPrice
    // Gross Revenue = Seller Payout / (1 - 0.08) = marketPrice / 0.92
    // Number of tickets = ceil(Gross Revenue / ticketPrice)
    const targetGrossRevenue = Math.round(parsedMarketPrice / 0.92)
    const totalTickets = Math.max(1, Math.ceil(targetGrossRevenue / parsedTicketPrice))
    const totalRevenue = totalTickets * parsedTicketPrice
    const platformFee = Math.round(totalRevenue * 0.08) // Exactly 8%
    const sellerPayout = totalRevenue - platformFee // 92%

    const newRequest = await prisma.productListingRequest.create({
      data: {
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
        status: "PENDING",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Your product listing request has been submitted successfully for verification.",
      request: newRequest,
    })
  } catch (error) {
    console.error("Error creating listing request:", error)
    return NextResponse.json(
      { success: false, error: "Failed to submit listing request. Please check inputs and try again." },
      { status: 500 }
    )
  }
}
