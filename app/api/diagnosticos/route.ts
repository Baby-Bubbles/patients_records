import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")

    const diagnosticos = await DatabaseService.getDiagnosticos(patientId || undefined)
    return NextResponse.json(diagnosticos)
  } catch (error) {
    console.error("Erro ao buscar diagnósticos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const diagnosticoData = await request.json()
    const diagnostico = await DatabaseService.createDiagnostico(diagnosticoData)
    return NextResponse.json(diagnostico, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar diagnóstico:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
