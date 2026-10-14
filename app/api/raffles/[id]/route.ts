import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { z } from "zod"

const updateRaffleSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  longDescription: z.string().optional(),
  image: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  price: z.number().min(1, "Price must be greater than 0").optional(),
  totalEntries: z.number().min(1, "Total entries must be greater than 0").optional(),
  category: z.string().min(1, "Category is required").optional(),
  featured: z.boolean().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
  endDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  specifications: z.array(z.string()).optional(),
  rules: z.array(z.string()).optional(),
  expenses: z.any().optional(),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const raffle = await prisma.raffle.findUnique({
      where: { id: params.id },

      include: {
        winners:true,
        entries:{
          select:{
            userId:true,
            id:true,
            totalCost:true
          }
        },
        _count: {
          select: { entries: true },
        },
      },
    })

    if (!raffle) {
      return NextResponse.json({ error: "Raffle not found" }, { status: 404 })
    }

    return NextResponse.json(raffle)
  } catch (error) {
    console.error("Get raffle error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // const user = await getUser()
    // if (!user || user.role !== "ADMIN") { 
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }
 
    const body = await request.json()
    const data = updateRaffleSchema.parse(body)
    
    const raffle = await prisma.raffle.update({
      where: { id: params.id },
      data: {
        ...data,
        realPrice:Number.parseInt(body.realPrice ) * 100, // conver to paisa,
        gallery: data.gallery || [],
        specifications: data.specifications || [],
        rules: data.rules || [],
        ...(data.expenses !== undefined ? { expenses: data.expenses } : {}),
      },
    })

    return NextResponse.json(raffle)
  } catch (error) {
    console.error("Update raffle error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // const user = await getUser()
    // if (!user || user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    await prisma.raffle.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Raffle deleted successfully" })
  } catch (error) {
    console.error("Delete raffle error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
