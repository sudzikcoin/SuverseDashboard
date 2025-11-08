import { prisma } from "@/lib/db"

export async function hasCompanyAccess(
  userId: string,
  companyId: string,
  userRole: string
): Promise<boolean> {
  if (userRole === "ADMIN") {
    return true
  }

  if (userRole === "COMPANY") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    })
    return user?.companyId === companyId
  }

  if (userRole === "ACCOUNTANT") {
    const link = await prisma.accountantClient.findFirst({
      where: { accountantId: userId, companyId },
    })
    return !!link
  }

  return false
}

export async function assertAccountantHasAccess(
  accountantId: string,
  companyId: string
): Promise<void> {
  const link = await prisma.accountantClient.findFirst({
    where: { accountantId, companyId },
  })
  if (!link) {
    throw new Error("No access to this company")
  }
}
