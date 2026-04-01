'use client'

import { useState, useMemo } from 'react'
import { CardsComponents } from '@/src/components/cards'
import { DataTable } from '@/src/components/dataTable'
import { Button } from '@/src/components/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { ModalCadastroProduto } from './modal-cadastro-produto'
import { ModalEdicaoProduto } from './modal-edicao-produto'
import { ModalVisualizacaoProduto } from './modal-visualizacao-produto'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import {
  Package,
  Warehouse,
  AlertTriangle,
  Tag,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  PowerOff,
} from 'lucide-react'
import {
  useListaProdutos,
  useAlteraStatusProduto,
} from '@/src/http/generated/produtos/produtos'
import { ListaProdutos200Item } from '@/src/http/generated/api.schemas'

// ─── Badges ───────────────────────────────────────────────────────────────────

function BadgeStatus({ ativo }: { ativo: boolean }) {
  if (ativo) {
    return (
      <span
        className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
        style={{ backgroundColor: '#DCFCE7', color: '#016630' }}
      >
        Ativo
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium"
      style={{ color: '#45556C' }}
    >
      Inativo
    </span>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ProdutosPage() {
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState<ListaProdutos200Item | null>(null)
  const [produtoVisualizando, setProdutoVisualizando] = useState<ListaProdutos200Item | null>(null)

  const eventoId = typeof window !== 'undefined'
    ? Number(localStorage.getItem('selected-team-id')) || undefined
    : undefined

  const { data: produtos = [], refetch } = useListaProdutos({ eventoId })
  const { mutate: alteraStatus } = useAlteraStatusProduto()

  const totalProdutos = produtos.length
  const estoqueTotal = 0
  const alertasCriticos = 0
  const categorias = new Set(produtos.map(p => p.categoria)).size

  const dadosFiltrados = useMemo(() => {
    if (!busca.trim()) return produtos
    const termo = busca.toLowerCase()
    return produtos.filter(
      p =>
        p.nome.toLowerCase().includes(termo) ||
        p.codigo.toLowerCase().includes(termo) ||
        p.categoria.toLowerCase().includes(termo),
    )
  }, [produtos, busca])

  const columns: ColumnDef<ListaProdutos200Item>[] = [
    { accessorKey: 'codigo', header: 'Código' },
    { accessorKey: 'nome', header: 'Produto' },
    { accessorKey: 'categoria', header: 'Categoria' },
    {
      accessorKey: 'ativo',
      header: 'Status',
      cell: ({ row }) => <BadgeStatus ativo={row.original.ativo} />,
    },
    {
      id: 'acoes',
      header: 'Ações',
      cell: ({ row }) => {
        const produto = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center size-8 rounded-md hover:bg-neutral-100 transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44" align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onClick={() => setProdutoVisualizando(produto)}
                >
                  <Eye size={14} /> Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onClick={() => setProdutoEditando(produto)}
                >
                  <Pencil size={14} /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onClick={() =>
                    alteraStatus(
                      { id: produto.id, data: { ativo: !produto.ativo } },
                      { onSuccess: () => refetch() },
                    )
                  }
                >
                  <PowerOff size={14} />
                  {produto.ativo ? 'Inativar' : 'Ativar'}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="w-full p-6">

      {/* ── Cards de resumo ── */}
      <header className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardsComponents
          Title="Total de Produtos"
          Total={totalProdutos}
          Icon={<Package size={28} color="#155DFC" />}
          NumberColor="#155DFC"
        />
        <CardsComponents
          Title="Estoque Total"
          Total={estoqueTotal}
          Icon={<Warehouse size={28} color="#00A63E" />}
          NumberColor="#00A63E"
        />
        <CardsComponents
          Title="Alertas Críticos"
          Total={alertasCriticos}
          Icon={<AlertTriangle size={28} color="#E7000B" />}
          NumberColor="#E7000B"
        />
        <CardsComponents
          Title="Categorias"
          Total={categorias}
          Icon={<Tag size={28} color="#9810FA" />}
          NumberColor="#9810FA"
        />
      </header>

      {/* ── Título + Botões ── */}
      <section className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-semibold" style={{ color: '#0F1E2E' }}>
          Listagem de Produtos
        </h1>

        <div className="flex items-center gap-2.5">
          <Button variant="default" onClick={() => setModalAberto(true)}>
            <Plus />
            Novo Produto
          </Button>
        </div>
      </section>

      {/* ── Barra de busca ── */}
      <div className="mt-4 flex items-center gap-2 bg-white rounded-md border border-neutral-300 px-3">
        <Search size={16} className="shrink-0 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por nome, código, categoria..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="flex-1 py-2.5 text-base bg-transparent outline-none placeholder:text-gray-400"
        />
      </div>

      {/* ── Tabela ── */}
      <div className="mt-5 w-full overflow-x-auto">
        <DataTable columns={columns} data={dadosFiltrados} filtro={[]} />
      </div>

      <ModalCadastroProduto
        open={modalAberto}
        onOpenChange={setModalAberto}
        onSuccess={() => refetch()}
        eventoId={eventoId}
      />

      <ModalVisualizacaoProduto
        produto={produtoVisualizando}
        open={produtoVisualizando !== null}
        onOpenChange={open => { if (!open) setProdutoVisualizando(null) }}
      />

      <ModalEdicaoProduto
        produto={produtoEditando}
        open={produtoEditando !== null}
        onOpenChange={open => { if (!open) setProdutoEditando(null) }}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
