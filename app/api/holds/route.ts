import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createHoldSchema } from "@/lib/validations"
import { createAuditLog } from "@/lib/audit"
import { sendHoldConfirmation } from "@/lib/email"

export async function POST(req: Request) {
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

    const body = await req.json()
    const validated = createHoldSchema.parse(body)

    const inventory = await prisma.creditInventory.findUnique({
      where: { id: validated.inventoryId },
    })

    if (!inventory) {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      )
    }

    if (Number(inventory.availableUSD) < validated.amountUSD) {
      return NextResponse.json(
        { error: "Insufficient available credits" },
        { status: 400 }
      )
    }

    if (validated.amountUSD < Number(inventory.minBlockUSD)) {
      return NextResponse.json(
        { error: `Minimum block size is $${inventory.minBlockUSD}` },
        { status: 400 }
      )
    }

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 72)

    const hold = await prisma.hold.create({
      data: {
        inventoryId: validated.inventoryId,
        companyId: session.user.companyId,
        amountUSD: validated.amountUSD,
        expiresAt,
      },
    })

    await prisma.creditInventory.update({
      where: { id: validated.inventoryId },
      data: {
        availableUSD: {
          decrement: validated.amountUSD,
        },
      },
    })

    await createAuditLog(
      session.user.id,
      "CREATE",
      "Hold",
      hold.id
    )

    await sendHoldConfirmation(session.user.email!, {
      creditType: inventory.creditType,
      amountUSD: validated.amountUSD,
      expiresAt,
    })

    return NextResponse.json(hold)
  } catch (error: any) {
    console.error("Hold creation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create hold" },
      { status: 500 }
    )
  }
}
