import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { signPayload } from "@/lib/sign"
import { logAudit } from "@/lib/audit"

async function hasCompanyAccess(userId: string, role: string, companyId: string): Promise<boolean> {
  if (role === "ADMIN") return true
  
  if (role === "ACCOUNTANT") {
    const link = await prisma.accountantClient.findFirst({
      where: {
        accountantId: userId,
        companyId: companyId,
      },
    })
    return !!link
  }
  
  if (role === "COMPANY") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    })
    return user?.companyId === companyId
  }
  
  return false
}

export async function POST(
  request: NextRequest,
  { params }: { params: { docId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role, id: userId } = session.user as { role: string; id: string }

    const document = await prisma.document.findUnique({
      where: { id: params.docId },
    })

    if (!document || document.deletedAt) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const hasAccess = await hasCompanyAccess(userId, role, document.companyId)
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const ttlSeconds = body.ttlSeconds || 3600
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000)

    const token = signPayload({
      docId: params.docId,
      companyId: document.companyId,
      exp: expiresAt.getTime(),
    })

    const url = `${request.nextUrl.origin}/api/files?token=${token}`

    await logAudit('doc_share', userId, document.companyId, {
      docId: params.docId,
      filename: document.filename,
      ttlSeconds,
    })

    return NextResponse.json({
      url,
      expiresAt: expiresAt.toISOString(),
      ttlSeconds,
    })
  } catch (error) {
    console.error("Error creating share link:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
