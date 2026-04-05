'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { DataTable } from '@/src/components/dataTable'
import { ColumnDef } from '@tanstack/react-table'
import { useListaMovimentacoesBar, useListaBar } from '@/src/http/generated/bares/bares'
import { ListaMovimentacoesBar200Item } from '@/src/http/generated/api.schemas'

function BadgeTipo({ tipo }: { tipo: string }) {
  if (tipo === 'ENTRADA') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium"
        style={{ backgroundColor: '#DCFCE7', color: '#016630' }}>
        <ArrowDownToLine className="h-3 w-3" />
        Entrada
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
      <ArrowUpFromLine className="h-3 w-3" />
      Saída
    </span>
  )
}

export default function MovimentacoesBarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const barId = Number(id)
  const router = useRouter()

  const { data: bar } = useListaBar(barId)
  const { data: movimentacoes = [] } = useListaMovimentacoesBar(barId)

  const totalEntradas = movimentacoes.filter((m) => m.tipo === 'ENTRADA').reduce((acc, m) => acc + m.quantidade, 0)
  const totalSaidas = movimentacoes.filter((m) => m.tipo === 'SAIDA').reduce((acc, m) => acc + m.quantidade, 0)

  const colunas: ColumnDef<ListaMovimentacoesBar200Item>[] = [
    {
      id: 'produto',
      header: 'Produto',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-[#1F2933]">{row.original.produtoNome}</p>
          <p className="text-xs text-[#6B7280]">
            {row.original.produtoCodigo} • {row.original.produtoCategoria}
          </p>
        </div>
      ),
    },
    {
      id: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => <BadgeTipo tipo={row.original.tipo} />,
    },
    {
      id: 'tipoMovimentacao',
      header: 'Referência',
      cell: ({ row }) => (
        <span className="text-sm text-[#374151]">
          {row.original.tipoMovimentacao ?? '—'}
        </span>
      ),
    },
    {
      id: 'quantidade',
      header: 'Quantidade',
      cell: ({ row }) => (
        <span className="font-medium"
          style={{ color: row.original.tipo === 'ENTRADA' ? '#016630' : '#991B1B' }}>
          {row.original.tipo === 'ENTRADA' ? '+' : '-'}{row.original.quantidade}{' '}
          <span className="text-xs text-[#6B7280] font-normal">
            {row.original.produtoUnidadeMedida.toUpperCase()}
          </span>
        </span>
      ),
    },
    {
      id: 'dataHora',
      header: 'Data/Hora',
      cell: ({ row }) =>
        new Date(row.original.dataHora).toLocaleString('pt-BR'),
    },
  ]

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
            Movimentações — {bar?.nome ?? '...'}
          </h1>
          <p className="text-sm text-slate-500">Histórico de entradas e saídas de produtos</p>
        </div>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total de Movimentações', value: movimentacoes.length },
          { label: 'Total Entradas (un.)', value: `+${totalEntradas}` },
          { label: 'Total Saídas (un.)', value: `-${totalSaidas}` },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-[#0F1E2E]">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="rounded-xl border bg-white shadow-sm">
        <DataTable columns={colunas} data={movimentacoes} filtro={[]} />
      </div>
    </div>
  )
}
