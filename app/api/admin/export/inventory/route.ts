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

    const inventory = await prisma.creditInventory.findMany({
      orderBy: { createdAt: "desc" },
    })

    const csv = [
      "ID,Type,Year,Jurisdiction,State Restriction,Face Value,Min Block,Price Per Dollar,Available,Close By,Broker,Status",
      ...inventory.map(item =>
        [
          item.id,
          item.creditType,
          item.taxYear,
          item.jurisdiction || "",
          item.stateRestriction || "",
          item.faceValueUSD,
          item.minBlockUSD,
          item.pricePerDollar,
          item.availableUSD,
          item.closeBy?.toISOString() || "",
          item.brokerName || "",
          item.status,
        ].join(",")
      ),
    ].join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=inventory.csv",
      },
    })
  } catch (error: any) {
    console.error("Inventory export error:", error)
    return NextResponse.json(
      { error: error.message || "Export failed" },
      { status: 500 }
    )
  }
}
