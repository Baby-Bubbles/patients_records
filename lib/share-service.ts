// Serviço dedicado para funcionalidade de compartilhamento
export interface ShareTokenData {
  patientId: string
  timestamp: number
  password: string
  expiresAt: number
}

export class ShareService {
  // Gerar token de compartilhamento seguro
  static generateShareToken(patientId: string, password: string): string {
    try {
      const now = Date.now()
      const expiresAt = now + 30 * 24 * 60 * 60 * 1000 // 30 dias

      const tokenData: ShareTokenData = {
        patientId: patientId.trim(),
        timestamp: now,
        password: password.trim(),
        expiresAt,
      }

      console.log("🔗 Gerando token:", {
        patientId: tokenData.patientId,
        timestamp: new Date(tokenData.timestamp).toLocaleString(),
        expiresAt: new Date(tokenData.expiresAt).toLocaleString(),
        hasPassword: !!tokenData.password,
      })

      const jsonString = JSON.stringify(tokenData)
      const encoded = btoa(encodeURIComponent(jsonString))

      // Tornar URL-safe
      return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
    } catch (error) {
      console.error("❌ Erro ao gerar token:", error)
      throw new Error("Erro ao gerar token de compartilhamento")
    }
  }

  // Validar token de compartilhamento
  static validateShareToken(token: string, password: string): ShareTokenData | null {
    try {
      console.log("🔍 Validando token...")

      // Restaurar caracteres do base64
      let normalizedToken = token.replace(/-/g, "+").replace(/_/g, "/")

      // Adicionar padding se necessário
      while (normalizedToken.length % 4) {
        normalizedToken += "="
      }

      const decoded = atob(normalizedToken)
      const decompressed = decodeURIComponent(decoded)
      const tokenData: ShareTokenData = JSON.parse(decompressed)

      console.log("📋 Dados do token:", {
        patientId: tokenData.patientId,
        timestamp: new Date(tokenData.timestamp).toLocaleString(),
        expiresAt: new Date(tokenData.expiresAt).toLocaleString(),
        hasPassword: !!tokenData.password,
      })

      // Verificar senha
      if (tokenData.password.trim() !== password.trim()) {
        console.log("❌ Senha incorreta")
        return null
      }

      // Verificar expiração
      const now = Date.now()
      if (now > tokenData.expiresAt) {
        console.log("❌ Token expirado")
        return null
      }

      console.log("✅ Token válido!")
      return tokenData
    } catch (error) {
      console.error("💥 Erro ao validar token:", error)
      return null
    }
  }

  // Verificar se token é válido (sem senha) - versão mais robusta
  static isTokenValid(token: string): { valid: boolean; error?: string } {
    try {
      if (!token || typeof token !== "string") {
        return { valid: false, error: "Token não fornecido" }
      }

      // Restaurar caracteres do base64
      let normalizedToken = token.replace(/-/g, "+").replace(/_/g, "/")

      // Adicionar padding se necessário
      while (normalizedToken.length % 4) {
        normalizedToken += "="
      }

      console.log("🔍 Verificando token:", token.substring(0, 20) + "...")

      const decoded = atob(normalizedToken)
      const decompressed = decodeURIComponent(decoded)
      const tokenData: ShareTokenData = JSON.parse(decompressed)

      // Verificar se tem os campos necessários
      if (!tokenData.patientId || !tokenData.password || !tokenData.expiresAt) {
        return { valid: false, error: "Token malformado" }
      }

      // Verificar expiração
      const now = Date.now()
      if (now > tokenData.expiresAt) {
        return { valid: false, error: "Token expirado" }
      }

      console.log("✅ Token estruturalmente válido")
      return { valid: true }
    } catch (error) {
      console.error("❌ Erro ao verificar token:", error)
      return { valid: false, error: "Token inválido ou corrompido" }
    }
  }

  // Decodificar token sem validar senha (para debug)
  static decodeToken(token: string): ShareTokenData | null {
    try {
      let normalizedToken = token.replace(/-/g, "+").replace(/_/g, "/")
      while (normalizedToken.length % 4) {
        normalizedToken += "="
      }

      const decoded = atob(normalizedToken)
      const decompressed = decodeURIComponent(decoded)
      return JSON.parse(decompressed)
    } catch {
      return null
    }
  }
}
