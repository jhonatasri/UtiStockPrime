'use client'

import { useContext, useMemo, useState } from 'react'
import { Plus, Trash2, Check, PackageOpen } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/src/components/dataTable'
import { ModalAdicionarProduto, ItemEntrada } from './modal-adicionar-produto'
import { useCriaEntrada } from '@/src/http/generated/entradas/entradas'
import { AuthContext } from '@/src/providers/AuthContext'

const TIPOS_ENTRADA = [
  'Abastecimento',
  'Reposição',
  'Transferência',
  'Ajuste de Estoque',
  'Outros',
]

export default function EntradasPage() {
  const { user } = useContext(AuthContext)

  const eventoId =
    typeof window !== 'undefined'
      ? Number(localStorage.getItem('selected-team-id')) || undefined
      : undefined

  const usuarioId = user ? Number(user.usuario.id) : undefined

  const [tipoEntrada, setTipoEntrada] = useState('')
  const [numeroDocumento, setNumeroDocumento] = useState('')
  const [fornecedor, setFornecedor] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const dataHora = useMemo(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }, [])

  const [itens, setItens] = useState<ItemEntrada[]>([])
  const [adicionandoProduto, setAdicionandoProduto] = useState(false)

  const { mutate: criaEntrada, isPending } = useCriaEntrada()

  const totalItens = itens.length
  const totalQuantidade = itens.reduce((acc, i) => acc + i.quantidade, 0)
  const valorTotal = itens.reduce((acc, i) => acc + i.quantidade * i.precoVenda, 0)

  function removerItem(idx: number) {
    setItens((prev) => prev.filter((_, i) => i !== idx))
  }

  function handleAdicionarProduto(item: ItemEntrada) {
    setItens((prev) => [...prev, item])
    setAdicionandoProduto(false)
  }

  function podeFinalizarEntrada() {
    return tipoEntrada && itens.length > 0
  }

  function handleFinalizarEntrada() {
    if (!podeFinalizarEntrada()) return
    criaEntrada(
      {
        data: {
          dataHora: new Date(dataHora).toISOString(),
          tipoEntrada,
          numeroDocumento: numeroDocumento || undefined,
          fornecedor: fornecedor || undefined,
          observacoes: observacoes || undefined,
          eventoId,
          itens: itens.map((i) => ({
            produtoId: i.produtoId,
            barId: i.barId,
            loteSerie: i.loteSerie || undefined,
            validade: i.validade || undefined,
            quantidade: i.quantidade,
            precoVenda: i.precoVenda,
            localizacao: i.localizacao || undefined,
          })),
        },
      },
      {
        onSuccess: () => {
          setItens([])
          setTipoEntrada('')
          setNumeroDocumento('')
          setFornecedor('')
          setObservacoes('')
          setAdicionandoProduto(false)
        },
      }
    )
  }

  const colunas: ColumnDef<ItemEntrada>[] = [
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
      accessorKey: 'loteSerie',
      header: 'Lote/Série',
      cell: ({ row }) => row.original.loteSerie || '—',
    },
    {
      accessorKey: 'validade',
      header: 'Validade',
      cell: ({ row }) =>
        row.original.validade
          ? new Date(row.original.validade).toLocaleDateString('pt-BR')
          : '—',
    },
    {
      accessorKey: 'quantidade',
      header: 'Quantidade',
      cell: ({ row }) => (
        <span className="font-medium text-[#00A63E]">+{row.original.quantidade}</span>
      ),
    },
    {
      accessorKey: 'precoVenda',
      header: 'Preço de Venda',
      cell: ({ row }) => `R$ ${row.original.precoVenda.toFixed(2)}`,
    },
    {
      id: 'total',
      header: 'Total',
      cell: ({ row }) =>
        `R$ ${(row.original.quantidade * row.original.precoVenda).toFixed(2)}`,
    },
    {
      accessorKey: 'barNome',
      header: 'Bar',
    },
    {
      accessorKey: 'localizacao',
      header: 'Localização',
      cell: ({ row }) => row.original.localizacao || 'Depósito Principal',
    },
    {
      id: 'acoes',
      header: 'Ações',
      cell: ({ row }) => (
        <button
          onClick={() => removerItem(row.index)}
          className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6" style={{ backgroundColor: '#F8FAFC', minHeight: '100%' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <p className="text-base text-[#0F1E2E]">
          Depois de inserir todos os dados clique no botão &apos;Finalizar Entrada&apos;
        </p>
        <Button
          onClick={handleFinalizarEntrada}
          disabled={!podeFinalizarEntrada() || isPending}
          style={{ backgroundColor: '#7CBC9E' }}
          className="text-white"
        >
          <Check className="mr-2 h-4 w-4" />
          {isPending ? 'Salvando...' : 'Finalizar Entrada'}
        </Button>
      </div>

      {/* Card 1 — Informações */}
      <div className="rounded-xl border border-[#D1D5DB] bg-white p-6 space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-[#0F1E2E]">Informações de Entrada</h2>
          <p className="text-sm text-[#6B7280]">Dados gerais sobre a movimentação de entrada</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Data/Hora */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2933]">Data/Hora da Entrada</label>
            <input
              type="datetime-local"
              className="rounded-md border border-[#D1D5DB] bg-[#F5F7FA] px-3 py-2 text-sm outline-none cursor-not-allowed opacity-70"
              value={dataHora}
              readOnly
            />
          </div>

          {/* Tipo de Entrada */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2933]">
              Tipo de Entrada <span className="text-red-500">*</span>
            </label>
            <select
              className="rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#253158]"
              value={tipoEntrada}
              onChange={(e) => setTipoEntrada(e.target.value)}
            >
              <option value="">(Selecione)</option>
              {TIPOS_ENTRADA.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Número do Documento */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2933]">Número do Documento</label>
            <input
              className="rounded-md border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#253158]"
              placeholder="Ex: NF-1245678"
              value={numeroDocumento}
              onChange={(e) => setNumeroDocumento(e.target.value)}
            />
          </div>
        </div>

        {/* Fornecedor */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1F2933]">Fornecedor</label>
          <input
            className="rounded-md border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#253158]"
            placeholder="Nome do fornecedor"
            value={fornecedor}
            onChange={(e) => setFornecedor(e.target.value)}
          />
        </div>

        {/* Observações */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1F2933]">Observações</label>
          <textarea
            rows={3}
            className="rounded-md border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#253158] resize-none"
            placeholder="Informações adicionais sobre a entrada..."
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        </div>
      </div>

      {/* Modal adicionar produto (inline, below info card) */}
      {adicionandoProduto && (
        <ModalAdicionarProduto
          eventoId={eventoId}
          usuarioId={usuarioId}
          onAdicionar={handleAdicionarProduto}
          onCancelar={() => setAdicionandoProduto(false)}
        />
      )}

      {/* Card 2 — Produtos */}
      <div className="rounded-xl border border-[#D1D5DB] bg-white">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-[#1F2933]">Produtos da Entrada</h2>
            <p className="text-sm text-[#6B7280]">Adicione os produtos que estão sendo recebidos</p>
          </div>
          <Button
            onClick={() => setAdicionandoProduto(true)}
            style={{ backgroundColor: '#7CBC9E' }}
            className="text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Produto
          </Button>
        </div>

        {itens.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <PackageOpen className="h-10 w-10 text-slate-300" />
            <p className="text-sm text-slate-400">
              Nenhum produto adicionado. Clique em &ldquo;Adicionar Produto&rdquo; para começar.
            </p>
          </div>
        ) : (
          <>
            <DataTable columns={colunas} data={itens} filtro={[]} />

            {/* Summary bar */}
            <div className="flex items-center gap-8 rounded-b-xl border-t bg-[#F8FAFC] px-6 py-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#6B7280]">Total de produtos:</span>
                <span className="font-medium text-[#1F2933]">{totalItens}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#6B7280]">Quantidade de itens:</span>
                <span className="font-medium text-[#00A63E]">+{totalQuantidade}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#6B7280]">Valor total:</span>
                <span className="font-medium text-[#1F2933]">R$ {valorTotal.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
