import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { unstable_noStore as noStore } from "next/cache"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  noStore()

  try {
    const { searchParams } = new URL(request.url)
    const pageParam = searchParams.get("page")
    const limitParam = searchParams.get("limit")
    const search = searchParams.get("search")?.trim() || ""
    const status = searchParams.get("status")?.trim() || "All"
    const minAmountParam = searchParams.get("minAmount")?.trim()
    const maxAmountParam = searchParams.get("maxAmount")?.trim()
    const startDateParam = searchParams.get("startDate")?.trim()
    const endDateParam = searchParams.get("endDate")?.trim()
    const datePreset = searchParams.get("datePreset")?.trim()
    const sortBy = searchParams.get("sortBy")?.trim() || "newest"
    const isExport = searchParams.get("all") === "true"

    const page = Math.max(1, parseInt(pageParam || "1", 10) || 1)
    const limit = isExport
      ? 1000
      : Math.max(1, Math.min(100, parseInt(limitParam || "10", 10) || 10))

    const where: any = { role: "USER" }

    // Status filter
    if (status === "Active") {
      where.isActive = true
    } else if (status === "Inactive") {
      where.isActive = false
    } else if (status === "VIP") {
      // VIP customers have spent at least 500000 paisa (Rs. 5,000)
      where.payments = {
        some: {
          status: "COMPLETED",
          amount: { gte: 500000 },
        },
      }
    }

    // Search filter across name, email, phone, city
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ]
    }

    // Registration Date filtering
    let dateFilterStart: Date | undefined
    let dateFilterEnd: Date | undefined

    if (datePreset && datePreset !== "all") {
      const now = new Date()
      if (datePreset === "today") {
        dateFilterStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      } else if (datePreset === "last7days") {
        dateFilterStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      } else if (datePreset === "last30days") {
        dateFilterStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      } else if (datePreset === "thisMonth") {
        dateFilterStart = new Date(now.getFullYear(), now.getMonth(), 1)
      }
    } else if (startDateParam || endDateParam) {
      if (startDateParam) {
        dateFilterStart = new Date(startDateParam)
      }
      if (endDateParam) {
        const end = new Date(endDateParam)
        end.setHours(23, 59, 59, 999)
        dateFilterEnd = end
      }
    }

    if (dateFilterStart || dateFilterEnd) {
      where.createdAt = {}
      if (dateFilterStart) where.createdAt.gte = dateFilterStart
      if (dateFilterEnd) where.createdAt.lte = dateFilterEnd
    }

    // Amount spent filtering (in PKR -> convert to paisa)
    const minAmount = minAmountParam ? parseFloat(minAmountParam) : undefined
    const maxAmount = maxAmountParam ? parseFloat(maxAmountParam) : undefined

    if (
      (minAmount !== undefined && !isNaN(minAmount)) ||
      (maxAmount !== undefined && !isNaN(maxAmount))
    ) {
      const minPaisa = minAmount !== undefined && !isNaN(minAmount) ? Math.round(minAmount * 100) : undefined
      const maxPaisa = maxAmount !== undefined && !isNaN(maxAmount) ? Math.round(maxAmount * 100) : undefined

      if (minPaisa !== undefined && minPaisa > 0) {
        const having: any = {
          amount: {
            _sum: {
              gte: minPaisa,
              ...(maxPaisa !== undefined ? { lte: maxPaisa } : {}),
            },
          },
        }

        const groups = await prisma.payment.groupBy({
          by: ["userId"],
          where: { status: "COMPLETED" },
          _sum: { amount: true },
          having,
        })

        const matchedIds = groups.map((g) => g.userId)
        where.id = { in: matchedIds }
      } else if (maxPaisa !== undefined) {
        // Users who spent more than maxPaisa must be excluded
        const overBudget = await prisma.payment.groupBy({
          by: ["userId"],
          where: { status: "COMPLETED" },
          _sum: { amount: true },
          having: {
            amount: {
              _sum: {
                gt: maxPaisa,
              },
            },
          },
        })

        const overIds = overBudget.map((g) => g.userId)
        where.id = { notIn: overIds }
      }
    }

    // Sort order
    let orderBy: any = { createdAt: "desc" }
    if (sortBy === "oldest") {
      orderBy = { createdAt: "asc" }
    } else if (sortBy === "name_asc") {
      orderBy = { name: "asc" }
    } else if (sortBy === "name_desc") {
      orderBy = { name: "desc" }
    }

    const [totalMatching, customers, statsAgg] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: isExport ? 0 : (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: {
              entries: true,
              winners: true,
            },
          },
          payments: {
            where: { status: "COMPLETED" },
            select: { amount: true },
          },
        },
      }),
      Promise.all([
        prisma.user.count({ where: { role: "USER" } }),
        prisma.user.count({
          where: {
            role: "USER",
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
        prisma.payment.aggregate({
          where: { status: "COMPLETED" },
          _sum: { amount: true },
        }),
        prisma.user.count({
          where: {
            role: "USER",
            payments: {
              some: {
                status: "COMPLETED",
                amount: { gte: 500000 },
              },
            },
          },
        }),
      ]),
    ])

    const [totalCustomers, activeThisMonth, totalRevenue, vipCustomers] = statsAgg

    let customersWithTotalSpent = customers.map((customer) => ({
      ...customer,
      totalSpent: customer.payments.reduce((sum, payment) => sum + payment.amount, 0),
      lastActivity: customer.createdAt,
    }))

    // In-memory sort by totalSpent if requested
    if (sortBy === "spent_desc") {
      customersWithTotalSpent = customersWithTotalSpent.sort((a, b) => b.totalSpent - a.totalSpent)
    } else if (sortBy === "spent_asc") {
      customersWithTotalSpent = customersWithTotalSpent.sort((a, b) => a.totalSpent - b.totalSpent)
    } else if (sortBy === "entries_desc") {
      customersWithTotalSpent = customersWithTotalSpent.sort(
        (a, b) => b._count.entries - a._count.entries
      )
    }

    const totalPages = Math.max(1, Math.ceil(totalMatching / limit))

    const response = NextResponse.json({
      customers: customersWithTotalSpent,
      pagination: {
        total: totalMatching,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      stats: {
        totalCustomers,
        activeThisMonth,
        totalRevenue: totalRevenue._sum.amount || 0,
        vipCustomers,
      },
    })

    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("API Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}
