import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Primeiro, buscar informações do arquivo
    const { data: fileData, error: fetchError } = await supabase
      .from("file_attachments")
      .select("file_path")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Erro ao buscar arquivo para deletar:", fetchError)
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 })
    }

    // Deletar do storage
    const { error: storageError } = await supabase.storage.from("medical-files").remove([fileData.file_path])

    if (storageError) {
      console.warn("Aviso: Erro ao deletar do storage:", storageError)
      // Continuar mesmo se falhar no storage
    }

    // Deletar do banco
    const { error: dbError } = await supabase.from("file_attachments").delete().eq("id", id)

    if (dbError) {
      console.error("Erro ao deletar do banco:", dbError)
      return NextResponse.json({ error: `Erro ao deletar: ${dbError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro geral na deleção:", error)
    return NextResponse.json(
      {
        error: `Erro interno do servidor: ${(error as Error).message}`,
      },
      { status: 500 },
    )
  }
}
