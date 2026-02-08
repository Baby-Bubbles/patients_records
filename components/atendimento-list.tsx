"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Edit, Plus, Clock, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Atendimento } from "@/app/page"
import { formatDateTimeToBR } from "@/lib/date-utils"
import { FileList } from "@/components/file-list"

interface AtendimentoListProps {
  atendimentos: Atendimento[]
  patientId: string
  onNewAtendimento: () => void
  onEditAtendimento: (atendimento: Atendimento) => void
  onDeleteAtendimento?: (id: string) => void
}

export function AtendimentoList({
  atendimentos,
  patientId,
  onNewAtendimento,
  onEditAtendimento,
  onDeleteAtendimento,
}: AtendimentoListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [atendimentoToDelete, setAtendimentoToDelete] = useState<string | null>(null)

  const sortedAtendimentos = [...atendimentos].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setAtendimentoToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (atendimentoToDelete && onDeleteAtendimento) {
      onDeleteAtendimento(atendimentoToDelete)
    }
    setDeleteDialogOpen(false)
    setAtendimentoToDelete(null)
  }

  if (atendimentos.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <h3 className="text-base font-medium text-gray-900 mb-2">Nenhum atendimento registrado</h3>
        <p className="text-gray-600 mb-4 text-sm">Registre o primeiro atendimento deste diagnóstico.</p>
        <Button onClick={onNewAtendimento} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Atendimento
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-base font-semibold text-gray-900">
          Atendimentos ({atendimentos.length})
        </h4>
        <Button onClick={onNewAtendimento} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Atendimento
        </Button>
      </div>

      <div className="space-y-3">
        {sortedAtendimentos.map((atendimento) => (
          <Card key={atendimento.id} className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {formatDateTimeToBR(atendimento.date)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditAtendimento(atendimento)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  {onDeleteAtendimento && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteClick(atendimento.id, e)}
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Sinais Vitais */}
              {(atendimento.heartRate ||
                atendimento.respiratoryRate ||
                atendimento.saturation ||
                atendimento.temperature) && (
                <div className="bg-primary/10 p-3 rounded mb-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    {atendimento.heartRate && (
                      <div>
                        <p className="text-xs text-gray-500">FC</p>
                        <p className="text-sm font-medium">{atendimento.heartRate} bpm</p>
                      </div>
                    )}
                    {atendimento.respiratoryRate && (
                      <div>
                        <p className="text-xs text-gray-500">FR</p>
                        <p className="text-sm font-medium">{atendimento.respiratoryRate} rpm</p>
                      </div>
                    )}
                    {atendimento.saturation && (
                      <div>
                        <p className="text-xs text-gray-500">Saturação</p>
                        <p className="text-sm font-medium">{atendimento.saturation}%</p>
                      </div>
                    )}
                    {atendimento.temperature && (
                      <div>
                        <p className="text-xs text-gray-500">Temperatura</p>
                        <p className="text-sm font-medium">{atendimento.temperature}°C</p>
                      </div>
                    )}
                  </div>
                  {atendimento.cardiacAuscultation && (
                    <div className="mt-2 pt-2 border-t border-primary/20">
                      <p className="text-xs text-gray-500">Ausculta Cardíaca:</p>
                      <p className="text-sm text-gray-700">{atendimento.cardiacAuscultation}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Evolução */}
              {atendimento.evolution && (
                <div className="mb-3">
                  <h5 className="text-xs font-semibold text-gray-600 mb-1">Evolução/Condutas:</h5>
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{atendimento.evolution}</p>
                </div>
              )}

              {/* Orientações */}
              {atendimento.additionalGuidance && (
                <div className="mb-3">
                  <h5 className="text-xs font-semibold text-gray-600 mb-1">Orientações:</h5>
                  <p className="text-sm text-gray-700 bg-yellow-50 p-2 rounded">{atendimento.additionalGuidance}</p>
                </div>
              )}

              {/* Anexos */}
              {atendimento.attachments && atendimento.attachments.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-600 mb-1">Anexos:</h5>
                  <FileList
                    files={atendimento.attachments}
                    patientId={patientId}
                    showDeleteButton={false}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Atendimento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este atendimento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Excluir
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
