"use client"

import { useState, useEffect } from "react"
import { Plus, Search, FileText, Download, User, AlertCircle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PatientForm } from "@/components/patient-form"
import { PatientDetails } from "@/components/patient-details"
import { formatDateToBR } from "@/lib/date-utils"
import { ApiClient } from "@/lib/api-client"
import { DataMigration } from "@/lib/data-migration"
import { testConnection } from "@/lib/supabase-client"
import Link from "next/link"

export interface Patient {
  id: string
  name: string
  cpf: string
  birthDate: string
  phone: string
  email: string
  address: string
  createdAt: string
}

export interface FileAttachment {
  id: string
  originalName: string
  size: number
  type: string
}

export interface Appointment {
  id: string
  patientId: string
  date: string
  doctor: string
  diagnosis: string
  anamnesis: string
  // Sinais vitais
  heartRate?: number
  respiratoryRate?: number
  saturation?: number
  temperature?: number
  cardiacAuscultation?: string
  // Outros campos
  evolution: string
  medications: string
  additionalGuidance: string
  attachments?: FileAttachment[]
  createdAt: string
}

export default function HomePage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showPatientForm, setShowPatientForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dbConnected, setDbConnected] = useState(false)
  const [showMigration, setShowMigration] = useState(false)

  // Verificar conexão e carregar dados
  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      setLoading(true)
      setError(null)

      // Testar conexão com banco
      const connected = await testConnection()
      setDbConnected(connected)

      if (connected) {
        await loadData()

        // Verificar se há dados no localStorage para migração
        const hasLocalData = localStorage.getItem("patients") || localStorage.getItem("appointments")
        if (hasLocalData) {
          setShowMigration(true)
        }
      } else {
        setError("Não foi possível conectar ao banco de dados. Verifique a configuração do Supabase.")
      }
    } catch (error) {
      setError(`Erro ao inicializar aplicação: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    try {
      const [patientsData, appointmentsData] = await Promise.all([ApiClient.getPatients(), ApiClient.getAppointments()])

      setPatients(patientsData)
      setAppointments(appointmentsData)
    } catch (error) {
      setError(`Erro ao carregar dados: ${(error as Error).message}`)
    }
  }

  const handleMigration = async () => {
    try {
      setLoading(true)
      const result = await DataMigration.migrateFromLocalStorage()

      if (result.success) {
        await DataMigration.clearLocalStorage()
        await loadData()
        setShowMigration(false)
        alert(
          `Migração concluída! ${result.migratedPatients} pacientes e ${result.migratedAppointments} atendimentos migrados.`,
        )
      } else {
        alert(`Migração parcial. Erros: ${result.errors.join(", ")}`)
      }
    } catch (error) {
      alert(`Erro na migração: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(
    (patient) => patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || patient.cpf.includes(searchTerm),
  )

  const addPatient = async (patientData: Omit<Patient, "id" | "createdAt">) => {
    try {
      const newPatient = await ApiClient.createPatient(patientData)
      setPatients([...patients, newPatient])
      setShowPatientForm(false)
    } catch (error) {
      alert(`Erro ao criar paciente: ${(error as Error).message}`)
    }
  }

  const updatePatient = async (updatedPatient: Patient) => {
    try {
      const patient = await ApiClient.updatePatient(updatedPatient.id, updatedPatient)
      setPatients(patients.map((p) => (p.id === patient.id ? patient : p)))
      if (selectedPatient?.id === patient.id) {
        setSelectedPatient(patient)
      }
    } catch (error) {
      alert(`Erro ao atualizar paciente: ${(error as Error).message}`)
    }
  }

  const addAppointment = async (appointmentData: Omit<Appointment, "id" | "createdAt">) => {
    try {
      // The appointment form now handles the complete flow including file uploads
      // So we just need to add it to our local state
      setAppointments([...appointments, appointmentData as Appointment])

      // Refresh the data to get the latest from the server
      await loadData()
    } catch (error) {
      alert(`Erro ao processar atendimento: ${(error as Error).message}`)
    }
  }

  const updateAppointment = async (updatedAppointment: Appointment) => {
    try {
      const appointment = await ApiClient.updateAppointment(updatedAppointment.id, updatedAppointment)
      setAppointments(appointments.map((a) => (a.id === appointment.id ? appointment : a)))
    } catch (error) {
      alert(`Erro ao atualizar atendimento: ${(error as Error).message}`)
    }
  }

  const getPatientAppointments = (patientId: string) => {
    return appointments.filter((apt) => apt.patientId === patientId)
  }

  const exportToCSV = () => {
    const csvData = patients.map((patient) => {
      const patientAppointments = getPatientAppointments(patient.id)
      return {
        Nome: patient.name,
        CPF: patient.cpf,
        "Data Nascimento": new Date(patient.birthDate).toLocaleDateString("pt-BR"),
        Telefone: patient.phone,
        Email: patient.email,
        Endereço: patient.address,
        "Total Atendimentos": patientAppointments.length,
        "Último Atendimento":
          patientAppointments.length > 0
            ? new Date(Math.max(...patientAppointments.map((apt) => new Date(apt.date).getTime()))).toLocaleDateString(
                "pt-BR",
              )
            : "Nenhum",
      }
    })

    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => headers.map((header) => `"${row[header as keyof typeof row]}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `prontuarios_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema...</p>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Erro de Conexão</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={initializeApp}>Tentar Novamente</Button>
              <Link href="/diagnostics">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Diagnóstico
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedPatient) {
    return (
      <PatientDetails
        patient={selectedPatient}
        appointments={getPatientAppointments(selectedPatient.id)}
        onBack={() => setSelectedPatient(null)}
        onAddAppointment={addAppointment}
        onUpdatePatient={updatePatient}
        onUpdateAppointment={updateAppointment}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Alerta de migração */}
        {showMigration && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Dados encontrados no armazenamento local. Deseja migrar para o banco de dados?</span>
                <div className="flex gap-2 ml-4">
                  <Button size="sm" onClick={handleMigration}>
                    Migrar Dados
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowMigration(false)}>
                    Ignorar
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Prontuário Eletrônico</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Sistema de gestão de pacientes e atendimentos
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Link href="/diagnostics">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent text-sm sm:text-base">
                <Settings className="h-4 w-4" />
                Diagnóstico
              </Button>
            </Link>
            <Button
              onClick={exportToCSV}
              variant="outline"
              className="flex items-center gap-2 bg-transparent text-sm sm:text-base"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
            <Button onClick={() => setShowPatientForm(true)} className="flex items-center gap-2 text-sm sm:text-base">
              <Plus className="h-4 w-4" />
              Novo Paciente
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Atendimentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atendimentos Hoje</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointments.filter((apt) => new Date(apt.date).toDateString() === new Date().toDateString()).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pacientes Cadastrados</CardTitle>
            <CardDescription>Gerencie os pacientes e seus históricos de atendimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4 sm:mb-6">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:max-w-sm text-sm sm:text-base"
              />
            </div>

            {filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {patients.length === 0 ? "Nenhum paciente cadastrado" : "Nenhum paciente encontrado"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {patients.length === 0
                    ? "Comece adicionando seu primeiro paciente ao sistema."
                    : "Tente ajustar os termos de busca."}
                </p>
                {patients.length === 0 && (
                  <Button onClick={() => setShowPatientForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Paciente
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredPatients.map((patient) => {
                  const patientAppointments = getPatientAppointments(patient.id)
                  const lastAppointment =
                    patientAppointments.length > 0
                      ? new Date(Math.max(...patientAppointments.map((apt) => new Date(apt.date).getTime())))
                      : null

                  return (
                    <Card
                      key={patient.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                          <div className="flex-1">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{patient.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">CPF: {patient.cpf}</p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Nascimento: {formatDateToBR(patient.birthDate)}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">Telefone: {patient.phone}</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <Badge variant="secondary" className="mb-2 text-xs">
                              {patientAppointments.length} atendimento{patientAppointments.length !== 1 ? "s" : ""}
                            </Badge>
                            {lastAppointment && (
                              <p className="text-xs sm:text-sm text-gray-600">
                                Último: {formatDateToBR(lastAppointment)}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {showPatientForm && <PatientForm onSubmit={addPatient} onCancel={() => setShowPatientForm(false)} />}
      </div>
    </div>
  )
}
