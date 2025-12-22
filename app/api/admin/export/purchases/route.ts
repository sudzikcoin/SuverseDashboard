export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const purchases = await prisma.purchaseOrder.findMany({
      include: {
        company: true,
        inventory: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const csv = [
      "PO ID,Company,Credit Type,Tax Year,Amount USD,Price Per Dollar,Subtotal,Fees,Total,Status,Broker Status,Created At",
      ...purchases.map(po =>
        [
          po.id,
          po.company.legalName,
          po.inventory.creditType,
          po.inventory.taxYear,
          po.amountUSD,
          po.pricePerDollar,
          po.subtotalUSD,
          po.feesUSD,
          po.totalUSD,
          po.status,
          po.brokerStatus,
          po.createdAt.toISOString(),
        ].join(",")
      ),
    ].join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=purchases.csv",
      },
    })
  } catch (error: any) {
    console.error("Purchases export error:", error)
    return NextResponse.json(
      { error: error.message || "Export failed" },
      { status: 500 }
    )
  }
}
