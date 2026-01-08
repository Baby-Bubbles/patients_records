import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_db2_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_db2_SUPABASE_PUBLISHABLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface DatabasePatient {
  id: string
  name: string
  cpf: string
  birth_date: string
  phone: string
  email?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface DatabaseAppointment {
  id: string
  patient_id: string
  date: string
  doctor: string
  diagnosis?: string
  anamnesis?: string
  heart_rate?: number
  respiratory_rate?: number
  saturation?: number
  temperature?: number
  cardiac_auscultation?: string
  evolution?: string
  medications?: string
  additional_guidance?: string
  created_at: string
  updated_at: string
}

export interface DatabaseFileAttachment {
  id: string
  appointment_id: string
  original_name: string
  file_path: string
  file_size: number
  file_type: string
  uploaded_at: string
}

// Função para testar conexão
export async function testConnection() {
  try {
    const { data, error } = await supabase.from("patients").select("count").single()
    if (error) throw error
    return true
  } catch (error) {
    console.error("Erro de conexão com Supabase:", error)
    return false
  }
}
