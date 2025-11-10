export const runtime = 'nodejs';
import { Resend } from 'resend';
import { getEmailEnv } from '../env';

const emailEnv = getEmailEnv();

if (!emailEnv.isValid) {
  console.error('[mail] Email environment validation failed - emails may not work');
}

export const resend = new Resend(emailEnv.RESEND_API_KEY);

export function fromAddress() {
  return emailEnv.RESEND_FROM;
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local}***@${domain}`;
  return `${local.substring(0, 2)}***${local.substring(local.length - 2)}@${domain}`;
}
