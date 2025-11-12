import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ops/auth-middleware";
import { getAuthEnv } from "@/lib/env";
import { VERSION_HASH } from "@/lib/env";

export async function GET() {
  const adminError = await requireAdmin();
  if (adminError) return adminError;

  try {
    const authEnv = getAuthEnv();
    
    const sessionSecretLen = authEnv.sessionSecret?.length || 0;
    const nextAuthSecretLen = authEnv.secret?.length || 0;
    
    const strong = sessionSecretLen >= 32 && nextAuthSecretLen >= 32;
    
    return NextResponse.json({
      ok: true,
      versionHashPrefix: VERSION_HASH.substring(0, 8),
      secrets: {
        sessionSecretLength: sessionSecretLen,
        nextAuthSecretLength: nextAuthSecretLen,
        strong: strong,
        recommendation: strong ? "✅ Secrets are strong (≥32 chars)" : "⚠️ Secrets should be ≥32 chars",
      },
      validation: {
        isValid: authEnv.isValid,
        trustHost: authEnv.trust,
        hasUrl: !!authEnv.url,
        hasDatabase: !!authEnv.DATABASE_URL,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Crypto health check failed" },
      { status: 500 }
    );
  }
}
