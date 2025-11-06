import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe_2025'
  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@suverse.io' },
    update: {},
    create: {
      email: 'admin@suverse.io',
      hashedPassword,
      role: 'ADMIN',
      name: 'Admin User',
    },
  })

  console.log('Created admin user:', admin.email)
  console.log('Admin password:', adminPassword)

  const inventory = [
    {
      creditType: 'ITC',
      taxYear: 2024,
      faceValueUSD: 2000000,
      minBlockUSD: 25000,
      pricePerDollar: 0.88,
      availableUSD: 2000000,
      jurisdiction: 'Federal',
      brokerName: 'SuVerse Capital',
      notes: 'Investment Tax Credit 2024',
    },
    {
      creditType: 'PTC',
      taxYear: 2024,
      faceValueUSD: 1000000,
      minBlockUSD: 10000,
      pricePerDollar: 0.86,
      availableUSD: 1000000,
      jurisdiction: 'Federal',
      brokerName: 'SuVerse Capital',
      notes: 'Production Tax Credit 2024',
    },
    {
      creditType: 'C45Q',
      taxYear: 2025,
      faceValueUSD: 500000,
      minBlockUSD: 5000,
      pricePerDollar: 0.85,
      availableUSD: 500000,
      jurisdiction: 'Federal',
      brokerName: 'SuVerse Capital',
      notes: 'Carbon Capture Credit 45Q',
    },
    {
      creditType: 'C48C',
      taxYear: 2025,
      faceValueUSD: 750000,
      minBlockUSD: 10000,
      pricePerDollar: 0.90,
      availableUSD: 750000,
      jurisdiction: 'Federal',
      brokerName: 'SuVerse Capital',
      notes: 'Advanced Energy Project Credit 48C',
    },
    {
      creditType: 'C48E',
      taxYear: 2025,
      faceValueUSD: 300000,
      minBlockUSD: 5000,
      pricePerDollar: 0.89,
      availableUSD: 300000,
      jurisdiction: 'Federal',
      brokerName: 'SuVerse Capital',
      notes: 'Clean Electricity Investment Credit 48E',
    },
  ]

  for (const item of inventory) {
    const created = await prisma.creditInventory.create({
      data: item as any,
    })
    console.log(`Created inventory: ${created.creditType} ${created.taxYear}`)
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
