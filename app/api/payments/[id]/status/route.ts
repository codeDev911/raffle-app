import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {

    const { status } = await request.json()

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

    // Prevent updating completed or refunded payments
    if (["COMPLETED", "REFUNDED"].includes(existingPayment.status)) {
      return NextResponse.json({ error: "Cannot update completed or refunded payments" }, { status: 400 })
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: params.id },
      data: { status },
    })

    return NextResponse.json(updatedPayment)
  } catch (error) {
    console.error("Error updating payment status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
