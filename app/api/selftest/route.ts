import { NextResponse } from 'next/server';
import { runAllChecks } from '@/lib/ops/health';
import { requireAdmin } from '@/lib/ops/auth-middleware';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const startTime = Date.now();
  
  try {
    const result = await runAllChecks();
    const durationMs = Date.now() - startTime;

    const failures: string[] = [];
    if (result.checks.db && !result.checks.db.ok) failures.push('db');
    if (result.checks.auth && !result.checks.auth.ok) failures.push('auth');
    if (result.checks.email && !result.checks.email.ok) failures.push('email');
    if (result.checks.wallet && !result.checks.wallet.ok) failures.push('wallet');
    if (result.checks.usdc && !result.checks.usdc.ok) failures.push('usdc');
    if (result.checks.audit && !result.checks.audit.ok) failures.push('audit');

    return NextResponse.json(
      {
        ok: result.ok,
        durationMs,
        failures,
        report: result,
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    const durationMs = Date.now() - startTime;
    console.error('[shield] /api/selftest error:', error);
    
    return NextResponse.json(
      { 
        ok: false, 
        durationMs,
        failures: ['all'],
        report: {
          error: error instanceof Error ? error.message : 'Self-test failed',
        },
      },
      { status: 200 }
    );
  }
}
