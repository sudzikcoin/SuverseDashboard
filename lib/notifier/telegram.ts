import { getEnv } from "../env"

export async function notifyTelegram(text: string): Promise<{ok: boolean; skipped?: boolean; error?: string}> {
  const { ENABLE_TELEGRAM, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = getEnv()
  
  if (!ENABLE_TELEGRAM) {
    console.log('[notifier] disabled: ENABLE_TELEGRAM=false')
    return { ok: true, skipped: true }
  }
  
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('[notifier] disabled: missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID')
    return { ok: true, skipped: true }
  }
  
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.warn('[notifier] fail:', response.status, errorData)
      return { ok: false, error: `Telegram API error: ${response.status}` }
    }
    
    console.log('[notifier] message sent successfully')
    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.warn('[notifier] fail:', message)
    return { ok: false, error: message }
  }
}
