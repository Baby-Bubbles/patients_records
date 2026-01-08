import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"

export async function GET() {
  try {
    const patients = await DatabaseService.getPatients()
    return NextResponse.json(patients)
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const patientData = await request.json()
    const patient = await DatabaseService.createPatient(patientData)
    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar paciente:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
