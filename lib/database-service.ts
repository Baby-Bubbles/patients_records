import { supabase, type DatabasePatient } from "./supabase-client"
import type { Patient, Appointment, FileAttachment } from "@/app/page"

export class DatabaseService {
  // Pacientes
  static async getPatients(): Promise<Patient[]> {
    const { data, error } = await supabase.from("patients").select("*").order("name")

    if (error) throw error

    return data.map(this.mapDatabasePatientToPatient)
  }

  static async getPatient(id: string): Promise<Patient | null> {
    const { data, error } = await supabase.from("patients").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") return null // Not found
      throw error
    }

    return this.mapDatabasePatientToPatient(data)
  }

  static async createPatient(patient: Omit<Patient, "id" | "createdAt">): Promise<Patient> {
    const { data, error } = await supabase
      .from("patients")
      .insert({
        name: patient.name,
        cpf: patient.cpf,
        birth_date: patient.birthDate,
        phone: patient.phone,
        email: patient.email || null,
        address: patient.address || null,
      })
      .select()
      .single()

    if (error) throw error

    return this.mapDatabasePatientToPatient(data)
  }

  static async updatePatient(patient: Patient): Promise<Patient> {
    const { data, error } = await supabase
      .from("patients")
      .update({
        name: patient.name,
        cpf: patient.cpf,
        birth_date: patient.birthDate,
        phone: patient.phone,
        email: patient.email || null,
        address: patient.address || null,
      })
      .eq("id", patient.id)
      .select()
      .single()

    if (error) throw error

    return this.mapDatabasePatientToPatient(data)
  }

  static async deletePatient(id: string): Promise<void> {
    const { error } = await supabase.from("patients").delete().eq("id", id)

    if (error) throw error
  }

  // Atendimentos
  static async getAppointments(patientId?: string): Promise<Appointment[]> {
    let query = supabase
      .from("appointments")
      .select(`
        *,
        file_attachments (
          id,
          original_name,
          file_path,
          file_size,
          file_type,
          uploaded_at
        )
      `)
      .order("date", { ascending: false })

    if (patientId) {
      query = query.eq("patient_id", patientId)
    }

    const { data, error } = await query

    if (error) throw error

    return data.map(this.mapDatabaseAppointmentToAppointment)
  }

  static async getAppointment(id: string): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        file_attachments (
          id,
          original_name,
          file_path,
          file_size,
          file_type,
          uploaded_at
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }

    return this.mapDatabaseAppointmentToAppointment(data)
  }

  static async createAppointment(appointment: Omit<Appointment, "id" | "createdAt">): Promise<Appointment> {
    console.log("🏥 Criando atendimento no banco...")

    // Criar o atendimento (sem arquivos)
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        patient_id: appointment.patientId,
        date: appointment.date,
        doctor: appointment.doctor,
        diagnosis: appointment.diagnosis || null,
        anamnesis: appointment.anamnesis || null,
        heart_rate: appointment.heartRate || null,
        respiratory_rate: appointment.respiratoryRate || null,
        saturation: appointment.saturation || null,
        temperature: appointment.temperature || null,
        cardiac_auscultation: appointment.cardiacAuscultation || null,
        evolution: appointment.evolution || null,
        medications: appointment.medications || null,
        additional_guidance: appointment.additionalGuidance || null,
      })
      .select()
      .single()

    if (error) throw error

    console.log("✅ Atendimento criado com ID:", data.id)

    // Retornar o atendimento criado
    return (await this.getAppointment(data.id)) as Appointment
  }

  static async updateAppointment(appointment: Appointment): Promise<Appointment> {
    const { data, error } = await supabase
      .from("appointments")
      .update({
        date: appointment.date,
        doctor: appointment.doctor,
        diagnosis: appointment.diagnosis || null,
        anamnesis: appointment.anamnesis || null,
        heart_rate: appointment.heartRate || null,
        respiratory_rate: appointment.respiratoryRate || null,
        saturation: appointment.saturation || null,
        temperature: appointment.temperature || null,
        cardiac_auscultation: appointment.cardiacAuscultation || null,
        evolution: appointment.evolution || null,
        medications: appointment.medications || null,
        additional_guidance: appointment.additionalGuidance || null,
      })
      .eq("id", appointment.id)
      .select()
      .single()

    if (error) throw error

    return (await this.getAppointment(data.id)) as Appointment
  }

  static async deleteAppointment(id: string): Promise<void> {
    const { error } = await supabase.from("appointments").delete().eq("id", id)

    if (error) throw error
  }

  // Anexos de arquivos
  static async createFileAttachments(appointmentId: string, attachments: FileAttachment[]): Promise<void> {
    const fileData = attachments.map((attachment) => ({
      appointment_id: appointmentId,
      original_name: attachment.originalName,
      file_path: attachment.id, // Usando o ID como path temporário
      file_size: attachment.size,
      file_type: attachment.type,
    }))

    const { error } = await supabase.from("file_attachments").insert(fileData)

    if (error) throw error
  }

  static async deleteFileAttachment(id: string): Promise<void> {
    // Primeiro, obter informações do arquivo para deletar do storage
    const { data: fileData, error: fetchError } = await supabase
      .from("file_attachments")
      .select("file_path")
      .eq("id", id)
      .single()

    if (fetchError) throw fetchError

    // Deletar do storage
    const { error: storageError } = await supabase.storage.from("medical-files").remove([fileData.file_path])

    if (storageError) console.warn("Erro ao deletar arquivo do storage:", storageError)

    // Deletar do banco
    const { error } = await supabase.from("file_attachments").delete().eq("id", id)

    if (error) throw error
  }

  // Upload de arquivo
  static async uploadFile(file: File, appointmentId: string): Promise<FileAttachment> {
    const fileExt = file.name.split(".").pop()
    const fileName = `${appointmentId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // Upload para o storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from("medical-files").upload(fileName, file)

    if (uploadError) throw uploadError

    // Salvar metadados no banco
    const { data, error } = await supabase
      .from("file_attachments")
      .insert({
        appointment_id: appointmentId,
        original_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.type,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      originalName: data.original_name,
      size: data.file_size,
      type: data.file_type,
    }
  }

  // Download de arquivo
  static async getFileDownloadUrl(filePath: string): Promise<string> {
    const { data, error } = await supabase.storage.from("medical-files").createSignedUrl(filePath, 3600) // 1 hora

    if (error) throw error

    return data.signedUrl
  }

  // Mappers
  private static mapDatabasePatientToPatient(dbPatient: DatabasePatient): Patient {
    return {
      id: dbPatient.id,
      name: dbPatient.name,
      cpf: dbPatient.cpf,
      birthDate: dbPatient.birth_date,
      phone: dbPatient.phone,
      email: dbPatient.email || "",
      address: dbPatient.address || "",
      createdAt: dbPatient.created_at,
    }
  }

  private static mapDatabaseAppointmentToAppointment(dbAppointment: any): Appointment {
    return {
      id: dbAppointment.id,
      patientId: dbAppointment.patient_id,
      date: dbAppointment.date,
      doctor: dbAppointment.doctor,
      diagnosis: dbAppointment.diagnosis || "",
      anamnesis: dbAppointment.anamnesis || "",
      heartRate: dbAppointment.heart_rate,
      respiratoryRate: dbAppointment.respiratory_rate,
      saturation: dbAppointment.saturation,
      temperature: dbAppointment.temperature,
      cardiacAuscultation: dbAppointment.cardiac_auscultation || "",
      evolution: dbAppointment.evolution || "",
      medications: dbAppointment.medications || "",
      additionalGuidance: dbAppointment.additional_guidance || "",
      attachments:
        dbAppointment.file_attachments?.map((file: any) => ({
          id: file.id,
          originalName: file.original_name,
          size: file.file_size,
          type: file.file_type,
        })) || [],
      createdAt: dbAppointment.created_at,
    }
  }
}
