import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { validateSession } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths - no auth required
  const publicPaths = [
    "/login",
    "/diagnostics",
    "/share/",
    "/api/share/",
    "/api/cron/heartbeat",
    "/_next/",
    "/favicon.ico",
    "/icon",
    "/apple-icon",
  ]

  // Check if current path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Validate session for protected routes
  const session = await validateSession(request)

  if (!session) {
    // Redirect to login, preserving the intended destination
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Session valid, proceed
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
