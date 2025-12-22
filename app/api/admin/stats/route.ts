import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [
      totalUsers,
      totalCompanies,
      totalCredits,
      totalPurchases,
      totalAccountants,
      recentActivity,
      activeHolds,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.company.count({ where: { deletedAt: null } }),
      prisma.creditInventory.count({ where: { status: "ACTIVE" } }),
      prisma.purchaseOrder.count(),
      prisma.user.count({ where: { role: "ACCOUNTANT" } }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { timestamp: "desc" },
        include: {
          actor: { select: { email: true, name: true } },
        },
      }),
      prisma.hold.count({ where: { status: "ACTIVE" } }),
    ])

    const totalAvailableUSD = await prisma.creditInventory.aggregate({
      where: { status: "ACTIVE" },
      _sum: { availableUSD: true },
    })

    return NextResponse.json({
      totalUsers,
      totalCompanies,
      totalCredits,
      totalPurchases,
      totalAccountants,
      recentActivity,
      activeHolds,
      totalAvailableUSD: totalAvailableUSD._sum.availableUSD || 0,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
