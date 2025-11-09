import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createAuditLog } from "@/lib/audit"

function asDecimal(v: any) {
  return Number.isFinite(v) ? v : parseFloat(String(v || 0)) || 0
}

function asInt(v: any) {
  return Number.isFinite(v) ? v : parseInt(String(v || 0), 10) || 0
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data: any = {}

    if (body.creditType !== undefined) data.creditType = String(body.creditType).trim()
    if (body.taxYear !== undefined) data.taxYear = asInt(body.taxYear)
    if (body.faceValueUSD !== undefined) data.faceValueUSD = asDecimal(body.faceValueUSD)
    if (body.availableUSD !== undefined) data.availableUSD = asDecimal(body.availableUSD)
    if (body.minBlockUSD !== undefined) data.minBlockUSD = asDecimal(body.minBlockUSD)
    if (body.pricePerDollar !== undefined) data.pricePerDollar = asDecimal(body.pricePerDollar)
    if (body.status !== undefined) data.status = body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE"
    if (body.jurisdiction !== undefined) data.jurisdiction = body.jurisdiction ? String(body.jurisdiction).trim() : null
    if (body.stateRestriction !== undefined) data.stateRestriction = body.stateRestriction ? String(body.stateRestriction).trim() : null
    if (body.closeBy !== undefined) data.closeBy = body.closeBy ? new Date(body.closeBy) : null
    if (body.brokerName !== undefined) data.brokerName = body.brokerName ? String(body.brokerName).trim() : null
    if (body.notes !== undefined) data.notes = body.notes ? String(body.notes).trim() : null

    const updated = await prisma.creditInventory.update({
      where: { id: params.id },
      data,
    })

    await createAuditLog(
      (session.user as any).id,
      "UPDATE",
      "CreditInventory",
      updated.id
    )

    return NextResponse.json({ ok: true, credit: updated })
  } catch (error: any) {
    console.error("Update inventory error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update inventory" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.creditInventory.delete({
      where: { id: params.id },
    })

    await createAuditLog(
      (session.user as any).id,
      "DELETE",
      "CreditInventory",
      params.id
    )

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("Delete inventory error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete inventory" },
      { status: 500 }
    )
  }
}
