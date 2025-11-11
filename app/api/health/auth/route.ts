import { NextResponse } from "next/server"
import { getAuthEnv } from "@/lib/env"
import { prisma } from "@/lib/db"

export async function GET() {
  const result: {
    envOk: boolean
    dbOk: boolean
    hasAdmin: boolean
    hashAlgo: string | null
    details?: any
  } = {
    envOk: false,
    dbOk: false,
    hasAdmin: false,
    hashAlgo: null,
  }

  try {
    const authEnv = getAuthEnv()
    result.envOk = authEnv.isValid
    
    if (!authEnv.isValid) {
      result.details = {
        message: 'Auth environment validation failed',
        missing: [
          !authEnv.NEXTAUTH_SECRET && 'NEXTAUTH_SECRET',
          !authEnv.NEXTAUTH_URL && 'NEXTAUTH_URL',
          !authEnv.DATABASE_URL && 'DATABASE_URL',
        ].filter(Boolean)
      }
    }
  } catch (error: any) {
    result.details = { envError: error.message }
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    result.dbOk = true
  } catch (error: any) {
    result.details = { ...result.details, dbError: error.message }
  }

  try {
    const admin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@suverse.io' },
          { email: 'admin@suverse.app' },
        ],
        role: 'ADMIN',
      },
      select: {
        email: true,
        hashedPassword: true,
      },
    })

    result.hasAdmin = !!admin
    
    if (admin?.hashedPassword) {
      const prefix = admin.hashedPassword.substring(0, 4)
      if (prefix.startsWith('$2')) {
        result.hashAlgo = 'bcrypt'
      } else if (prefix.startsWith('$argon')) {
        result.hashAlgo = 'argon2'
      } else {
        result.hashAlgo = `unknown (prefix: ${prefix})`
      }
    }
  } catch (error: any) {
    result.details = { ...result.details, adminCheckError: error.message }
  }

  const status = result.envOk && result.dbOk && result.hasAdmin ? 200 : 503

  return NextResponse.json(result, { status })
}
