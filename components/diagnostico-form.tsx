"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import type { Diagnostico } from "@/app/page"
import { formatFileSize, getFileIcon } from "@/lib/file-utils"
import { ApiClient } from "@/lib/api-client"

interface DiagnosticoFormProps {
  patientId: string
  patientName: string
  onSubmit: (diagnostico: Omit<Diagnostico, "id" | "createdAt">) => Promise<Diagnostico>
  onCancel: () => void
}

export function DiagnosticoForm({ patientId, patientName, onSubmit, onCancel }: DiagnosticoFormProps) {
  const [formData, setFormData] = useState({
    startDate: "",
    dischargeDate: "",
    doctor: "",
    anamnesis: "",
    diagnosis: "",
    heartRate: "",
    respiratoryRate: "",
    saturation: "",
    temperature: "",
    cardiacAuscultation: "",
    evolution: "",
    medications: "",
    additionalGuidance: "",
  })

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [uploadErrors, setUploadErrors] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setUploadErrors([])

    try {
      const diagnosticoData = {
        patientId,
        startDate: formData.startDate,
        dischargeDate: formData.dischargeDate || undefined,
        doctor: formData.doctor || undefined,
        anamnesis: formData.anamnesis || undefined,
        diagnosis: formData.diagnosis || undefined,
        heartRate: formData.heartRate ? Number(formData.heartRate) : undefined,
        respiratoryRate: formData.respiratoryRate ? Number(formData.respiratoryRate) : undefined,
        saturation: formData.saturation ? Number(formData.saturation) : undefined,
        temperature: formData.temperature ? Number(formData.temperature) : undefined,
        cardiacAuscultation: formData.cardiacAuscultation || undefined,
        evolution: formData.evolution || undefined,
        medications: formData.medications || undefined,
        additionalGuidance: formData.additionalGuidance || undefined,
      }

      const createdDiagnostico = await onSubmit(diagnosticoData)

      // Upload files if any
      if (selectedFiles.length > 0) {
        await uploadFiles(createdDiagnostico.id)
      }

      onCancel()
    } catch (error) {
      console.error("Erro ao criar diagnóstico:", error)
      alert(`Erro ao criar diagnóstico: ${(error as Error).message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const uploadFiles = async (diagnosticoId: string) => {
    const errors: string[] = []

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      const fileKey = `${file.name}-${i}`

      try {
        setUploadProgress((prev) => ({ ...prev, [fileKey]: 0 }))

        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => ({
            ...prev,
            [fileKey]: Math.min((prev[fileKey] || 0) + 10, 90),
          }))
        }, 100)

        await ApiClient.uploadFilePolymorphic(file, "diagnostico", diagnosticoId)

        clearInterval(progressInterval)
        setUploadProgress((prev) => ({ ...prev, [fileKey]: 100 }))
        setUploadedFiles((prev) => [...prev, file.name])
      } catch (error) {
        errors.push(`${file.name}: ${(error as Error).message}`)
      }
    }

    if (errors.length > 0) {
      setUploadErrors(errors)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const maxFiles = 5
    const maxSizeMB = 10

    const validFiles = files.filter((file) => {
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

      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name}: Tipo de arquivo não permitido (${file.type})`)
        return false
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`${file.name}: Arquivo muito grande (máx. ${maxSizeMB}MB)`)
        return false
      }

      return true
    })

    if (selectedFiles.length + validFiles.length > maxFiles) {
      alert(`Máximo de ${maxFiles} arquivos permitidos`)
      return
    }

    setSelectedFiles((prev) => [...prev, ...validFiles])
    e.target.value = ""
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Novo Diagnóstico</CardTitle>
            <CardDescription>Registrar diagnóstico para {patientName}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} disabled={submitting}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Início *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dischargeDate">Data de Alta</Label>
                  <Input
                    id="dischargeDate"
                    name="dischargeDate"
                    type="datetime-local"
                    value={formData.dischargeDate}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor">Pediatra/Médico</Label>
                <Input
                  id="doctor"
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleChange}
                  placeholder="Nome do pediatra/médico"
                  disabled={submitting}
                />
              </div>
            </div>

            <Separator />

            {/* Anamnese e Diagnóstico */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Anamnese e Diagnóstico</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="anamnesis">Anamnese</Label>
                  <Textarea
                    id="anamnesis"
                    name="anamnesis"
                    value={formData.anamnesis}
                    onChange={handleChange}
                    placeholder="História clínica, sintomas relatados, queixas principais..."
                    rows={4}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnóstico</Label>
                  <Textarea
                    id="diagnosis"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    placeholder="Diagnóstico médico, hipóteses diagnósticas..."
                    rows={3}
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Sinais Vitais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sinais Vitais (Iniciais)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heartRate" className="text-xs sm:text-sm">FC</Label>
                  <div className="relative">
                    <Input
                      id="heartRate"
                      name="heartRate"
                      type="number"
                      value={formData.heartRate}
                      onChange={handleChange}
                      placeholder="bpm"
                      className="text-sm pr-12"
                      disabled={submitting}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">bpm</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="respiratoryRate" className="text-xs sm:text-sm">FR</Label>
                  <div className="relative">
                    <Input
                      id="respiratoryRate"
                      name="respiratoryRate"
                      type="number"
                      value={formData.respiratoryRate}
                      onChange={handleChange}
                      placeholder="rpm"
                      className="text-sm pr-12"
                      disabled={submitting}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">rpm</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saturation" className="text-xs sm:text-sm">Saturação</Label>
                  <div className="relative">
                    <Input
                      id="saturation"
                      name="saturation"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.saturation}
                      onChange={handleChange}
                      placeholder="95"
                      className="text-sm pr-8"
                      disabled={submitting}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature" className="text-xs sm:text-sm">Temperatura</Label>
                  <div className="relative">
                    <Input
                      id="temperature"
                      name="temperature"
                      type="number"
                      step="0.1"
                      value={formData.temperature}
                      onChange={handleChange}
                      placeholder="36.5"
                      className="text-sm pr-10"
                      disabled={submitting}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">°C</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardiacAuscultation">Ausculta Cardíaca</Label>
                <Textarea
                  id="cardiacAuscultation"
                  name="cardiacAuscultation"
                  value={formData.cardiacAuscultation}
                  onChange={handleChange}
                  placeholder="Descrição da ausculta cardíaca..."
                  rows={2}
                  disabled={submitting}
                />
              </div>
            </div>

            <Separator />

            {/* Evolução e Condutas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Evolução e Condutas</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="evolution">Evolução/Condutas</Label>
                  <Textarea
                    id="evolution"
                    name="evolution"
                    value={formData.evolution}
                    onChange={handleChange}
                    placeholder="Evolução do quadro, condutas tomadas, procedimentos realizados..."
                    rows={4}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medications">Medicamentos em Uso</Label>
                  <Textarea
                    id="medications"
                    name="medications"
                    value={formData.medications}
                    onChange={handleChange}
                    placeholder="Medicamentos prescritos, dosagem, frequência, duração do tratamento..."
                    rows={3}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additionalGuidance">Orientações Adicionais</Label>
                  <Textarea
                    id="additionalGuidance"
                    name="additionalGuidance"
                    value={formData.additionalGuidance}
                    onChange={handleChange}
                    placeholder="Orientações gerais, cuidados especiais, retorno..."
                    rows={3}
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Anexos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Anexos</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6">
                <div className="text-center">
                  <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
                  <div className="flex flex-col sm:flex-row text-xs sm:text-sm text-gray-600">
                    <label
                      htmlFor="file-upload-diag"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80"
                    >
                      <span>Clique para selecionar arquivos</span>
                      <input
                        id="file-upload-diag"
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={handleFileSelect}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                        disabled={submitting}
                      />
                    </label>
                    <p className="sm:pl-1">ou arraste e solte</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG, DOC, XLS até 10MB cada (máx. 5 arquivos)</p>
                </div>
              </div>

              {uploadErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Alguns arquivos não puderam ser enviados:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {uploadErrors.map((error, index) => (
                          <li key={index} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    Arquivos selecionados ({selectedFiles.length}/5):
                  </h4>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => {
                      const fileKey = `${file.name}-${index}`
                      const progress = uploadProgress[fileKey] || 0
                      const isUploaded = uploadedFiles.includes(file.name)
                      const isUploading = submitting && progress > 0 && progress < 100

                      return (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-3 rounded border ${
                            isUploaded
                              ? "bg-green-50 border-green-200"
                              : isUploading
                                ? "bg-primary/10 border-primary/30"
                                : "bg-gray-50 border-gray-200"
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
                              {isUploading && (
                                <div className="mt-1">
                                  <Progress value={progress} className="h-1" />
                                  <p className="text-xs text-primary mt-1">Enviando... {progress}%</p>
                                </div>
                              )}
                            </div>
                          </div>
                          {!submitting && !isUploaded && (
                            <Button
                              type="button"
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
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-6">
              <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Criando..." : "Criar Diagnóstico"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
