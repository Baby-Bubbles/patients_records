import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const atendimento = await DatabaseService.getAtendimento(id)
    if (!atendimento) {
      return NextResponse.json({ error: "Atendimento não encontrado" }, { status: 404 })
    }
    return NextResponse.json(atendimento)
  } catch (error) {
    console.error("Erro ao buscar atendimento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const atendimentoData = await request.json()
    const atendimento = await DatabaseService.updateAtendimento({
      ...atendimentoData,
      id,
    })
    return NextResponse.json(atendimento)
  } catch (error) {
    console.error("Erro ao atualizar atendimento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await DatabaseService.deleteAtendimento(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar atendimento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
