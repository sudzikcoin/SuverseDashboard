export const runtime = 'nodejs';
import { Resend } from 'resend';

const key = process.env.RESEND_API_KEY;
if (!key) {
  console.error('[Email] Missing RESEND_API_KEY');
}

export const resend = new Resend(key!);

export function fromAddress() {
  return process.env.RESEND_FROM || 'onboarding@resend.dev';
}
