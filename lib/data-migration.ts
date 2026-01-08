// Utilitário para migrar dados do localStorage para o banco
import { ApiClient } from "./api-client"
import type { Patient, Appointment } from "@/app/page"

export class DataMigration {
  static async migrateFromLocalStorage(): Promise<{
    success: boolean
    migratedPatients: number
    migratedAppointments: number
    errors: string[]
  }> {
    const errors: string[] = []
    let migratedPatients = 0
    let migratedAppointments = 0

    try {
      // Verificar se há dados no localStorage
      const localPatients = localStorage.getItem("patients")
      const localAppointments = localStorage.getItem("appointments")

      if (!localPatients && !localAppointments) {
        return {
          success: true,
          migratedPatients: 0,
          migratedAppointments: 0,
          errors: ["Nenhum dado encontrado no localStorage"],
        }
      }

      // Migrar pacientes
      if (localPatients) {
        const patients: Patient[] = JSON.parse(localPatients)

        for (const patient of patients) {
          try {
            await ApiClient.createPatient({
              name: patient.name,
              cpf: patient.cpf,
              birthDate: patient.birthDate,
              phone: patient.phone,
              email: patient.email,
              address: patient.address,
            })
            migratedPatients++
          } catch (error) {
            errors.push(`Erro ao migrar paciente ${patient.name}: ${(error as Error).message}`)
          }
        }
      }

      // Migrar atendimentos
      if (localAppointments) {
        const appointments: Appointment[] = JSON.parse(localAppointments)

        // Buscar pacientes migrados para mapear IDs
        const migratedPatientsData = await ApiClient.getPatients()
        const patientIdMap = new Map<string, string>()

        // Criar mapa de IDs antigos para novos
        if (localPatients) {
          const oldPatients: Patient[] = JSON.parse(localPatients)
          oldPatients.forEach((oldPatient, index) => {
            if (migratedPatientsData[index]) {
              patientIdMap.set(oldPatient.id, migratedPatientsData[index].id)
            }
          })
        }

        for (const appointment of appointments) {
          try {
            const newPatientId = patientIdMap.get(appointment.patientId)
            if (!newPatientId) {
              errors.push(`Paciente não encontrado para atendimento ${appointment.id}`)
              continue
            }

            await ApiClient.createAppointment({
              patientId: newPatientId,
              date: appointment.date,
              doctor: appointment.doctor,
              diagnosis: appointment.diagnosis,
              anamnesis: appointment.anamnesis,
              heartRate: appointment.heartRate,
              respiratoryRate: appointment.respiratoryRate,
              saturation: appointment.saturation,
              temperature: appointment.temperature,
              cardiacAuscultation: appointment.cardiacAuscultation,
              evolution: appointment.evolution,
              medications: appointment.medications,
              additionalGuidance: appointment.additionalGuidance,
              // Nota: arquivos do localStorage não podem ser migrados automaticamente
              attachments: [],
            })
            migratedAppointments++
          } catch (error) {
            errors.push(`Erro ao migrar atendimento: ${(error as Error).message}`)
          }
        }
      }

      return {
        success: errors.length === 0,
        migratedPatients,
        migratedAppointments,
        errors,
      }
    } catch (error) {
      return {
        success: false,
        migratedPatients,
        migratedAppointments,
        errors: [`Erro geral na migração: ${(error as Error).message}`],
      }
    }
  }

  static async clearLocalStorage(): Promise<void> {
    localStorage.removeItem("patients")
    localStorage.removeItem("appointments")
    // Limpar outros dados relacionados se existirem
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("files_")) {
        localStorage.removeItem(key)
      }
    })
  }
}
