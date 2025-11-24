/**
 * Email Verification API Route
 * 
 * MANUAL TEST PLAN:
 * 1. Register new user → receive email → click link → see "Email Verified!" success page
 * 2. Click the same link again → see "Verification Failed - already used" error
 * 3. For expired token → click resend → receive new email with new token
 *    → old link shows "invalid or used" → new link shows success
 * 
 * Handles email verification from the link sent to users.
 * Accepts token via query parameter or JSON body.
 * 
 * The token workflow:
 * - Token is generated as 64-char random hex string (no hashing)
 * - Token is stored plain in database and compared plain
 * - Token expires in 24 hours
 * - Token is marked as "used" after successful verification
 * - User status is set to ACTIVE and emailVerifiedAt is set to current time
 * 
 * Returns explicit JSON responses with success, code, and message fields.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailToken } from '@/lib/auth/emailVerification';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  
  if (!token) {
    console.log('[VERIFY] Missing token in request');
    return NextResponse.json(
      {
        success: false,
        code: 'MISSING_TOKEN',
        message: 'Invalid verification link.',
      },
      { status: 400 }
    );
  }

  const result = await verifyEmailToken(token);

  if (!result.ok) {
    // Map internal error codes to user-friendly responses
    if (result.error === 'expired') {
      return NextResponse.json(
        {
          success: false,
          code: 'TOKEN_EXPIRED',
          message: 'This verification link has expired. Please request a new verification link.',
        },
        { status: 400 }
      );
    } else if (result.error === 'invalid_or_used') {
      return NextResponse.json(
        {
          success: false,
          code: 'TOKEN_USED',
          message: 'This verification link is invalid or has already been used.',
        },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          code: 'SERVER_ERROR',
          message: 'An unexpected error occurred while verifying your email.',
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token;

    if (!token) {
      console.log('[VERIFY] Missing token in request body');
      return NextResponse.json(
        {
          success: false,
          code: 'MISSING_TOKEN',
          message: 'Invalid verification link.',
        },
        { status: 400 }
      );
    }

    const result = await verifyEmailToken(token);

    if (!result.ok) {
      // Map internal error codes to user-friendly responses
      if (result.error === 'expired') {
        return NextResponse.json(
          {
            success: false,
            code: 'TOKEN_EXPIRED',
            message: 'This verification link has expired. Please request a new verification link.',
          },
          { status: 400 }
        );
      } else if (result.error === 'invalid_or_used') {
        return NextResponse.json(
          {
            success: false,
            code: 'TOKEN_USED',
            message: 'This verification link is invalid or has already been used.',
          },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            code: 'SERVER_ERROR',
            message: 'An unexpected error occurred while verifying your email.',
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[VERIFY] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred while verifying your email.',
      },
      { status: 500 }
    );
  }
}
