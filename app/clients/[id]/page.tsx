import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import CompanyDetailsClient from "./CompanyDetailsClient"

export default async function CompanyDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const { role, id: userId } = session.user as { role: string; id: string }

  let hasAccess = false
  if (role === "ADMIN") {
    hasAccess = true
  } else if (role === "ACCOUNTANT") {
    const link = await prisma.accountantClient.findFirst({
      where: {
        accountantId: userId,
        companyId: params.id,
      },
    })
    hasAccess = !!link
  } else if (role === "COMPANY") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    })
    hasAccess = user?.companyId === params.id
  }

  if (!hasAccess) {
    redirect("/clients")
  }

  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: {
      documents: {
        orderBy: { createdAt: "desc" },
      },
      purchaseOrders: {
        where: {
          status: {
            in: ["PAID", "PAID_TEST"],
          },
        },
        include: {
          inventory: {
            select: {
              id: true,
              creditType: true,
              taxYear: true,
              brokerName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!company) {
    redirect("/clients")
  }

  return (
    <CompanyDetailsClient 
      company={JSON.parse(JSON.stringify(company))} 
      userRole={role}
    />
  )
}
