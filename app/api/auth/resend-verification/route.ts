/**
 * Resend Verification Email API Route
 * 
 * Allows users to request a new verification email.
 * Returns generic success response to prevent email enumeration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resendVerification } from '@/lib/auth/emailVerification';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { ok: false, error: 'email_required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { ok: false, error: 'invalid_email' },
        { status: 400 }
      );
    }

    const result = await resendVerification(email);

    // Handle already verified case explicitly
    if (!result.ok && result.error === 'already_verified') {
      return NextResponse.json(
        { 
          ok: false, 
          error: 'already_verified',
          message: 'This email address is already verified. You can log in now.' 
        },
        { status: 400 }
      );
    }

    // Generic success response (don't leak user existence)
    return NextResponse.json({
      ok: true,
      message: 'If an account with that email exists and is not yet verified, a new verification link has been sent.',
    });
  } catch (error: any) {
    console.error('[resend-verification] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'server_error' },
      { status: 500 }
    );
  }
}
