import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { unstable_noStore as noStore } from "next/cache"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  noStore()

  try {
    console.log("Fetching customers data...") // Debug log

    const [customers, stats] = await Promise.all([
      prisma.user.findMany({
        where: { role: "USER" },
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
                amount: { gte: 500000 }, // VIP threshold: 5000 PKR
              },
            },
          },
        }),
      ]),
    ])

    console.log(`Found ${customers.length} customers`) // Debug log

    const [totalCustomers, activeThisMonth, totalRevenue, vipCustomers] = stats

    const customersWithTotalSpent = customers.map((customer) => ({
      ...customer,
      totalSpent: customer.payments.reduce((sum, payment) => sum + payment.amount, 0),
      lastActivity: customer.createdAt,
    }))

    return NextResponse.json({
      customers: customersWithTotalSpent,
      stats: {
        totalCustomers,
        activeThisMonth,
        totalRevenue: totalRevenue._sum.amount || 0,
        vipCustomers,
      },
    })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}
