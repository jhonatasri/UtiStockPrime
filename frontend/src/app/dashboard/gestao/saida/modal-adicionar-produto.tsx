'use client'

import { useState, useMemo } from 'react'
import { Search, X, Info, ArrowUpFromLine } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { useListaProdutos } from '@/src/http/generated/produtos/produtos'
import { useListaBares } from '@/src/http/generated/bares/bares'
import { ListaProdutos200Item } from '@/src/http/generated/api.schemas'

export interface ItemSaida {
  produtoId: number
  produtoNome: string
  produtoCodigo: string
  produtoCategoria: string
  produtoUnidadeMedida: string
  barId: number
  barNome: string
  quantidade: number
  motivo: string
  localizacao: string
}

interface Props {
  eventoId?: number
  usuarioId?: number
  onAdicionar: (item: ItemSaida) => void
  onCancelar: () => void
}

export function ModalAdicionarProdutoSaida({ eventoId, usuarioId, onAdicionar, onCancelar }: Props) {
  const [busca, setBusca] = useState('')
  const [produtoSelecionado, setProdutoSelecionado] = useState<ListaProdutos200Item | null>(null)
  const [barId, setBarId] = useState<number | ''>('')
  const [quantidade, setQuantidade] = useState('')
  const [motivo, setMotivo] = useState('')
  const [localizacao, setLocalizacao] = useState('')

  const { data: produtos = [] } = useListaProdutos({ eventoId })
  const { data: bares = [] } = useListaBares({ eventoId, usuarioId })

  const produtosAtivos = produtos.filter((p) => p.ativo)
  const baresAtivos = bares.filter((b) => b.ativo)

  const filtrados = useMemo(
    () =>
      produtosAtivos.filter(
        (p) =>
          p.nome.toLowerCase().includes(busca.toLowerCase()) ||
          p.codigo.toLowerCase().includes(busca.toLowerCase()) ||
          p.categoria.toLowerCase().includes(busca.toLowerCase())
      ),
    [produtosAtivos, busca]
  )

  const barSelecionado = baresAtivos.find((b) => b.id === barId)
  const qtd = parseInt(quantidade) || 0

  function podeAdicionar() {
    return produtoSelecionado && barId && qtd > 0
  }

  function handleAdicionar() {
    if (!produtoSelecionado || !barId || !barSelecionado) return
    onAdicionar({
      produtoId: produtoSelecionado.id,
      produtoNome: produtoSelecionado.nome,
      produtoCodigo: produtoSelecionado.codigo,
      produtoCategoria: produtoSelecionado.categoria,
      produtoUnidadeMedida: produtoSelecionado.unidadeMedida,
      barId: Number(barId),
      barNome: barSelecionado.nome,
      quantidade: qtd,
      motivo,
      localizacao,
    })
  }

  return (
    <div className="rounded-xl border border-[#D1D5DB] bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-lg font-bold text-[#0F1E2E]">Adicionar Produto à Saída</h2>
        <button onClick={onCancelar} className="rounded-md p-1 text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Info banner */}
        <div className="flex items-center gap-2 rounded-lg border border-[#D1D5DB] px-3 py-2.5 text-sm text-[#6B7280]">
          <Info className="h-4 w-4 shrink-0" />
          Selecione o produto e informe os dados da saída
        </div>

        {/* Search */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1F2933]">Buscar Produto</label>
          <div className="flex items-center gap-2 rounded-md border border-[#E5E5E5] bg-white px-3 py-2">
            <Search className="h-4 w-4 text-[#6B7280]" />
            <input
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#9D9D9D]"
              placeholder="Buscar pelo Produto"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value)
                setProdutoSelecionado(null)
              }}
            />
          </div>
        </div>

        {/* Product list */}
        {(busca || !produtoSelecionado) && (
          <div className="max-h-[187px] overflow-y-auto rounded-lg border border-[#D1D5DB] divide-y divide-[#D1D5DB]">
            {filtrados.length === 0 ? (
              <p className="px-4 py-3 text-sm text-[#6B7280]">Nenhum produto encontrado</p>
            ) : (
              filtrados.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setProdutoSelecionado(p)
                    setBusca('')
                  }}
                  className="flex cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-[#F8FAFC]"
                  style={produtoSelecionado?.id === p.id ? { backgroundColor: '#EFF6FF' } : {}}
                >
                  <div>
                    <p className="text-sm font-medium text-[#1F2933]">{p.nome}</p>
                    <p className="text-xs text-[#62748E]">
                      {p.codigo} • {p.categoria}
                    </p>
                  </div>
                  <span className="rounded-md border px-2 py-0.5 text-xs font-medium text-[#2563EB]">
                    {p.unidadeMedida.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Selected product indicator */}
        {produtoSelecionado && !busca && (
          <div className="flex items-center justify-between rounded-lg border border-[#D1D5DB] bg-[#EFF6FF] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#1F2933]">{produtoSelecionado.nome}</p>
              <p className="text-xs text-[#62748E]">
                {produtoSelecionado.codigo} • {produtoSelecionado.categoria}
              </p>
            </div>
            <button
              onClick={() => setProdutoSelecionado(null)}
              className="text-xs text-[#6B7280] hover:text-slate-900"
            >
              Trocar
            </button>
          </div>
        )}

        {/* Bar selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1F2933]">
            Bar de Origem <span className="text-red-500">*</span>
          </label>
          <select
            className="rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#253158]"
            value={barId}
            onChange={(e) => setBarId(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">(Selecione o bar)</option>
            {baresAtivos.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Quantidade */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1F2933]">
            Quantidade <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            className="rounded-md border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#253158]"
            placeholder="Ex: 0"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
          />
          {produtoSelecionado && (
            <p className="text-xs text-[#62748E]">Unidade: {produtoSelecionado.unidadeMedida.toUpperCase()}</p>
          )}
        </div>

        {/* Motivo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1F2933]">Motivo</label>
          <input
            className="rounded-md border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#253158]"
            placeholder="Ex: Consumo interno, descarte, etc."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>

        {/* Localização */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1F2933]">Localização Física</label>
          <input
            className="rounded-md border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#253158]"
            placeholder="Ex: Corredor A, Prateleira 3"
            value={localizacao}
            onChange={(e) => setLocalizacao(e.target.value)}
          />
        </div>

        {/* Preview */}
        {produtoSelecionado && qtd > 0 && (
          <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#45556C]">Produto:</span>
              <span className="font-medium text-[#1F2933]">{produtoSelecionado.nome}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#45556C]">Quantidade a retirar:</span>
              <span className="font-bold text-[#991B1B]">
                -{qtd} {produtoSelecionado.unidadeMedida.toUpperCase()}
              </span>
            </div>
            {barSelecionado && (
              <div className="flex justify-between text-sm">
                <span className="text-[#45556C]">Bar de origem:</span>
                <span className="font-medium text-[#1F2933]">{barSelecionado.nome}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
        <Button variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button
          onClick={handleAdicionar}
          disabled={!podeAdicionar()}
          style={{ backgroundColor: '#991B1B' }}
          className="text-white"
        >
          <ArrowUpFromLine className="mr-2 h-4 w-4" />
          Adicionar Produto
        </Button>
      </div>
    </div>
  )
}
