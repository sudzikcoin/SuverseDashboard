import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentBrokerOrThrow } from '@/lib/broker/currentBroker'

export async function GET() {
  try {
    const broker = await getCurrentBrokerOrThrow()

    const pools = await prisma.brokerCreditPool.findMany({
      where: { brokerId: broker.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(pools)
  } catch (error) {
    if (error instanceof Error && error.message === 'Broker access only') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching broker inventory:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const broker = await getCurrentBrokerOrThrow()
    const body = await request.json()

    // TODO: Add input validation using Zod
    const {
      programName,
      creditYear,
      creditType,
      jurisdiction,
      programCode,
      registryId,
      totalFaceValueUsd,
      availableFaceValueUsd,
      minBlockUsd,
      pricePerDollar,
      offerStartDate,
      offerExpiryDate,
      expectedSettlementDays,
      visibility,
      status,
    } = body

    const pool = await prisma.brokerCreditPool.create({
      data: {
        brokerId: broker.id,
        programName,
        creditYear: parseInt(creditYear),
        creditType,
        jurisdiction,
        programCode,
        registryId,
        totalFaceValueUsd,
        availableFaceValueUsd,
        minBlockUsd,
        pricePerDollar,
        offerStartDate: offerStartDate ? new Date(offerStartDate) : null,
        offerExpiryDate: offerExpiryDate ? new Date(offerExpiryDate) : null,
        expectedSettlementDays: expectedSettlementDays
          ? parseInt(expectedSettlementDays)
          : null,
        visibility: visibility || 'PUBLIC',
        status: status || 'DRAFT',
      },
    })

    return NextResponse.json(pool, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Broker access only') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating credit pool:', error)
    return NextResponse.json(
      { error: 'Failed to create credit pool' },
      { status: 500 }
    )
  }
}
