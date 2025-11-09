import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createAuditLog } from "@/lib/audit"

function isAdmin(session: any) {
  return !!session && (session.user as any)?.role === "ADMIN"
}

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const company = await prisma.company.update({
    where: { id: params.id },
    data: { status: "ACTIVE" },
  })

  await createAuditLog(
    (session.user as any).id,
    "UNBLOCK",
    "Company",
    company.id
  )

  return NextResponse.json({ ok: true, company })
}
