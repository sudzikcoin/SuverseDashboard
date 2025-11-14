import { prisma } from '../db';
import { getAuthEnv, getEmailEnv, getWalletEnv, getUsdcEnv, VERSION_HASH, maskEmail, maskKey } from '../env';

export interface HealthCheckResult {
  ok: boolean;
  info?: any;
  error?: string;
}

export async function checkDb(): Promise<HealthCheckResult> {
  try {
    await prisma.$queryRaw`SELECT 1 as health`;

    return {
      ok: true,
      info: {
        connected: true,
        lastChecked: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

export async function checkAuth(): Promise<HealthCheckResult> {
  try {
    const authEnv = getAuthEnv();
    const secret = process.env.NEXTAUTH_SECRET || '';
    const sessionSecret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || '';
    
    if (!secret || secret.length < 32) {
      return {
        ok: false,
        error: 'NEXTAUTH_SECRET missing or too short (< 32 chars)',
      };
    }

    if (!sessionSecret || sessionSecret.length < 32) {
      return {
        ok: false,
        error: 'SESSION_SECRET missing or too short (< 32 chars)',
      };
    }

    return {
      ok: authEnv.isValid,
      info: {
        secretLength: secret.length,
        sessionSecretLength: sessionSecret.length,
        versionHashPrefix: VERSION_HASH.substring(0, 8),
        trustHost: authEnv.trust,
        url: authEnv.url || '<not set>',
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Auth check failed',
    };
  }
}

export async function checkEmail(): Promise<HealthCheckResult> {
  try {
    const emailEnv = getEmailEnv();
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM;

    const info: any = {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      from: maskEmail(from),
    };

    if (!apiKey || apiKey.length < 10) {
      return {
        ok: false,
        error: 'RESEND_API_KEY missing or too short',
        info,
      };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      info.reachable = response.status === 200 || response.status === 405;
      info.statusCode = response.status;

      if (response.status === 401 || response.status === 403) {
        return {
          ok: false,
          error: 'Invalid RESEND_API_KEY (authentication failed)',
          info,
        };
      }

      return {
        ok: info.reachable,
        info,
      };
    } catch (fetchError) {
      return {
        ok: false,
        error: 'Cannot reach Resend API',
        info,
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Email check failed',
    };
  }
}

export async function checkWallet(): Promise<HealthCheckResult> {
  try {
    const walletEnv = getWalletEnv();
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

    const info: any = {
      hasProjectId: !!projectId && projectId !== 'MISSING' && projectId !== '',
      projectIdLength: projectId?.length || 0,
      projectIdPrefix: maskKey(projectId, 6),
    };

    // If no projectId is set at all
    if (!projectId || projectId === 'MISSING' || projectId === '') {
      return {
        ok: false,
        error: 'WalletConnect projectId not configured',
        info,
      };
    }

    // Check if projectId has valid format (32 hex chars)
    if (projectId.length === 32 && /^[a-fA-F0-9]{32}$/.test(projectId)) {
      info.validFormat = true;
      info.isValid = walletEnv.isValid;
      return {
        ok: true,
        info,
      };
    }

    // Invalid format
    return {
      ok: false,
      error: `WalletConnect projectId has invalid format (expected 32 hex chars, got ${projectId.length} chars)`,
      info,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Wallet check failed',
    };
  }
}

export async function checkUsdc(): Promise<HealthCheckResult> {
  try {
    const usdcEnv = getUsdcEnv();
    const address = process.env.USDC_BASE_ADDRESS;
    const decimals = usdcEnv.NEXT_PUBLIC_USDC_DECIMALS;

    const info: any = {
      hasAddress: !!address,
      address: address || '<not set>',
      decimals,
      validDecimals: decimals >= 0 && decimals <= 18,
    };

    if (!usdcEnv.isValid) {
      return {
        ok: false,
        error: 'USDC configuration validation failed',
        info,
      };
    }

    if (address && !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return {
        ok: false,
        error: 'USDC_BASE_ADDRESS has invalid format (expected 0x + 40 hex chars)',
        info,
      };
    }

    return {
      ok: true,
      info,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'USDC check failed',
    };
  }
}

export async function checkAudit(): Promise<HealthCheckResult> {
  try {
    const count = await prisma.auditLog.count();

    return {
      ok: true,
      info: {
        tableExists: true,
        recordCount: count,
      },
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMsg.includes('does not exist') || errorMsg.includes('Unknown arg')) {
      return {
        ok: false,
        error: 'AuditLog table does not exist or Prisma schema out of sync',
      };
    }

    return {
      ok: false,
      error: `Audit check failed: ${errorMsg}`,
    };
  }
}

export async function runAllChecks() {
  const startTime = Date.now();

  const [dbResult, authResult, emailResult, walletResult, usdcResult, auditResult] = 
    await Promise.all([
      checkDb(),
      checkAuth(),
      checkEmail(),
      checkWallet(),
      checkUsdc(),
      checkAudit(),
    ]);

  const durationMs = Date.now() - startTime;

  const allOk = 
    dbResult.ok &&
    authResult.ok &&
    emailResult.ok &&
    walletResult.ok &&
    usdcResult.ok &&
    auditResult.ok;

  return {
    ok: allOk,
    ts: new Date().toISOString(),
    versionHashPrefix: VERSION_HASH.substring(0, 8),
    durationMs,
    checks: {
      db: dbResult,
      auth: authResult,
      email: emailResult,
      wallet: walletResult,
      usdc: usdcResult,
      audit: auditResult,
    },
  };
}
