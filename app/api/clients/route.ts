import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !["ACCOUNTANT", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const companies = await prisma.company.findMany({
      include: {
        users: {
          select: {
            email: true,
          },
        },
        purchases: {
          select: {
            id: true,
            totalUSD: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const clientData = companies.map((company) => ({
      id: company.id,
      legalName: company.legalName,
      state: company.state,
      ein: company.ein,
      contactEmail: company.contactEmail,
      totalPurchases: company.purchases.length,
      totalValue: company.purchases.reduce(
        (sum, p) => sum + Number(p.totalUSD),
        0
      ),
      createdAt: company.createdAt,
    }))

    return NextResponse.json({ clients: clientData })
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !["ACCOUNTANT", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { legalName, state, ein, contactEmail } = body

    if (!legalName || !contactEmail) {
      return NextResponse.json(
        { error: "Legal name and contact email are required" },
        { status: 400 }
      )
    }

    const company = await prisma.company.create({
      data: {
        legalName,
        state,
        ein,
        contactEmail,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "CREATE",
        entity: "Company",
        entityId: company.id,
      },
    })

    return NextResponse.json({ company }, { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    )
  }
}
