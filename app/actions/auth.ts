"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createSession, SESSION_COOKIE_NAME } from "@/lib/auth"

interface LoginResult {
  success: boolean
  error?: string
}

export async function login(password: string, callbackUrl: string = "/"): Promise<LoginResult> {
  try {
    const appPassword = process.env.APP_PASSWORD

    if (!appPassword) {
      console.error("APP_PASSWORD not configured")
      return { success: false, error: "Sistema não configurado corretamente" }
    }

    // Validate password
    if (password.trim() !== appPassword.trim()) {
      console.warn("Failed login attempt")
      return { success: false, error: "Senha incorreta" }
    }

    // Create encrypted session
    const sessionToken = await createSession()

    // Set httpOnly cookie
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log("Login successful")
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Erro ao processar login" }
  }

  // Redirect outside try-catch (Next.js pattern)
  redirect(callbackUrl)
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  redirect("/login")
}
