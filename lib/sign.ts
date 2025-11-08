import crypto from 'crypto'

const ALG = 'sha256'
const ENC = 'base64url'
const SECRET = process.env.DOCS_SIGN_SECRET || 'fallback-dev-secret-change-in-production'

export function signPayload(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const hmac = crypto.createHmac(ALG, SECRET).update(data).digest(ENC)
  return `${data}.${hmac}`
}

export function verifySignature(token: string): any | null {
  try {
    const [data, sig] = token.split('.')
    if (!data || !sig) return null
    
    const check = crypto.createHmac(ALG, SECRET).update(data).digest(ENC)
    if (check !== sig) return null
    
    const json = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'))
    
    if (json.exp && Date.now() > json.exp) return null
    
    return json
  } catch (error) {
    return null
  }
}
