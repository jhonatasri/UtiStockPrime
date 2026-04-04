'use client'

import { useContext, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, Download, Package } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { useListaBares } from '@/src/http/generated/bares/bares'
import { AuthContext } from '@/src/providers/AuthContext'
import { apiMutator } from '@/src/lib/api'

// ─── Tipo do item do relatório ────────────────────────────────────────────────

type RelatorioBarItem = {
  produtoId: number
  produtoNome: string
  produtoCodigo: string
  produtoUnidadeMedida: string
  totalEntrada: number
  totalSaida: number
  totalDevolucao: number
  totalSangria: number
  saldo: number
}

// ─── Hook para buscar o relatório ─────────────────────────────────────────────

function useRelatorioBar(barId: number | undefined) {
  return useQuery({
    queryKey: ['relatorioBar', barId],
    queryFn: () =>
      apiMutator<RelatorioBarItem[]>({
        url: '/relatorios/bar',
        method: 'GET',
        params: { barId },
      }),
    enabled: !!barId,
  })
}

// ─── Badge de saldo ───────────────────────────────────────────────────────────

function SaldoBadge({ saldo, unidade }: { saldo: number; unidade: string }) {
  if (saldo > 0)
    return (
      <span className="font-semibold text-[#16A34A]">
        +{saldo} {unidade.toUpperCase()}
      </span>
    )
  if (saldo < 0)
    return (
      <span className="font-semibold text-[#991B1B]">
        {saldo} {unidade.toUpperCase()}
      </span>
    )
  return (
    <span className="font-semibold text-[#6B7280]">
      0 {unidade.toUpperCase()}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RelatorioBarPage() {
  const { user } = useContext(AuthContext)

  const eventoId =
    typeof window !== 'undefined'
      ? Number(localStorage.getItem('selected-team-id')) || undefined
      : undefined

  const usuarioId = user ? Number(user.usuario.id) : undefined

  const [barId, setBarId] = useState<number | ''>('')

  const { data: bares = [] } = useListaBares(
    { eventoId, usuarioId },
    { query: { enabled: !!usuarioId } }
  )
  const baresAtivos = bares.filter((b) => b.ativo)
  const barSelecionado = baresAtivos.find((b) => b.id === barId)

  const { data: itens = [], isFetching } = useRelatorioBar(barId || undefined)

  // Totalizadores
  const totais = useMemo(
    () =>
      itens.reduce(
        (acc, i) => ({
          entrada: acc.entrada + i.totalEntrada,
          saida: acc.saida + i.totalSaida,
          devolucao: acc.devolucao + i.totalDevolucao,
          sangria: acc.sangria + i.totalSangria,
          saldo: acc.saldo + i.saldo,
        }),
        { entrada: 0, saida: 0, devolucao: 0, sangria: 0, saldo: 0 }
      ),
    [itens]
  )

  // ── Exportar Excel ──────────────────────────────────────────────────────────
  async function handleExportar() {
    const XLSX = await import('xlsx')

    const linhas = itens.map((i) => ({
      Produto: i.produtoNome,
      Código: i.produtoCodigo,
      'Unidade de Medida': i.produtoUnidadeMedida.toUpperCase(),
      'Total Entrada': i.totalEntrada,
      'Total Saída': i.totalSaida,
      'Total Devolução': i.totalDevolucao,
      'Total Sangrias (Fichas)': i.totalSangria,
      Saldo: i.saldo,
    }))

    // Linha de totais
    linhas.push({
      Produto: 'TOTAL',
      Código: '',
      'Unidade de Medida': '',
      'Total Entrada': totais.entrada,
      'Total Saída': totais.saida,
      'Total Devolução': totais.devolucao,
      'Total Sangrias (Fichas)': totais.sangria,
      Saldo: totais.saldo,
    })

    const ws = XLSX.utils.json_to_sheet(linhas)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório por Bar')

    const nomeArquivo = `relatorio-bar-${barSelecionado?.nome ?? 'desconhecido'}-${new Date().toISOString().slice(0, 10)}.xlsx`
    XLSX.writeFile(wb, nomeArquivo)
  }

  return (
    <div
      className="flex flex-col gap-5 p-6"
      style={{ backgroundColor: '#F8FAFC', minHeight: '100%' }}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1E2E]">
            Relatório por Bar
          </h1>
          <p className="text-sm text-[#6B7280]">
            Entradas, saídas, devoluções e saldo por produto
          </p>
        </div>

        <Button
          onClick={handleExportar}
          disabled={itens.length === 0}
          className="text-white"
          style={{ backgroundColor: '#253158' }}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      {/* Filtros */}
      <div className="rounded-xl border border-[#D1D5DB] bg-white p-5">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1.5 w-72">
            <label className="text-sm font-medium text-[#1F2933]">
              Bar <span className="text-red-500">*</span>
            </label>
            <select
              className="rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#253158]"
              value={barId}
              onChange={(e) =>
                setBarId(e.target.value ? Number(e.target.value) : '')
              }
            >
              <option value="">(Selecione o Bar)</option>
              {baresAtivos.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome}
                </option>
              ))}
            </select>
          </div>

          {barSelecionado && (
            <div className="flex items-center gap-2 mt-5">
              <BarChart3 className="h-4 w-4 text-[#253158]" />
              <span className="text-sm font-medium text-[#253158]">
                {barSelecionado.nome}
              </span>
              {barSelecionado.liderNome && (
                <span className="text-sm text-[#6B7280]">
                  · Líder: {barSelecionado.liderNome}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabela */}
      {!barId ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[#D1D5DB] bg-white py-20 text-center">
          <BarChart3 className="h-10 w-10 text-slate-300" />
          <p className="text-sm text-slate-400">
            Selecione um bar para visualizar o relatório.
          </p>
        </div>
      ) : isFetching ? (
        <div className="flex items-center justify-center py-20 text-sm text-slate-400">
          Carregando relatório...
        </div>
      ) : itens.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[#D1D5DB] bg-white py-20 text-center">
          <Package className="h-10 w-10 text-slate-300" />
          <p className="text-sm text-slate-400">
            Nenhum produto encontrado para este bar.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#D1D5DB] bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-[#F8FAFC]">
                <th className="px-5 py-3 text-left font-semibold text-[#1F2933]">
                  Produto
                </th>
                <th className="px-5 py-3 text-center font-semibold text-[#00A63E]">
                  Entradas
                </th>
                <th className="px-5 py-3 text-center font-semibold text-[#991B1B]">
                  Saídas
                </th>
                <th className="px-5 py-3 text-center font-semibold text-[#7CBC9E]">
                  Devoluções
                </th>
                <th className="px-5 py-3 text-center font-semibold text-[#7C3AED]">
                  Sangrias (Fichas)
                </th>
                <th className="px-5 py-3 text-center font-semibold text-[#253158]">
                  Saldo
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F3F4F6]">
              {itens.map((item) => (
                <tr
                  key={item.produtoId}
                  className="hover:bg-[#F8FAFC] transition-colors"
                >
                  <td className="px-5 py-3">
                    <p className="font-medium text-[#1F2933]">
                      {item.produtoNome}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {item.produtoCodigo}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-center font-medium text-[#00A63E]">
                    {item.totalEntrada > 0
                      ? `+${item.totalEntrada} ${item.produtoUnidadeMedida.toUpperCase()}`
                      : `—`}
                  </td>
                  <td className="px-5 py-3 text-center font-medium text-[#991B1B]">
                    {item.totalSaida > 0
                      ? `-${item.totalSaida} ${item.produtoUnidadeMedida.toUpperCase()}`
                      : `—`}
                  </td>
                  <td className="px-5 py-3 text-center font-medium text-[#7CBC9E]">
                    {item.totalDevolucao > 0
                      ? `+${item.totalDevolucao} ${item.produtoUnidadeMedida.toUpperCase()}`
                      : `—`}
                  </td>
                  <td className="px-5 py-3 text-center font-medium text-[#7C3AED]">
                    {item.totalSangria > 0
                      ? `${item.totalSangria} ${item.produtoUnidadeMedida.toUpperCase()}`
                      : `—`}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <SaldoBadge
                      saldo={item.saldo}
                      unidade={item.produtoUnidadeMedida}
                    />
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Linha de totais */}
            <tfoot>
              <tr className="border-t-2 border-[#D1D5DB] bg-[#F8FAFC]">
                <td className="px-5 py-3 font-bold text-[#0F1E2E]">Total</td>
                <td className="px-5 py-3 text-center font-bold text-[#00A63E]">
                  +{totais.entrada}
                </td>
                <td className="px-5 py-3 text-center font-bold text-[#991B1B]">
                  -{totais.saida}
                </td>
                <td className="px-5 py-3 text-center font-bold text-[#7CBC9E]">
                  +{totais.devolucao}
                </td>
                <td className="px-5 py-3 text-center font-bold text-[#7C3AED]">
                  {totais.sangria}
                </td>
                <td className="px-5 py-3 text-center">
                  <SaldoBadge saldo={totais.saldo} unidade="" />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
