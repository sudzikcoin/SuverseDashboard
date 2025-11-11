import { NextRequest, NextResponse } from "next/server"
import { getEnv } from "@/lib/env"
import { buildSummary } from "@/lib/analytics/summary"
import { notifyTelegram } from "@/lib/notifier/telegram"

export async function POST(request: NextRequest) {
  const { CRON_SECRET } = getEnv()
  
  const cronSecret = request.headers.get('x-cron-secret')
  
  if (!CRON_SECRET || cronSecret !== CRON_SECRET) {
    console.warn('[cron] Unauthorized access attempt to daily-summary')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const now = new Date()
    
    const summary = await buildSummary(yesterday, now)
    
    const { totals, topActions, anomalies } = summary
    
    const topActionsText = topActions
      .slice(0, 3)
      .map(({ action, count }) => `${action} (${count})`)
      .join(', ')
    
    const alertsText = anomalies.length > 0
      ? '\n\n<b>🚨 Alerts:</b>\n' + anomalies.map(a => `• ${a}`).join('\n')
      : ''
    
    const message = `📊 <b>Daily Summary</b> (UTC)
    
<b>Totals:</b>
• Events: ${totals.events}
• Payments: $${totals.paymentsUSD.toFixed(2)}
• Active Users: ${totals.users}
• Companies: ${totals.companies}

<b>Top Actions:</b>
${topActionsText || 'None'}${alertsText}`

    const result = await notifyTelegram(message)
    
    return NextResponse.json({
      ok: result.ok,
      summary: {
        events: totals.events,
        paymentsUSD: totals.paymentsUSD,
        anomalies: anomalies.length,
      },
      sent: !result.skipped,
    })
  } catch (error) {
    console.error('[cron/daily-summary] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate daily summary' },
      { status: 500 }
    )
  }
}
