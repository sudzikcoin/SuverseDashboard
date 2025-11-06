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

    return NextResponse.json(purchases)
  } catch (error: any) {
    console.error("Admin purchases fetch error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch purchases" },
      { status: 500 }
    )
  }
}
