import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Reset endpoint disabled in production" },
      { status: 403 }
    )
  }

  try {
    await prisma.auditLog.deleteMany({})
    await prisma.document.deleteMany({})
    await prisma.purchaseOrder.deleteMany({})
    await prisma.hold.deleteMany({})
    await prisma.creditInventory.deleteMany({})
    await prisma.accountantClient.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.company.deleteMany({})

    const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe_2025"
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    const admin = await prisma.user.create({
      data: {
        email: "admin@suverse.io",
        hashedPassword,
        role: "ADMIN",
        name: "Admin User",
      },
    })

    const inventory = [
      {
        creditType: "ITC",
        taxYear: 2024,
        faceValueUSD: 2000000,
        minBlockUSD: 25000,
        pricePerDollar: 0.88,
        availableUSD: 2000000,
        jurisdiction: "Federal",
        brokerName: "SuVerse Capital",
        notes: "Investment Tax Credit 2024",
      },
      {
        creditType: "PTC",
        taxYear: 2024,
        faceValueUSD: 1000000,
        minBlockUSD: 10000,
        pricePerDollar: 0.86,
        availableUSD: 1000000,
        jurisdiction: "Federal",
        brokerName: "SuVerse Capital",
        notes: "Production Tax Credit 2024",
      },
      {
        creditType: "C45Q",
        taxYear: 2025,
        faceValueUSD: 500000,
        minBlockUSD: 5000,
        pricePerDollar: 0.85,
        availableUSD: 500000,
        jurisdiction: "Federal",
        brokerName: "SuVerse Capital",
        notes: "Carbon Capture Credit 45Q",
      },
      {
        creditType: "C48C",
        taxYear: 2025,
        faceValueUSD: 750000,
        minBlockUSD: 10000,
        pricePerDollar: 0.90,
        availableUSD: 750000,
        jurisdiction: "Federal",
        brokerName: "SuVerse Capital",
        notes: "Advanced Energy Project Credit 48C",
      },
      {
        creditType: "C48E",
        taxYear: 2025,
        faceValueUSD: 300000,
        minBlockUSD: 5000,
        pricePerDollar: 0.89,
        availableUSD: 300000,
        jurisdiction: "Federal",
        brokerName: "SuVerse Capital",
        notes: "Clean Electricity Investment Credit 48E",
      },
    ]

    const credits = await Promise.all(
      inventory.map((item) =>
        prisma.creditInventory.create({
          data: item as any,
        })
      )
    )

    await prisma.$disconnect()

    return NextResponse.json({
      message: "Database reset and seeded successfully",
      admin: { email: admin.email },
      credits: credits.length,
    })
  } catch (error) {
    console.error("Reset error:", error)
    await prisma.$disconnect()
    return NextResponse.json(
      { error: "Failed to reset database" },
      { status: 500 }
    )
  }
}
