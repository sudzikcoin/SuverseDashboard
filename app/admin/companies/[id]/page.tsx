import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import CompanyEditor from "./CompanyEditor"

export default async function CompanyPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/login")
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
    redirect("/admin/companies")
  }

  return <CompanyEditor initial={company} />
}
