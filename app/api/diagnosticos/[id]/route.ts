import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const diagnostico = await DatabaseService.getDiagnostico(id)
    if (!diagnostico) {
      return NextResponse.json({ error: "Diagnóstico não encontrado" }, { status: 404 })
    }
    return NextResponse.json(diagnostico)
  } catch (error) {
    console.error("Erro ao buscar diagnóstico:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const diagnosticoData = await request.json()
    const diagnostico = await DatabaseService.updateDiagnostico({
      ...diagnosticoData,
      id,
    })
    return NextResponse.json(diagnostico)
  } catch (error) {
    console.error("Erro ao atualizar diagnóstico:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await DatabaseService.deleteDiagnostico(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar diagnóstico:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
