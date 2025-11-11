import { NextResponse } from 'next/server';
import { checkAudit } from '@/lib/ops/health';
import { requireAdmin } from '@/lib/ops/auth-middleware';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const result = await checkAudit();
    return NextResponse.json(result, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('[shield] /api/health/audit error:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Audit health check failed' 
      },
      { status: 200 }
    );
  }
}
