export const runtime = 'nodejs';
import { resend, fromAddress } from './resend';
import WelcomeEmail from '@/emails/WelcomeEmail';

type SendResult = { ok: boolean; id?: string; error?: string };

export async function sendWelcomeEmail(to: string, name?: string): Promise<SendResult> {
  try {
    const res = await resend.emails.send({
      from: fromAddress(),
      to,
      subject: `Welcome to SuVerse${name ? ', ' + name : ''}!`,
      react: WelcomeEmail({ name }),
    });
    if ('error' in res && res.error) {
      console.error('[Email] Resend API error:', res.error);
      return { ok: false, error: String(res.error?.message || res.error) };
    }
    return { ok: true, id: (res as any).data?.id || (res as any).id };
  } catch (e: any) {
    console.error('[Email] Exception:', e?.message || e);
    return { ok: false, error: e?.message || 'Unknown error' };
  }
}
