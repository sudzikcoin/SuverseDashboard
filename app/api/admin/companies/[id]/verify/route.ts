import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyCompanySchema } from "@/lib/validations"
import { writeAudit } from "@/lib/audit"
import { getRequestContext } from "@/lib/reqctx"
import { safeGetServerSession } from "@/lib/session-safe"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await safeGetServerSession()

  if (!session || !["ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validated = verifyCompanySchema.parse(body)
    
    // Normalize note to handle null/undefined
    const safeNote = validated.note ?? null

    const company = await prisma.company.findUnique({
      where: { id: params.id },
    })

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      )
    }

    const previousStatus = company.verificationStatus

    const updatedCompany = await prisma.company.update({
      where: { id: params.id },
      data: {
        verificationStatus: validated.status,
        verificationNote: safeNote,
      },
    })

    const ctx = await getRequestContext()
    await writeAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: validated.status === "VERIFIED" ? "VERIFY_COMPANY" : "REJECT_COMPANY",
      entity: "COMPANY",
      entityId: company.id,
      companyId: company.id,
      details: {
        previousStatus,
        newStatus: validated.status,
        note: safeNote,
        companyName: company.legalName,
        ein: company.ein,
      },
      ...ctx,
    })

    return NextResponse.json({ company: updatedCompany })
  } catch (error: any) {
    console.error("Error verifying company:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update verification status" },
      { status: 500 }
    )
  }
}
