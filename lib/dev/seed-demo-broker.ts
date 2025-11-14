// TODO(dev-demo): remove before production
// This file contains development-only utilities for seeding a demo broker account

import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export interface SeedDemoBrokerOptions {
  seedCreditPools?: boolean
}

export interface SeedDemoBrokerResult {
  success: boolean
  message: string
  userId?: string
  brokerId?: string
  poolsCreated?: number
}

export async function ensureDemoBrokerUser(
  options: SeedDemoBrokerOptions = {}
): Promise<SeedDemoBrokerResult> {
  const email = 'broker.demo@suverse.io'
  const password = 'demoBroker123'
  const actions: string[] = []

  try {
    let user = await prisma.user.findUnique({ 
      where: { email },
      include: { broker: true }
    })

    let broker = user?.broker

    if (!broker) {
      // Use upsert for atomic broker creation (email is @unique in schema)
      // Type assertion needed until LSP picks up regenerated Prisma types
      broker = await prisma.broker.upsert({
        where: { email } as any,
        create: {
          name: 'Demo Broker',
          legalName: 'Demo Broker LLC',
          email,
          taxId: '12-3456789',
          state: 'Delaware',
          country: 'USA',
        },
        update: {},
      })
      
      const wasCreated = !user || user.brokerId !== broker.id
      actions.push(wasCreated ? 'Created Broker record' : 'Reused existing Broker record')
    }

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 12)

      user = await prisma.user.create({
        data: {
          email,
          name: 'Demo Broker',
          role: 'BROKER',
          brokerId: broker.id,
          hashedPassword,
        },
        include: { broker: true },
      })
      actions.push('Created User record with BROKER role')
    } else {
      const updates: any = {}
      
      if (user.role !== 'BROKER') {
        updates.role = 'BROKER'
        actions.push('Updated role to BROKER')
      }
      
      if (user.brokerId !== broker.id) {
        updates.brokerId = broker.id
        actions.push('Linked user to broker')
      }

      const hashedPassword = await bcrypt.hash(password, 12)
      updates.hashedPassword = hashedPassword
      actions.push('Updated password')

      if (Object.keys(updates).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updates,
          include: { broker: true },
        })
      }
    }

    let poolsCreated = 0
    if (options.seedCreditPools) {
      const existingPools = await prisma.brokerCreditPool.count({
        where: { brokerId: broker.id }
      })

      if (existingPools === 0) {
        await prisma.brokerCreditPool.createMany({
          data: [
            {
              brokerId: broker.id,
              programName: 'Solar Investment Tax Credit',
              creditYear: 2024,
              creditType: 'ITC',
              jurisdiction: 'Federal',
              programCode: 'ITC-2024',
              registryId: 'DEMO-ITC-001',
              totalFaceValueUsd: 5000000,
              availableFaceValueUsd: 5000000,
              minBlockUsd: 50000,
              pricePerDollar: 0.92,
              visibility: 'PUBLIC',
              status: 'ACTIVE',
              offerStartDate: new Date('2024-01-01'),
              offerExpiryDate: new Date('2025-12-31'),
              expectedSettlementDays: 45,
            },
            {
              brokerId: broker.id,
              programName: 'Production Tax Credit - Wind',
              creditYear: 2024,
              creditType: 'PTC',
              jurisdiction: 'Federal',
              programCode: 'PTC-2024',
              registryId: 'DEMO-PTC-001',
              totalFaceValueUsd: 3000000,
              availableFaceValueUsd: 2750000,
              minBlockUsd: 25000,
              pricePerDollar: 0.89,
              visibility: 'PUBLIC',
              status: 'ACTIVE',
              offerStartDate: new Date('2024-01-01'),
              offerExpiryDate: new Date('2025-06-30'),
              expectedSettlementDays: 30,
            },
            {
              brokerId: broker.id,
              programName: 'Carbon Capture Credit - 45Q',
              creditYear: 2024,
              creditType: '45Q',
              jurisdiction: 'Federal',
              programCode: '45Q-2024',
              registryId: 'DEMO-45Q-001',
              totalFaceValueUsd: 2000000,
              availableFaceValueUsd: 2000000,
              minBlockUsd: 100000,
              pricePerDollar: 0.85,
              visibility: 'PUBLIC',
              status: 'DRAFT',
              expectedSettlementDays: 60,
            },
          ],
        })
        poolsCreated = 3
        actions.push('Created 3 demo credit pools')
      }
    }

    const message = actions.length > 0 
      ? `Demo broker ready: ${actions.join(', ')}`
      : 'Demo broker already configured'

    console.log(`[seed-demo-broker] ${message}`)

    if (!user) {
      throw new Error('User creation failed')
    }

    return {
      success: true,
      message,
      userId: user.id,
      brokerId: broker.id,
      poolsCreated,
    }
  } catch (error) {
    console.error('[seed-demo-broker] Error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
