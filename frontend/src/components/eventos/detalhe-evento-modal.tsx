'use client'

import { useState } from 'react'
import { CalendarDays, FileText, MapPin, Users } from 'lucide-react'
import { FiEdit } from 'react-icons/fi'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Separator } from '@/src/components/ui/separator'
import { useListaEvento } from '@/src/http/generated/eventos/eventos'
import { useListaUsuarios } from '@/src/http/generated/usuários/usuários'
import { EditaEventoModal } from './edita-evento-modal'
import { CriaEventoBodyCategoria as CategoriaEvento } from '@/src/http/generated/api.schemas'

type Props = {
  id: number | null
  open: boolean
  onClose: () => void
}

const CATEGORIA_LABELS: Record<CategoriaEvento, string> = {
  SHOW: 'Show',
  FESTIVAL: 'Festival',
  CORPORATIVO: 'Corporativo',
  PRIVADO: 'Privado',
}

export function DetalheEventoModal({ id, open, onClose }: Props) {
  const [editOpen, setEditOpen] = useState(false)

  const { data: evento, isLoading } = useListaEvento(id ?? 0, {
    query: { enabled: open && id !== null },
  })
  const { data: todosUsuarios = [] } = useListaUsuarios()

  const usuariosDoEvento = todosUsuarios.filter(u =>
    (evento?.usuariosIds ?? []).includes(u.id)
  )

  const dataFormatada = evento?.data
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(evento.data))
    : '—'

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhe do Evento</DialogTitle>
          </DialogHeader>

          {isLoading || !evento ? (
            <div className="py-12 text-center text-sm text-gray-500">Carregando...</div>
          ) : (
            <div className="flex flex-col gap-5 pb-2">
              {/* Header */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <CalendarDays size={28} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{evento.nome}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${evento.ativo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                          }`}
                      >
                        {evento.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                        {CATEGORIA_LABELS[evento.categoria as CategoriaEvento] ?? evento.categoria}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-[#253158] text-white hover:bg-[#1a2342] flex gap-1.5 items-center"
                    onClick={() => setEditOpen(true)}
                  >
                    <FiEdit size={15} />
                    Editar
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Data + Local */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Data e Hora</p>
                  <p className="text-sm font-medium text-gray-900">{dataFormatada}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Local</p>
                  <p className="text-sm font-medium text-gray-900">{evento.local}</p>
                </div>
              </div>

              {/* Informações do Evento */}
              <div className="border rounded-xl p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <MapPin size={15} className="text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Informações do Evento</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Tipo</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{CATEGORIA_LABELS[evento.categoria as CategoriaEvento] ?? evento.categoria}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Local</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{evento.local}</p>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              {evento.descricao && (
                <div className="border rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                      <FileText size={15} className="text-green-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">Descrição</span>
                  </div>
                  <p className="text-sm text-gray-700">{evento.descricao}</p>
                </div>
              )}

              {/* Usuários */}
              <div className="border rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users size={15} className="text-purple-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Usuários</span>
                  <span className="ml-auto text-xs text-gray-400">{usuariosDoEvento.length} vinculado{usuariosDoEvento.length !== 1 ? 's' : ''}</span>
                </div>

                {usuariosDoEvento.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">Nenhum usuário vinculado</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {usuariosDoEvento.map(u => (
                      <div key={u.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-xs font-semibold text-gray-500">
                          {u.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-800">{u.nome}</span>
                          <span className="text-xs text-gray-400">{u.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <EditaEventoModal
        id={id}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  )
}
