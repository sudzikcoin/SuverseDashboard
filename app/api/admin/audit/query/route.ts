import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      from,
      to,
      actions,
      entities,
      q,
      limit = 500,
      cursor,
    } = body as {
      from?: string
      to?: string
      actions?: string[]
      entities?: string[]
      q?: string
      limit?: number
      cursor?: string
    }

    const where: any = {}

    if (from || to) {
      where.timestamp = {}
      if (from) where.timestamp.gte = new Date(from)
      if (to) where.timestamp.lte = new Date(to)
    }

    if (actions && actions.length > 0) {
      where.action = { in: actions }
    }

    if (entities && entities.length > 0) {
      where.entity = { in: entities }
    }

    if (q) {
      where.OR = [
        { actorEmail: { contains: q, mode: 'insensitive' as any } },
        { entityId: { contains: q, mode: 'insensitive' as any } },
        { ip: { contains: q } },
      ]
    }

    if (cursor) {
      where.id = { lt: cursor }
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit + 1,
    })

    const hasMore = logs.length > limit
    const items = hasMore ? logs.slice(0, limit) : logs
    const nextCursor = hasMore ? logs[limit].id : null

    const fromDate = from ? new Date(from) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const toDate = to ? new Date(to) : new Date()

    const allLogsInRange = await prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: fromDate,
          lte: toDate,
        },
      },
      select: {
        action: true,
        timestamp: true,
        amountUSD: true,
      },
    })

    const byDay: Record<string, number> = {}
    const byAction: Record<string, number> = {}
    const paymentsByDay: Record<string, number> = {}

    allLogsInRange.forEach((log) => {
      const day = log.timestamp.toISOString().split('T')[0]
      byDay[day] = (byDay[day] || 0) + 1
      byAction[log.action] = (byAction[log.action] || 0) + 1

      if (log.amountUSD != null && Number(log.amountUSD) > 0) {
        paymentsByDay[day] = (paymentsByDay[day] || 0) + Number(log.amountUSD)
      }
    })

    return NextResponse.json({
      items,
      nextCursor,
      aggregates: {
        byDay: Object.entries(byDay).map(([date, count]) => ({ date, count })),
        byAction: Object.entries(byAction).map(([action, count]) => ({ action, count })),
        paymentsByDay: Object.entries(paymentsByDay).map(([date, amount]) => ({ date, amount })),
      },
    })
  } catch (error) {
    console.error('[audit/query] Error:', error)
    return NextResponse.json(
      { error: 'Failed to query audit logs' },
      { status: 500 }
    )
  }
}
