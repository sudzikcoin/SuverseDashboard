/**
 * Resend Verification Email API Route
 * 
 * Allows users to request a new verification email.
 * Returns generic success response to prevent email enumeration.
 * 
 * IMPORTANT: This endpoint does NOT reveal whether:
 * - The email exists in the system
 * - The user is already verified
 * - Any error occurred during email sending
 * 
 * This is intentional to prevent email enumeration attacks.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resendVerification } from '@/lib/auth/emailVerification';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      console.log('[resend-verification] No email provided');
      return NextResponse.json(
        { ok: false, error: 'email_required', message: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[resend-verification] Invalid email format:', email);
      return NextResponse.json(
        { ok: false, error: 'invalid_email', message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    console.log('[resend-verification] Processing resend request for:', email);
    
    const result = await resendVerification(email);

    // Always return generic success response to prevent email enumeration
    // Never reveal whether the email exists, is already verified, etc.
    return NextResponse.json({
      ok: true,
      message: 'If an account with that email exists and is not yet verified, a new verification link has been sent.',
    });
  } catch (error: any) {
    console.error('[resend-verification] Unexpected error:', error);
    return NextResponse.json(
      { ok: false, error: 'server_error', message: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
