import { PrismaClient } from "@prisma/client"

const ACCOUNTANT_EMAIL = "accountant@example.com"
const COMPANY_LEGAL_NAME = "Acme Solar Inc"

const prisma = new PrismaClient()

async function linkAccountantToCompany() {
  try {
    const accountant = await prisma.user.findUnique({
      where: { email: ACCOUNTANT_EMAIL },
      select: { id: true, role: true, email: true },
    })

    if (!accountant) {
      console.error(`❌ Error: Accountant with email "${ACCOUNTANT_EMAIL}" not found`)
      process.exit(1)
    }

    if (accountant.role !== "ACCOUNTANT") {
      console.error(
        `❌ Error: User "${ACCOUNTANT_EMAIL}" has role "${accountant.role}" but must be "ACCOUNTANT"`
      )
      process.exit(1)
    }

    const company = await prisma.company.findFirst({
      where: { legalName: COMPANY_LEGAL_NAME },
      select: { id: true, legalName: true },
    })

    if (!company) {
      console.error(`❌ Error: Company with legal name "${COMPANY_LEGAL_NAME}" not found`)
      process.exit(1)
    }

    const existingLink = await prisma.accountantClient.findFirst({
      where: {
        accountantId: accountant.id,
        companyId: company.id,
      },
    })

    let status: "created" | "already-exists"

    if (existingLink) {
      status = "already-exists"
    } else {
      await prisma.accountantClient.create({
        data: {
          accountantId: accountant.id,
          companyId: company.id,
        },
      })
      status = "created"
    }

    console.log(
      `✔ Linked accountant ${accountant.id} (${accountant.email}) to company ${company.id} (${company.legalName}) - status: ${status}`
    )
    process.exit(0)
  } catch (error) {
    console.error("❌ Error linking accountant to company:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

linkAccountantToCompany()
