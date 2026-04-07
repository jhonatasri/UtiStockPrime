'use client'

import { useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Store,
  Package,
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  Undo2,
  TrendingUp,
  TrendingDown,
  CalendarCheck,
} from 'lucide-react'
import { AuthContext } from '@/src/providers/AuthContext'
import { apiMutator } from '@/src/lib/api'

// ─── Tipo do resumo ───────────────────────────────────────────────────────────

type DashboardData = {
  totalBares: number
  baresAbertos: number
  baresFechados: number
  baresInativos: number
  totalProdutos: number
  totalEntradas: number
  totalQuantidadeEntradas: number
  totalSaidas: number
  totalQuantidadeSaidas: number
  totalSangrias: number
  totalDevolucoes: number
  ultimasMovimentacoes: {
    id: number
    tipo: 'ENTRADA' | 'SAIDA'
    dataHora: string
    totalItens: number
    totalQuantidade: number
    descricao: string | null
  }[]
}

function useDashboard(eventoId: number | undefined) {
  return useQuery({
    queryKey: ['dashboard', eventoId],
    enabled: !!eventoId,
    queryFn: () =>
      apiMutator<DashboardData>({
        url: '/dashboard',
        method: 'GET',
        params: { eventoId },
      }),
  })
}

// ─── Card KPI ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string
  value: number | string
  sub?: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: iconBg }}
      >
        <Icon className="h-5 w-5" style={{ color: iconColor }} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-[#6B7280]">{label}</p>
        <p className="text-2xl font-bold text-[#0F1E2E]">{value}</p>
        {sub && <p className="text-xs text-[#9CA3AF]">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Linha de movimentação ────────────────────────────────────────────────────

function MovimentacaoRow({
  item,
}: {
  item: DashboardData['ultimasMovimentacoes'][0]
}) {
  const isEntrada = item.tipo === 'ENTRADA'
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#F3F4F6] last:border-0">
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: isEntrada ? '#F0FDF4' : '#FEF2F2' }}
        >
          {isEntrada ? (
            <TrendingUp className="h-4 w-4" style={{ color: '#16A34A' }} />
          ) : (
            <TrendingDown className="h-4 w-4" style={{ color: '#DC2626' }} />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-[#1F2933]">
            {isEntrada ? 'Entrada' : 'Saída'}
            {item.descricao ? ` · ${item.descricao}` : ''}
          </p>
          <p className="text-xs text-[#9CA3AF]">
            {new Date(item.dataHora).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <span
          className="text-sm font-semibold"
          style={{ color: isEntrada ? '#16A34A' : '#DC2626' }}
        >
          {isEntrada ? '+' : '-'}{item.totalQuantidade} un.
        </span>
        <p className="text-xs text-[#9CA3AF]">{item.totalItens} {item.totalItens === 1 ? 'produto' : 'produtos'}</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useContext(AuthContext)

  const eventoId =
    typeof window !== 'undefined'
      ? Number(localStorage.getItem('selected-team-id')) || undefined
      : undefined

  const { data, isLoading } = useDashboard(eventoId)

  const nomeEvento =
    typeof window !== 'undefined'
      ? localStorage.getItem('selected-team-name') ?? 'Evento'
      : 'Evento'

  if (!eventoId) {
    return (
      <div className="flex flex-col h-64 items-center justify-center gap-3 text-[#9CA3AF]">
        <CalendarCheck className="h-10 w-10 opacity-40" />
        <p className="text-sm font-medium">Nenhum evento selecionado</p>
        <p className="text-xs">Selecione um evento no menu lateral para visualizar os dados.</p>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[#9CA3AF]">
        Carregando dashboard...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6" style={{ backgroundColor: '#F8FAFC', minHeight: '100%' }}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F1E2E]">Dashboard</h1>
        <p className="text-sm text-[#6B7280]">
          Visão geral do evento{eventoId ? ` · ${nomeEvento}` : ''}
        </p>
      </div>

      {/* KPIs — linha 1 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard
          label="Total de Bares"
          value={data.totalBares}
          sub={`${data.baresAbertos} abertos · ${data.baresFechados} fechados`}
          icon={Store}
          iconBg="#EEF2FF"
          iconColor="#4F46E5"
        />
        <KpiCard
          label="Bares Abertos"
          value={data.baresAbertos}
          sub={`${data.baresInativos} inativos`}
          icon={Store}
          iconBg="#F0FDF4"
          iconColor="#16A34A"
        />
        <KpiCard
          label="Produtos Cadastrados"
          value={data.totalProdutos}
          icon={Package}
          iconBg="#FFF7ED"
          iconColor="#EA580C"
        />
        <KpiCard
          label="Sangrias"
          value={data.totalSangrias}
          sub="total de fichas"
          icon={Banknote}
          iconBg="#F5F3FF"
          iconColor="#7C3AED"
        />
      </div>

      {/* KPIs — linha 2 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard
          label="Entradas"
          value={data.totalEntradas}
          sub={`${data.totalQuantidadeEntradas} unidades no total`}
          icon={ArrowDownCircle}
          iconBg="#F0FDF4"
          iconColor="#16A34A"
        />
        <KpiCard
          label="Saídas"
          value={data.totalSaidas}
          sub={`${data.totalQuantidadeSaidas} unidades no total`}
          icon={ArrowUpCircle}
          iconBg="#FEF2F2"
          iconColor="#DC2626"
        />
        <KpiCard
          label="Devoluções"
          value={data.totalDevolucoes}
          icon={Undo2}
          iconBg="#F0FDFA"
          iconColor="#0D9488"
        />
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm flex flex-col justify-between">
          <p className="text-sm text-[#6B7280]">Saldo líquido de unidades</p>
          <p
            className="text-2xl font-bold"
            style={{
              color:
                data.totalQuantidadeEntradas - data.totalQuantidadeSaidas >= 0
                  ? '#16A34A'
                  : '#DC2626',
            }}
          >
            {data.totalQuantidadeEntradas - data.totalQuantidadeSaidas >= 0 ? '+' : ''}
            {data.totalQuantidadeEntradas - data.totalQuantidadeSaidas}
          </p>
          <p className="text-xs text-[#9CA3AF]">entradas − saídas</p>
        </div>
      </div>

      {/* Atividade recente */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="px-5 py-4 border-b border-[#F3F4F6]">
          <h2 className="text-base font-semibold text-[#0F1E2E]">Atividade Recente</h2>
          <p className="text-xs text-[#9CA3AF]">Últimas movimentações de entrada e saída</p>
        </div>
        <div className="px-5">
          {data.ultimasMovimentacoes.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#9CA3AF]">
              Nenhuma movimentação registrada.
            </p>
          ) : (
            data.ultimasMovimentacoes.map((m) => (
              <MovimentacaoRow key={`${m.tipo}-${m.id}`} item={m} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
