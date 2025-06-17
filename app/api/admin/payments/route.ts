import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    

    const [payments, stats] = await Promise.all([
      prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          entries: {
            include: {
              raffle: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      }),
      Promise.all([
        prisma.payment.aggregate({
          where: { status: "COMPLETED" },
          _sum: { amount: true },
        }),
        prisma.payment.count({ where: { status: "PENDING" } }),
        prisma.payment.count({ where: { status: "FAILED" } }),
        prisma.payment.count(),
      ]),
    ])

    const [totalRevenue, pendingPayments, failedPayments, totalPayments] = stats
    const completedPayments = totalPayments - pendingPayments - failedPayments
    const successRate = totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0

    const formattedPayments = payments.map((payment) => ({
      ...payment,
      raffleName: payment.entries[0]?.raffle?.title || (payment.metadata as any)?.raffleName || "Unknown Raffle",
      entries: (payment.metadata as any)?.quantity || 1,
    }))

    return NextResponse.json({
      payments: formattedPayments,
      stats: {
        totalRevenue: totalRevenue._sum.amount || 0,
        pendingPayments,
        failedPayments,
        successRate,
      },
    })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
