export const runtime = 'nodejs';
import { resend, fromAddress } from './resend';
import WelcomeEmail from '@/emails/WelcomeEmail';
import { writeAudit } from '@/lib/audit';

type SendResult = { ok: boolean; id?: string; error?: string };

export async function sendWelcomeEmail(
  to: string, 
  name?: string,
  userId?: string
): Promise<SendResult> {
  try {
    const res = await resend.emails.send({
      from: fromAddress(),
      to,
      subject: `Welcome to SuVerse${name ? ', ' + name : ''}!`,
      react: WelcomeEmail({ name }),
    });
    
    if ('error' in res && res.error) {
      console.error('[Email] Resend API error:', res.error);
      
      try {
        await writeAudit({
          action: 'UPDATE',
          entity: 'USER',
          entityId: userId || to,
          actorId: userId || null,
          actorEmail: to,
          details: {
            emailStatus: 'FAILED',
            template: 'WelcomeEmail',
            provider: 'Resend',
            error: String(res.error?.message || res.error),
          },
        });
      } catch (auditError) {
        console.error('[Email] Audit log failed:', auditError);
      }
      
      return { ok: false, error: String(res.error?.message || res.error) };
    }
    
    const emailId = (res as any).data?.id || (res as any).id;
    
    try {
      await writeAudit({
        action: 'UPDATE',
        entity: 'USER',
        entityId: userId || to,
        actorId: userId || null,
        actorEmail: to,
        details: {
          emailStatus: 'SENT',
          template: 'WelcomeEmail',
          provider: 'Resend',
          emailId,
        },
      });
    } catch (auditError) {
      console.error('[Email] Audit log failed:', auditError);
    }
    
    return { ok: true, id: emailId };
  } catch (e: any) {
    console.error('[Email] Exception:', e?.message || e);
    
    try {
      await writeAudit({
        action: 'UPDATE',
        entity: 'USER',
        entityId: userId || to,
        actorId: userId || null,
        actorEmail: to,
        details: {
          emailStatus: 'EXCEPTION',
          template: 'WelcomeEmail',
          provider: 'Resend',
          error: e?.message || 'Unknown error',
        },
      });
    } catch (auditError) {
      console.error('[Email] Audit log failed:', auditError);
    }
    
    return { ok: false, error: e?.message || 'Unknown error' };
  }
}
