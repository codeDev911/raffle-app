import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { z } from "zod"

const createRaffleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  longDescription: z.string().optional(),
  image: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  price: z.number().min(1, "Price must be greater than 0"),
  realPrice: z.number().min(1, "Real Price must be greater than 0"),
  totalEntries: z.number().min(1, "Total entries must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  featured: z.boolean().optional(),
  endDate: z.string().transform((str) => new Date(str)),
  specifications: z.array(z.string()).optional(),
  rules: z.array(z.string()).optional(),
  expenses: z.any().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const featured = searchParams.get("featured")

    const where: any = {}
    if (category && category !== "all") where.category = category
    if (status && status !== "all") where.status = status.toUpperCase()
    if (featured === "true") where.featured = true

    const raffles = await prisma.raffle.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { entries: true },
        },
      },
    })

    return NextResponse.json(raffles)
  } catch (error) {
    console.error("Get raffles error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // const user = await getUser()
    // if (!user || user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const body = await request.json()
    const data = createRaffleSchema.parse(body)

    const raffle = await prisma.raffle.create({
      data: {
        ...data,
        price: data.price * 100, // Convert to paisa
        realPrice:data.realPrice * 100, // convert to paisa
        gallery: data.gallery || [],
        specifications: data.specifications || [],
        rules: data.rules || [],
        expenses: data.expenses || [],
      },
    })

    return NextResponse.json(raffle)
  } catch (error) {
    console.error("Create raffle error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
