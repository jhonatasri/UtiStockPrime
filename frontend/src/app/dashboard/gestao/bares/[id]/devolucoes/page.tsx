'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, ChevronRight, User, UserCheck, Package, Undo2 } from 'lucide-react'
import { useListaBar } from '@/src/http/generated/bares/bares'
import { useListaDevoluCoes, useListaDevolucao } from '@/src/http/generated/devoluções/devoluções'
import { ListaDevoluCoes200Item } from '@/src/http/generated/api.schemas'

// ─── Painel expandido de uma devolução ───────────────────────────────────────

function DevolucaoDetalhe({ devolucaoId }: { devolucaoId: number }) {
  const { data: devolucao, isLoading } = useListaDevolucao(devolucaoId)

  if (isLoading) {
    return (
      <div className="px-4 py-3 text-sm text-slate-400">Carregando detalhes...</div>
    )
  }

  return (
    <div className="border-t border-[#F3F4F6] bg-[#F8FAFC] px-5 py-4 flex flex-col gap-4">
      {/* Usuário e Responsável */}
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF2FF]">
            <User className="h-3.5 w-3.5 text-[#253158]" />
          </div>
          <div>
            <p className="text-xs text-[#6B7280]">Usuário que realizou</p>
            <p className="text-sm font-medium text-[#1F2933]">{devolucao?.usuarioNome ?? '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF2FF]">
            <UserCheck className="h-3.5 w-3.5 text-[#253158]" />
          </div>
          <div>
            <p className="text-xs text-[#6B7280]">Responsável</p>
            <p className="text-sm font-medium text-[#1F2933]">{devolucao?.responsavel ?? '—'}</p>
          </div>
        </div>
        {devolucao?.observacoes && (
          <div className="flex-1 min-w-[200px]">
            <p className="text-xs text-[#6B7280]">Observações</p>
            <p className="text-sm text-[#1F2933]">{devolucao.observacoes}</p>
          </div>
        )}
      </div>

      {/* Produtos */}
      {devolucao?.itens && devolucao.itens.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Produtos Devolvidos</p>
          <div className="flex flex-col gap-1">
            {devolucao.itens.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F0FDF4]">
                    <Package className="h-3.5 w-3.5 text-[#16A34A]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1F2933]">{item.produtoNome}</p>
                    <p className="text-xs text-[#6B7280]">{item.produtoUnidadeMedida}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#16A34A]">
                  +{item.quantidade} {item.produtoUnidadeMedida.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#9CA3AF]">Nenhum produto registrado nesta devolução.</p>
      )}
    </div>
  )
}

// ─── Linha da devolução ───────────────────────────────────────────────────────

function DevolucaoRow({ devolucao }: { devolucao: ListaDevoluCoes200Item }) {
  const [aberto, setAberto] = useState(false)

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
        onClick={() => setAberto((v) => !v)}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0FDF4] shrink-0">
            <Undo2 className="h-4 w-4 text-[#16A34A]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1F2933]">
              {new Date(devolucao.dataHora).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
            <p className="text-xs text-[#6B7280]">
              {devolucao.usuarioNome ?? 'Usuário não informado'} · Resp.: {devolucao.responsavel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-medium text-[#16A34A]">
            {devolucao.totalItens} {devolucao.totalItens === 1 ? 'produto' : 'produtos'}
          </span>
          {aberto
            ? <ChevronDown className="h-4 w-4 text-slate-400" />
            : <ChevronRight className="h-4 w-4 text-slate-400" />
          }
        </div>
      </button>

      {aberto && <DevolucaoDetalhe devolucaoId={devolucao.id} />}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DevolucoesBarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const barId = Number(id)
  const router = useRouter()

  const { data: bar } = useListaBar(barId)
  const { data: devolucoes = [], isLoading } = useListaDevoluCoes({ barId })

  const totalProdutos = devolucoes.reduce((acc, d) => acc + d.totalItens, 0)

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-[#0F1E2E]">
            Devoluções — {bar?.nome ?? '...'}
          </h1>
          <p className="text-sm text-slate-500">Histórico de devoluções registradas neste bar</p>
        </div>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total de Devoluções', value: devolucoes.length },
          { label: 'Total de Produtos Devolvidos', value: totalProdutos },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-[#0F1E2E]">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Lista de devoluções */}
      {isLoading ? (
        <div className="py-10 text-center text-sm text-slate-400">Carregando devoluções...</div>
      ) : devolucoes.length === 0 ? (
        <div className="rounded-xl border bg-white px-6 py-10 text-center text-sm text-slate-400">
          Nenhuma devolução registrada para este bar.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {devolucoes.map((d) => (
            <DevolucaoRow key={d.id} devolucao={d} />
          ))}
        </div>
      )}
    </div>
  )
}
