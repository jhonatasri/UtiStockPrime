'use client'

import { useState } from 'react'
import { User, Shield, FileText, CheckCircle2 } from 'lucide-react'
import { FiEdit } from 'react-icons/fi'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Separator } from '@/src/components/ui/separator'
import { useListaUsuario } from '@/src/http/generated/usuários/usuários'
import { EditaUsuarioModal } from './edita-usuario-modal'

type Props = {
  id: number | null
  open: boolean
  onClose: () => void
}

const FUNCAO_LABELS: Record<string, string> = {
  ADMINISTRADOR: 'Administrador',
  GESTOR: 'Gestor',
  COORDENADOR_BAR: 'Coordenador Bar',
  COORDENADOR_ESTOQUE: 'Coordenador Estoque',
}

const FUNCAO_DESCRICAO: Record<string, string> = {
  ADMINISTRADOR: 'Acesso total ao sistema, incluindo configurações e gestão de usuários',
  GESTOR: 'Gerencia operações de estoque e coordena equipes',
  COORDENADOR_BAR: 'Coordena operações do bar e movimentações relacionadas',
  COORDENADOR_ESTOQUE: 'Coordena as movimentações e organização do estoque',
}

const FUNCAO_PERMISSOES: Record<string, { label: string; descricao: string }[]> = {
  ADMINISTRADOR: [
    { label: 'Acesso a Relatórios', descricao: 'Visualizar e exportar relatórios' },
    { label: 'Gestão de Usuários', descricao: 'Criar e gerenciar usuários' },
    { label: 'Movimentações de Estoque', descricao: 'Registrar entradas e saídas' },
    { label: 'Configurações do Sistema', descricao: 'Alterar configurações gerais' },
  ],
  GESTOR: [
    { label: 'Acesso a Relatórios', descricao: 'Visualizar e exportar relatórios' },
    { label: 'Movimentações de Estoque', descricao: 'Registrar entradas e saídas' },
  ],
  COORDENADOR_BAR: [
    { label: 'Gestão de Produtos (Bar)', descricao: 'Gerenciar produtos do bar' },
    { label: 'Movimentações de Estoque', descricao: 'Registrar entradas e saídas' },
  ],
  COORDENADOR_ESTOQUE: [
    { label: 'Gestão de Estoque', descricao: 'Gerenciar itens do estoque' },
    { label: 'Movimentações de Estoque', descricao: 'Registrar entradas e saídas' },
    { label: 'Organização', descricao: 'Organizar categorias e localizações' },
  ],
}

export function DetalheUsuarioModal({ id, open, onClose }: Props) {
  const [editOpen, setEditOpen] = useState(false)

  const { data: usuario, isLoading } = useListaUsuario(id ?? 0, {
    query: { enabled: open && id !== null },
  })

  const funcao = String(usuario?.funcao ?? '')
  const funcaoLabel = FUNCAO_LABELS[funcao] ?? funcao
  const permissoes = FUNCAO_PERMISSOES[funcao] ?? []

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhe do Usuário</DialogTitle>
        </DialogHeader>

        {isLoading || !usuario ? (
          <div className="py-12 text-center text-sm text-gray-500">Carregando...</div>
        ) : (
          <div className="flex flex-col gap-5 pb-2">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User size={28} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{usuario.nome}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${usuario.ativo
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                        }`}
                    >
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                    {funcaoLabel && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">
                        {funcaoLabel}
                      </span>
                    )}
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

            {/* Email + Telefone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">E-mail</p>
                <p className="text-sm font-medium text-gray-900">{usuario.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Telefone</p>
                <p className="text-sm font-medium text-gray-900">{usuario.telefone}</p>
              </div>
            </div>

            {/* Perfil e Permissões */}
            <div className="border rounded-xl p-4 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
                  <Shield size={15} className="text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-gray-800">Perfil e Permissões</span>
              </div>

              {funcaoLabel && (
                <>
                  <div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-purple-100 text-purple-700">
                      {funcaoLabel}
                    </span>
                    {FUNCAO_DESCRICAO[funcao] && (
                      <p className="text-xs text-gray-500 mt-2">{FUNCAO_DESCRICAO[funcao]}</p>
                    )}
                  </div>

                  {permissoes.length > 0 && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {permissoes.map((p) => (
                          <div
                            key={p.label}
                            className="flex items-start gap-2 bg-gray-50 rounded-lg p-3"
                          >
                            <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-800">{p.label}</p>
                              <p className="text-xs text-gray-500">{p.descricao}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Informações Adicionais */}
            {(usuario.descricao || funcaoLabel) && (
              <div className="border rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                    <FileText size={15} className="text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Informações Adicionais</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Cargo / Função</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{funcaoLabel || '—'}</p>
                </div>
                {usuario.descricao && (
                  <div>
                    <p className="text-xs text-gray-500">Descrição</p>
                    <p className="text-sm text-gray-700 mt-0.5">{usuario.descricao}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>

    <EditaUsuarioModal
      id={id}
      open={editOpen}
      onClose={() => setEditOpen(false)}
    />
    </>
  )
}
