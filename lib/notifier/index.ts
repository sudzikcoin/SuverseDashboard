import { notifyTelegram } from "./telegram"

type AuditLogLike = {
  action: string
  entity: string
  actorEmail?: string | null
  entityId?: string | null
  amountUSD?: number | any | null
  txHash?: string | null
  details?: any
}

export function formatAuditMessage(log: AuditLogLike): string {
  const { action, entity, actorEmail, entityId, amountUSD, txHash, details } = log
  
  const actor = actorEmail || 'System'
  const shortTx = txHash ? `${txHash.slice(0, 6)}…${txHash.slice(-4)}` : ''
  const detailsObj = details as Record<string, any> | null
  
  switch (action) {
    case 'REGISTER':
      const companyName = detailsObj?.companyName || 'Company'
      return `🟢 <b>New Company Registered</b>\n${companyName} by ${actor}`
    
    case 'PAYMENT_USDC_CONFIRMED':
    case 'PAYMENT_CONFIRMED':
      const amount = amountUSD ? `$${Number(amountUSD).toFixed(2)}` : '$0.00'
      return `💸 <b>USDC Payment Confirmed</b>\n${amount} ${shortTx ? `(tx ${shortTx})` : ''}\nBy: ${actor}`
    
    case 'PAYMENT_INITIATED':
    case 'PAYMENT_SUBMITTED':
      const amt = amountUSD ? `$${Number(amountUSD).toFixed(2)}` : '$0.00'
      return `💳 <b>Payment ${action === 'PAYMENT_INITIATED' ? 'Initiated' : 'Submitted'}</b>\n${amt}\nBy: ${actor}`
    
    case 'PAYMENT_FAILED':
      return `❌ <b>Payment Failed</b>\nBy: ${actor}`
    
    case 'USER_BLOCK':
    case 'USER_BLOCKED':
      const targetEmail = detailsObj?.targetEmail || entityId || 'user'
      return `🚫 <b>User Blocked</b>\n${targetEmail}\nBy: ${actor}`
    
    case 'USER_UNBLOCK':
    case 'USER_UNBLOCKED':
      const unblockedEmail = detailsObj?.targetEmail || entityId || 'user'
      return `✅ <b>User Unblocked</b>\n${unblockedEmail}\nBy: ${actor}`
    
    case 'RESET_PASSWORD':
    case 'PASSWORD_CHANGED':
      return `🔐 <b>Password Changed</b>\nBy: ${actor}`
    
    case 'LOGIN':
    case 'LOGIN_SUCCESS':
      return `🔓 <b>Login Success</b>\nBy: ${actor}`
    
    case 'LOGIN_FAIL':
    case 'LOGIN_FAILED':
      return `⚠️ <b>Login Failed</b>\nAttempt by: ${actor}`
    
    case 'ARCHIVE_COMPANY':
    case 'COMPANY_DELETED':
      return `🗑️ <b>Company Archived/Deleted</b>\n${detailsObj?.companyName || entityId || 'Company'}\nBy: ${actor}`
    
    case 'UNARCHIVE_COMPANY':
      return `♻️ <b>Company Restored</b>\n${detailsObj?.companyName || entityId || 'Company'}\nBy: ${actor}`
    
    case 'BLOCK_COMPANY':
      return `🚫 <b>Company Blocked</b>\n${detailsObj?.companyName || entityId || 'Company'}\nBy: ${actor}`
    
    case 'UNBLOCK_COMPANY':
      return `✅ <b>Company Unblocked</b>\n${detailsObj?.companyName || entityId || 'Company'}\nBy: ${actor}`
    
    case 'TRANSACTION_CRYPTO':
      const txAmount = amountUSD ? `$${Number(amountUSD).toFixed(2)}` : ''
      return `⛓️ <b>Crypto Transaction</b>\n${txAmount} ${shortTx ? `(${shortTx})` : ''}\nBy: ${actor}`
    
    case 'CREATE':
      return `➕ <b>Created ${entity}</b>\nBy: ${actor}`
    
    case 'UPDATE':
      return `✏️ <b>Updated ${entity}</b>\nBy: ${actor}`
    
    case 'DELETE':
      return `🗑️ <b>Deleted ${entity}</b>\nBy: ${actor}`
    
    case 'DOCUMENT_UPLOAD':
      return `📄 <b>Document Uploaded</b>\n${detailsObj?.fileName || 'File'}\nBy: ${actor}`
    
    case 'DOCUMENT_DELETE':
      return `🗑️ <b>Document Deleted</b>\n${detailsObj?.fileName || 'File'}\nBy: ${actor}`
    
    case 'HOLD_CREATED':
      return `🔒 <b>Credit Hold Created</b>\nBy: ${actor}`
    
    case 'HOLD_RELEASED':
      return `🔓 <b>Credit Hold Released</b>\nBy: ${actor}`
    
    default:
      return `📘 <b>${action}</b> on ${entity}\nBy: ${actor}`
  }
}

export async function notifyAudit(log: AuditLogLike): Promise<void> {
  const text = formatAuditMessage(log)
  await notifyTelegram(text)
}
