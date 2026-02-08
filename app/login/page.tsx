"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AlertCircle } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { login } from "@/app/actions/auth"

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await login(password, callbackUrl)

      if (!result.success) {
        setError(result.error || "Senha incorreta")
      }
      // If success, Server Action redirects automatically
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-primary/20">
      <CardHeader className="text-center">
        <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 overflow-hidden">
          <Image
            src="/logo.png"
            alt="Baby Bubbles Logo"
            width={80}
            height={80}
            className="object-contain"
            priority
          />
        </div>
        <CardTitle className="text-2xl text-secondary">Baby Bubbles</CardTitle>
        <CardDescription>Prontuário Eletrônico - Faça login para acessar</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Senha de Acesso</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 p-3 bg-primary/10 rounded-lg border border-primary/30">
          <p className="text-xs text-secondary text-center">
            Acesso restrito a profissionais autorizados
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function LoginFallback() {
  return (
    <Card className="w-full max-w-md border-primary/20">
      <CardHeader className="text-center">
        <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 overflow-hidden bg-gray-100">
          <div className="animate-pulse w-16 h-16 bg-gray-200 rounded-full" />
        </div>
        <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4 mx-auto" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
            <div className="h-10 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(180,85%,95%)] to-[hsl(280,100%,96%)] flex items-center justify-center p-4">
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
