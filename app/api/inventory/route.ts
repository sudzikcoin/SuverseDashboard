export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const creditType = searchParams.get("creditType")
    const taxYear = searchParams.get("taxYear")
    const minBlock = searchParams.get("minBlock")

    const where: any = {
      status: "ACTIVE",
      availableUSD: { gt: 0 },
    }

    if (creditType) where.creditType = creditType
    if (taxYear) where.taxYear = parseInt(taxYear)
    if (minBlock) where.minBlockUSD = { lte: parseFloat(minBlock) }

    const inventory = await prisma.creditInventory.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(inventory)
  } catch (error: any) {
    console.error("Inventory fetch error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch inventory" },
      { status: 500 }
    )
  }
}
