import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")

    const appointments = await DatabaseService.getAppointments(patientId || undefined)
    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Erro ao buscar atendimentos:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const appointmentData = await request.json()
    const appointment = await DatabaseService.createAppointment(appointmentData)
    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar atendimento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
