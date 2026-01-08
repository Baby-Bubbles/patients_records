import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

/**
 * Endpoint Vercel Cron para heartbeat diário do banco de dados
 *
 * Segurança: Protegido por Vercel Cron Secret (variável de ambiente CRON_SECRET)
 * Agendamento: Configurado em vercel.json
 *
 * Este endpoint:
 * 1. Valida o secret do cron
 * 2. Executa uma query leve de contagem na tabela patients
 * 3. Registra o resultado no console e no banco de dados
 * 4. Retorna resposta JSON com o status
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  // Etapa 1: Verificar Vercel Cron Secret
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  // Se CRON_SECRET estiver configurado, validá-lo
  if (cronSecret) {
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      console.error("Heartbeat: Tentativa de acesso não autorizado")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  } else {
    // Registrar aviso se CRON_SECRET não estiver configurado (ambiente de desenvolvimento)
    console.warn("Heartbeat: CRON_SECRET não configurado - endpoint desprotegido")
  }

  console.log("Heartbeat: Iniciando verificação de saúde do banco de dados...")

  try {
    // Etapa 2: Executar verificação de heartbeat
    const result = await DatabaseService.executeHeartbeatCheck()

    const totalTime = Date.now() - startTime

    if (result.success) {
      // Etapa 3a: Registrar sucesso no banco de dados
      await DatabaseService.logHeartbeat({
        status: "success",
        responseTimeMs: result.responseTimeMs,
        patientCount: result.patientCount,
      })

      // Etapa 3b: Registrar sucesso no console
      console.log("Heartbeat: SUCESSO", {
        patientCount: result.patientCount,
        responseTimeMs: result.responseTimeMs,
        totalTimeMs: totalTime,
        timestamp: new Date().toISOString(),
      })

      // Etapa 4: Retornar resposta de sucesso
      return NextResponse.json({
        status: "success",
        timestamp: new Date().toISOString(),
        metrics: {
          patientCount: result.patientCount,
          responseTimeMs: result.responseTimeMs,
          totalTimeMs: totalTime,
        },
      })
    } else {
      // Etapa 3a: Registrar falha no banco de dados
      await DatabaseService.logHeartbeat({
        status: "failure",
        responseTimeMs: result.responseTimeMs,
        errorMessage: result.error?.message || "Erro desconhecido",
        errorDetails: {
          code: result.error?.code,
          details: result.error?.details,
          hint: result.error?.hint,
        },
      })

      // Etapa 3b: Registrar falha no console
      console.error("Heartbeat: FALHA", {
        error: result.error,
        responseTimeMs: result.responseTimeMs,
        totalTimeMs: totalTime,
        timestamp: new Date().toISOString(),
      })

      // Etapa 4: Retornar resposta de erro
      return NextResponse.json(
        {
          status: "failure",
          timestamp: new Date().toISOString(),
          error: result.error?.message || "Verificação de heartbeat do banco de dados falhou",
          metrics: {
            responseTimeMs: result.responseTimeMs,
            totalTimeMs: totalTime,
          },
        },
        { status: 500 },
      )
    }
  } catch (error) {
    // Etapa 5: Tratar erros inesperados
    const totalTime = Date.now() - startTime

    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    const errorDetails =
      error instanceof Error
        ? {
            name: error.name,
            stack: error.stack,
          }
        : { raw: String(error) }

    // Tentar registrar no banco de dados (pode falhar se o banco estiver fora do ar)
    try {
      await DatabaseService.logHeartbeat({
        status: "failure",
        responseTimeMs: totalTime,
        errorMessage,
        errorDetails,
      })
    } catch (logError) {
      console.error("Heartbeat: Falha ao registrar erro no banco de dados:", logError)
    }

    // Sempre registrar no console
    console.error("Heartbeat: FALHA CRÍTICA", {
      error,
      totalTimeMs: totalTime,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        status: "failure",
        timestamp: new Date().toISOString(),
        error: errorMessage,
        metrics: {
          totalTimeMs: totalTime,
        },
      },
      { status: 500 },
    )
  }
}
