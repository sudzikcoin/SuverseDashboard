import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { safeGetServerSession } from "@/lib/session-safe"

export async function GET(request: Request) {
  const session = await safeGetServerSession()

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.toLowerCase() || ""

    const brokers = await prisma.broker.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { companyName: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              { contactName: { contains: query, mode: "insensitive" } },
              { state: { contains: query, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            status: true,
            emailVerifiedAt: true,
          },
        },
        _count: {
          select: {
            creditPools: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ brokers })
  } catch (error: any) {
    console.error("Error fetching brokers:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch brokers" },
      { status: 500 }
    )
  }
}
