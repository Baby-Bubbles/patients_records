import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const appointment = await DatabaseService.getAppointment(params.id)
    if (!appointment) {
      return NextResponse.json({ error: "Atendimento não encontrado" }, { status: 404 })
    }
    return NextResponse.json(appointment)
  } catch (error) {
    console.error("Erro ao buscar atendimento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const appointmentData = await request.json()
    const appointment = await DatabaseService.updateAppointment({
      ...appointmentData,
      id: params.id,
    })
    return NextResponse.json(appointment)
  } catch (error) {
    console.error("Erro ao atualizar atendimento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await DatabaseService.deleteAppointment(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar atendimento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
