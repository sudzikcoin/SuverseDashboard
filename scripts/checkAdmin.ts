import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function checkAdminCredentials() {
  try {
    console.log("🔍 Checking for ADMIN users in database...\n")

    const adminUsers = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        hashedPassword: true,
        name: true,
        createdAt: true,
      },
    })

    if (adminUsers.length === 0) {
      console.log("⚠️  No ADMIN users found in database.\n")
      console.log("🔧 Creating new admin account...\n")

      const hashedPassword = await bcrypt.hash("Admin123!", 12)

      const newAdmin = await prisma.user.create({
        data: {
          email: "admin@suverse.app",
          hashedPassword: hashedPassword,
          role: "ADMIN",
          name: "System Administrator",
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      })

      console.log("✅ New admin account created!")
      console.log("\n📋 Admin Details:")
      console.log(
        JSON.stringify(
          {
            email: newAdmin.email,
            password: "Admin123! (not shown in production)",
            name: newAdmin.name,
            createdAt: newAdmin.createdAt,
          },
          null,
          2
        )
      )
    } else {
      console.log(`✅ Found ${adminUsers.length} ADMIN user(s):\n`)

      const adminList = adminUsers.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name || "N/A",
        passwordEncrypted: user.hashedPassword ? "✓ (bcrypt hashed)" : "⚠️  No password set",
        createdAt: user.createdAt,
      }))

      console.log("📋 Admin Accounts:")
      console.log(JSON.stringify(adminList, null, 2))
      console.log("\n⚠️  Passwords are encrypted with bcrypt and cannot be displayed.")
    }
  } catch (error) {
    console.error("❌ Error checking admin credentials:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminCredentials()
