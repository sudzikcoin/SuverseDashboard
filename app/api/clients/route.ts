import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { COMPLETED_PURCHASE_STATUSES } from "@/lib/purchase-statuses"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !["ACCOUNTANT", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    let companies: any[] = []

    if (session.user.role === "ADMIN") {
      companies = await prisma.company.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          users: {
            select: {
              email: true,
            },
          },
          purchaseOrders: {
            where: {
              status: {
                in: [...COMPLETED_PURCHASE_STATUSES],
              },
            },
            select: {
              id: true,
              amountUSD: true,
              totalUSD: true,
              status: true,
            },
          },
        },
        orderBy: {
          legalName: "asc",
        },
      })
    } else if (session.user.role === "ACCOUNTANT") {
      const links = await prisma.accountantClient.findMany({
        where: { accountantId: session.user.id },
        include: {
          company: {
            include: {
              users: {
                select: {
                  email: true,
                },
              },
              purchaseOrders: {
                where: {
                  status: {
                    in: [...COMPLETED_PURCHASE_STATUSES],
                  },
                },
                select: {
                  id: true,
                  amountUSD: true,
                  totalUSD: true,
                  status: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      companies = links
        .map((link) => link.company)
        .filter((c) => c.deletedAt === null && c.status !== "ARCHIVED")
        .sort((a, b) => a.legalName.localeCompare(b.legalName))
    }

    const clientData = companies.map((company: any) => ({
      id: company.id,
      legalName: company.legalName,
      state: company.state,
      ein: company.ein,
      contactEmail: company.contactEmail,
      verificationStatus: company.verificationStatus,
      verificationNote: company.verificationNote,
      totalPurchases: company.purchaseOrders.length,
      totalValue: company.purchaseOrders.reduce(
        (sum: number, p: any) => {
          const value = p.amountUSD ? Number(p.amountUSD) : (p.totalUSD ? Number(p.totalUSD) : 0)
          return sum + (isNaN(value) ? 0 : value)
        },
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
        verificationStatus: "UNVERIFIED",
      },
    })

    if (session.user.role === "ACCOUNTANT") {
      await prisma.accountantClient.create({
        data: {
          accountantId: session.user.id,
          companyId: company.id,
        },
      })
    }

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "CREATE",
        entity: "COMPANY",
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
