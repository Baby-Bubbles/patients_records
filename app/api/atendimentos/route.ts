import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const diagnosticoId = searchParams.get("diagnosticoId")

    const atendimentos = await DatabaseService.getAtendimentos(diagnosticoId || undefined)
    return NextResponse.json(atendimentos)
  } catch (error) {
    console.error("Erro ao buscar atendimentos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const atendimentoData = await request.json()
    const atendimento = await DatabaseService.createAtendimento(atendimentoData)
    return NextResponse.json(atendimento, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar atendimento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
