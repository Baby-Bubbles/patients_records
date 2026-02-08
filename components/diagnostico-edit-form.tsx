"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { X } from "lucide-react"
import type { Diagnostico } from "@/app/page"
import { formatDateTimeForInput } from "@/lib/date-utils"

interface DiagnosticoEditFormProps {
  diagnostico: Diagnostico
  patientName: string
  onSubmit: (diagnostico: Diagnostico) => Promise<Diagnostico>
  onCancel: () => void
}

export function DiagnosticoEditForm({ diagnostico, patientName, onSubmit, onCancel }: DiagnosticoEditFormProps) {
  const [formData, setFormData] = useState({
    startDate: formatDateTimeForInput(diagnostico.startDate),
    dischargeDate: diagnostico.dischargeDate ? formatDateTimeForInput(diagnostico.dischargeDate) : "",
    doctor: diagnostico.doctor || "",
    anamnesis: diagnostico.anamnesis || "",
    diagnosis: diagnostico.diagnosis || "",
    heartRate: diagnostico.heartRate?.toString() || "",
    respiratoryRate: diagnostico.respiratoryRate?.toString() || "",
    saturation: diagnostico.saturation?.toString() || "",
    temperature: diagnostico.temperature?.toString() || "",
    cardiacAuscultation: diagnostico.cardiacAuscultation || "",
    evolution: diagnostico.evolution || "",
    medications: diagnostico.medications || "",
    additionalGuidance: diagnostico.additionalGuidance || "",
  })

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const diagnosticoData = {
        ...diagnostico,
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

      await onSubmit(diagnosticoData)
      onCancel()
    } catch (error) {
      console.error("Erro ao atualizar diagnóstico:", error)
      alert(`Erro ao atualizar diagnóstico: ${(error as Error).message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Editar Diagnóstico</CardTitle>
            <CardDescription>Alterar diagnóstico de {patientName}</CardDescription>
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
              <h3 className="text-lg font-semibold">Sinais Vitais</h3>
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

            <div className="flex justify-end space-x-2 pt-6">
              <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
