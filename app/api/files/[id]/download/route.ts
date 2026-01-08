import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Buscar informações do arquivo
    const { data: fileData, error: fetchError } = await supabase
      .from("file_attachments")
      .select("file_path, original_name")
      .eq("id", params.id)
      .single()

    if (fetchError) {
      console.error("Erro ao buscar arquivo:", fetchError)
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 })
    }

    if (!fileData) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 })
    }

    // Gerar URL de download assinada (válida por 1 hora)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from("medical-files")
      .createSignedUrl(fileData.file_path, 3600)

    if (urlError) {
      console.error("Erro ao gerar URL:", urlError)
      return NextResponse.json({ error: `Erro ao gerar URL: ${urlError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      downloadUrl: signedUrlData.signedUrl,
      fileName: fileData.original_name,
    })
  } catch (error) {
    console.error("Erro geral no download:", error)
    return NextResponse.json(
      {
        error: `Erro interno do servidor: ${(error as Error).message}`,
      },
      { status: 500 },
    )
  }
}
