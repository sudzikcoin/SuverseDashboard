import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notifyTelegram } from "@/lib/notifier/telegram"
import { formatAuditMessage } from "@/lib/notifier"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const { text } = body as { text?: string }
    
    let message: string
    let result: any
    
    if (text) {
      message = text
      result = await notifyTelegram(text)
    } else {
      const fakeAuditLog = {
        action: 'PAYMENT_CONFIRMED',
        entity: 'PAYMENT',
        actorEmail: 'test@suverse.app',
        entityId: 'test-123',
        amountUSD: 1234.56,
        txHash: '0x1f71b4a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8da',
        details: { companyName: 'Test Company LLC' }
      }
      
      message = formatAuditMessage(fakeAuditLog)
      result = await notifyTelegram(message)
    }
    
    return NextResponse.json({
      ok: result.ok,
      skipped: result.skipped,
      message,
      info: result.error ? { error: result.error } : { sent: true }
    })
  } catch (error) {
    console.error('[notify-test] Error:', error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
