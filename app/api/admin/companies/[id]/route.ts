import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createAuditLog } from "@/lib/audit"

function isAdmin(session: any) {
  return !!session && (session.user as any)?.role === "ADMIN"
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: {
      accountantLinks: {
        include: {
          accountant: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          purchases: true,
          documents: true,
          users: true,
        },
      },
    },
  })

  if (!company) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ company })
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { legalName, state, ein, contactEmail } = await req.json()

  const company = await prisma.company.update({
    where: { id: params.id },
    data: {
      legalName,
      state: state || null,
      ein: ein || null,
      contactEmail,
    },
  })

  await createAuditLog(
    (session.user as any).id,
    "UPDATE",
    "Company",
    company.id,
    { legalName, state, ein, contactEmail }
  )

  return NextResponse.json({ ok: true, company })
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await prisma.company.update({
    where: { id: params.id },
    data: { archivedAt: new Date() },
  })

  await createAuditLog(
    (session.user as any).id,
    "DELETE",
    "Company",
    params.id
  )

  return NextResponse.json({ ok: true })
}
