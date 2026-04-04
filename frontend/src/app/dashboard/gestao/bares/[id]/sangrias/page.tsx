'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, ChevronRight, User, UserCheck, Package, ClipboardList } from 'lucide-react'
import { useListaBar } from '@/src/http/generated/bares/bares'
import { useListaSangrias, useListaSangria } from '@/src/http/generated/sangrias/sangrias'
import { ListaSangrias200Item } from '@/src/http/generated/api.schemas'

// ─── Badge de status ──────────────────────────────────────────────────────────

function BadgeStatus({ status }: { status: string }) {
  if (status === 'FINALIZADA') {
    return (
      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
        style={{ backgroundColor: '#DCFCE7', color: '#016630' }}>
        Finalizada
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: '#FEF9C3', color: '#854D0E' }}>
      Em Aberto
    </span>
  )
}

// ─── Painel expandido de uma sangria ─────────────────────────────────────────

function SangriaDetalhe({ sangriaId }: { sangriaId: number }) {
  const { data: sangria, isLoading } = useListaSangria(sangriaId)

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
            <p className="text-sm font-medium text-[#1F2933]">{sangria?.usuarioNome ?? '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF2FF]">
            <UserCheck className="h-3.5 w-3.5 text-[#253158]" />
          </div>
          <div>
            <p className="text-xs text-[#6B7280]">Responsável acompanhou</p>
            <p className="text-sm font-medium text-[#1F2933]">{sangria?.responsavel ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Produtos */}
      {sangria?.itens && sangria.itens.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Produtos Contados</p>
          <div className="flex flex-col gap-1">
            {sangria.itens.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF2FF]">
                    <Package className="h-3.5 w-3.5 text-[#253158]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1F2933]">{item.produtoNome}</p>
                    <p className="text-xs text-[#6B7280]">{item.produtoUnidadeMedida}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#253158]">{item.quantidade} un.</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#9CA3AF]">Nenhum produto registrado nesta sangria.</p>
      )}
    </div>
  )
}

// ─── Linha da sangria ─────────────────────────────────────────────────────────

function SangriaRow({ sangria }: { sangria: ListaSangrias200Item }) {
  const [aberto, setAberto] = useState(false)

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
        onClick={() => setAberto((v) => !v)}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF2FF] shrink-0">
            <ClipboardList className="h-4 w-4 text-[#253158]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1F2933]">
              {new Date(sangria.dataHora).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
            <p className="text-xs text-[#6B7280]">
              {sangria.usuarioNome ?? 'Usuário não informado'} · Resp.: {sangria.responsavel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <BadgeStatus status={sangria.status} />
          <span className="text-sm font-medium text-[#253158]">
            {sangria.valorTotal} un.
          </span>
          {aberto
            ? <ChevronDown className="h-4 w-4 text-slate-400" />
            : <ChevronRight className="h-4 w-4 text-slate-400" />
          }
        </div>
      </button>

      {aberto && <SangriaDetalhe sangriaId={sangria.id} />}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SangriasBarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const barId = Number(id)
  const router = useRouter()

  const { data: bar } = useListaBar(barId)
  const { data: sangrias = [], isLoading } = useListaSangrias({ barId })

  const finalizadas = sangrias.filter((s) => s.status === 'FINALIZADA').length
  const abertas = sangrias.filter((s) => s.status === 'ABERTA').length
  const totalProdutos = sangrias.reduce((acc, s) => acc + s.valorTotal, 0)

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
            Sangrias — {bar?.nome ?? '...'}
          </h1>
          <p className="text-sm text-slate-500">Histórico de sangrias realizadas neste bar</p>
        </div>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total de Sangrias', value: sangrias.length },
          { label: 'Finalizadas', value: finalizadas },
          { label: 'Em Aberto', value: abertas },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-[#0F1E2E]">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Lista de sangrias */}
      {isLoading ? (
        <div className="py-10 text-center text-sm text-slate-400">Carregando sangrias...</div>
      ) : sangrias.length === 0 ? (
        <div className="rounded-xl border bg-white px-6 py-10 text-center text-sm text-slate-400">
          Nenhuma sangria registrada para este bar.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sangrias.map((s) => (
            <SangriaRow key={s.id} sangria={s} />
          ))}
        </div>
      )}
    </div>
  )
}
