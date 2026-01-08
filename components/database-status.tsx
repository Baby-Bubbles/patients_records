"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, CheckCircle, XCircle, Info, RefreshCw } from "lucide-react"
import { DatabaseDiagnostics } from "@/lib/database-diagnostics"

interface DatabaseStatusProps {
  isConnected: boolean
  onRefresh: () => void
}

export function DatabaseStatus({ isConnected, onRefresh }: DatabaseStatusProps) {
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null)
  const [systemInfo, setSystemInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const runDiagnostic = async () => {
    setLoading(true)
    try {
      const [diagnostic, info] = await Promise.all([
        DatabaseDiagnostics.runFullDiagnostic(),
        DatabaseDiagnostics.getSystemInfo(),
      ])
      setDiagnosticResults(diagnostic)
      setSystemInfo(info)
      setShowDetails(true)
    } catch (error) {
      alert(`Erro no diagnóstico: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className={`h-5 w-5 ${isConnected ? "text-green-600" : "text-red-600"}`} />
          Status do Banco de Dados
        </CardTitle>
        <CardDescription>Verificação da conexão e configuração do Supabase</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">Conectado</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-600 font-medium">Desconectado</span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={runDiagnostic} disabled={loading}>
              <Info className="h-4 w-4 mr-1" />
              Diagnóstico Completo
            </Button>
          </div>
        </div>

        {showDetails && systemInfo && (
          <div className="space-y-3">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div>
                    <strong>URL do Supabase:</strong> {systemInfo.supabaseUrl}
                  </div>
                  <div>
                    <strong>Chave Anônima:</strong> {systemInfo.hasAnonKey ? "✅ Configurada" : "❌ Não configurada"}
                  </div>
                  <div>
                    <strong>Registros nas tabelas:</strong>
                    <div className="flex gap-2 mt-1">
                      {Object.entries(systemInfo.tablesCount).map(([table, count]) => (
                        <Badge key={table} variant={count === -1 ? "destructive" : "secondary"}>
                          {table}: {count === -1 ? "Erro" : count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {diagnosticResults && (
          <div className="space-y-2">
            <h4 className="font-medium">Resultados do Diagnóstico:</h4>
            <div className="space-y-1">
              {diagnosticResults.results.map((result: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{result.test}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{result.status}</span>
                    <span className="text-xs text-gray-600">{result.message}</span>
                  </div>
                </div>
              ))}
            </div>
            <Alert variant={diagnosticResults.success ? "default" : "destructive"}>
              <AlertDescription>
                {diagnosticResults.success
                  ? "🎉 Todos os testes passaram! O sistema está funcionando corretamente."
                  : "⚠️ Alguns testes falharam. Verifique a configuração do Supabase."}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {!isConnected && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  <strong>Problemas de conexão detectados.</strong> Verifique:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>
                    Se as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão
                    configuradas
                  </li>
                  <li>Se os scripts SQL foram executados no Supabase SQL Editor</li>
                  <li>Se o projeto Supabase está ativo</li>
                  <li>Se as políticas RLS estão configuradas corretamente</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
