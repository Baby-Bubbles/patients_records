"use client"

import { useState } from "react"
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react"
import {
  ArrowLeft,
  Plus,
  Calendar,
  FileText,
  User,
  Share,
  Copy,
  Check,
  X,
  Edit,
  Stethoscope,
  Trash2,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import type { Patient, Appointment, Diagnostico, Atendimento } from "@/app/page"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShareService } from "@/lib/share-service"
import { PatientEditForm } from "@/components/patient-edit-form"
import { DiagnosticoForm } from "@/components/diagnostico-form"
import { DiagnosticoEditForm } from "@/components/diagnostico-edit-form"
import { DiagnosticoList } from "@/components/diagnostico-list"
import { AtendimentoForm } from "@/components/atendimento-form"
import { AtendimentoEditForm } from "@/components/atendimento-edit-form"
import { AtendimentoList } from "@/components/atendimento-list"
import { FileList } from "@/components/file-list"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Navbar } from "@/components/navbar"
import { formatDateToBR, formatDateTimeToBR } from "@/lib/date-utils"

interface PatientDetailsProps {
  patient: Patient
  appointments: Appointment[]
  diagnosticos: Diagnostico[]
  atendimentos: Atendimento[]
  onBack: () => void
  onAddAppointment: (appointment: Omit<Appointment, "id" | "createdAt">) => void
  onUpdatePatient: (patient: Patient) => void
  onUpdateAppointment: (appointment: Appointment) => void
  onAddDiagnostico: (diagnostico: Omit<Diagnostico, "id" | "createdAt">) => Promise<Diagnostico>
  onUpdateDiagnostico: (diagnostico: Diagnostico) => Promise<Diagnostico>
  onDeleteDiagnostico: (id: string) => Promise<void>
  onAddAtendimento: (atendimento: Omit<Atendimento, "id" | "createdAt">) => Promise<Atendimento>
  onUpdateAtendimento: (atendimento: Atendimento) => Promise<Atendimento>
  onDeleteAtendimento: (id: string) => Promise<void>
  onDeletePatient?: (id: string) => Promise<void>
  getDiagnosticoAtendimentos: (diagnosticoId: string) => Atendimento[]
  onRefreshData: () => Promise<void>
}

export function PatientDetails({
  patient,
  appointments,
  diagnosticos,
  atendimentos,
  onBack,
  onAddAppointment,
  onUpdatePatient,
  onUpdateAppointment,
  onAddDiagnostico,
  onUpdateDiagnostico,
  onDeleteDiagnostico,
  onAddAtendimento,
  onUpdateAtendimento,
  onDeleteAtendimento,
  onDeletePatient,
  getDiagnosticoAtendimentos,
  onRefreshData,
}: PatientDetailsProps) {
  // Navigation state
  const [selectedDiagnostico, setSelectedDiagnostico] = useState<Diagnostico | null>(null)

  // Form states
  const [showPatientEditForm, setShowPatientEditForm] = useState(false)
  const [showDiagnosticoForm, setShowDiagnosticoForm] = useState(false)
  const [editingDiagnostico, setEditingDiagnostico] = useState<Diagnostico | null>(null)
  const [showAtendimentoForm, setShowAtendimentoForm] = useState(false)
  const [editingAtendimento, setEditingAtendimento] = useState<Atendimento | null>(null)

  // Share modal state
  const [shareUrl, setShareUrl] = useState<string>("")
  const [sharePassword, setSharePassword] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Delete patient dialog state
  const [showDeletePatientDialog, setShowDeletePatientDialog] = useState(false)

  // Handlers
  const handleEditPatient = (updatedPatient: Patient) => {
    onUpdatePatient(updatedPatient)
    setShowPatientEditForm(false)
  }

  const handleAddDiagnostico = async (diagnosticoData: Omit<Diagnostico, "id" | "createdAt">) => {
    const created = await onAddDiagnostico(diagnosticoData)
    setShowDiagnosticoForm(false)
    return created
  }

  const handleEditDiagnostico = async (diagnosticoData: Diagnostico) => {
    const updated = await onUpdateDiagnostico(diagnosticoData)
    setEditingDiagnostico(null)
    if (selectedDiagnostico?.id === updated.id) {
      setSelectedDiagnostico(updated)
    }
    return updated
  }

  const handleDeleteDiagnostico = async (id: string) => {
    await onDeleteDiagnostico(id)
    if (selectedDiagnostico?.id === id) {
      setSelectedDiagnostico(null)
    }
  }

  const handleDeletePatient = async () => {
    if (onDeletePatient) {
      await onDeletePatient(patient.id)
    }
  }

  const handleAddAtendimento = async (atendimentoData: Omit<Atendimento, "id" | "createdAt">) => {
    const created = await onAddAtendimento(atendimentoData)
    setShowAtendimentoForm(false)
    await onRefreshData()
    return created
  }

  const handleEditAtendimento = async (atendimentoData: Atendimento) => {
    const updated = await onUpdateAtendimento(atendimentoData)
    setEditingAtendimento(null)
    return updated
  }

  const handleDeleteAtendimento = async (id: string) => {
    await onDeleteAtendimento(id)
  }

  // Share functionality
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
      const token = ShareService.generateShareToken(patient.id, sharePassword.trim())
      const url = `${window.location.origin}/share/${token}`
      setShareUrl(url)

      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
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

  // Get atendimentos for selected diagnostico
  const currentAtendimentos = selectedDiagnostico
    ? getDiagnosticoAtendimentos(selectedDiagnostico.id)
    : []

  return (
    <div className="min-h-full">
      <Navbar />

      <div className="py-6 sm:py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={selectedDiagnostico ? () => setSelectedDiagnostico(null) : onBack}
                className="shrink-0 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-gray-900 truncate">{patient.name}</h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  {selectedDiagnostico ? "Detalhes do Diagnóstico" : "Prontuário do paciente"}
                </p>
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
                {!selectedDiagnostico && (
                  <Button onClick={() => setShowDiagnosticoForm(true)} className="flex items-center gap-2 text-sm">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Novo Diagnóstico</span>
                    <span className="sm:hidden">Novo</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Patient Information - Sidebar */}
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

                {/* Statistics */}
                <Separator />
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Diagnósticos</span>
                    <Badge variant="secondary">{diagnosticos.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Atendimentos</span>
                    <Badge variant="secondary">
                      {atendimentos.filter(a =>
                        diagnosticos.some(d => d.id === a.diagnosticoId)
                      ).length}
                    </Badge>
                  </div>
                </div>

                {/* Delete Patient Button */}
                {onDeletePatient && (
                  <>
                    <Separator />
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setShowDeletePatientDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir Paciente
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {selectedDiagnostico ? (
              // Diagnostico Details View
              <div className="space-y-6">
                {/* Diagnostico Header Card - Collapsible */}
                <Disclosure as="div">
                  {({ open }) => (
                    <Card>
                      <CardHeader className="p-0">
                        <div className="flex items-start justify-between p-6">
                          <DisclosureButton className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-2">
                              <Stethoscope className="h-5 w-5 text-primary" />
                              <CardTitle>Diagnóstico</CardTitle>
                              <Badge variant={selectedDiagnostico.dischargeDate ? "secondary" : "default"}>
                                {selectedDiagnostico.dischargeDate ? "Alta" : "Em tratamento"}
                              </Badge>
                              <ChevronDown
                                className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                                  open ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                            <CardDescription>
                              Início: {formatDateToBR(selectedDiagnostico.startDate)}
                              {selectedDiagnostico.dischargeDate && (
                                <> | Alta: {formatDateToBR(selectedDiagnostico.dischargeDate)}</>
                              )}
                              {selectedDiagnostico.doctor && (
                                <> | Dr(a). {selectedDiagnostico.doctor}</>
                              )}
                            </CardDescription>
                          </DisclosureButton>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                            onClick={() => setEditingDiagnostico(selectedDiagnostico)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <DisclosurePanel>
                        <CardContent className="space-y-4 pt-0">
                          {/* Diagnóstico */}
                          {selectedDiagnostico.diagnosis && (
                            <div>
                              <h5 className="text-sm font-semibold text-gray-700 mb-1">Diagnóstico:</h5>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                {selectedDiagnostico.diagnosis}
                              </p>
                            </div>
                          )}

                          {/* Anamnese */}
                          {selectedDiagnostico.anamnesis && (
                            <div>
                              <h5 className="text-sm font-semibold text-gray-700 mb-1">Anamnese:</h5>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                {selectedDiagnostico.anamnesis}
                              </p>
                            </div>
                          )}

                          {/* Sinais Vitais Iniciais */}
                          {(selectedDiagnostico.heartRate ||
                            selectedDiagnostico.respiratoryRate ||
                            selectedDiagnostico.saturation ||
                            selectedDiagnostico.temperature ||
                            selectedDiagnostico.cardiacAuscultation) && (
                            <div>
                              <h5 className="text-sm font-semibold text-gray-700 mb-2">Sinais Vitais Iniciais:</h5>
                              <div className="bg-primary/10 p-3 rounded">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-2">
                                  {selectedDiagnostico.heartRate && (
                                    <div className="text-center">
                                      <p className="text-xs text-gray-500">FC</p>
                                      <p className="text-xs sm:text-sm font-medium">{selectedDiagnostico.heartRate} bpm</p>
                                    </div>
                                  )}
                                  {selectedDiagnostico.respiratoryRate && (
                                    <div className="text-center">
                                      <p className="text-xs text-gray-500">FR</p>
                                      <p className="text-xs sm:text-sm font-medium">{selectedDiagnostico.respiratoryRate} rpm</p>
                                    </div>
                                  )}
                                  {selectedDiagnostico.saturation && (
                                    <div className="text-center">
                                      <p className="text-xs text-gray-500">Saturação</p>
                                      <p className="text-xs sm:text-sm font-medium">{selectedDiagnostico.saturation}%</p>
                                    </div>
                                  )}
                                  {selectedDiagnostico.temperature && (
                                    <div className="text-center">
                                      <p className="text-xs text-gray-500">Temperatura</p>
                                      <p className="text-xs sm:text-sm font-medium">{selectedDiagnostico.temperature}°C</p>
                                    </div>
                                  )}
                                </div>
                                {selectedDiagnostico.cardiacAuscultation && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Ausculta Cardíaca:</p>
                                    <p className="text-sm text-gray-600">{selectedDiagnostico.cardiacAuscultation}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Evolução */}
                          {selectedDiagnostico.evolution && (
                            <div>
                              <h5 className="text-sm font-semibold text-gray-700 mb-1">Evolução/Condutas:</h5>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                {selectedDiagnostico.evolution}
                              </p>
                            </div>
                          )}

                          {/* Medicamentos */}
                          {selectedDiagnostico.medications && (
                            <div>
                              <h5 className="text-sm font-semibold text-gray-700 mb-1">Medicamentos em Uso:</h5>
                              <p className="text-sm text-gray-600 bg-green-50 p-3 rounded">
                                {selectedDiagnostico.medications}
                              </p>
                            </div>
                          )}

                          {/* Orientações */}
                          {selectedDiagnostico.additionalGuidance && (
                            <div>
                              <h5 className="text-sm font-semibold text-gray-700 mb-1">Orientações Adicionais:</h5>
                              <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                                {selectedDiagnostico.additionalGuidance}
                              </p>
                            </div>
                          )}

                          {/* Anexos do Diagnóstico */}
                          {selectedDiagnostico.attachments && selectedDiagnostico.attachments.length > 0 && (
                            <div>
                              <h5 className="text-sm font-semibold text-gray-700 mb-1">Anexos:</h5>
                              <FileList
                                files={selectedDiagnostico.attachments}
                                patientId={patient.id}
                                showDeleteButton={false}
                              />
                            </div>
                          )}
                        </CardContent>
                      </DisclosurePanel>
                    </Card>
                  )}
                </Disclosure>

                {/* Atendimentos List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Atendimentos do Diagnóstico
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AtendimentoList
                      atendimentos={currentAtendimentos}
                      patientId={patient.id}
                      onNewAtendimento={() => setShowAtendimentoForm(true)}
                      onEditAtendimento={(atendimento) => setEditingAtendimento(atendimento)}
                      onDeleteAtendimento={handleDeleteAtendimento}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Diagnosticos List View
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Diagnósticos
                  </CardTitle>
                  <CardDescription>
                    {diagnosticos.length} diagnóstico{diagnosticos.length !== 1 ? "s" : ""} registrado
                    {diagnosticos.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DiagnosticoList
                    diagnosticos={diagnosticos}
                    atendimentos={atendimentos}
                    onSelectDiagnostico={setSelectedDiagnostico}
                    onNewDiagnostico={() => setShowDiagnosticoForm(true)}
                    onDeleteDiagnostico={handleDeleteDiagnostico}
                    getDiagnosticoAtendimentos={getDiagnosticoAtendimentos}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Share Modal */}
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
                    {copied && <p className="text-sm text-green-600">Link copiado para a área de transferência!</p>}
                  </div>
                )}

                <div className="bg-primary/10 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-secondary mb-1">Informações de Segurança:</h4>
                  <ul className="text-xs text-secondary/90 space-y-1">
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

        {/* Forms */}
        {showPatientEditForm && (
          <PatientEditForm
            patient={patient}
            onSubmit={handleEditPatient}
            onCancel={() => setShowPatientEditForm(false)}
          />
        )}

        {showDiagnosticoForm && (
          <DiagnosticoForm
            patientId={patient.id}
            patientName={patient.name}
            onSubmit={handleAddDiagnostico}
            onCancel={() => setShowDiagnosticoForm(false)}
          />
        )}

        {editingDiagnostico && (
          <DiagnosticoEditForm
            diagnostico={editingDiagnostico}
            patientName={patient.name}
            onSubmit={handleEditDiagnostico}
            onCancel={() => setEditingDiagnostico(null)}
          />
        )}

        {showAtendimentoForm && selectedDiagnostico && (
          <AtendimentoForm
            diagnosticoId={selectedDiagnostico.id}
            patientName={patient.name}
            onSubmit={handleAddAtendimento}
            onCancel={() => setShowAtendimentoForm(false)}
          />
        )}

        {editingAtendimento && (
          <AtendimentoEditForm
            atendimento={editingAtendimento}
            patientName={patient.name}
            onSubmit={handleEditAtendimento}
            onCancel={() => setEditingAtendimento(null)}
          />
        )}

        {/* Delete Patient Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={showDeletePatientDialog}
          onOpenChange={setShowDeletePatientDialog}
          title="Excluir Paciente"
          description={`Todos os diagnósticos e atendimentos de ${patient.name} serão excluídos permanentemente. Esta ação não pode ser desfeita.`}
          onConfirm={handleDeletePatient}
        />
          </div>
        </main>
      </div>
    </div>
  )
}
