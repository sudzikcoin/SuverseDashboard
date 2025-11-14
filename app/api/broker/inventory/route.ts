import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentBrokerOrThrow } from '@/lib/broker/currentBroker'
import { createCreditPoolSchema } from '@/lib/broker/validation'

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

    // Validate input using Zod
    const validationResult = createCreditPoolSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data

    const pool = await prisma.brokerCreditPool.create({
      data: {
        brokerId: broker.id,
        programName: validatedData.programName,
        creditYear: validatedData.creditYear,
        creditType: validatedData.creditType,
        jurisdiction: validatedData.jurisdiction,
        programCode: validatedData.programCode || null,
        registryId: validatedData.registryId || null,
        totalFaceValueUsd: validatedData.totalFaceValueUsd,
        availableFaceValueUsd: validatedData.availableFaceValueUsd,
        minBlockUsd: validatedData.minBlockUsd,
        pricePerDollar: validatedData.pricePerDollar,
        offerStartDate: validatedData.offerStartDate ? new Date(validatedData.offerStartDate) : null,
        offerExpiryDate: validatedData.offerExpiryDate ? new Date(validatedData.offerExpiryDate) : null,
        expectedSettlementDays: validatedData.expectedSettlementDays || null,
        visibility: validatedData.visibility,
        status: validatedData.status,
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
