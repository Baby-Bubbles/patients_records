"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Plus, ChevronRight, Stethoscope, Trash2 } from "lucide-react"
import type { Diagnostico, Atendimento } from "@/app/page"
import { formatDateToBR, formatDateTimeToBR } from "@/lib/date-utils"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

interface DiagnosticoListProps {
  diagnosticos: Diagnostico[]
  atendimentos: Atendimento[]
  onSelectDiagnostico: (diagnostico: Diagnostico) => void
  onNewDiagnostico: () => void
  onDeleteDiagnostico?: (id: string) => Promise<void>
  getDiagnosticoAtendimentos: (diagnosticoId: string) => Atendimento[]
}

export function DiagnosticoList({
  diagnosticos,
  atendimentos,
  onSelectDiagnostico,
  onNewDiagnostico,
  onDeleteDiagnostico,
  getDiagnosticoAtendimentos,
}: DiagnosticoListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [diagnosticoToDelete, setDiagnosticoToDelete] = useState<string | null>(null)

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDiagnosticoToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (diagnosticoToDelete && onDeleteDiagnostico) {
      await onDeleteDiagnostico(diagnosticoToDelete)
    }
    setDeleteDialogOpen(false)
    setDiagnosticoToDelete(null)
  }
  const sortedDiagnosticos = [...diagnosticos].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  )

  if (diagnosticos.length === 0) {
    return (
      <div className="text-center py-12">
        <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum diagnóstico registrado</h3>
        <p className="text-gray-600 mb-4">Comece adicionando o primeiro diagnóstico deste paciente.</p>
        <Button onClick={onNewDiagnostico}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Diagnóstico
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Diagnósticos</h3>
        <Button onClick={onNewDiagnostico} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Diagnóstico
        </Button>
      </div>

      <div className="space-y-3">
        {sortedDiagnosticos.map((diagnostico) => {
          const diagAtendimentos = getDiagnosticoAtendimentos(diagnostico.id)
          const isActive = !diagnostico.dischargeDate

          return (
            <Card
              key={diagnostico.id}
              className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${
                isActive ? "border-l-primary" : "border-l-gray-300"
              }`}
              onClick={() => onSelectDiagnostico(diagnostico)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                        {isActive ? "Em tratamento" : "Alta"}
                      </Badge>
                      {diagnostico.diagnosis && (
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {diagnostico.diagnosis.length > 50
                            ? diagnostico.diagnosis.substring(0, 50) + "..."
                            : diagnostico.diagnosis}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Início: {formatDateToBR(diagnostico.startDate)}</span>
                      </div>
                      {diagnostico.dischargeDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Alta: {formatDateToBR(diagnostico.dischargeDate)}</span>
                        </div>
                      )}
                      {diagnostico.doctor && (
                        <span className="text-gray-500">Dr(a). {diagnostico.doctor}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        {diagAtendimentos.length} atendimento{diagAtendimentos.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {onDeleteDiagnostico && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteClick(diagnostico.id, e)}
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Diagnóstico"
        description="Todos os atendimentos deste diagnóstico serão excluídos permanentemente. Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
