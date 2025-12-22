/**
 * Resend Email Client Wrapper
 * 
 * Centralized Resend client for all email operations.
 * Reads environment variables at request time for reliability.
 * Never falls back to sandbox address - requires proper configuration.
 */

import { Resend } from 'resend';

// Get configuration at request time (not module load time)
export function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM;
  
  const hasApiKey = !!apiKey && apiKey.length > 10;
  const hasFromAddress = !!fromAddress && fromAddress.length > 0;
  
  return {
    apiKey: apiKey || '',
    fromAddress: fromAddress || '',
    hasApiKey,
    hasFromAddress,
    isConfigured: hasApiKey && hasFromAddress,
    isSandboxMode: fromAddress?.includes('resend.dev') ?? false,
  };
}

// Create Resend client on demand
export function createResendClient(): Resend | null {
  const config = getResendConfig();
  if (!config.hasApiKey) {
    console.error('[EMAIL] Cannot create Resend client: RESEND_API_KEY not configured');
    return null;
  }
  return new Resend(config.apiKey);
}

// Export helper to check if Resend is properly configured
export function isResendConfigured(): boolean {
  const config = getResendConfig();
  return config.isConfigured;
}

// Log configuration status (for debugging, never log the actual key)
export function logResendStatus(): void {
  const config = getResendConfig();
  if (config.isConfigured) {
    console.log(`[EMAIL] Resend configured: API key length=${config.apiKey.length}, from=${config.fromAddress}`);
    if (config.isSandboxMode) {
      console.warn('[EMAIL] WARNING: Using sandbox domain - emails only go to account owner');
    }
  } else {
    if (!config.hasApiKey) {
      console.error('[EMAIL] Resend NOT configured: RESEND_API_KEY is missing');
    }
    if (!config.hasFromAddress) {
      console.error('[EMAIL] Resend NOT configured: RESEND_FROM is missing');
    }
  }
}
