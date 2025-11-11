import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { normalizeEmail, maskEmail } from "@/lib/auth-diagnostics"

export async function POST(req: NextRequest) {
  if (!process.env.REPL_ID) {
    return NextResponse.json(
      { error: 'This endpoint is only available in Replit environment' },
      { status: 403 }
    )
  }

  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({
        ok: false,
        reason: 'MISSING_CREDENTIALS',
        message: 'Email and password are required'
      })
    }

    const normalizedEmail = normalizeEmail(email)
    const emailMasked = maskEmail(normalizedEmail)

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        hashedPassword: true,
        role: true,
      },
    })

    if (!user || !user.hashedPassword) {
      return NextResponse.json({
        ok: false,
        reason: 'USER_NOT_FOUND',
        message: `No user found with email ${emailMasked}`,
      })
    }

    const hashPrefix = user.hashedPassword.substring(0, 4)
    const isValid = await bcrypt.compare(password, user.hashedPassword)

    if (!isValid) {
      return NextResponse.json({
        ok: false,
        reason: 'INVALID_PASSWORD',
        message: 'Password does not match',
        debug: {
          emailMasked,
          hashAlgo: hashPrefix.startsWith('$2') ? 'bcrypt' : `unknown (${hashPrefix})`,
        },
      })
    }

    return NextResponse.json({
      ok: true,
      message: 'Login test successful',
      user: {
        email: user.email,
        role: user.role,
        hashAlgo: hashPrefix.startsWith('$2') ? 'bcrypt' : `unknown (${hashPrefix})`,
      },
    })
  } catch (error: any) {
    console.error('[test-login] Error:', error)
    return NextResponse.json({
      ok: false,
      reason: 'EXCEPTION',
      message: error.message,
    }, { status: 500 })
  }
}
