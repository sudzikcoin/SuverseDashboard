export const runtime = 'nodejs';
import { resend, fromAddress, maskEmail } from './resend';
import WelcomeEmail from '@/emails/WelcomeEmail';
import { writeAudit } from '@/lib/audit';

type SendResult = { ok: boolean; id?: string; error?: string };

export async function sendWelcomeEmail(
  to: string, 
  name?: string,
  userId?: string
): Promise<SendResult> {
  const masked = maskEmail(to);
  const from = fromAddress();
  
  console.log(`[mail] sending → to=${masked}, from=${from}`);
  
  try {
    const res = await resend.emails.send({
      from,
      to,
      subject: `Welcome to SuVerse${name ? ', ' + name : ''}!`,
      react: WelcomeEmail({ name }),
    });
    
    if ('error' in res && res.error) {
      const errorMsg = String(res.error?.message || res.error);
      const errorCode = (res.error as any)?.statusCode || 'UNKNOWN';
      console.error(`[mail] error code=${errorCode} message=${errorMsg}`);
      
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
            error: errorMsg,
          },
        });
      } catch (auditError) {
        console.error('[mail] Audit log failed:', auditError);
      }
      
      return { ok: false, error: errorMsg };
    }
    
    const emailId = (res as any).data?.id || (res as any).id;
    console.log(`[mail] sent id=${emailId}`);
    
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
      console.error('[mail] Audit log failed:', auditError);
    }
    
    return { ok: true, id: emailId };
  } catch (e: any) {
    const errorMsg = e?.message || 'Unknown error';
    console.error(`[mail] exception: ${errorMsg}`);
    
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
          error: errorMsg,
        },
      });
    } catch (auditError) {
      console.error('[mail] Audit log failed:', auditError);
    }
    
    return { ok: false, error: errorMsg };
  }
}
