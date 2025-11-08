import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const updateCompanySchema = z.object({
  legalName: z.string().min(1).optional(),
  state: z.string().length(2).optional(),
  ein: z.string().optional(),
  contactEmail: z.string().email().optional(),
})

async function hasCompanyAccess(userId: string, role: string, companyId: string) {
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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role, id: userId } = session.user as { role: string; id: string }

    const hasAccess = await hasCompanyAccess(userId, role, params.id)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        documents: {
          orderBy: { createdAt: "desc" },
        },
        purchases: {
          include: {
            inventory: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json({ company })
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role, id: userId } = session.user as { role: string; id: string }

    const hasAccess = await hasCompanyAccess(userId, role, params.id)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const validated = updateCompanySchema.parse(body)

    const company = await prisma.company.update({
      where: { id: params.id },
      data: validated,
    })

    return NextResponse.json({ company })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }
    console.error("Error updating company:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role, id: userId } = session.user as { role: string; id: string }

    const hasAccess = await hasCompanyAccess(userId, role, params.id)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const company = await prisma.company.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ company, message: "Company archived" })
  } catch (error) {
    console.error("Error archiving company:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role, id: userId } = session.user as { role: string; id: string }

    const hasAccess = await hasCompanyAccess(userId, role, params.id)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    
    if (body.action === "unarchive") {
      const company = await prisma.company.update({
        where: { id: params.id },
        data: { deletedAt: null },
      })
      return NextResponse.json({ company, message: "Company unarchived" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in PATCH:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
