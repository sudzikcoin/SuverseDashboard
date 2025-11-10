import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createAuditLog } from "@/lib/audit"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.company.update({
      where: { id: params.id },
      data: { status: "ACTIVE", archivedAt: null },
    })

    await createAuditLog(
      (session.user as any).id,
      "UNARCHIVE",
      "Company",
      params.id
    )

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("Unarchive company error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to unarchive company" },
      { status: 500 }
    )
  }
}
