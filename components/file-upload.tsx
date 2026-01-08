"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Upload, X, AlertCircle, CheckCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ApiClient } from "@/lib/api-client"
import { formatFileSize, getFileIcon, isValidFileType, isValidFileSize } from "@/lib/file-utils"

interface FileUploadProps {
  appointmentId: string
  onFilesUploaded: (files: { id: string; originalName: string; size: number; type: string }[]) => void
  maxFiles?: number
  maxSizeMB?: number
}

export function FileUpload({ appointmentId, onFilesUploaded, maxFiles = 5, maxSizeMB = 10 }: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (message: string) => {
    console.log(message)
    setDebugInfo((prev) => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      const newErrors: string[] = []

      addDebugInfo(`📁 Selecionados ${files.length} arquivo(s)`)

      // Validar número de arquivos
      if (selectedFiles.length + files.length > maxFiles) {
        newErrors.push(`Máximo de ${maxFiles} arquivos permitidos`)
      }

      // Validar cada arquivo
      const validFiles = files.filter((file) => {
        if (!isValidFileType(file)) {
          newErrors.push(`${file.name}: Tipo de arquivo não permitido (${file.type})`)
          return false
        }
        if (!isValidFileSize(file, maxSizeMB)) {
          newErrors.push(`${file.name}: Arquivo muito grande (${formatFileSize(file.size)}, máx. ${maxSizeMB}MB)`)
          return false
        }
        return true
      })

      addDebugInfo(`✅ ${validFiles.length} arquivo(s) válido(s)`)

      setErrors(newErrors)
      if (validFiles.length > 0) {
        setSelectedFiles((prev) => [...prev, ...validFiles].slice(0, maxFiles))
      }

      // Limpar input
      e.target.value = ""
    },
    [selectedFiles.length, maxFiles, maxSizeMB],
  )

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setErrors([])
    setUploadedFiles([])
    setDebugInfo([])

    addDebugInfo(`🚀 Iniciando upload de ${selectedFiles.length} arquivo(s)`)
    addDebugInfo(`📋 Appointment ID: ${appointmentId}`)

    const successfulUploads: { id: string; originalName: string; size: number; type: string }[] = []

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const fileId = `${file.name}-${i}`

        addDebugInfo(`📤 Processando: ${file.name} (${formatFileSize(file.size)})`)

        // Iniciar progresso
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }))

        // Simular progresso visual
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => ({
            ...prev,
            [fileId]: Math.min((prev[fileId] || 0) + 10, 90),
          }))
        }, 100)

        try {
          const uploadedFile = await ApiClient.uploadFile(file, appointmentId)

          clearInterval(progressInterval)
          setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }))
          setUploadedFiles((prev) => [...prev, file.name])

          successfulUploads.push(uploadedFile)
          addDebugInfo(`✅ Sucesso: ${file.name}`)
        } catch (error) {
          clearInterval(progressInterval)
          const errorMessage = (error as Error).message
          addDebugInfo(`❌ Erro: ${file.name} - ${errorMessage}`)
          setErrors((prev) => [...prev, `${file.name}: ${errorMessage}`])
        }
      }

      if (successfulUploads.length > 0) {
        addDebugInfo(`🎉 Upload concluído: ${successfulUploads.length} arquivo(s)`)
        onFilesUploaded(successfulUploads)

        // Limpar arquivos enviados com sucesso
        setTimeout(() => {
          setSelectedFiles([])
          setUploadProgress({})
          setUploadedFiles([])
          setDebugInfo([])
        }, 3000)
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Debug Info */}
      {debugInfo.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="text-xs space-y-1">
              {debugInfo.map((info, index) => (
                <div key={index} className="font-mono">
                  {info}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Área de upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6">
        <div className="text-center">
          <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
          <div className="flex flex-col sm:flex-row text-xs sm:text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
            >
              <span>Clique para fazer upload</span>
              <input
                id="file-upload"
                type="file"
                multiple
                className="sr-only"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                disabled={uploading}
              />
            </label>
            <p className="sm:pl-1">ou arraste e solte</p>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            PDF, JPG, PNG, DOC, XLS até {maxSizeMB}MB cada (máx. {maxFiles} arquivos)
          </p>
        </div>
      </div>

      {/* Erros */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de arquivos selecionados */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            Arquivos selecionados ({selectedFiles.length}/{maxFiles}):
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => {
              const fileId = `${file.name}-${index}`
              const progress = uploadProgress[fileId] || 0
              const isUploaded = uploadedFiles.includes(file.name)

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded ${
                    isUploaded ? "bg-green-50 border border-green-200" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {isUploaded ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <span className="text-lg">{getFileIcon(file.name)}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isUploaded ? "text-green-900" : "text-gray-900"}`}>
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • {file.type}
                      </p>
                      {uploading && progress > 0 && !isUploaded && (
                        <div className="mt-1">
                          <Progress value={progress} className="h-1" />
                          <p className="text-xs text-gray-500 mt-1">{progress}%</p>
                        </div>
                      )}
                      {isUploaded && <p className="text-xs text-green-600 mt-1">✅ Upload concluído</p>}
                    </div>
                  </div>
                  {!uploading && !isUploaded && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Botão de upload */}
          <div className="flex justify-end">
            <Button
              onClick={uploadFiles}
              disabled={uploading || selectedFiles.length === 0 || uploadedFiles.length === selectedFiles.length}
              className="text-sm"
            >
              {uploading
                ? "Fazendo upload..."
                : `Upload ${selectedFiles.length} arquivo${selectedFiles.length !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
