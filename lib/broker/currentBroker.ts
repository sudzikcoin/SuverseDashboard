import { prisma } from '@/lib/db'
import { safeGetServerSession } from '@/lib/session-safe'

export async function getCurrentBrokerOrThrow() {
  const session = await safeGetServerSession()

  if (!session || session.user.role !== 'BROKER' || !session.user.brokerId) {
    throw new Error('Broker access only')
  }

  const broker = await prisma.broker.findUnique({
    where: { id: session.user.brokerId },
  })

  if (!broker) {
    throw new Error('Broker not found')
  }

  return broker
}
