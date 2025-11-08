import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  const deleted = await prisma.accountantClient.deleteMany({})
  console.log(`Deleted ${deleted.count} AccountantClient rows`)
}

main().finally(() => prisma.$disconnect())
