"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatabaseStatus } from "@/components/database-status"
import { Navbar } from "@/components/navbar"
import { testConnection } from "@/lib/supabase-client"

export default function DiagnosticsPage() {
  const [dbConnected, setDbConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      setLoading(true)
      const connected = await testConnection()
      setDbConnected(connected)
    } catch (error) {
      console.error("Erro ao verificar conexão:", error)
      setDbConnected(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full">
      <Navbar />

      <div className="py-6 sm:py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Diagnóstico do Sistema</h1>
            <p className="text-gray-600 mt-1">Verificação completa da conectividade e configuração</p>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <DatabaseStatus isConnected={dbConnected} onRefresh={checkConnection} />

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Informações do Sistema</CardTitle>
                <CardDescription>Detalhes técnicos e configuração</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Ambiente</h4>
                      <p className="text-sm text-gray-600">
                        <strong>Node.js:</strong> {typeof window !== "undefined" ? "Cliente" : "Servidor"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Timestamp:</strong> {new Date().toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Configuração</h4>
                      <p className="text-sm text-gray-600">
                        <strong>Supabase URL:</strong>{" "}
                        {process.env.NEXT_PUBLIC_db2_SUPABASE_URL ? "✅ Configurado" : "❌ Não configurado"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Chave Pública:</strong>{" "}
                        {process.env.NEXT_PUBLIC_db2_SUPABASE_PUBLISHABLE_KEY ? "✅ Configurada" : "❌ Não configurada"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-primary/10 p-4 rounded-lg">
                    <h4 className="font-medium text-secondary mb-2">Como resolver problemas comuns:</h4>
                    <ul className="text-sm text-secondary/90 space-y-1">
                      <li>
                        • <strong>Conexão falhando:</strong> Verifique as variáveis de ambiente
                      </li>
                      <li>
                        • <strong>Tabelas não encontradas:</strong> Execute os scripts SQL no Supabase
                      </li>
                      <li>
                        • <strong>Upload de arquivos:</strong> Verifique se o bucket 'medical-files' existe
                      </li>
                      <li>
                        • <strong>Permissões:</strong> Confirme se as políticas RLS estão configuradas
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
