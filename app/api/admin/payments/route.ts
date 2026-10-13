import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { unstable_noStore as noStore } from "next/cache"
import { PaymentStatus } from "@prisma/client"

// Force dynamic rendering and disable caching
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  // Disable function caching
  noStore()

  try {
    const { searchParams } = new URL(request.url)
    const pageParam = searchParams.get("page")
    const limitParam = searchParams.get("limit")
    const search = searchParams.get("search")?.trim() || ""
    const status = searchParams.get("status")?.trim() || "All"
    const isExport = searchParams.get("all") === "true"

    const page = Math.max(1, parseInt(pageParam || "1", 10) || 1)
    const limit = isExport
      ? 1000
      : Math.max(1, Math.min(100, parseInt(limitParam || "10", 10) || 10))

    // Build filter query
    const where: any = {}

    // Status filter
    if (status && status !== "All") {
      const upperStatus = status.toUpperCase()
      if (Object.values(PaymentStatus).includes(upperStatus as PaymentStatus)) {
        where.status = upperStatus as PaymentStatus
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { transactionId: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        {
          entries: {
            some: {
              raffle: {
                title: { contains: search, mode: "insensitive" },
              },
            },
          },
        },
      ]
    }

    const [totalMatching, payments, statsAgg] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        skip: isExport ? 0 : (page - 1) * limit,
        take: limit,
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

    const [totalRevenue, pendingPayments, failedPayments, totalPayments] = statsAgg
    const completedPayments = totalPayments - pendingPayments - failedPayments
    const successRate = totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0

    const formattedPayments = payments.map((payment) => ({
      ...payment,
      raffleName:
        payment.entries[0]?.raffle?.title ||
        (payment.metadata as any)?.raffleName ||
        "Unknown Raffle",
      entries: (payment.metadata as any)?.quantity || 1,
    }))

    const totalPages = Math.max(1, Math.ceil(totalMatching / limit))

    const response = NextResponse.json({
      payments: formattedPayments,
      pagination: {
        total: totalMatching,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      stats: {
        totalRevenue: totalRevenue._sum.amount || 0,
        pendingPayments,
        failedPayments,
        successRate,
      },
    })

    // Add cache-control headers to prevent caching
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("API Error fetching payments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
