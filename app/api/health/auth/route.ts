import { NextResponse } from "next/server"
import { getAuthEnv } from "@/lib/env"

export async function GET() {
  try {
    const authEnv = getAuthEnv()
    
    return NextResponse.json({
      ok: true,
      cookieName: "sv.session.v2",
      hasSecret: Boolean(authEnv.secret && authEnv.secret.length >= 32),
      trustHost: authEnv.trust,
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        ok: false,
        error: error.message 
      },
      { status: 500 }
    )
  }
}
