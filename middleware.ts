import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (isPublic(pathname)) return NextResponse.next()

  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  if (!needsAuth) return NextResponse.next()

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    const url = new URL("/login", req.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith("/admin")) {
    if ((token as any).role !== "ADMIN") {
      const url = new URL("/dashboard", req.url)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api/health).*)"
  ],
}
