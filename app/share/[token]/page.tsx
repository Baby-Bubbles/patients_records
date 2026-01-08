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
import { Calendar, FileText, User, Phone, Mail, MapPin, Share, AlertCircle, Lock, Clock, RefreshCw } from "lucide-react"
import { formatDateToBR, formatDateTimeToBR } from "@/lib/date-utils"
import { FileList } from "@/components/file-list"
import type { Patient, Appointment } from "@/app/page"

interface ShareResponse {
  patient: Patient
  appointments: Appointment[]
  tokenInfo: {
    expiresAt: number
    createdAt: number
  }
}

export default function SharedPatientPage() {
  const params = useParams()
  const token = params.token as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (message: string) => {
    console.log(message)
    setDebugInfo((prev) => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`])
  }

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
      addDebugInfo(`🔍 Verificando token: ${token.substring(0, 20)}...`)

      const response = await fetch(`/api/share/${token}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      addDebugInfo(`📡 Resposta da API: ${response.status}`)

      const data = await response.json()
      addDebugInfo(`📋 Dados recebidos: ${JSON.stringify(data)}`)

      if (!data.valid) {
        setError(data.error || "Link de compartilhamento inválido ou expirado")
        addDebugInfo(`❌ Token inválido: ${data.error}`)
      } else {
        addDebugInfo("✅ Token válido, aguardando senha")
      }

      setLoading(false)
    } catch (error) {
      const errorMessage = `Erro ao verificar link: ${(error as Error).message}`
      addDebugInfo(`💥 ${errorMessage}`)
      setError(errorMessage)
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError("")
    setSubmitting(true)

    try {
      addDebugInfo(`🔐 Tentando autenticar com senha...`)

      const response = await fetch(`/api/share/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: password.trim() }),
      })

      addDebugInfo(`📡 Resposta da autenticação: ${response.status}`)

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error || "Erro ao validar senha"
        setAuthError(errorMsg)
        addDebugInfo(`❌ Erro na autenticação: ${errorMsg}`)
        return
      }

      const shareData: ShareResponse = data

      setPatient(shareData.patient)
      setAppointments(shareData.appointments)
      setTokenInfo(shareData.tokenInfo)
      setIsAuthenticated(true)
      setAuthError("")

      addDebugInfo("🎉 Autenticação bem-sucedida!")
    } catch (error) {
      const errorMsg = `Erro de conexão: ${(error as Error).message}`
      addDebugInfo(`💥 ${errorMsg}`)
      setAuthError(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const retryTokenCheck = () => {
    setError(null)
    setLoading(true)
    setDebugInfo([])
    checkTokenValidity()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando link...</p>
          {debugInfo.length > 0 && (
            <div className="mt-4 text-xs text-gray-500 max-w-md">
              {debugInfo.map((info, index) => (
                <div key={index} className="font-mono text-left">
                  {info}
                </div>
              ))}
            </div>
          )}
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

            {/* Debug info */}
            {debugInfo.length > 0 && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer">Informações de Debug</summary>
                <div className="mt-2 text-xs text-gray-400 bg-gray-50 p-2 rounded font-mono">
                  {debugInfo.map((info, index) => (
                    <div key={index}>{info}</div>
                  ))}
                </div>
              </details>
            )}
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
            <div className="mx-auto bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-blue-600" />
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

            {/* Debug info para desenvolvimento */}
            {debugInfo.length > 0 && (
              <details className="mt-4">
                <summary className="text-sm text-gray-500 cursor-pointer">Debug Info</summary>
                <div className="mt-2 text-xs text-gray-400 bg-gray-50 p-2 rounded font-mono max-h-32 overflow-y-auto">
                  {debugInfo.map((info, index) => (
                    <div key={index}>{info}</div>
                  ))}
                </div>
              </details>
            )}
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

  const sortedAppointments = [...appointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header com indicação de visualização compartilhada */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Share className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-sm font-medium text-blue-900 mb-1">Visualização Compartilhada</h2>
              <p className="text-xs text-blue-700 mb-2">
                Você está visualizando o histórico médico compartilhado. Esta é uma visualização somente leitura.
              </p>
              {tokenInfo && (
                <div className="flex items-center gap-4 text-xs text-blue-600">
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
                    <span className="text-sm text-gray-600">Total de Atendimentos</span>
                    <Badge variant="secondary">{appointments.length}</Badge>
                  </div>
                  {appointments.length > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Primeiro Atendimento</span>
                        <span className="text-sm">
                          {new Date(
                            Math.min(...appointments.map((apt) => new Date(apt.date).getTime())),
                          ).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Último Atendimento</span>
                        <span className="text-sm">
                          {new Date(
                            Math.max(...appointments.map((apt) => new Date(apt.date).getTime())),
                          ).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </>
                  )}
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
                    <p className="text-gray-600">Este paciente ainda não possui atendimentos registrados.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedAppointments.map((appointment) => (
                      <Card key={appointment.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg">Atendimento</h4>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {appointment.date ? formatDateTimeToBR(appointment.date) : "Data não informada"}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {/* Pediatra/Médico */}
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
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                                    {appointment.heartRate && (
                                      <div className="text-center">
                                        <p className="text-xs text-gray-500">FC</p>
                                        <p className="text-sm font-medium">{appointment.heartRate} bpm</p>
                                      </div>
                                    )}
                                    {appointment.respiratoryRate && (
                                      <div className="text-center">
                                        <p className="text-xs text-gray-500">FR</p>
                                        <p className="text-sm font-medium">{appointment.respiratoryRate} rpm</p>
                                      </div>
                                    )}
                                    {appointment.saturation && (
                                      <div className="text-center">
                                        <p className="text-xs text-gray-500">Saturação</p>
                                        <p className="text-sm font-medium">{appointment.saturation}%</p>
                                      </div>
                                    )}
                                    {appointment.temperature && (
                                      <div className="text-center">
                                        <p className="text-xs text-gray-500">Temperatura</p>
                                        <p className="text-sm font-medium">{appointment.temperature}°C</p>
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
                                  <FileList files={appointment.attachments} showDeleteButton={false} />
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
