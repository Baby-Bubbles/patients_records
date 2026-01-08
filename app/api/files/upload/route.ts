import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function POST(request: NextRequest) {
  console.log("🔄 API Upload: Iniciando processamento...")

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const appointmentId = formData.get("appointmentId") as string

    console.log(`📋 Dados recebidos: file=${file?.name}, appointmentId=${appointmentId}`)

    if (!file || !appointmentId) {
      console.error("❌ Dados obrigatórios ausentes")
      return NextResponse.json({ error: "Arquivo e ID do atendimento são obrigatórios" }, { status: 400 })
    }

    // Validar se o appointmentId é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(appointmentId)) {
      console.error(`❌ ID do atendimento inválido: ${appointmentId}`)
      return NextResponse.json(
        { error: `ID do atendimento inválido. Esperado UUID, recebido: ${appointmentId}` },
        { status: 400 },
      )
    }

    // Verificar se o atendimento existe
    const { data: appointmentExists, error: appointmentError } = await supabase
      .from("appointments")
      .select("id")
      .eq("id", appointmentId)
      .single()

    if (appointmentError || !appointmentExists) {
      console.error(`❌ Atendimento não encontrado: ${appointmentId}`)
      return NextResponse.json({ error: "Atendimento não encontrado" }, { status: 404 })
    }

    console.log(`✅ Atendimento encontrado: ${appointmentId}`)

    // Validar tipo de arquivo
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]

    console.log(`🔍 Validando tipo: ${file.type}`)

    if (!allowedTypes.includes(file.type)) {
      console.error(`❌ Tipo não permitido: ${file.type}`)
      return NextResponse.json({ error: `Tipo de arquivo não permitido: ${file.type}` }, { status: 400 })
    }

    // Validar tamanho (10MB)
    const maxSize = 10 * 1024 * 1024
    console.log(`📏 Validando tamanho: ${file.size} bytes (máx: ${maxSize})`)

    if (file.size > maxSize) {
      console.error(`❌ Arquivo muito grande: ${file.size} bytes`)
      return NextResponse.json(
        { error: `Arquivo muito grande (${Math.round(file.size / 1024 / 1024)}MB). Máximo permitido: 10MB` },
        { status: 400 },
      )
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split(".").pop()
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2)
    const fileName = `${appointmentId}/${timestamp}-${randomId}.${fileExt}`

    console.log(`📁 Nome do arquivo no storage: ${fileName}`)

    // Upload para o Supabase Storage
    console.log("☁️ Fazendo upload para Supabase Storage...")
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("medical-files")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("❌ Erro no upload do Supabase:", uploadError)
      return NextResponse.json({ error: `Erro no upload: ${uploadError.message}` }, { status: 500 })
    }

    console.log("✅ Upload para storage concluído:", uploadData.path)

    // Salvar metadados no banco
    console.log("💾 Salvando metadados no banco...")
    const { data: fileRecord, error: dbError } = await supabase
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

    if (dbError) {
      console.error("❌ Erro ao salvar no banco:", dbError)

      // Tentar deletar o arquivo do storage se falhou no banco
      console.log("🧹 Limpando arquivo do storage devido ao erro no banco...")
      await supabase.storage.from("medical-files").remove([uploadData.path])

      return NextResponse.json({ error: `Erro ao salvar metadados: ${dbError.message}` }, { status: 500 })
    }

    console.log("✅ Metadados salvos no banco:", fileRecord.id)

    // Retornar dados do arquivo
    const result = {
      id: fileRecord.id,
      originalName: fileRecord.original_name,
      size: fileRecord.file_size,
      type: fileRecord.file_type,
    }

    console.log("🎉 Upload completo! Retornando:", result)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("💥 Erro geral no upload:", error)
    return NextResponse.json(
      {
        error: `Erro interno do servidor: ${(error as Error).message}`,
      },
      { status: 500 },
    )
  }
}
