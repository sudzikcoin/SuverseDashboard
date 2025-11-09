import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const accountants = await prisma.user.findMany({
      where: { role: "ACCOUNTANT" },
      include: {
        accountantClients: {
          include: {
            company: {
              select: {
                id: true,
                legalName: true,
                ein: true,
                state: true,
                contactEmail: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ accountants })
  } catch (error) {
    console.error("Error fetching accountants:", error)
    return NextResponse.json(
      { error: "Failed to fetch accountants" },
      { status: 500 }
    )
  }
}
