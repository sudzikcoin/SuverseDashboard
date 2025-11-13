/**
 * Safe Session Helpers for Edge Runtime (Middleware)
 * 
 * Edge-compatible version that prevents "aes/gcm: invalid ghash tag" crashes
 * in middleware. Uses only Edge-compatible APIs.
 */

import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

/**
 * Detects if an error is related to AES-GCM decryption failure
 * Broadened to catch various crypto error phrasings
 */
function isAesGcmError(error: any): boolean {
  const msg = error?.message?.toLowerCase() || String(error).toLowerCase()
  return (
    msg.includes('aes/gcm') ||
    msg.includes('invalid ghash tag') ||
    msg.includes('decryption failed') ||
    msg.includes('unsupported state') ||
    msg.includes('unable to authenticate data') ||
    msg.includes('invalid tag') ||
    msg.includes('authentication tag') ||
    error?.name === 'OperationError' ||
    error?.code === 'ERR_CRYPTO_INVALID_TAG'
  )
}

/**
 * Safely retrieves JWT token from request (Edge-compatible)
 * Returns null if decryption fails instead of throwing
 */
export async function safeGetToken(req: NextRequest): Promise<any | null> {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    })
    return token
  } catch (error) {
    if (isAesGcmError(error)) {
      console.warn('[session-safe] Invalid encrypted session detected (likely old secret), treating as logged out')
      return null
    }
    // Re-throw non-AES errors (genuine bugs)
    console.error('[session-safe] Unexpected session error:', error)
    throw error
  }
}
