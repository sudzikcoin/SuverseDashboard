import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { registerSchema } from "@/lib/validations"
import { writeAudit } from "@/lib/audit"
import { createEmailVerificationToken } from "@/lib/auth/emailVerification"
import { getRequestContext } from "@/lib/reqctx"

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
          verificationStatus: "UNVERIFIED",
        },
      })
    }

    // User is created with status: PENDING_VERIFICATION (default in schema)
    // and emailVerifiedAt: null
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        hashedPassword,
        name: validated.name,
        role: validated.role,
        companyId: company?.id,
        status: "PENDING_VERIFICATION", // Explicit for clarity
        emailVerifiedAt: null,
      },
    })

    if (company) {
      await prisma.company.update({
        where: { id: company.id },
        data: { ownerId: user.id },
      })
    }

    const ctx = await getRequestContext()
    await writeAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "REGISTER",
      entity: "USER",
      entityId: user.id,
      companyId: company?.id,
      details: {
        role: user.role,
        companyCreated: !!company,
        emailVerificationRequired: true,
      },
      ...ctx,
    })

    // Send email verification instead of welcome email
    // User cannot log in until they verify their email address
    await createEmailVerificationToken(user.id, user.email).catch((err) => {
      console.error("Failed to send verification email:", err)
      // Don't fail registration if email fails - user can request resend
    })

    return NextResponse.json({
      success: true,
      requiresEmailVerification: true,
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
