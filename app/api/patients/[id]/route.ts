import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const patient = await DatabaseService.getPatient(params.id)
    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }
    return NextResponse.json(patient)
  } catch (error) {
    console.error("Erro ao buscar paciente:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const patientData = await request.json()
    const patient = await DatabaseService.updatePatient({
      ...patientData,
      id: params.id,
    })
    return NextResponse.json(patient)
  } catch (error) {
    console.error("Erro ao atualizar paciente:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await DatabaseService.deletePatient(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar paciente:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
