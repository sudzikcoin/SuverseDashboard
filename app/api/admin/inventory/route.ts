import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createInventorySchema } from "@/lib/validations"
import { createAuditLog } from "@/lib/audit"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const inventory = await prisma.creditInventory.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(inventory)
  } catch (error: any) {
    console.error("Admin inventory fetch error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch inventory" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const validated = createInventorySchema.parse(body)

    const inventory = await prisma.creditInventory.create({
      data: {
        ...validated,
        availableUSD: validated.faceValueUSD,
        closeBy: validated.closeBy ? new Date(validated.closeBy) : null,
      },
    })

    await createAuditLog(
      session.user.id,
      "CREATE",
      "CreditInventory",
      inventory.id
    )

    return NextResponse.json(inventory)
  } catch (error: any) {
    console.error("Admin inventory creation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create inventory" },
      { status: 500 }
    )
  }
}
