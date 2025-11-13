import { NextResponse } from 'next/server';
import { safeGetServerSession } from '../session-safe';

export async function requireAdmin() {
  // Use safe session helper to prevent "aes/gcm: invalid ghash tag" crashes
  // If decryption fails (old cookie), treat as logged out
  const session = await safeGetServerSession();
  
  if (!session || !session.user) {
    return NextResponse.json(
      { ok: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  if ((session.user as any).role !== 'ADMIN') {
    return NextResponse.json(
      { ok: false, error: 'Admin access required' },
      { status: 403 }
    );
  }

  return null;
}
