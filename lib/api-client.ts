// Cliente para comunicação com a API
export class ApiClient {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`

      try {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const error = await response.json()
          errorMessage = error.error || error.message || errorMessage
        } else {
          // Se não é JSON, pode ser HTML de erro
          const text = await response.text()
          if (text.includes("<!DOCTYPE")) {
            errorMessage = "Erro do servidor - endpoint não encontrado ou erro interno"
          } else {
            errorMessage = text.substring(0, 100) // Primeiros 100 caracteres
          }
        }
      } catch {
        errorMessage = `Erro de comunicação com o servidor (${response.status})`
      }

      throw new Error(errorMessage)
    }
    return response.json()
  }

  // Pacientes
  static async getPatients() {
    const response = await fetch("/api/patients")
    return this.handleResponse(response)
  }

  static async getPatient(id: string) {
    const response = await fetch(`/api/patients/${id}`)
    return this.handleResponse(response)
  }

  static async createPatient(patient: any) {
    const response = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patient),
    })
    return this.handleResponse(response)
  }

  static async updatePatient(id: string, patient: any) {
    const response = await fetch(`/api/patients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patient),
    })
    return this.handleResponse(response)
  }

  static async deletePatient(id: string) {
    const response = await fetch(`/api/patients/${id}`, {
      method: "DELETE",
    })
    return this.handleResponse(response)
  }

  // Atendimentos
  static async getAppointments(patientId?: string) {
    const url = patientId ? `/api/appointments?patientId=${patientId}` : "/api/appointments"
    const response = await fetch(url)
    return this.handleResponse(response)
  }

  static async getAppointment(id: string) {
    const response = await fetch(`/api/appointments/${id}`)
    return this.handleResponse(response)
  }

  static async createAppointment(appointment: any) {
    console.log("📡 Enviando atendimento para API...")
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointment),
    })
    const result = await this.handleResponse(response)
    console.log("✅ Atendimento criado via API:", result.id)
    return result
  }

  static async updateAppointment(id: string, appointment: any) {
    const response = await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointment),
    })
    return this.handleResponse(response)
  }

  static async deleteAppointment(id: string) {
    const response = await fetch(`/api/appointments/${id}`, {
      method: "DELETE",
    })
    return this.handleResponse(response)
  }

  // Diagnósticos
  static async getDiagnosticos(patientId?: string) {
    const url = patientId ? `/api/diagnosticos?patientId=${patientId}` : "/api/diagnosticos"
    const response = await fetch(url)
    return this.handleResponse(response)
  }

  static async getDiagnostico(id: string) {
    const response = await fetch(`/api/diagnosticos/${id}`)
    return this.handleResponse(response)
  }

  static async createDiagnostico(diagnostico: any) {
    const response = await fetch("/api/diagnosticos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(diagnostico),
    })
    return this.handleResponse(response)
  }

  static async updateDiagnostico(id: string, diagnostico: any) {
    const response = await fetch(`/api/diagnosticos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(diagnostico),
    })
    return this.handleResponse(response)
  }

  static async deleteDiagnostico(id: string) {
    const response = await fetch(`/api/diagnosticos/${id}`, {
      method: "DELETE",
    })
    return this.handleResponse(response)
  }

  // Atendimentos
  static async getAtendimentos(diagnosticoId?: string) {
    const url = diagnosticoId ? `/api/atendimentos?diagnosticoId=${diagnosticoId}` : "/api/atendimentos"
    const response = await fetch(url)
    return this.handleResponse(response)
  }

  static async getAtendimento(id: string) {
    const response = await fetch(`/api/atendimentos/${id}`)
    return this.handleResponse(response)
  }

  static async createAtendimento(atendimento: any) {
    const response = await fetch("/api/atendimentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(atendimento),
    })
    return this.handleResponse(response)
  }

  static async updateAtendimento(id: string, atendimento: any) {
    const response = await fetch(`/api/atendimentos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(atendimento),
    })
    return this.handleResponse(response)
  }

  static async deleteAtendimento(id: string) {
    const response = await fetch(`/api/atendimentos/${id}`, {
      method: "DELETE",
    })
    return this.handleResponse(response)
  }

  // Arquivos
  static async uploadFile(file: File, appointmentId: string) {
    try {
      console.log(`🔄 Iniciando upload de ${file.name} para atendimento ${appointmentId}`)
      console.log(`📋 Arquivo: ${file.name}, Tipo: ${file.type}, Tamanho: ${file.size} bytes`)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("appointmentId", appointmentId)

      console.log(`📤 Enviando para /api/files/upload...`)

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      })

      console.log(`📡 Resposta recebida: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        console.error(`❌ Erro na resposta: Content-Type = ${contentType}`)

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Erro HTTP ${response.status}`)
        } else {
          const textResponse = await response.text()
          console.error(`❌ Resposta não-JSON:`, textResponse.substring(0, 200))

          if (textResponse.includes("<!DOCTYPE")) {
            throw new Error("Endpoint de upload não encontrado. Verifique se a API está configurada corretamente.")
          } else {
            throw new Error(`Erro do servidor: ${response.status} - ${response.statusText}`)
          }
        }
      }

      const result = await response.json()
      console.log(`✅ Upload concluído:`, result)
      return result
    } catch (error) {
      console.error(`💥 Erro no upload:`, error)
      throw error
    }
  }

  // Upload polymorphic - for diagnosticos or atendimentos
  static async uploadFilePolymorphic(
    file: File,
    entityType: "diagnostico" | "atendimento",
    entityId: string
  ) {
    try {
      console.log(`🔄 Iniciando upload de ${file.name} para ${entityType} ${entityId}`)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("entityType", entityType)
      formData.append("entityId", entityId)

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Erro HTTP ${response.status}`)
        } else {
          throw new Error(`Erro do servidor: ${response.status} - ${response.statusText}`)
        }
      }

      const result = await response.json()
      console.log(`✅ Upload concluído:`, result)
      return result
    } catch (error) {
      console.error(`💥 Erro no upload:`, error)
      throw error
    }
  }

  static async deleteFile(id: string) {
    const response = await fetch(`/api/files/${id}`, {
      method: "DELETE",
    })
    return this.handleResponse(response)
  }

  static async getFileDownloadUrl(id: string) {
    const response = await fetch(`/api/files/${id}/download`)
    return this.handleResponse(response)
  }
}
