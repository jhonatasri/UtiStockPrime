'use client'

import { useContext, useMemo, useState } from 'react'
import { Plus, Trash2, Check, PackageOpen } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/src/components/dataTable'
import { ModalAdicionarProdutoSaida, ItemSaida } from './modal-adicionar-produto'
import { useCriaSaida } from '@/src/http/generated/saidas/saidas'
import { AuthContext } from '@/src/providers/AuthContext'

const TIPOS_SAIDA = [
  'Consumo',
  'Avaria',
  'Transferência',
  'Ajuste de Estoque',
  'Outros',
]

export default function SaidaPage() {
  const { user } = useContext(AuthContext)

  const eventoId =
    typeof window !== 'undefined'
      ? Number(localStorage.getItem('selected-team-id')) || undefined
      : undefined

  const usuarioId = user ? Number(user.usuario.id) : undefined

  const [tipoSaida, setTipoSaida] = useState('')
  const [numeroDocumento, setNumeroDocumento] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const dataHora = useMemo(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }, [])

  const [itens, setItens] = useState<ItemSaida[]>([])
  const [adicionandoProduto, setAdicionandoProduto] = useState(false)

  const { mutate: criaSaida, isPending } = useCriaSaida()

  const totalItens = itens.length
  const totalQuantidade = itens.reduce((acc, i) => acc + i.quantidade, 0)

  function removerItem(idx: number) {
    setItens((prev) => prev.filter((_, i) => i !== idx))
  }

  function handleAdicionarProduto(item: ItemSaida) {
    setItens((prev) => [...prev, item])
    setAdicionandoProduto(false)
  }

  function podeFinalizarSaida() {
    return tipoSaida && itens.length > 0
  }

  function handleFinalizarSaida() {
    if (!podeFinalizarSaida()) return
    criaSaida(
      {
        data: {
          dataHora: new Date(dataHora).toISOString(),
          tipoSaida,
          numeroDocumento: numeroDocumento || undefined,
          observacoes: observacoes || undefined,
          eventoId,
          itens: itens.map((i) => ({
            produtoId: i.produtoId,
            barId: i.barId,
            quantidade: i.quantidade,
            motivo: i.motivo || undefined,
            localizacao: i.localizacao || undefined,
          })),
        },
      },
      {
        onSuccess: () => {
          setItens([])
          setTipoSaida('')
          setNumeroDocumento('')
          setObservacoes('')
          setAdicionandoProduto(false)
        },
      }
    )
  }

  const colunas: ColumnDef<ItemSaida>[] = [
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
      accessorKey: 'quantidade',
      header: 'Quantidade',
      cell: ({ row }) => (
        <span className="font-medium text-[#991B1B]">
          -{row.original.quantidade} {row.original.produtoUnidadeMedida.toUpperCase()}
        </span>
      ),
    },
    {
      accessorKey: 'barNome',
      header: 'Bar de Origem',
    },
    {
      accessorKey: 'motivo',
      header: 'Motivo',
      cell: ({ row }) => row.original.motivo || '—',
    },
    {
      accessorKey: 'localizacao',
      header: 'Localização',
      cell: ({ row }) => row.original.localizacao || '—',
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
          Depois de inserir todos os dados clique no botão &apos;Finalizar Saída&apos;
        </p>
        <Button
          onClick={handleFinalizarSaida}
          disabled={!podeFinalizarSaida() || isPending}
          style={{ backgroundColor: '#991B1B' }}
          className="text-white"
        >
          <Check className="mr-2 h-4 w-4" />
          {isPending ? 'Salvando...' : 'Finalizar Saída'}
        </Button>
      </div>

      {/* Card 1 — Informações */}
      <div className="rounded-xl border border-[#D1D5DB] bg-white p-6 space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-[#0F1E2E]">Informações de Saída</h2>
          <p className="text-sm text-[#6B7280]">Dados gerais sobre a movimentação de saída</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Data/Hora */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2933]">Data/Hora da Saída</label>
            <input
              type="datetime-local"
              className="rounded-md border border-[#D1D5DB] bg-[#F5F7FA] px-3 py-2 text-sm outline-none cursor-not-allowed opacity-70"
              value={dataHora}
              readOnly
            />
          </div>

          {/* Tipo de Saída */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2933]">
              Tipo de Saída <span className="text-red-500">*</span>
            </label>
            <select
              className="rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#253158]"
              value={tipoSaida}
              onChange={(e) => setTipoSaida(e.target.value)}
            >
              <option value="">(Selecione)</option>
              {TIPOS_SAIDA.map((t) => (
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
              placeholder="Ex: DOC-001"
              value={numeroDocumento}
              onChange={(e) => setNumeroDocumento(e.target.value)}
            />
          </div>
        </div>

        {/* Observações */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1F2933]">Observações</label>
          <textarea
            rows={3}
            className="rounded-md border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#253158] resize-none"
            placeholder="Informações adicionais sobre a saída..."
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        </div>
      </div>

      {/* Modal adicionar produto (inline) */}
      {adicionandoProduto && (
        <ModalAdicionarProdutoSaida
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
            <h2 className="text-xl font-semibold text-[#1F2933]">Produtos da Saída</h2>
            <p className="text-sm text-[#6B7280]">Adicione os produtos que estão sendo retirados</p>
          </div>
          <Button
            onClick={() => setAdicionandoProduto(true)}
            style={{ backgroundColor: '#991B1B' }}
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
                <span className="font-medium text-[#991B1B]">-{totalQuantidade}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
