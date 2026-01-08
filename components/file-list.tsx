"use client"

import { useState } from "react"
import { Download, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ApiClient } from "@/lib/api-client"
import { formatFileSize, getFileIcon } from "@/lib/file-utils"
import type { FileAttachment } from "@/app/page"

interface FileListProps {
  files: FileAttachment[]
  onFileDeleted?: (fileId: string) => void
  showDeleteButton?: boolean
  patientId?: string
  appointmentId?: string
}

export function FileList({ files, onFileDeleted, showDeleteButton = false, patientId, appointmentId }: FileListProps) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async (file: FileAttachment) => {
    setDownloading(file.id)
    setError(null)

    try {
      const { downloadUrl, fileName } = await ApiClient.getFileDownloadUrl(file.id)

      // Criar link temporário para download
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = fileName || file.originalName
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      setError(`Erro ao baixar ${file.originalName}: ${(error as Error).message}`)
    } finally {
      setDownloading(null)
    }
  }

  const handleDelete = async (file: FileAttachment) => {
    if (!confirm(`Tem certeza que deseja excluir ${file.originalName}?`)) {
      return
    }

    setDeleting(file.id)
    setError(null)

    try {
      await ApiClient.deleteFile(file.id)
      onFileDeleted?.(file.id)
    } catch (error) {
      setError(`Erro ao excluir ${file.originalName}: ${(error as Error).message}`)
    } finally {
      setDeleting(null)
    }
  }

  const handlePreview = async (file: FileAttachment) => {
    // Para imagens, abrir preview; para outros, fazer download
    if (file.type && file.type.startsWith("image/")) {
      try {
        const { downloadUrl } = await ApiClient.getFileDownloadUrl(file.id)
        window.open(downloadUrl, "_blank")
      } catch (error) {
        setError(`Erro ao visualizar ${file.originalName}: ${(error as Error).message}`)
      }
    } else {
      handleDownload(file)
    }
  }

  // Verificar se files é um array válido
  if (!Array.isArray(files) || files.length === 0) {
    return <div className="text-center py-4 text-gray-500 text-sm">Nenhum arquivo anexado</div>
  }

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        {files.map((file, index) => {
          // Verificar se file é um objeto válido
          if (!file || typeof file !== "object") {
            console.warn("Invalid file object at index", index, file)
            return null
          }

          // Garantir que temos as propriedades necessárias
          const fileId = file.id || `file-${index}`
          const fileName = file.originalName || `Arquivo ${index + 1}`
          const fileSize = file.size || 0

          return (
            <div key={fileId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="text-lg">{getFileIcon(fileName)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(fileSize)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {/* Botão de visualizar/preview */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePreview(file)}
                  disabled={downloading === fileId}
                  className="text-blue-600 hover:text-blue-800"
                  title="Visualizar"
                >
                  <Eye className="h-4 w-4" />
                </Button>

                {/* Botão de download */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(file)}
                  disabled={downloading === fileId}
                  className="text-green-600 hover:text-green-800"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>

                {/* Botão de excluir */}
                {showDeleteButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file)}
                    disabled={deleting === fileId}
                    className="text-red-600 hover:text-red-800"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
