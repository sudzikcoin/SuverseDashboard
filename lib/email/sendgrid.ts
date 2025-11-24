/**
 * SendGrid Email Utility
 * 
 * Handles sending transactional emails via SendGrid with development mode fallback.
 * When SENDGRID_API_KEY is not set, emails are logged to console instead of being sent.
 */

export const runtime = 'nodejs';
import sgMail from '@sendgrid/mail';

const apiKey = process.env.SENDGRID_API_KEY;
const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'info@suverse.io';

// Initialize SendGrid if API key is available
if (apiKey) {
  sgMail.setApiKey(apiKey);
  console.log('[sendgrid] Initialized with API key');
} else {
  console.warn('[DEV] SENDGRID_API_KEY is not set. Emails will not be sent, only logged.');
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send a transactional email via SendGrid.
 * In dev mode (no API key), logs email content to console instead.
 */
export async function sendTransactionalEmail(opts: SendEmailOptions): Promise<void> {
  const { to, subject, html, text } = opts;

  if (!apiKey) {
    console.log('[DEV EMAIL]', {
      to,
      from: fromAddress,
      subject,
      html,
      text: text || subject,
    });
    return;
  }

  try {
    await sgMail.send({
      to,
      from: {
        email: fromAddress,
        name: 'SuVerse Dashboard',
      },
      subject,
      html,
      text: text || subject,
    });
    
    console.log(`[sendgrid] Email sent to ${to}: ${subject}`);
  } catch (error: any) {
    console.error('[sendgrid] Failed to send email:', error);
    throw new Error(`SendGrid error: ${error?.message || 'Unknown error'}`);
  }
}
