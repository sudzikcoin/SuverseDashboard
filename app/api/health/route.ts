import { NextResponse } from 'next/server';
import { runAllChecks } from '@/lib/ops/health';
import { requireAdmin } from '@/lib/ops/auth-middleware';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const result = await runAllChecks();
    return NextResponse.json(result, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('[shield] /api/health error:', error);
    return NextResponse.json(
      { 
        ok: false, 
        ts: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check aggregation failed',
        checks: {},
      },
      { status: 200 }
    );
  }
}
