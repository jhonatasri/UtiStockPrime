'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Package, AlertTriangle } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { apiMutator } from '@/src/lib/api'

// ─── Tipo do item do relatório ────────────────────────────────────────────────

type RelatorioEstoqueItem = {
  produtoId: number
  produtoNome: string
  produtoCodigo: string
  produtoUnidadeMedida: string
  produtoQuantidadeMinima: number
  totalEntrada: number
  totalSaida: number
  totalSangria: number
  totalDevolucao: number
  estoqueTotal: number
  alerta: 'BOM' | 'BAIXO' | 'CRITICO'
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useRelatorioEstoque(eventoId: number | undefined) {
  return useQuery({
    queryKey: ['relatorioEstoque', eventoId],
    queryFn: () =>
      apiMutator<RelatorioEstoqueItem[]>({
        url: '/relatorios/estoque',
        method: 'GET',
        params: { eventoId },
      }),
    enabled: !!eventoId,
  })
}

// ─── Badge de alerta ──────────────────────────────────────────────────────────

function AlertaBadge({ alerta }: { alerta: 'BOM' | 'BAIXO' | 'CRITICO' }) {
  if (alerta === 'BOM')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
        Bom
      </span>
    )
  if (alerta === 'BAIXO')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
        <AlertTriangle className="h-3 w-3" />
        Baixo
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
      <AlertTriangle className="h-3 w-3" />
      Crítico
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RelatorioEstoquePage() {
  const [eventoId, setEventoId] = useState<number | undefined>(undefined)

  useEffect(() => {
    setEventoId(Number(localStorage.getItem('selected-team-id')) || undefined)
  }, [])

  const { data: itens = [], isFetching } = useRelatorioEstoque(eventoId)

  const totais = itens.reduce(
    (acc, i) => ({
      entrada: acc.entrada + i.totalEntrada,
      saida: acc.saida + i.totalSaida,
      sangria: acc.sangria + i.totalSangria,
      devolucao: acc.devolucao + i.totalDevolucao,
      estoque: acc.estoque + i.estoqueTotal,
    }),
    { entrada: 0, saida: 0, sangria: 0, devolucao: 0, estoque: 0 }
  )

  const countAlerta = {
    BOM: itens.filter((i) => i.alerta === 'BOM').length,
    BAIXO: itens.filter((i) => i.alerta === 'BAIXO').length,
    CRITICO: itens.filter((i) => i.alerta === 'CRITICO').length,
  }

  async function handleExportar() {
    const XLSX = await import('xlsx')

    const linhas = itens.map((i) => ({
      Produto: i.produtoNome,
      Código: i.produtoCodigo,
      'Unidade de Medida': i.produtoUnidadeMedida.toUpperCase(),
      'Qtd. Mínima': i.produtoQuantidadeMinima,
      'Total Entrada': i.totalEntrada,
      'Total Saída': i.totalSaida,
      'Total Sangria (Fichas)': i.totalSangria,
      'Total Devolução': i.totalDevolucao,
      'Estoque Total': i.estoqueTotal,
      'Alerta de Estoque': i.alerta === 'BOM' ? 'Bom' : i.alerta === 'BAIXO' ? 'Baixo' : 'Crítico',
    }))

    linhas.push({
      Produto: 'TOTAL',
      Código: '',
      'Unidade de Medida': '',
      'Qtd. Mínima': 0,
      'Total Entrada': totais.entrada,
      'Total Saída': totais.saida,
      'Total Sangria (Fichas)': totais.sangria,
      'Total Devolução': totais.devolucao,
      'Estoque Total': totais.estoque,
      'Alerta de Estoque': '',
    })

    const ws = XLSX.utils.json_to_sheet(linhas)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório de Estoque')

    const nomeArquivo = `relatorio-estoque-${new Date().toISOString().slice(0, 10)}.xlsx`
    XLSX.writeFile(wb, nomeArquivo)
  }

  return (
    <div
      className="flex flex-col gap-5 p-6"
      style={{ backgroundColor: '#F8FAFC', minHeight: '100%' }}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1E2E]">
            Relatório de Estoque
          </h1>
          <p className="text-sm text-[#6B7280]">
            Visão geral do estoque por produto no evento selecionado
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

      {/* Resumo de alertas */}
      {itens.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4">
            <p className="text-xs font-medium text-green-600">Estoque Bom</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{countAlerta.BOM}</p>
            <p className="text-xs text-green-600 mt-0.5">produtos</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-xs font-medium text-amber-600">Estoque Baixo</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{countAlerta.BAIXO}</p>
            <p className="text-xs text-amber-600 mt-0.5">produtos</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-xs font-medium text-red-600">Estoque Crítico</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{countAlerta.CRITICO}</p>
            <p className="text-xs text-red-600 mt-0.5">produtos</p>
          </div>
        </div>
      )}

      {/* Tabela */}
      {!eventoId ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[#D1D5DB] bg-white py-20 text-center">
          <Package className="h-10 w-10 text-slate-300" />
          <p className="text-sm text-slate-400">
            Selecione um evento para visualizar o relatório de estoque.
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
            Nenhum produto encontrado para este evento.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#D1D5DB] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-[#F8FAFC]">
                  <th className="px-5 py-3 text-left font-semibold text-[#1F2933]">
                    Produto
                  </th>
                  <th className="px-5 py-3 text-center font-semibold text-[#00A63E]">
                    Total Entrada
                  </th>
                  <th className="px-5 py-3 text-center font-semibold text-[#991B1B]">
                    Total Saída
                  </th>
                  <th className="px-5 py-3 text-center font-semibold text-[#7C3AED]">
                    Total Sangria (Fichas)
                  </th>
                  <th className="px-5 py-3 text-center font-semibold text-[#7CBC9E]">
                    Devoluções
                  </th>
                  <th className="px-5 py-3 text-center font-semibold text-[#253158]">
                    Estoque Total
                  </th>
                  <th className="px-5 py-3 text-center font-semibold text-[#1F2933]">
                    Alerta
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
                      <p className="font-medium text-[#1F2933]">{item.produtoNome}</p>
                      <p className="text-xs text-[#6B7280]">
                        {item.produtoCodigo} · Mín: {item.produtoQuantidadeMinima} {item.produtoUnidadeMedida.toUpperCase()}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-center font-medium text-[#00A63E]">
                      {item.totalEntrada > 0
                        ? `+${item.totalEntrada} ${item.produtoUnidadeMedida.toUpperCase()}`
                        : '—'}
                    </td>
                    <td className="px-5 py-3 text-center font-medium text-[#991B1B]">
                      {item.totalSaida > 0
                        ? `-${item.totalSaida} ${item.produtoUnidadeMedida.toUpperCase()}`
                        : '—'}
                    </td>
                    <td className="px-5 py-3 text-center font-medium text-[#7C3AED]">
                      {item.totalSangria > 0
                        ? `${item.totalSangria} ${item.produtoUnidadeMedida.toUpperCase()}`
                        : '—'}
                    </td>
                    <td className="px-5 py-3 text-center font-medium text-[#7CBC9E]">
                      {item.totalDevolucao > 0
                        ? `+${item.totalDevolucao} ${item.produtoUnidadeMedida.toUpperCase()}`
                        : '—'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`font-semibold ${
                          item.estoqueTotal > 0
                            ? 'text-[#1F2933]'
                            : 'text-[#991B1B]'
                        }`}
                      >
                        {item.estoqueTotal} {item.produtoUnidadeMedida.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <AlertaBadge alerta={item.alerta} />
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t-2 border-[#D1D5DB] bg-[#F8FAFC]">
                  <td className="px-5 py-3 font-bold text-[#0F1E2E]">Total</td>
                  <td className="px-5 py-3 text-center font-bold text-[#00A63E]">
                    +{totais.entrada}
                  </td>
                  <td className="px-5 py-3 text-center font-bold text-[#991B1B]">
                    -{totais.saida}
                  </td>
                  <td className="px-5 py-3 text-center font-bold text-[#7C3AED]">
                    {totais.sangria}
                  </td>
                  <td className="px-5 py-3 text-center font-bold text-[#7CBC9E]">
                    +{totais.devolucao}
                  </td>
                  <td className="px-5 py-3 text-center font-bold text-[#1F2933]">
                    {totais.estoque}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
