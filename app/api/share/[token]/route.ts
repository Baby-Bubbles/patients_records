import { type NextRequest, NextResponse } from "next/server"
import { ShareService } from "@/lib/share-service"
import { DatabaseService } from "@/lib/database-service"

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const { password } = await request.json()

    console.log("🔐 API: Validando acesso ao token compartilhado")
    console.log("📋 Token recebido:", token?.substring(0, 20) + "...")

    if (!token || !password) {
      return NextResponse.json({ error: "Token e senha são obrigatórios" }, { status: 400 })
    }

    // Validar token
    const tokenData = ShareService.validateShareToken(token, password)
    if (!tokenData) {
      console.log("❌ Token inválido ou senha incorreta")
      return NextResponse.json({ error: "Senha incorreta ou link inválido/expirado" }, { status: 401 })
    }

    console.log("✅ Token válido, buscando dados do paciente:", tokenData.patientId)

    // Buscar dados do paciente e atendimentos
    const [patient, appointments] = await Promise.all([
      DatabaseService.getPatient(tokenData.patientId),
      DatabaseService.getAppointments(tokenData.patientId),
    ])

    if (!patient) {
      console.log("❌ Paciente não encontrado:", tokenData.patientId)
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    console.log("🎉 Dados carregados com sucesso!")

    return NextResponse.json({
      patient,
      appointments,
      tokenInfo: {
        expiresAt: tokenData.expiresAt,
        createdAt: tokenData.timestamp,
      },
    })
  } catch (error) {
    console.error("💥 Erro na API de compartilhamento:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

// Verificar se token é válido (sem autenticação)
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params

    console.log("🔍 API: Verificando validade do token")
    console.log("📋 Token:", token?.substring(0, 20) + "...")

    if (!token) {
      return NextResponse.json({
        valid: false,
        error: "Token não fornecido",
      })
    }

    const validation = ShareService.isTokenValid(token)

    console.log("📊 Resultado da validação:", validation)

    return NextResponse.json(validation)
  } catch (error) {
    console.error("❌ Erro na verificação do token:", error)
    return NextResponse.json({
      valid: false,
      error: "Erro ao verificar token",
    })
  }
}
