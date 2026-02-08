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
import type { Atendimento } from "@/app/page"
import { formatDateTimeForInput } from "@/lib/date-utils"

interface AtendimentoEditFormProps {
  atendimento: Atendimento
  patientName: string
  onSubmit: (atendimento: Atendimento) => Promise<Atendimento>
  onCancel: () => void
}

export function AtendimentoEditForm({ atendimento, patientName, onSubmit, onCancel }: AtendimentoEditFormProps) {
  const [formData, setFormData] = useState({
    date: formatDateTimeForInput(atendimento.date),
    heartRate: atendimento.heartRate?.toString() || "",
    respiratoryRate: atendimento.respiratoryRate?.toString() || "",
    saturation: atendimento.saturation?.toString() || "",
    temperature: atendimento.temperature?.toString() || "",
    cardiacAuscultation: atendimento.cardiacAuscultation || "",
    evolution: atendimento.evolution || "",
    additionalGuidance: atendimento.additionalGuidance || "",
  })

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const atendimentoData = {
        ...atendimento,
        date: formData.date,
        heartRate: formData.heartRate ? Number(formData.heartRate) : undefined,
        respiratoryRate: formData.respiratoryRate ? Number(formData.respiratoryRate) : undefined,
        saturation: formData.saturation ? Number(formData.saturation) : undefined,
        temperature: formData.temperature ? Number(formData.temperature) : undefined,
        cardiacAuscultation: formData.cardiacAuscultation || undefined,
        evolution: formData.evolution || undefined,
        additionalGuidance: formData.additionalGuidance || undefined,
      }

      await onSubmit(atendimentoData)
      onCancel()
    } catch (error) {
      console.error("Erro ao atualizar atendimento:", error)
      alert(`Erro ao atualizar atendimento: ${(error as Error).message}`)
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
      <Card className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Editar Atendimento</CardTitle>
            <CardDescription>Alterar atendimento de {patientName}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} disabled={submitting}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Data e Hora */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data e Hora *</Label>
                <Input
                  id="date"
                  name="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
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
                  <Label htmlFor="additionalGuidance">Orientações Adicionais</Label>
                  <Textarea
                    id="additionalGuidance"
                    name="additionalGuidance"
                    value={formData.additionalGuidance}
                    onChange={handleChange}
                    placeholder="Orientações gerais, cuidados especiais..."
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
