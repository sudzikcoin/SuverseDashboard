import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { registerSchema } from "@/lib/validations"
import { createAuditLog } from "@/lib/audit"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validated = registerSchema.parse(body)

    if (validated.role === "ADMIN") {
      return NextResponse.json(
        { error: "Cannot self-register as admin" },
        { status: 403 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12)

    let company = null
    if (validated.role === "COMPANY" && validated.companyLegalName) {
      company = await prisma.company.create({
        data: {
          legalName: validated.companyLegalName,
          state: validated.state,
          ein: validated.ein,
          contactEmail: validated.email,
          taxLiability: validated.taxLiability,
          targetCloseYear: validated.targetCloseYear,
        },
      })
    }

    const user = await prisma.user.create({
      data: {
        email: validated.email,
        hashedPassword,
        name: validated.name,
        role: validated.role,
        companyId: company?.id,
      },
    })

    if (company) {
      await prisma.company.update({
        where: { id: company.id },
        data: { ownerId: user.id },
      })
    }

    await createAuditLog(user.id, "CREATE", "User", user.id)

    if (validated.role === "COMPANY" || validated.role === "ACCOUNTANT") {
      await sendWelcomeEmail(
        validated.email,
        validated.role as "COMPANY" | "ACCOUNTANT",
        validated.name
      ).catch((err) => {
        console.error("Failed to send welcome email:", err)
      })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 }
    )
  }
}
