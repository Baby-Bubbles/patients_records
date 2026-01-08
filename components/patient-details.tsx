"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Plus,
  Calendar,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Share,
  Copy,
  Check,
  X,
  Edit,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AppointmentForm } from "@/components/appointment-form"
import { FileList } from "@/components/file-list"
import type { Patient, Appointment } from "@/app/page"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShareService } from "@/lib/share-service"
import { PatientEditForm } from "@/components/patient-edit-form"
import { AppointmentEditForm } from "@/components/appointment-edit-form"
import { formatDateToBR, formatDateTimeToBR } from "@/lib/date-utils"

interface PatientDetailsProps {
  patient: Patient
  appointments: Appointment[]
  onBack: () => void
  onAddAppointment: (appointment: Omit<Appointment, "id" | "createdAt">) => void
  onUpdatePatient: (patient: Patient) => void
  onUpdateAppointment: (appointment: Appointment) => void
}

export function PatientDetails({
  patient,
  appointments,
  onBack,
  onAddAppointment,
  onUpdatePatient,
  onUpdateAppointment,
}: PatientDetailsProps) {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [showPatientEditForm, setShowPatientEditForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [shareUrl, setShareUrl] = useState<string>("")
  const [sharePassword, setSharePassword] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [generating, setGenerating] = useState(false)

  const sortedAppointments = [...appointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleAddAppointment = (appointment: Omit<Appointment, "id" | "createdAt" | "patientId">) => {
    onAddAppointment({
      ...appointment,
      patientId: patient.id,
    })
    setShowAppointmentForm(false)
  }

  const handleEditPatient = (updatedPatient: Patient) => {
    onUpdatePatient(updatedPatient)
    setShowPatientEditForm(false)
  }

  const handleEditAppointment = (updatedAppointment: Appointment) => {
    onUpdateAppointment(updatedAppointment)
    setEditingAppointment(null)
  }

  const handleFileDeleted = (appointmentId: string, fileId: string) => {
    const appointment = appointments.find((a) => a.id === appointmentId)
    if (appointment && appointment.attachments) {
      const updatedAppointment = {
        ...appointment,
        attachments: appointment.attachments.filter((f) => f.id !== fileId),
      }
      onUpdateAppointment(updatedAppointment)
    }
  }

  const handleGenerateLink = async () => {
    if (!sharePassword.trim()) {
      alert("Por favor, defina uma senha para o link de compartilhamento")
      return
    }

    if (sharePassword.trim().length < 4) {
      alert("A senha deve ter pelo menos 4 caracteres")
      return
    }

    setGenerating(true)

    try {
      console.log("🔗 Gerando link de compartilhamento...")

      const token = ShareService.generateShareToken(patient.id, sharePassword.trim())
      const url = `${window.location.origin}/share/${token}`
      setShareUrl(url)

      console.log("✅ Link gerado com sucesso!")

      // Copiar automaticamente para a área de transferência
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      console.error("❌ Erro ao gerar link:", error)
      alert("Erro ao gerar link de compartilhamento: " + (error as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  const generateShareLink = () => {
    setShowShareModal(true)
    setShareUrl("")
    setSharePassword("")
    setCopied(false)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Erro ao copiar:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={onBack} className="shrink-0 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">{patient.name}</h1>
            <p className="text-gray-600 text-sm sm:text-base">Prontuário do paciente</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={generateShareLink}
              variant="outline"
              className="flex items-center gap-2 bg-transparent text-sm"
            >
              <Share className="h-4 w-4" />
              <span className="hidden sm:inline">Compartilhar Histórico</span>
              <span className="sm:hidden">Compartilhar</span>
            </Button>
            <Button onClick={() => setShowAppointmentForm(true)} className="flex items-center gap-2 text-sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Atendimento</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Patient Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  Informações do Paciente
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowPatientEditForm(true)} className="shrink-0">
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">CPF</p>
                  <p className="text-sm">{patient.cpf || "Não informado"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-gray-500">Data de Nascimento</p>
                  <p className="text-sm">{patient.birthDate ? formatDateToBR(patient.birthDate) : "Não informado"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-gray-500">Telefone</p>
                  <p className="text-sm">{patient.phone || "Não informado"}</p>
                </div>
                {patient.email && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm">{patient.email}</p>
                    </div>
                  </>
                )}
                {patient.address && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Endereço</p>
                      <p className="text-sm">{patient.address}</p>
                    </div>
                  </>
                )}
                <Separator />
                <div>
                  <p className="text-sm font-medium text-gray-500">Cadastrado em</p>
                  <p className="text-sm">{patient.createdAt ? formatDateToBR(patient.createdAt) : "Não informado"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointments History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Histórico de Atendimentos
                </CardTitle>
                <CardDescription>
                  {appointments.length} atendimento{appointments.length !== 1 ? "s" : ""} registrado
                  {appointments.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sortedAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum atendimento registrado</h3>
                    <p className="text-gray-600 mb-4">Comece adicionando o primeiro atendimento deste paciente.</p>
                    <Button onClick={() => setShowAppointmentForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Atendimento
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedAppointments.map((appointment) => (
                      <Card key={appointment.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-2 sm:gap-0">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-base sm:text-lg">Atendimento</h4>
                              <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {appointment.date ? formatDateTimeToBR(appointment.date) : "Data não informada"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 self-start">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingAppointment(appointment)}
                                className="h-8 w-8 sm:h-auto sm:w-auto"
                              >
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {/* Pediatra/Médico - agora como campo de texto */}
                            {appointment.doctor && (
                              <div>
                                <h5 className="text-sm font-semibold text-gray-700 mb-1">Pediatra/Médico:</h5>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{appointment.doctor}</p>
                              </div>
                            )}

                            {/* Anamnese */}
                            {appointment.anamnesis && (
                              <div>
                                <h5 className="text-sm font-semibold text-gray-700 mb-1">Anamnese:</h5>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{appointment.anamnesis}</p>
                              </div>
                            )}

                            {/* Diagnóstico */}
                            {appointment.diagnosis && (
                              <div>
                                <h5 className="text-sm font-semibold text-gray-700 mb-1">Diagnóstico:</h5>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{appointment.diagnosis}</p>
                              </div>
                            )}

                            {/* Sinais Vitais */}
                            {(appointment.heartRate ||
                              appointment.respiratoryRate ||
                              appointment.saturation ||
                              appointment.temperature ||
                              appointment.cardiacAuscultation) && (
                              <div>
                                <h5 className="text-sm font-semibold text-gray-700 mb-2">Sinais Vitais:</h5>
                                <div className="bg-blue-50 p-3 rounded">
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-2">
                                    {appointment.heartRate && (
                                      <div className="text-center">
                                        <p className="text-xs text-gray-500">FC</p>
                                        <p className="text-xs sm:text-sm font-medium">{appointment.heartRate} bpm</p>
                                      </div>
                                    )}
                                    {appointment.respiratoryRate && (
                                      <div className="text-center">
                                        <p className="text-xs text-gray-500">FR</p>
                                        <p className="text-xs sm:text-sm font-medium">
                                          {appointment.respiratoryRate} rpm
                                        </p>
                                      </div>
                                    )}
                                    {appointment.saturation && (
                                      <div className="text-center">
                                        <p className="text-xs text-gray-500">Saturação</p>
                                        <p className="text-xs sm:text-sm font-medium">{appointment.saturation}%</p>
                                      </div>
                                    )}
                                    {appointment.temperature && (
                                      <div className="text-center">
                                        <p className="text-xs text-gray-500">Temperatura</p>
                                        <p className="text-xs sm:text-sm font-medium">{appointment.temperature}°C</p>
                                      </div>
                                    )}
                                  </div>
                                  {appointment.cardiacAuscultation && (
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Ausculta Cardíaca:</p>
                                      <p className="text-sm text-gray-600">{appointment.cardiacAuscultation}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Evolução/Condutas */}
                            {appointment.evolution && (
                              <div>
                                <h5 className="text-sm font-semibold text-gray-700 mb-1">Evolução/Condutas:</h5>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{appointment.evolution}</p>
                              </div>
                            )}

                            {/* Medicamentos */}
                            {appointment.medications && (
                              <div>
                                <h5 className="text-sm font-semibold text-gray-700 mb-1">Medicamentos e Uso:</h5>
                                <p className="text-sm text-gray-600 bg-green-50 p-3 rounded">
                                  {appointment.medications}
                                </p>
                              </div>
                            )}

                            {/* Orientações Adicionais */}
                            {appointment.additionalGuidance && (
                              <div>
                                <h5 className="text-sm font-semibold text-gray-700 mb-1">Orientações Adicionais:</h5>
                                <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                                  {appointment.additionalGuidance}
                                </p>
                              </div>
                            )}

                            {/* Anexos */}
                            {appointment.attachments &&
                              Array.isArray(appointment.attachments) &&
                              appointment.attachments.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-semibold text-gray-700 mb-1">Anexos:</h5>
                                  <FileList
                                    files={appointment.attachments}
                                    patientId={patient.id}
                                    appointmentId={appointment.id}
                                    onFileDeleted={(fileId) => handleFileDeleted(appointment.id, fileId)}
                                    showDeleteButton={true}
                                  />
                                </div>
                              )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Share className="h-5 w-5" />
                    Compartilhar Histórico
                  </CardTitle>
                  <CardDescription>Link seguro de acesso ao histórico de {patient.name}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowShareModal(false)
                    setShareUrl("")
                    setSharePassword("")
                    setCopied(false)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Senha de Proteção *</Label>
                  <Input
                    type="password"
                    placeholder="Digite uma senha segura (mín. 4 caracteres)"
                    value={sharePassword}
                    onChange={(e) => setSharePassword(e.target.value)}
                    disabled={generating}
                  />
                  <p className="text-xs text-gray-500">
                    Esta senha será necessária para acessar o histórico compartilhado
                  </p>
                </div>

                {!shareUrl && (
                  <Button
                    onClick={handleGenerateLink}
                    className="w-full"
                    disabled={generating || !sharePassword.trim() || sharePassword.trim().length < 4}
                  >
                    {generating ? "Gerando..." : "Gerar Link de Compartilhamento"}
                  </Button>
                )}

                {shareUrl && (
                  <div className="space-y-2">
                    <Label>Link de Compartilhamento</Label>
                    <div className="flex gap-2">
                      <Input value={shareUrl} readOnly className="text-sm" />
                      <Button size="icon" variant="outline" onClick={copyToClipboard}>
                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    {copied && <p className="text-sm text-green-600">✅ Link copiado para a área de transferência!</p>}
                  </div>
                )}

                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Informações de Segurança:</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Link válido por 30 dias</li>
                    <li>• Acesso somente leitura</li>
                    <li>• Funciona em qualquer dispositivo</li>
                    <li>• Não permite acesso a outros pacientes</li>
                    <li>• Compartilhe apenas com pessoas autorizadas</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowShareModal(false)
                      setShareUrl("")
                      setSharePassword("")
                      setCopied(false)
                    }}
                  >
                    Fechar
                  </Button>
                  {shareUrl && (
                    <Button onClick={copyToClipboard} className="flex items-center gap-2">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copiado!" : "Copiar Link"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showAppointmentForm && (
          <AppointmentForm
            patientId={patient.id}
            patientName={patient.name}
            onSubmit={handleAddAppointment}
            onCancel={() => setShowAppointmentForm(false)}
          />
        )}

        {showPatientEditForm && (
          <PatientEditForm
            patient={patient}
            onSubmit={handleEditPatient}
            onCancel={() => setShowPatientEditForm(false)}
          />
        )}

        {editingAppointment && (
          <AppointmentEditForm
            appointment={editingAppointment}
            patientName={patient.name}
            onSubmit={handleEditAppointment}
            onCancel={() => setEditingAppointment(null)}
          />
        )}
      </div>
    </div>
  )
}
