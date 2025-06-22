import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // const user = await getUser()
    // if (!user || user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const body = await request.json()
    const { entryNumber } = body

    // Get raffle with entries
    const raffle = await prisma.raffle.findUnique({
      where: { id: params.id },
      include: {
        entries: {
          include: {
            user: true,
          },
          orderBy: { createdAt: "asc" },
        },
        winners: true,
      },
    })

    if (!raffle) {
      console.log("Raffle Not Found");
      
      return NextResponse.json({ error: "Raffle not found" }, { status: 404 })
    }

    // Check if winner already exists
    if (raffle.winners.length > 0) {
      console.log("Winner already selected");
      
      return NextResponse.json({ error: "Winner already selected" }, { status: 400 })
    }

    // Calculate which entry corresponds to the selected number
    let currentCount = 0
    let selectedEntry = null

    for (const entry of raffle.entries) {
      currentCount += entry.quantity
      if (entryNumber <= currentCount) {
        selectedEntry = entry
        break
      }
    }

    if (!selectedEntry) {
      console.log("Invalid Entry");
      
      return NextResponse.json({ error: "Invalid entry number" }, { status: 400 })
    }

    // Create winner record
    const winner = await prisma.winner.create({
      data: {
        userId: selectedEntry.userId,
        raffleId: raffle.id,
        prizeValue: raffle.realPrice, // Estimate prize value
        verified: true,
        drawnAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
          },
        },
        raffle: {
          select: {
            title: true,
            description: true,
            image: true,
          },
        },
      },
    })

    // Update raffle status to completed
    await prisma.raffle.update({
      where: { id: params.id },
      data: { status: "COMPLETED" },
    })

    return NextResponse.json({
      message: "Winner selected successfully",
      winner,
      entryNumber,
    })
  } catch (error) {
    console.error("Select winner error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
