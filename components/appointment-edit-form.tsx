"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { X, Upload, FileText, Download } from "lucide-react"
import type { Appointment } from "@/app/page"
import { formatDateTimeForInput } from "@/lib/date-utils"

interface AppointmentEditFormProps {
  appointment: Appointment
  patientName: string
  onSubmit: (appointment: Appointment) => void
  onCancel: () => void
}

export function AppointmentEditForm({ appointment, patientName, onSubmit, onCancel }: AppointmentEditFormProps) {
  const [formData, setFormData] = useState({
    date: formatDateTimeForInput(appointment.date),
    doctor: appointment.doctor,
    diagnosis: appointment.diagnosis,
    anamnesis: appointment.anamnesis,
    heartRate: appointment.heartRate?.toString() || "",
    respiratoryRate: appointment.respiratoryRate?.toString() || "",
    saturation: appointment.saturation?.toString() || "",
    temperature: appointment.temperature?.toString() || "",
    cardiacAuscultation: appointment.cardiacAuscultation || "",
    evolution: appointment.evolution,
    medications: appointment.medications,
    additionalGuidance: appointment.additionalGuidance,
  })

  const [attachments, setAttachments] = useState<File[]>([])
  const [existingAttachments, setExistingAttachments] = useState<string[]>(appointment.attachments || [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const appointmentData = {
      ...appointment,
      ...formData,
      heartRate: formData.heartRate ? Number(formData.heartRate) : undefined,
      respiratoryRate: formData.respiratoryRate ? Number(formData.respiratoryRate) : undefined,
      saturation: formData.saturation ? Number(formData.saturation) : undefined,
      temperature: formData.temperature ? Number(formData.temperature) : undefined,
      attachments: [...existingAttachments, ...attachments.map((file) => file.name)],
    }

    onSubmit(appointmentData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files))
    }
  }

  const downloadFile = (filename: string) => {
    // Simular download - em produção, seria um endpoint real
    const link = document.createElement("a")
    link.href = `/placeholder.pdf` // Placeholder para demonstração
    link.download = filename
    link.click()
  }

  const removeExistingAttachment = (filename: string) => {
    setExistingAttachments(existingAttachments.filter((f) => f !== filename))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Editar Atendimento</CardTitle>
            <CardDescription>Alterar atendimento de {patientName}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
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
                  <Label htmlFor="date">Data e Hora *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor">Pediatra/Médico *</Label>
                  <Input
                    id="doctor"
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleChange}
                    required
                    placeholder="Nome do pediatra/médico"
                  />
                </div>
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
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Sinais Vitais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sinais Vitais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heartRate">Frequência Cardíaca (FC)</Label>
                  <div className="relative">
                    <Input
                      id="heartRate"
                      name="heartRate"
                      type="number"
                      value={formData.heartRate}
                      onChange={handleChange}
                      placeholder="bpm"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                      bpm
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="respiratoryRate">Frequência Respiratória (FR)</Label>
                  <div className="relative">
                    <Input
                      id="respiratoryRate"
                      name="respiratoryRate"
                      type="number"
                      value={formData.respiratoryRate}
                      onChange={handleChange}
                      placeholder="rpm"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                      rpm
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saturation">Saturação</Label>
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
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperatura</Label>
                  <div className="relative">
                    <Input
                      id="temperature"
                      name="temperature"
                      type="number"
                      step="0.1"
                      value={formData.temperature}
                      onChange={handleChange}
                      placeholder="36.5"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                      °C
                    </span>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medications">Medicamentos e Uso</Label>
                  <Textarea
                    id="medications"
                    name="medications"
                    value={formData.medications}
                    onChange={handleChange}
                    placeholder="Medicamentos prescritos, dosagem, frequência, duração do tratamento..."
                    rows={3}
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
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Anexos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Anexos</h3>

              {/* Anexos Existentes */}
              {existingAttachments.length > 0 && (
                <div className="space-y-2">
                  <Label>Arquivos Existentes</Label>
                  <div className="space-y-2">
                    {existingAttachments.map((filename, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText className="h-4 w-4 mr-2" />
                          {filename}
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => downloadFile(filename)}>
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => removeExistingAttachment(filename)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Novos Anexos */}
              <div className="space-y-2">
                <Label htmlFor="attachments">Adicionar Novos Arquivos</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="attachments"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                      >
                        <span>Clique para fazer upload</span>
                        <input
                          id="attachments"
                          name="attachments"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                      </label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG, DOC até 10MB cada</p>
                  </div>
                  {attachments.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Novos arquivos:</h4>
                      <div className="space-y-1">
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <FileText className="h-4 w-4 mr-2" />
                            {file.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
