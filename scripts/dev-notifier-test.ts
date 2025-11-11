#!/usr/bin/env tsx

import { notifyTelegram } from "../lib/notifier/telegram"
import { getEnv } from "../lib/env"

async function main() {
  console.log("📱 Telegram Notifier Test")
  console.log("━".repeat(50))

  const env = getEnv()
  
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.warn("⚠️  Telegram credentials not configured")
    console.warn("   Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env")
    console.warn("   Skipping test...")
    return
  }

  console.log("✅ Telegram credentials found")
  console.log(`   Chat ID: ${env.TELEGRAM_CHAT_ID}`)
  console.log()

  const testMessage = `
🧪 <b>SuVerse Test Notification</b>

This is a test message from the notifier system.

<b>System Info:</b>
• Timestamp: ${new Date().toISOString()}
• Environment: Development
• Test ID: ${Math.random().toString(36).substr(2, 9)}

<i>If you see this, notifications are working! 🎉</i>
`

  console.log("📤 Sending test message...")
  const result = await notifyTelegram(testMessage)

  if (result.ok) {
    console.log("✅ Message sent successfully!")
    console.log(`   Check your Telegram chat: ${env.TELEGRAM_CHAT_ID}`)
  } else if (result.skipped) {
    console.warn("⚠️  Message skipped (credentials not configured)")
  } else {
    console.error("❌ Failed to send message")
    console.error(`   Error: ${result.error || "Unknown error"}`)
  }

  console.log()
  console.log("━".repeat(50))
  console.log("Test complete!")
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
