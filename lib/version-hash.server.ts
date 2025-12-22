/**
 * Server-only VERSION_HASH computation
 * This file uses Node.js crypto and must only be imported in server-side code.
 */
import { createHash } from "crypto";

export function computeVersionHash(): string {
  try {
    const secret = process.env.NEXTAUTH_SECRET || '';
    const sessionSecret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || '';
    const resendFrom = process.env.RESEND_FROM || '';
    
    const combined = `${secret}:${sessionSecret}:${resendFrom}`;
    const hash = createHash('sha256').update(combined).digest('hex');
    
    return hash;
  } catch (error) {
    console.error('[shield] Failed to compute VERSION_HASH:', error);
    return 'fallback-version';
  }
}

export const VERSION_HASH = computeVersionHash();
