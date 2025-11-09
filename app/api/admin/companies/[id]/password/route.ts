import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
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

    const { newPassword } = await req.json()

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        companyId: params.id,
        role: "COMPANY",
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Company user not found" },
        { status: 404 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword },
    })

    await createAuditLog(
      (session.user as any).id,
      "RESET_PASSWORD",
      "User",
      user.id,
      { companyId: params.id }
    )

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("Password reset error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to reset password" },
      { status: 500 }
    )
  }
}
