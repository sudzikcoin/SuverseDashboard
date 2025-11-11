interface AuthLogData {
  stage: string
  emailMasked: string
  reasonCode?: string
  ip?: string
  ua?: string
  ts: string
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return '***@***'
  const masked = local.length > 2 
    ? `${local[0]}${local[1]}${'*'.repeat(Math.min(local.length - 2, 5))}` 
    : local
  return `${masked}@${domain}`
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function logAuth(event: string, data: Partial<AuthLogData>) {
  const logEntry: AuthLogData = {
    stage: data.stage || 'unknown',
    emailMasked: data.emailMasked || '***',
    reasonCode: data.reasonCode,
    ip: data.ip || 'unknown',
    ua: data.ua || 'unknown',
    ts: new Date().toISOString(),
  }
  
  console.log(`[auth] ${event}`, JSON.stringify(logEntry))
}

export type ReasonCode =
  | 'USER_NOT_FOUND'
  | 'HASH_MISMATCH'
  | 'INVALID_PASSWORD'
  | 'MISSING_CREDENTIALS'
  | 'COMPANY_ARCHIVED'
  | 'DB_ERROR'
  | 'ENV_INVALID'
  | 'SUCCESS'
