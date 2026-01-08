import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_db2_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_db2_SUPABASE_PUBLISHABLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Função para fazer upload de arquivo
export async function uploadFile(file: File, patientId: string, appointmentId: string) {
  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `appointments/${patientId}/${appointmentId}/${fileName}`

  const { data, error } = await supabase.storage.from("medical-files").upload(filePath, file)

  if (error) {
    throw error
  }

  return {
    path: data.path,
    originalName: file.name,
    size: file.size,
    type: file.type,
  }
}

// Função para obter URL de download
export async function getFileDownloadUrl(filePath: string) {
  const { data } = await supabase.storage.from("medical-files").createSignedUrl(filePath, 3600) // URL válida por 1 hora

  return data?.signedUrl
}

// Função para deletar arquivo
export async function deleteFile(filePath: string) {
  const { error } = await supabase.storage.from("medical-files").remove([filePath])

  if (error) {
    throw error
  }
}

// Função para listar arquivos de um atendimento
export async function listAppointmentFiles(patientId: string, appointmentId: string) {
  const { data, error } = await supabase.storage
    .from("medical-files")
    .list(`appointments/${patientId}/${appointmentId}`)

  if (error) {
    throw error
  }

  return data
}
