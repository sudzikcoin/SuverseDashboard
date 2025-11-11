import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';
import { NextResponse } from 'next/server';

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
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
