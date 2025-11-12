import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ops/auth-middleware";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const adminError = await requireAdmin();
  if (adminError) return adminError;

  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      ok: true,
      hasSession: !!session,
      sessionInfo: session ? {
        userRole: session.user?.role || "UNKNOWN",
        hasEmail: !!session.user?.email,
        emailMasked: session.user?.email ? `${session.user.email.substring(0, 3)}***@${session.user.email.split('@')[1]}` : null,
      } : null,
      note: "Session data is masked for security",
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Session health check failed" },
      { status: 500 }
    );
  }
}
