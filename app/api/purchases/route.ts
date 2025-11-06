import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user.companyId) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 400 }
      )
    }

    const purchases = await prisma.purchaseOrder.findMany({
      where: { companyId: session.user.companyId },
      include: {
        inventory: true,
        company: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(purchases)
  } catch (error: any) {
    console.error("Purchases fetch error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch purchases" },
      { status: 500 }
    )
  }
}
