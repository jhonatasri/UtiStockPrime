'use client'

import { useState, useMemo } from 'react'
import { Search, X, Info, ShoppingCart } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { useListaProdutos } from '@/src/http/generated/produtos/produtos'
import { useListaBares } from '@/src/http/generated/bares/bares'
import { ListaProdutos200Item } from '@/src/http/generated/api.schemas'

export interface ItemEntrada {
  produtoId: number
  produtoNome: string
  produtoCodigo: string
  produtoCategoria: string
  produtoUnidadeMedida: string
  barId: number
  barNome: string
  loteSerie: string
  validade: string
  quantidade: number
  precoVenda: number
  localizacao: string
}

interface Props {
  eventoId?: number
  onAdicionar: (item: ItemEntrada) => void
  onCancelar: () => void
}

export function ModalAdicionarProduto({ eventoId, onAdicionar, onCancelar }: Props) {
  const [busca, setBusca] = useState('')
  const [produtoSelecionado, setProdutoSelecionado] = useState<ListaProdutos200Item | null>(null)
  const [barId, setBarId] = useState<number | ''>('')
  const [loteSerie, setLoteSerie] = useState('')
  const [validade, setValidade] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [precoVenda, setPrecoVenda] = useState('')
  const [localizacao, setLocalizacao] = useState('')

  const { data: produtos = [] } = useListaProdutos({ eventoId })
  const { data: bares = [] } = useListaBares({ eventoId })

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
  const preco = parseFloat(precoVenda) || 0
  const total = qtd * preco

  function podeAdicionar() {
    return produtoSelecionado && barId && qtd > 0 && preco >= 0
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
      loteSerie,
      validade,
      quantidade: qtd,
      precoVenda: preco,
      localizacao,
    })
  }

  return (
    <div className="rounded-xl border border-[#D1D5DB] bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-lg font-bold text-[#0F1E2E]">Adicionar Produto à Entrada</h2>
        <button onClick={onCancelar} className="rounded-md p-1 text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Info banner */}
        <div className="flex items-center gap-2 rounded-lg border border-[#D1D5DB] px-3 py-2.5 text-sm text-[#6B7280]">
          <Info className="h-4 w-4 shrink-0" />
          Selecione o produto e informe os dados da entrada
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
                  style={
                    produtoSelecionado?.id === p.id
                      ? { backgroundColor: '#EFF6FF' }
                      : {}
                  }
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
            Bar de Destino <span className="text-red-500">*</span>
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

        {/* Fields row 1 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2933]">Lote/Série</label>
            <input
              className="rounded-md border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#253158]"
              placeholder="Ex: LT26017857"
              value={loteSerie}
              onChange={(e) => setLoteSerie(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2933]">Data de Validade</label>
            <input
              type="date"
              className="rounded-md border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#253158]"
              value={validade}
              onChange={(e) => setValidade(e.target.value)}
            />
          </div>
        </div>

        {/* Fields row 2 */}
        <div className="grid grid-cols-2 gap-4">
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
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2933]">
              Preço de Venda (R$) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="rounded-md border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#253158]"
              placeholder="R$ 0,00"
              value={precoVenda}
              onChange={(e) => setPrecoVenda(e.target.value)}
            />
          </div>
        </div>

        {/* Localização */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1F2933]">Localização Física</label>
          <input
            className="rounded-md border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#253158]"
            placeholder="Ex: Corredor A, Prateleira 3, Posição 5"
            value={localizacao}
            onChange={(e) => setLocalizacao(e.target.value)}
          />
          <p className="text-xs text-[#62748E]">Se vazio, será usado &apos;Depósito Principal&apos;</p>
        </div>

        {/* Preview summary */}
        {produtoSelecionado && qtd > 0 && (
          <div className="rounded-lg border border-[#B9F8CF] bg-[#F0FDF4] p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#45556C]">Quantidade:</span>
              <span className="font-medium text-[#1F2933]">
                {qtd} {produtoSelecionado.unidadeMedida.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#45556C]">Preço unitário:</span>
              <span className="font-medium text-[#1F2933]">
                R$ {preco.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-[#D1D5DB]" />
            <div className="flex justify-between text-sm font-bold">
              <span className="text-[#45556C]">Total:</span>
              <span className="text-[#00A63E]">R$ {total.toFixed(2)}</span>
            </div>
            {barSelecionado && (
              <div className="flex justify-between text-sm">
                <span className="text-[#45556C]">Bar de destino:</span>
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
          style={{ backgroundColor: '#253158' }}
          className="text-white"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Adicionar Produto
        </Button>
      </div>
    </div>
  )
}
