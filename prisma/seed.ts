import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe_2025'
  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@suverse.io' },
    update: {
      hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@suverse.io',
      hashedPassword,
      role: 'ADMIN',
      name: 'Admin User',
    },
  })

  console.log('✅ Ensured admin user exists:', admin.email)
  console.log('   Password:', adminPassword)
  console.log('   Hash prefix:', hashedPassword.substring(0, 7))

  const accountantPassword = await bcrypt.hash('AccountTest123', 12)
  const accountant = await prisma.user.upsert({
    where: { email: 'accountant@example.com' },
    update: {},
    create: {
      email: 'accountant@example.com',
      hashedPassword: accountantPassword,
      role: 'ACCOUNTANT',
      name: 'Demo Accountant',
    },
  })
  console.log('Created accountant user:', accountant.email)

  const demoCompanies = [
    {
      legalName: 'Acme Solar Inc',
      state: 'CA',
      ein: '12-3456789',
      contactEmail: 'contact@acmesolar.com',
      taxLiability: 500000,
      targetCloseYear: 2025,
    },
    {
      legalName: 'GreenTech Manufacturing LLC',
      state: 'TX',
      ein: '98-7654321',
      contactEmail: 'info@greentech.com',
      taxLiability: 750000,
      targetCloseYear: 2025,
    },
    {
      legalName: 'Renewable Energy Partners',
      state: 'NY',
      ein: '45-6789012',
      contactEmail: 'hello@renewablepartners.com',
      taxLiability: 1200000,
      targetCloseYear: 2025,
    },
  ]

  for (const companyData of demoCompanies) {
    const company = await prisma.company.upsert({
      where: { ein: companyData.ein! },
      update: {},
      create: companyData as any,
    })
    console.log(`Ensured company exists: ${company.legalName}`)
  }

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

  const existingInventoryCount = await prisma.creditInventory.count()
  if (existingInventoryCount === 0) {
    for (const item of inventory) {
      const created = await prisma.creditInventory.create({
        data: item as any,
      })
      console.log(`Created inventory: ${created.creditType} ${created.taxYear}`)
    }
  } else {
    console.log(`Skipped creating inventory (${existingInventoryCount} records already exist)`)
  }

  const auditLogs = [
    {
      actorId: admin.id,
      actorEmail: 'admin@suverse.io',
      action: 'CREATE',
      entity: 'USER',
      entityId: admin.id,
    },
    {
      actorId: admin.id,
      actorEmail: 'admin@suverse.io',
      action: 'CREATE',
      entity: 'USER',
      entityId: accountant.id,
    },
    {
      actorId: admin.id,
      actorEmail: 'admin@suverse.io',
      action: 'CREATE',
      entity: 'CREDIT',
      entityId: 'demo-1',
    },
    {
      actorId: admin.id,
      actorEmail: 'admin@suverse.io',
      action: 'UPDATE',
      entity: 'CREDIT',
      entityId: 'demo-1',
    },
    {
      actorId: accountant.id,
      actorEmail: 'accountant@example.com',
      action: 'CREATE',
      entity: 'COMPANY',
      entityId: 'company-1',
    },
    {
      actorId: null,
      actorEmail: null,
      action: 'CREATE',
      entity: 'SYSTEM',
      entityId: null,
    },
  ]

  const existingAuditLogCount = await prisma.auditLog.count()
  if (existingAuditLogCount === 0) {
    for (const log of auditLogs) {
      await prisma.auditLog.create({
        data: log as any,
      })
    }
    console.log(`Created ${auditLogs.length} audit log entries`)
  } else {
    console.log(`Skipped creating audit logs (${existingAuditLogCount} records already exist)`)
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
