import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = session.user.role
  
  if (role === "ADMIN") {
    const companies = await prisma.company.findMany({ orderBy: { name: "asc" } })
    return NextResponse.json({ companies })
  }

  if (role === "ACCOUNTANT") {
    const links = await prisma.accountantClient.findMany({
      where: { accountantId: session.user.id },
      include: { company: true },
      orderBy: { company: { name: "asc" } }
    })
    return NextResponse.json({ companies: links.map(l => l.company) })
  }

  if (role === "COMPANY" && session.user.companyId) {
    const c = await prisma.company.findUnique({ where: { id: session.user.companyId } })
    return NextResponse.json({ companies: c ? [c] : [] })
  }

  return NextResponse.json({ companies: [] })
}
