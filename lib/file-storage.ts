// Sistema de armazenamento de arquivos usando localStorage para demonstração
// Em produção, isso seria substituído pelo Supabase ou outro serviço de storage

export interface StoredFile {
  id: string
  originalName: string
  size: number
  type: string
  data: string // Base64 encoded file data
  uploadedAt: string
}

export class FileStorage {
  private static getStorageKey(patientId: string, appointmentId: string): string {
    return `files_${patientId}_${appointmentId}`
  }

  static async uploadFile(file: File, patientId: string, appointmentId: string): Promise<StoredFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        try {
          const fileData: StoredFile = {
            id: `${Date.now()}_${Math.random().toString(36).substring(2)}`,
            originalName: file.name,
            size: file.size,
            type: file.type,
            data: reader.result as string,
            uploadedAt: new Date().toISOString(),
          }

          // Salvar no localStorage
          const storageKey = this.getStorageKey(patientId, appointmentId)
          const existingFiles = this.getFiles(patientId, appointmentId)
          const updatedFiles = [...existingFiles, fileData]

          localStorage.setItem(storageKey, JSON.stringify(updatedFiles))
          resolve(fileData)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error("Erro ao ler o arquivo"))
      }

      reader.readAsDataURL(file)
    })
  }

  static getFiles(patientId: string, appointmentId: string): StoredFile[] {
    try {
      const storageKey = this.getStorageKey(patientId, appointmentId)
      const data = localStorage.getItem(storageKey)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  static downloadFile(fileId: string, patientId: string, appointmentId: string): void {
    const files = this.getFiles(patientId, appointmentId)
    const file = files.find((f) => f.id === fileId)

    if (!file) {
      throw new Error("Arquivo não encontrado")
    }

    // Criar link de download
    const link = document.createElement("a")
    link.href = file.data
    link.download = file.originalName
    link.style.display = "none"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  static deleteFile(fileId: string, patientId: string, appointmentId: string): void {
    const storageKey = this.getStorageKey(patientId, appointmentId)
    const files = this.getFiles(patientId, appointmentId)
    const updatedFiles = files.filter((f) => f.id !== fileId)

    localStorage.setItem(storageKey, JSON.stringify(updatedFiles))
  }

  static previewFile(fileId: string, patientId: string, appointmentId: string): void {
    const files = this.getFiles(patientId, appointmentId)
    const file = files.find((f) => f.id === fileId)

    if (!file) {
      throw new Error("Arquivo não encontrado")
    }

    // Para imagens, abrir em nova aba
    if (file.type.startsWith("image/")) {
      const newWindow = window.open()
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${file.originalName}</title></head>
            <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f0f0;">
              <img src="${file.data}" style="max-width:100%;max-height:100vh;object-fit:contain;" alt="${file.originalName}">
            </body>
          </html>
        `)
      }
    } else {
      // Para outros tipos, fazer download
      this.downloadFile(fileId, patientId, appointmentId)
    }
  }
}
