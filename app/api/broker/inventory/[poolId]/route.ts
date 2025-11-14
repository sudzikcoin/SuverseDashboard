import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentBrokerOrThrow } from '@/lib/broker/currentBroker'

export async function GET(
  request: NextRequest,
  { params }: { params: { poolId: string } }
) {
  try {
    const broker = await getCurrentBrokerOrThrow()
    const { poolId } = params

    const pool = await prisma.brokerCreditPool.findUnique({
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
    const existingPool = await prisma.brokerCreditPool.findUnique({
      where: {
        id: poolId,
        brokerId: broker.id,
      },
    })

    if (!existingPool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
    }

    // TODO: Add input validation using Zod
    const updateData: any = {}

    // Only update provided fields
    if (body.programName !== undefined) updateData.programName = body.programName
    if (body.creditYear !== undefined)
      updateData.creditYear = parseInt(body.creditYear)
    if (body.creditType !== undefined) updateData.creditType = body.creditType
    if (body.jurisdiction !== undefined)
      updateData.jurisdiction = body.jurisdiction
    if (body.programCode !== undefined) updateData.programCode = body.programCode
    if (body.registryId !== undefined) updateData.registryId = body.registryId
    if (body.totalFaceValueUsd !== undefined)
      updateData.totalFaceValueUsd = body.totalFaceValueUsd
    if (body.availableFaceValueUsd !== undefined)
      updateData.availableFaceValueUsd = body.availableFaceValueUsd
    if (body.minBlockUsd !== undefined) updateData.minBlockUsd = body.minBlockUsd
    if (body.pricePerDollar !== undefined)
      updateData.pricePerDollar = body.pricePerDollar
    if (body.offerStartDate !== undefined)
      updateData.offerStartDate = body.offerStartDate
        ? new Date(body.offerStartDate)
        : null
    if (body.offerExpiryDate !== undefined)
      updateData.offerExpiryDate = body.offerExpiryDate
        ? new Date(body.offerExpiryDate)
        : null
    if (body.expectedSettlementDays !== undefined)
      updateData.expectedSettlementDays = body.expectedSettlementDays
        ? parseInt(body.expectedSettlementDays)
        : null
    if (body.visibility !== undefined) updateData.visibility = body.visibility
    if (body.status !== undefined) updateData.status = body.status

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
