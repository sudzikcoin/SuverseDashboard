import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyBrokerSchema } from "@/lib/validations"
import { writeAudit } from "@/lib/audit"
import { getRequestContext } from "@/lib/reqctx"
import { safeGetServerSession } from "@/lib/session-safe"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await safeGetServerSession()

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validated = verifyBrokerSchema.parse(body)

    const safeNote = validated.note ?? null

    const broker = await prisma.broker.findUnique({
      where: { id: params.id },
      include: {
        users: {
          select: { id: true, email: true },
          take: 1,
        },
      },
    })

    if (!broker) {
      return NextResponse.json(
        { error: "Broker not found" },
        { status: 404 }
      )
    }

    const previousStatus = broker.status

    const newStatus = validated.action === "VERIFY" ? "APPROVED" : "SUSPENDED"

    const updatedBroker = await prisma.broker.update({
      where: { id: params.id },
      data: {
        status: newStatus,
      },
    })

    const ctx = await getRequestContext()
    await writeAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: validated.action === "VERIFY" ? "VERIFY_BROKER" : "REJECT_BROKER",
      entity: "BROKER",
      entityId: broker.id,
      details: {
        previousStatus,
        newStatus,
        note: safeNote,
        brokerName: broker.name,
        companyName: broker.companyName,
        brokerEmail: broker.email,
        adminEmail: broker.users[0]?.email,
      },
      ...ctx,
    })

    return NextResponse.json({ broker: updatedBroker })
  } catch (error: any) {
    console.error("Error verifying broker:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update broker verification status" },
      { status: 500 }
    )
  }
}
