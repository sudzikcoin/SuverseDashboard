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
      data: { status: "BLOCKED" },
    })

    await writeAudit({
      actorId: (session.user as any).id,
      actorEmail: (session.user as any).email ?? null,
      action: "BLOCK_COMPANY",
      entity: "COMPANY",
      entityId: id,
      companyId: id,
      details: { prevStatus: prev?.status ?? null, nextStatus: updated.status },
    })

    return NextResponse.json({ ok: true, company: updated })
  } catch (error: any) {
    console.error("Block company error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to block company" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    )
  }
}
