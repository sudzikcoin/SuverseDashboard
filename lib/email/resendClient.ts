/**
 * Resend Email Client Wrapper
 * 
 * Centralized Resend client for all email operations.
 * Provides proper error handling and logging when API key is missing.
 */

import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'onboarding@resend.dev';

// Check if API key is configured
const hasApiKey = !!RESEND_API_KEY && RESEND_API_KEY.length > 10;

if (!hasApiKey) {
  console.error('[EMAIL] Missing RESEND_API_KEY, cannot send emails');
}

// Initialize Resend client (will fail gracefully if key is missing)
export const resendClient = new Resend(RESEND_API_KEY || 'missing-key');

// Export the from address
export const resendFromAddress = RESEND_FROM;

// Export helper to check if Resend is properly configured
export function isResendConfigured(): boolean {
  return hasApiKey;
}

// Log API key status (for debugging, never log the actual key)
export function logResendStatus(): void {
  if (hasApiKey) {
    console.log(`[EMAIL] Resend configured: API key length=${RESEND_API_KEY!.length}, from=${RESEND_FROM}`);
  } else {
    console.error('[EMAIL] Resend NOT configured: RESEND_API_KEY is missing or too short');
  }
}
