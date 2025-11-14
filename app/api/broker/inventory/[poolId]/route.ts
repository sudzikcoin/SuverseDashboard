import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentBrokerOrThrow } from '@/lib/broker/currentBroker'
import { updateCreditPoolSchema } from '@/lib/broker/validation'

export async function GET(
  request: NextRequest,
  { params }: { params: { poolId: string } }
) {
  try {
    const broker = await getCurrentBrokerOrThrow()
    const { poolId } = params

    const pool = await prisma.brokerCreditPool.findFirst({
      where: {
        id: poolId,
        brokerId: broker.id,
      },
    })

    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
    }

    return NextResponse.json(pool)
  } catch (error) {
    if (error instanceof Error && error.message === 'Broker access only') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching credit pool:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credit pool' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { poolId: string } }
) {
  try {
    const broker = await getCurrentBrokerOrThrow()
    const { poolId } = params
    const body = await request.json()

    // Verify the pool belongs to this broker
    const existingPool = await prisma.brokerCreditPool.findFirst({
      where: {
        id: poolId,
        brokerId: broker.id,
      },
    })

    if (!existingPool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
    }

    // Validate input using Zod
    const validationResult = updateCreditPoolSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data
    const updateData: any = {}

    // Only update provided fields
    if (validatedData.programName !== undefined) updateData.programName = validatedData.programName
    if (validatedData.creditYear !== undefined) updateData.creditYear = validatedData.creditYear
    if (validatedData.creditType !== undefined) updateData.creditType = validatedData.creditType
    if (validatedData.jurisdiction !== undefined) updateData.jurisdiction = validatedData.jurisdiction
    if (validatedData.programCode !== undefined) updateData.programCode = validatedData.programCode
    if (validatedData.registryId !== undefined) updateData.registryId = validatedData.registryId
    if (validatedData.totalFaceValueUsd !== undefined) updateData.totalFaceValueUsd = validatedData.totalFaceValueUsd
    if (validatedData.availableFaceValueUsd !== undefined) updateData.availableFaceValueUsd = validatedData.availableFaceValueUsd
    if (validatedData.minBlockUsd !== undefined) updateData.minBlockUsd = validatedData.minBlockUsd
    if (validatedData.pricePerDollar !== undefined) updateData.pricePerDollar = validatedData.pricePerDollar
    if (validatedData.offerStartDate !== undefined) {
      updateData.offerStartDate = validatedData.offerStartDate ? new Date(validatedData.offerStartDate) : null
    }
    if (validatedData.offerExpiryDate !== undefined) {
      updateData.offerExpiryDate = validatedData.offerExpiryDate ? new Date(validatedData.offerExpiryDate) : null
    }
    if (validatedData.expectedSettlementDays !== undefined) {
      updateData.expectedSettlementDays = validatedData.expectedSettlementDays || null
    }
    if (validatedData.visibility !== undefined) updateData.visibility = validatedData.visibility
    if (validatedData.status !== undefined) updateData.status = validatedData.status

    const updatedPool = await prisma.brokerCreditPool.update({
      where: { id: poolId },
      data: updateData,
    })

    return NextResponse.json(updatedPool)
  } catch (error) {
    if (error instanceof Error && error.message === 'Broker access only') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating credit pool:', error)
    return NextResponse.json(
      { error: 'Failed to update credit pool' },
      { status: 500 }
    )
  }
}
