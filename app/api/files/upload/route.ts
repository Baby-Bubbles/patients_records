import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function POST(request: NextRequest) {
  console.log("🔄 API Upload: Iniciando processamento...")

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    // Support polymorphic uploads
    const entityType = formData.get("entityType") as string || "appointment"
    const entityId = formData.get("entityId") as string
    const appointmentId = formData.get("appointmentId") as string

    // Use entityId if provided, otherwise fall back to appointmentId
    const targetId = entityId || appointmentId
    const targetType = entityId ? entityType : "appointment"

    console.log(`📋 Dados recebidos: file=${file?.name}, entityType=${targetType}, entityId=${targetId}`)

    if (!file || !targetId) {
      console.error("❌ Dados obrigatórios ausentes")
      return NextResponse.json({ error: "Arquivo e ID da entidade são obrigatórios" }, { status: 400 })
    }

    // Validar se o targetId é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(targetId)) {
      console.error(`❌ ID inválido: ${targetId}`)
      return NextResponse.json(
        { error: `ID inválido. Esperado UUID, recebido: ${targetId}` },
        { status: 400 },
      )
    }

    // Verificar se a entidade existe
    let tableName: string
    let columnName: string

    switch (targetType) {
      case "diagnostico":
        tableName = "diagnosticos"
        columnName = "diagnostico_id"
        break
      case "atendimento":
        tableName = "atendimentos"
        columnName = "atendimento_id"
        break
      case "appointment":
      default:
        tableName = "appointments"
        columnName = "appointment_id"
        break
    }

    const { data: entityExists, error: entityError } = await supabase
      .from(tableName)
      .select("id")
      .eq("id", targetId)
      .single()

    if (entityError || !entityExists) {
      console.error(`❌ Entidade não encontrada: ${targetType} ${targetId}`)
      return NextResponse.json({ error: `${targetType} não encontrado` }, { status: 404 })
    }

    console.log(`✅ Entidade encontrada: ${targetType} ${targetId}`)

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

    console.log(`📏 Tamanho do arquivo: ${file.size} bytes`)

    // Gerar nome único para o arquivo
    const fileExt = file.name.split(".").pop()
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2)
    const fileName = `${targetType}/${targetId}/${timestamp}-${randomId}.${fileExt}`

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

    // Build insert data based on entity type
    const insertData: Record<string, unknown> = {
      original_name: file.name,
      file_path: uploadData.path,
      file_size: file.size,
      file_type: file.type,
      entity_type: targetType,
    }

    // Set the appropriate foreign key based on entity type
    if (targetType === "diagnostico") {
      insertData.diagnostico_id = targetId
    } else if (targetType === "atendimento") {
      insertData.atendimento_id = targetId
    } else {
      insertData.appointment_id = targetId
    }

    const { data: fileRecord, error: dbError } = await supabase
      .from("file_attachments")
      .insert(insertData)
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
