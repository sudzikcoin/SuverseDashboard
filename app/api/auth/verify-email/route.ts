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
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailToken } from '@/lib/auth/emailVerification';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  
  if (!token) {
    console.log('[verify-email] No token provided');
    return NextResponse.json(
      { ok: false, error: 'missing_token' },
      { status: 400 }
    );
  }

  const result = await verifyEmailToken(token);

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'missing_token' },
        { status: 400 }
      );
    }

    const result = await verifyEmailToken(token);

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[verify-email] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'server_error' },
      { status: 500 }
    );
  }
}
