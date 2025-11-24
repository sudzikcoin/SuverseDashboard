/**
 * Email Verification API Route
 * 
 * Handles email verification from the link sent to users.
 * Accepts token via query parameter or JSON body.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailToken } from '@/lib/auth/emailVerification';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  
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
