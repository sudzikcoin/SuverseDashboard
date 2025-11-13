/**
 * Safe Session Helpers - Prevents "aes/gcm: invalid ghash tag" crashes
 * 
 * When NEXTAUTH_SECRET rotates, old encrypted cookies cause AES-GCM decryption
 * failures in NextAuth. These helpers catch those errors, clear invalid cookies,
 * and return null (treating the user as logged out) instead of throwing.
 */

import { getToken } from "next-auth/jwt"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import type { NextRequest } from "next/server"
import type { NextResponse } from "next/server"

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
 * Clears all NextAuth session cookies from a NextResponse
 */
export function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete("sv.session.v2")
  response.cookies.delete("next-auth.session-token")
  response.cookies.delete("__Secure-next-auth.session-token")
  console.log('[session-safe] Cleared invalid session cookies')
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

/**
 * Safely retrieves server session (App Router)
 * Returns null if decryption fails instead of throwing
 */
export async function safeGetServerSession(): Promise<any | null> {
  try {
    const session = await getServerSession(authOptions)
    return session
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
