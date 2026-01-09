import "server-only"
import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

export const SESSION_COOKIE_NAME = "bb-session"
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

interface SessionPayload {
  authenticated: boolean
  createdAt: number
  expiresAt: number
}

// Get secret key for JWT encryption
function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set")
  }
  return new TextEncoder().encode(secret)
}

// Create encrypted session JWT
export async function createSession(): Promise<string> {
  const now = Date.now()
  const expiresAt = now + SESSION_DURATION

  const payload: SessionPayload = {
    authenticated: true,
    createdAt: now,
    expiresAt,
  }

  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(getSecretKey())

  return token
}

// Validate session from request (for middleware)
export async function validateSession(request: NextRequest): Promise<SessionPayload | null> {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value

  if (!sessionToken) {
    return null
  }

  try {
    const { payload } = await jwtVerify(sessionToken, getSecretKey())

    const session = payload as unknown as SessionPayload

    // Check expiration
    const now = Date.now()
    if (session.expiresAt && now > session.expiresAt) {
      return null
    }

    return session
  } catch (error) {
    console.error("Session validation failed:", error)
    return null
  }
}

// Validate session from cookies (for Server Components)
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionToken) {
    return null
  }

  try {
    const { payload } = await jwtVerify(sessionToken, getSecretKey())
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}
