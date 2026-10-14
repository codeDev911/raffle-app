import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const dynamic = "force-dynamic"

const addExpenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  category: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raffleId = params.id
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
    })

    if (!raffle) {
      return NextResponse.json({ error: "Raffle not found" }, { status: 404 })
    }

    const body = await request.json()
    const { description, amount, category } = addExpenseSchema.parse(body)

    const rawExpenses: any = raffle.expenses

    const newItem = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      description: description.trim(),
      amount: Math.round(amount),
      category: category?.trim() || "Marketing",
      createdAt: new Date().toISOString(),
    }

    let updatedExpenses: any
    if (rawExpenses && typeof rawExpenses === "object" && !Array.isArray(rawExpenses)) {
      // Structured object format: { budget, items }
      const items = Array.isArray(rawExpenses.items) ? rawExpenses.items : []
      updatedExpenses = {
        budget: Number(rawExpenses.budget) || 0,
        items: [...items, newItem],
      }
    } else if (Array.isArray(rawExpenses)) {
      // Array format: [...]
      updatedExpenses = [...rawExpenses, newItem]
    } else {
      // Empty or undefined format
      updatedExpenses = {
        budget: 0,
        items: [newItem],
      }
    }

    const updatedRaffle = await prisma.raffle.update({
      where: { id: raffleId },
      data: {
        expenses: updatedExpenses,
      },
    })

    return NextResponse.json({
      success: true,
      item: newItem,
      expenses: updatedRaffle.expenses,
    })
  } catch (error: any) {
    console.error("Add expense error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raffleId = params.id
    const { searchParams } = new URL(request.url)
    const expenseId = searchParams.get("expenseId")

    if (!expenseId) {
      return NextResponse.json(
        { error: "expenseId parameter is required" },
        { status: 400 }
      )
    }

    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
    })

    if (!raffle) {
      return NextResponse.json({ error: "Raffle not found" }, { status: 404 })
    }

    const rawExpenses: any = raffle.expenses
    let updatedExpenses: any

    if (rawExpenses && typeof rawExpenses === "object" && !Array.isArray(rawExpenses)) {
      const items = Array.isArray(rawExpenses.items) ? rawExpenses.items : []
      updatedExpenses = {
        budget: Number(rawExpenses.budget) || 0,
        items: items.filter((item: any) => item.id !== expenseId),
      }
    } else if (Array.isArray(rawExpenses)) {
      updatedExpenses = rawExpenses.filter((item: any) => item.id !== expenseId)
    } else {
      updatedExpenses = []
    }

    await prisma.raffle.update({
      where: { id: raffleId },
      data: {
        expenses: updatedExpenses,
      },
    })

    return NextResponse.json({ success: true, message: "Expense removed" })
  } catch (error: any) {
    console.error("Delete expense error:", error)
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
