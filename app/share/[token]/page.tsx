"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Calendar,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Share,
  AlertCircle,
  Lock,
  Clock,
  RefreshCw,
  Stethoscope,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { formatDateToBR, formatDateTimeToBR } from "@/lib/date-utils"
import { FileList } from "@/components/file-list"
import type { Patient, Diagnostico, Atendimento } from "@/app/page"

interface ShareResponse {
  patient: Patient
  diagnosticos: Diagnostico[]
  atendimentos: Atendimento[]
  tokenInfo: {
    expiresAt: number
    createdAt: number
  }
}

export default function SharedPatientPage() {
  const params = useParams()
  const token = params.token as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([])
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([])
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [expandedDiagnosticos, setExpandedDiagnosticos] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (token) {
      checkTokenValidity()
    } else {
      setError("Token de compartilhamento não encontrado na URL")
      setLoading(false)
    }
  }, [token])

  const checkTokenValidity = async () => {
    try {
      const response = await fetch(`/api/share/${token}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!data.valid) {
        setError(data.error || "Link de compartilhamento inválido ou expirado")
      }

      setLoading(false)
    } catch (error) {
      setError(`Erro ao verificar link: ${(error as Error).message}`)
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError("")
    setSubmitting(true)

    try {
      const response = await fetch(`/api/share/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: password.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setAuthError(data.error || "Erro ao validar senha")
        return
      }

      const shareData: ShareResponse = data

      setPatient(shareData.patient)
      setDiagnosticos(shareData.diagnosticos)
      setAtendimentos(shareData.atendimentos)
      setTokenInfo(shareData.tokenInfo)
      setIsAuthenticated(true)
      setAuthError("")

      // Expand all diagnosticos by default
      setExpandedDiagnosticos(new Set(shareData.diagnosticos.map(d => d.id)))
    } catch (error) {
      setAuthError(`Erro de conexão: ${(error as Error).message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const retryTokenCheck = () => {
    setError(null)
    setLoading(true)
    checkTokenValidity()
  }

  const toggleDiagnostico = (id: string) => {
    setExpandedDiagnosticos(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getDiagnosticoAtendimentos = (diagnosticoId: string) => {
    return atendimentos.filter(a => a.diagnosticoId === diagnosticoId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando link...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Link Inválido</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500 mb-4">
              Verifique se o link está correto ou solicite um novo link de compartilhamento.
            </p>
            <Button onClick={retryTokenCheck} className="mb-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Acesso Protegido</CardTitle>
            <CardDescription>
              Este histórico médico está protegido por senha. Digite a senha fornecida para acessar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha de Acesso</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                  required
                  disabled={submitting}
                />
              </div>

              {authError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{authError}</div>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Verificando..." : "Acessar Histórico"}
              </Button>
            </form>

            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AlertCircle className="h-4 w-4" />
                <span>Link válido apenas com a senha correta</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Dados Não Encontrados</h2>
            <p className="text-gray-600">Não foi possível carregar os dados do paciente.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sortedDiagnosticos = [...diagnosticos].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header com indicação de visualização compartilhada */}
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Share className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-sm font-medium text-secondary mb-1">Visualização Compartilhada</h2>
              <p className="text-xs text-secondary/80 mb-2">
                Você está visualizando o histórico médico compartilhado. Esta é uma visualização somente leitura.
              </p>
              {tokenInfo && (
                <div className="flex items-center gap-4 text-xs text-primary">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Expira em: {new Date(tokenInfo.expiresAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 break-words">{patient.name}</h1>
          <p className="text-gray-600">Histórico médico compartilhado</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Paciente
                </CardTitle>
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
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Telefone</p>
                    <p className="text-sm">{patient.phone || "Não informado"}</p>
                  </div>
                </div>
                {patient.email && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-sm">{patient.email}</p>
                      </div>
                    </div>
                  </>
                )}
                {patient.address && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Endereço</p>
                        <p className="text-sm">{patient.address}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Estatísticas do Paciente */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Resumo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total de Diagnósticos</span>
                    <Badge variant="secondary">{diagnosticos.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total de Atendimentos</span>
                    <Badge variant="secondary">{atendimentos.length}</Badge>
                  </div>
                  {diagnosticos.length > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Primeiro Diagnóstico</span>
                        <span className="text-sm">
                          {formatDateToBR(
                            new Date(
                              Math.min(...diagnosticos.map((d) => new Date(d.startDate).getTime()))
                            ).toISOString()
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Último Diagnóstico</span>
                        <span className="text-sm">
                          {formatDateToBR(
                            new Date(
                              Math.max(...diagnosticos.map((d) => new Date(d.startDate).getTime()))
                            ).toISOString()
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Diagnosticos e Atendimentos */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Diagnósticos e Atendimentos
                </CardTitle>
                <CardDescription>
                  {diagnosticos.length} diagnóstico{diagnosticos.length !== 1 ? "s" : ""} com{" "}
                  {atendimentos.length} atendimento{atendimentos.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sortedDiagnosticos.length === 0 ? (
                  <div className="text-center py-12">
                    <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum diagnóstico registrado</h3>
                    <p className="text-gray-600">Este paciente ainda não possui diagnósticos registrados.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedDiagnosticos.map((diagnostico) => {
                      const diagAtendimentos = getDiagnosticoAtendimentos(diagnostico.id)
                      const isExpanded = expandedDiagnosticos.has(diagnostico.id)
                      const isActive = !diagnostico.dischargeDate

                      return (
                        <Card
                          key={diagnostico.id}
                          className={`border-l-4 ${isActive ? "border-l-primary" : "border-l-gray-300"}`}
                        >
                          <CardHeader
                            className="cursor-pointer"
                            onClick={() => toggleDiagnostico(diagnostico.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-500" />
                                  )}
                                  <Badge variant={isActive ? "default" : "secondary"}>
                                    {isActive ? "Em tratamento" : "Alta"}
                                  </Badge>
                                  {diagnostico.diagnosis && (
                                    <span className="text-sm font-medium text-gray-900">
                                      {diagnostico.diagnosis.length > 60
                                        ? diagnostico.diagnosis.substring(0, 60) + "..."
                                        : diagnostico.diagnosis}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 ml-6">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Início: {formatDateToBR(diagnostico.startDate)}</span>
                                  </div>
                                  {diagnostico.dischargeDate && (
                                    <span>Alta: {formatDateToBR(diagnostico.dischargeDate)}</span>
                                  )}
                                  {diagnostico.doctor && <span>Dr(a). {diagnostico.doctor}</span>}
                                  <Badge variant="outline" className="text-xs">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {diagAtendimentos.length} atendimento
                                    {diagAtendimentos.length !== 1 ? "s" : ""}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardHeader>

                          {isExpanded && (
                            <CardContent className="pt-0">
                              {/* Diagnostico Details */}
                              <div className="space-y-4 mb-6">
                                {diagnostico.anamnesis && (
                                  <div>
                                    <h5 className="text-sm font-semibold text-gray-700 mb-1">Anamnese:</h5>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                      {diagnostico.anamnesis}
                                    </p>
                                  </div>
                                )}

                                {(diagnostico.heartRate ||
                                  diagnostico.respiratoryRate ||
                                  diagnostico.saturation ||
                                  diagnostico.temperature ||
                                  diagnostico.cardiacAuscultation) && (
                                  <div>
                                    <h5 className="text-sm font-semibold text-gray-700 mb-2">
                                      Sinais Vitais Iniciais:
                                    </h5>
                                    <div className="bg-primary/10 p-3 rounded">
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                                        {diagnostico.heartRate && (
                                          <div className="text-center">
                                            <p className="text-xs text-gray-500">FC</p>
                                            <p className="text-sm font-medium">{diagnostico.heartRate} bpm</p>
                                          </div>
                                        )}
                                        {diagnostico.respiratoryRate && (
                                          <div className="text-center">
                                            <p className="text-xs text-gray-500">FR</p>
                                            <p className="text-sm font-medium">{diagnostico.respiratoryRate} rpm</p>
                                          </div>
                                        )}
                                        {diagnostico.saturation && (
                                          <div className="text-center">
                                            <p className="text-xs text-gray-500">Saturação</p>
                                            <p className="text-sm font-medium">{diagnostico.saturation}%</p>
                                          </div>
                                        )}
                                        {diagnostico.temperature && (
                                          <div className="text-center">
                                            <p className="text-xs text-gray-500">Temperatura</p>
                                            <p className="text-sm font-medium">{diagnostico.temperature}°C</p>
                                          </div>
                                        )}
                                      </div>
                                      {diagnostico.cardiacAuscultation && (
                                        <div>
                                          <p className="text-xs text-gray-500 mb-1">Ausculta Cardíaca:</p>
                                          <p className="text-sm text-gray-600">{diagnostico.cardiacAuscultation}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {diagnostico.evolution && (
                                  <div>
                                    <h5 className="text-sm font-semibold text-gray-700 mb-1">Evolução/Condutas:</h5>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                      {diagnostico.evolution}
                                    </p>
                                  </div>
                                )}

                                {diagnostico.medications && (
                                  <div>
                                    <h5 className="text-sm font-semibold text-gray-700 mb-1">Medicamentos em Uso:</h5>
                                    <p className="text-sm text-gray-600 bg-green-50 p-3 rounded">
                                      {diagnostico.medications}
                                    </p>
                                  </div>
                                )}

                                {diagnostico.additionalGuidance && (
                                  <div>
                                    <h5 className="text-sm font-semibold text-gray-700 mb-1">
                                      Orientações Adicionais:
                                    </h5>
                                    <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                                      {diagnostico.additionalGuidance}
                                    </p>
                                  </div>
                                )}

                                {diagnostico.attachments && diagnostico.attachments.length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-semibold text-gray-700 mb-1">Anexos do Diagnóstico:</h5>
                                    <FileList files={diagnostico.attachments} showDeleteButton={false} />
                                  </div>
                                )}
                              </div>

                              {/* Atendimentos */}
                              {diagAtendimentos.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Atendimentos ({diagAtendimentos.length})
                                  </h5>
                                  <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                                    {diagAtendimentos
                                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                      .map((atendimento) => (
                                        <Card key={atendimento.id} className="border-l-2 border-l-primary">
                                          <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Calendar className="h-4 w-4 text-gray-400" />
                                              <span className="text-sm font-medium">
                                                {formatDateTimeToBR(atendimento.date)}
                                              </span>
                                            </div>

                                            {(atendimento.heartRate ||
                                              atendimento.respiratoryRate ||
                                              atendimento.saturation ||
                                              atendimento.temperature) && (
                                              <div className="bg-primary/10 p-2 rounded mb-2">
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                                                  {atendimento.heartRate && (
                                                    <div>
                                                      <p className="text-gray-500">FC</p>
                                                      <p className="font-medium">{atendimento.heartRate} bpm</p>
                                                    </div>
                                                  )}
                                                  {atendimento.respiratoryRate && (
                                                    <div>
                                                      <p className="text-gray-500">FR</p>
                                                      <p className="font-medium">{atendimento.respiratoryRate} rpm</p>
                                                    </div>
                                                  )}
                                                  {atendimento.saturation && (
                                                    <div>
                                                      <p className="text-gray-500">Sat</p>
                                                      <p className="font-medium">{atendimento.saturation}%</p>
                                                    </div>
                                                  )}
                                                  {atendimento.temperature && (
                                                    <div>
                                                      <p className="text-gray-500">Temp</p>
                                                      <p className="font-medium">{atendimento.temperature}°C</p>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )}

                                            {atendimento.evolution && (
                                              <div className="mb-2">
                                                <p className="text-xs text-gray-500 mb-1">Evolução:</p>
                                                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                                  {atendimento.evolution}
                                                </p>
                                              </div>
                                            )}

                                            {atendimento.additionalGuidance && (
                                              <div className="mb-2">
                                                <p className="text-xs text-gray-500 mb-1">Orientações:</p>
                                                <p className="text-sm text-gray-700 bg-yellow-50 p-2 rounded">
                                                  {atendimento.additionalGuidance}
                                                </p>
                                              </div>
                                            )}

                                            {atendimento.attachments && atendimento.attachments.length > 0 && (
                                              <div>
                                                <p className="text-xs text-gray-500 mb-1">Anexos:</p>
                                                <FileList files={atendimento.attachments} showDeleteButton={false} />
                                              </div>
                                            )}
                                          </CardContent>
                                        </Card>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          )}
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer com informações de segurança */}
        <div className="mt-8 bg-gray-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertCircle className="h-4 w-4" />
            <span>
              Este link de compartilhamento permite acesso somente leitura ao histórico deste paciente específico.
              {tokenInfo && (
                <span className="ml-2">Válido até: {new Date(tokenInfo.expiresAt).toLocaleDateString("pt-BR")}</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
