/**
 * Email Verification Workflow
 * 
 * Handles creation and verification of email verification tokens for user registration.
 * Integrates with SendGrid for sending verification emails.
 * 
 * TODO: Future enhancement - reuse this pattern for password reset workflow.
 */

export const runtime = 'nodejs';
import { prisma } from '@/lib/db';
import { sendTransactionalEmail } from '@/lib/email/sendgrid';
import crypto from 'crypto';

const APP_BASE_URL = process.env.APP_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

if (!process.env.APP_BASE_URL) {
  console.warn('[WARN] APP_BASE_URL not set, defaulting to', APP_BASE_URL);
}

/**
 * Generate verification token and send email to user.
 * Invalidates any previous unused tokens for this user.
 */
export async function createEmailVerificationToken(
  userId: string,
  email: string
): Promise<void> {
  // Invalidate any existing unused tokens for this user
  await prisma.emailVerificationToken.updateMany({
    where: {
      userId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });

  // Generate cryptographically secure token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Token expires in 24 hours
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // Save token to database
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  // Build verification URL
  const verifyUrl = `${APP_BASE_URL}/auth/verify?token=${token}`;

  // Send verification email
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0B1220; color: #EAF2FB;">
      <div style="background: linear-gradient(135deg, #34D399 0%, #38BDF8 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #0B1220;">SuVerse</h1>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #0F172A; opacity: 0.9;">Tax Credit Marketplace</p>
      </div>
      
      <div style="background-color: #0F172A; padding: 30px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
        <h2 style="margin: 0 0 20px 0; color: #34D399; font-size: 24px;">Verify Your Email</h2>
        
        <p style="margin: 0 0 15px 0; line-height: 1.6; color: #AFC3D6;">
          Thanks for signing up with SuVerse! Please confirm your email address to complete your account registration.
        </p>
        
        <div style="background-color: rgba(52, 211, 153, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #34D399;">
          <p style="margin: 0; color: #AFC3D6;"><strong>Email:</strong> ${email}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="display: inline-block; background-color: #34D399; color: #0B1220; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Verify Email Address
          </a>
        </div>
        
        <p style="margin: 20px 0 0 0; font-size: 14px; color: #AFC3D6; line-height: 1.6;">
          Or copy and paste this link into your browser:
        </p>
        <p style="margin: 5px 0; padding: 10px; background-color: rgba(255, 255, 255, 0.05); border-radius: 4px; font-size: 12px; color: #38BDF8; word-break: break-all;">
          ${verifyUrl}
        </p>
        
        <p style="margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 14px; color: #AFC3D6; line-height: 1.6;">
          This link will expire in 24 hours. If you didn't create an account with SuVerse, you can safely ignore this email.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding: 20px; color: #AFC3D6; font-size: 12px;">
        <p style="margin: 0;">© ${new Date().getFullYear()} SuVerse. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `
Verify Your Email - SuVerse Dashboard

Thanks for signing up! Please confirm your email address to complete your account registration.

Email: ${email}

Verify your email by clicking this link:
${verifyUrl}

This link will expire in 24 hours.

If you didn't create an account with SuVerse, you can safely ignore this email.

© ${new Date().getFullYear()} SuVerse. All rights reserved.
  `.trim();

  try {
    await sendTransactionalEmail({
      to: email,
      subject: 'Verify your email for SuVerse Dashboard',
      html,
      text,
    });
    console.log(`[emailVerification] Sent verification email to ${email}`);
  } catch (error) {
    console.error('[emailVerification] Failed to send verification email:', error);
    // Don't throw - token is already created in DB, user can request resend
  }
}

/**
 * Verify an email token and activate the user account.
 * Uses a transaction to atomically update token and user to prevent race conditions.
 * Returns result indicating success or specific error.
 */
export async function verifyEmailToken(
  token: string
): Promise<{ ok: boolean; error?: string }> {
  // Normalize token
  const normalizedToken = token.trim();

  try {
    // Use transaction to atomically verify and activate user
    const result = await prisma.$transaction(async (tx) => {
      // Look up and lock token for update
      const tokenRecord = await tx.emailVerificationToken.findUnique({
        where: { token: normalizedToken },
        include: { user: true },
      });

      if (!tokenRecord) {
        return { ok: false, error: 'invalid_or_used' };
      }

      // Check if already used
      if (tokenRecord.usedAt !== null) {
        return { ok: false, error: 'invalid_or_used' };
      }

      // Check if expired
      if (tokenRecord.expiresAt < new Date()) {
        return { ok: false, error: 'expired' };
      }

      const now = new Date();

      // Atomically mark token as used
      await tx.emailVerificationToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: now },
      });

      // Atomically update user - verify email and activate account
      await tx.user.update({
        where: { id: tokenRecord.userId },
        data: {
          emailVerifiedAt: now,
          status: 'ACTIVE',
        },
      });

      console.log(`[emailVerification] Email verified for user ${tokenRecord.user.email}`);

      return { ok: true };
    });

    return result;
  } catch (error) {
    console.error('[emailVerification] Transaction failed:', error);
    return { ok: false, error: 'server_error' };
  }
}

/**
 * Resend verification email to a user by email address.
 * IMPORTANT: Does not leak whether user exists or is already verified.
 * Always returns generic success to prevent email enumeration attacks.
 */
export async function resendVerification(
  email: string
): Promise<{ ok: boolean; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Don't leak whether user exists or verification status
  if (!user) {
    console.log(`[emailVerification] Resend requested for non-existent email`);
    // Return success to prevent email enumeration
    return { ok: true };
  }

  // Check if already verified - but don't reveal this to the client
  if (user.emailVerifiedAt !== null) {
    console.log(`[emailVerification] Resend requested for already verified email`);
    // Return success to prevent email enumeration
    return { ok: true };
  }

  // Create and send new verification token
  await createEmailVerificationToken(user.id, user.email);

  return { ok: true };
}
