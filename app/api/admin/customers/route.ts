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
    const isExport = searchParams.get("all") === "true"

    const page = Math.max(1, parseInt(pageParam || "1", 10) || 1)
    const limit = isExport
      ? 1000
      : Math.max(1, Math.min(100, parseInt(limitParam || "10", 10) || 10))

    const where: any = { role: "USER" }

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

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ]
    }

    const [totalMatching, customers, statsAgg] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: isExport ? 0 : (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
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

    const customersWithTotalSpent = customers.map((customer) => ({
      ...customer,
      totalSpent: customer.payments.reduce((sum, payment) => sum + payment.amount, 0),
      lastActivity: customer.createdAt,
    }))

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
