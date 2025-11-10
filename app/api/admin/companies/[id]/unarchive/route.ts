import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdminSession } from "@/lib/admin"
import { writeAudit } from "@/lib/audit"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdminSession()
    const id = params.id

    const prev = await prisma.company.findUnique({ where: { id } })
    const updated = await prisma.company.update({
      where: { id },
      data: { status: "ACTIVE", archivedAt: null },
    })

    await writeAudit({
      actorId: (session.user as any).id,
      actorEmail: (session.user as any).email ?? null,
      action: "UNARCHIVE_COMPANY",
      entity: "COMPANY",
      entityId: id,
      details: { prevStatus: prev?.status ?? null, nextStatus: updated.status, archivedAt: updated.archivedAt },
    })

    return NextResponse.json({ ok: true, company: updated })
  } catch (error: any) {
    console.error("Unarchive company error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to unarchive company" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    )
  }
}
