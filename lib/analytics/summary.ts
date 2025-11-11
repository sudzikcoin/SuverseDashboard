import { prisma } from "../db"

export type Summary = {
  timeWindow: { from: Date; to: Date }
  totals: {
    events: number
    companies: number
    users: number
    paymentsUSD: number
  }
  topActions: Array<{ action: string; count: number }>
  anomalies: string[]
  notes?: string
}

export async function buildSummary(from: Date, to: Date): Promise<Summary> {
  const logs = await prisma.auditLog.findMany({
    where: {
      timestamp: {
        gte: from,
        lte: to,
      },
    },
    select: {
      action: true,
      entity: true,
      actorEmail: true,
      entityId: true,
      amountUSD: true,
      ip: true,
      details: true,
    },
  })

  const totalEvents = logs.length

  const companyIds = new Set(
    logs.filter(l => l.entity === 'COMPANY').map(l => l.entityId).filter(Boolean)
  )
  const totalCompanies = companyIds.size

  const userEmails = new Set(
    logs.map(l => l.actorEmail).filter(Boolean)
  )
  const totalUsers = userEmails.size

  const paymentsUSD = logs
    .filter(l => l.amountUSD != null)
    .reduce((sum, l) => sum + Number(l.amountUSD), 0)

  const actionCounts = logs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topActions = Object.entries(actionCounts)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const anomalies: string[] = []

  const loginFailsByIp = logs
    .filter(l => ['LOGIN_FAIL', 'LOGIN_FAILED'].includes(l.action) && l.ip)
    .reduce((acc, l) => {
      const ip = l.ip!
      acc[ip] = (acc[ip] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  Object.entries(loginFailsByIp).forEach(([ip, count]) => {
    if (count >= 3) {
      anomalies.push(`⚠️ ${count} failed login attempts from IP ${ip}`)
    }
  })

  const paymentActions = logs.filter(l =>
    ['PAYMENT_INITIATED', 'PAYMENT_SUBMITTED', 'PAYMENT_CONFIRMED', 'PAYMENT_FAILED'].includes(l.action)
  )
  const avgPaymentAmount = paymentActions.length > 0
    ? paymentActions.filter(l => l.amountUSD != null).reduce((sum, l) => sum + Number(l.amountUSD), 0) / paymentActions.length
    : 0

  const largePayments = paymentActions.filter(l =>
    l.amountUSD != null && Number(l.amountUSD) > avgPaymentAmount * 2
  )
  if (largePayments.length > 0 && avgPaymentAmount > 0) {
    anomalies.push(`💰 ${largePayments.length} payment(s) >2x average ($${avgPaymentAmount.toFixed(2)})`)
  }

  const deletions = logs.filter(l =>
    ['DELETE', 'ARCHIVE_COMPANY', 'COMPANY_DELETED'].includes(l.action)
  )
  if (deletions.length > 0) {
    anomalies.push(`🗑️ ${deletions.length} deletion/archive event(s)`)
  }

  const blocks = logs.filter(l =>
    ['USER_BLOCK', 'USER_BLOCKED', 'BLOCK_COMPANY'].includes(l.action)
  )
  if (blocks.length > 0) {
    anomalies.push(`🚫 ${blocks.length} user/company block(s)`)
  }

  const paymentFailures = logs.filter(l => l.action === 'PAYMENT_FAILED')
  if (paymentFailures.length > 0) {
    anomalies.push(`❌ ${paymentFailures.length} payment failure(s)`)
  }

  return {
    timeWindow: { from, to },
    totals: {
      events: totalEvents,
      companies: totalCompanies,
      users: totalUsers,
      paymentsUSD: Math.round(paymentsUSD * 100) / 100,
    },
    topActions,
    anomalies,
    notes: anomalies.length === 0 ? 'No anomalies detected' : undefined,
  }
}
