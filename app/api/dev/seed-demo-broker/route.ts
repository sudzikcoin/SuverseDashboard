// TODO(dev-demo): remove before production
// This endpoint seeds a demo broker account for development/testing purposes

import { NextRequest, NextResponse } from 'next/server'
import { ensureDemoBrokerUser } from '@/lib/dev/seed-demo-broker'

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not allowed in production' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json().catch(() => ({}))
    const { seedCreditPools = false } = body

    const result = await ensureDemoBrokerUser({ seedCreditPools })

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      ...result,
      credentials: {
        email: 'broker.demo@suverse.io',
        password: 'demoBroker123',
        note: 'Use these credentials to log in at /login',
      },
    })
  } catch (error) {
    console.error('[seed-demo-broker] API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not allowed in production' },
      { status: 403 }
    )
  }

  return NextResponse.json({
    endpoint: '/api/dev/seed-demo-broker',
    method: 'POST',
    description: 'Seeds a demo broker account for development/testing',
    options: {
      seedCreditPools: 'boolean (optional) - Also create demo credit pools',
    },
    credentials: {
      email: 'broker.demo@suverse.io',
      password: 'demoBroker123',
    },
  })
}
