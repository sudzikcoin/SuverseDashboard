import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { safeGetToken } from "./lib/session-safe-edge"

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/api/auth",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/_next",
  "/images",
  "/static",
]

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))
}

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/clients",
  "/marketplace",
  "/company",
  "/accountant",
  "/admin",
  "/pay",
]

async function computeVersionHash(req: NextRequest): Promise<string> {
  try {
    const secret = process.env.NEXTAUTH_SECRET || '';
    const sessionSecret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || '';
    const resendFrom = process.env.RESEND_FROM || '';
    
    const combined = `${secret}:${sessionSecret}:${resendFrom}`;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('[shield] Failed to compute VERSION_HASH in middleware:', error);
    return 'fallback-version';
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const response = NextResponse.next()

  try {
    const currentVersion = req.cookies.get("sv.version")?.value
    const expectedVersion = (await computeVersionHash(req)).substring(0, 8)

    if (currentVersion !== expectedVersion) {
      // Only clear auth cookies if there's an ACTUAL version mismatch 
      // (old cookie exists but has wrong value - means secrets changed)
      // Do NOT clear cookies if version cookie is just missing (new browser/session)
      if (currentVersion && currentVersion !== expectedVersion) {
        console.log('[shield] Version CHANGED, invalidating old sessions')
        response.cookies.delete("sv.session.v2")
        response.cookies.delete("next-auth.session-token")
        response.cookies.delete("__Secure-next-auth.session-token")
        
        if (!isPublic(pathname) && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
          const url = new URL("/login", req.url)
          url.searchParams.set("callbackUrl", pathname)
          return NextResponse.redirect(url)
        }
      }
      
      // Always set the version cookie if missing or mismatched
      response.cookies.set("sv.version", expectedVersion, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      })
    }
  } catch (error) {
    console.error('[shield] Version guard error:', error)
  }

  if (isPublic(pathname)) return response

  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  if (!needsAuth) return response

  // Use safe session helper to prevent "aes/gcm: invalid ghash tag" crashes
  // If decryption fails (old cookie), treat as logged out and clear cookies
  const token = await safeGetToken(req)
  if (!token) {
    const url = new URL("/login", req.url)
    url.searchParams.set("callbackUrl", pathname)
    const redirectResponse = NextResponse.redirect(url)
    // Clear invalid session cookies
    redirectResponse.cookies.delete("sv.session.v2")
    redirectResponse.cookies.delete("next-auth.session-token")
    redirectResponse.cookies.delete("__Secure-next-auth.session-token")
    return redirectResponse
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if ((token as any).role !== "ADMIN") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      const url = new URL("/dashboard", req.url)
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ],
}
