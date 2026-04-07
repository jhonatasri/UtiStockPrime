'use client'

import { useState, useMemo, useEffect } from 'react'
import { DataTable } from '@/src/components/dataTable'
import { Button } from '@/src/components/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { ModalCadastroBar } from './modal-cadastro-bar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  PowerOff,
  BarChart2,
  Banknote,
  Undo2,
  DoorOpen,
  DoorClosed,
} from 'lucide-react'
import { useListaBares, useAlteraAtivoBar, useAlteraStatusBar } from '@/src/http/generated/bares/bares'
import { ListaBares200Item } from '@/src/http/generated/api.schemas'

function BadgeStatus({ status, ativo }: { status: string; ativo: boolean }) {
  if (!ativo) {
    return (
      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium" style={{ color: '#45556C' }}>
        Inativo
      </span>
    )
  }
  if (status === 'ABERTO') {
    return (
      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: '#DCFCE7', color: '#016630' }}>
        Aberto
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: '#FEF9C3', color: '#854D0E' }}>
      Fechado
    </span>
  )
}

export default function BaresPage() {
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS')
  const [modalAberto, setModalAberto] = useState(false)
  const [barEditando, setBarEditando] = useState<ListaBares200Item | null>(null)

  const router = useRouter()

  const [eventoId, setEventoId] = useState<number | undefined>(undefined)
  useEffect(() => {
    setEventoId(Number(localStorage.getItem('selected-team-id')) || undefined)
  }, [])

  const { data: bares = [], refetch } = useListaBares({ eventoId })
  const { mutate: alteraAtivo } = useAlteraAtivoBar()
  const { mutate: alteraStatus } = useAlteraStatusBar()

  const totalBares = bares.length
  const baresAtivos = bares.filter(b => b.ativo && b.status === 'ABERTO').length
  const baresFechados = bares.filter(b => b.ativo && b.status === 'FECHADO').length
  const baresInativos = bares.filter(b => !b.ativo).length

  const filtered = useMemo(() => {
    return bares.filter(b => {
      const matchBusca = b.nome.toLowerCase().includes(busca.toLowerCase())
      const matchStatus =
        filtroStatus === 'TODOS' ? true :
        filtroStatus === 'ABERTO' ? b.ativo && b.status === 'ABERTO' :
        filtroStatus === 'FECHADO' ? b.ativo && b.status === 'FECHADO' :
        filtroStatus === 'INATIVO' ? !b.ativo : true
      return matchBusca && matchStatus
    })
  }, [bares, busca, filtroStatus])

  const colunas: ColumnDef<ListaBares200Item>[] = [
    {
      accessorKey: 'nome',
      header: 'Nome do Bar',
    },
    {
      accessorKey: 'qtdProdutos',
      header: 'Qtd de Produtos',
    },
    {
      accessorKey: 'liderNome',
      header: 'Líder Principal',
      cell: ({ row }) => row.original.liderNome ?? '—',
    },
    {
      id: 'statusBadge',
      header: 'Status',
      cell: ({ row }) => (
        <BadgeStatus status={row.original.status} ativo={row.original.ativo} />
      ),
    },
    {
      id: 'acoes',
      header: 'Ações',
      cell: ({ row }) => {
        const bar = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/gestao/bares/${bar.id}/movimentacoes`)}>
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Movimentações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/gestao/bares/${bar.id}/sangrias`)}>
                  <Banknote className="mr-2 h-4 w-4" />
                  Sangrias
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/gestao/bares/${bar.id}/devolucoes`)}>
                  <Undo2 className="mr-2 h-4 w-4" />
                  Devoluções
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setBarEditando(bar)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                {bar.ativo && (
                  <DropdownMenuItem
                    onClick={() =>
                      alteraStatus(
                        { id: bar.id, data: { status: bar.status === 'ABERTO' ? 'FECHADO' : 'ABERTO' } },
                        { onSuccess: () => refetch() }
                      )
                    }
                  >
                    {bar.status === 'ABERTO' ? (
                      <>
                        <DoorClosed className="mr-2 h-4 w-4" />
                        Fechar Bar
                      </>
                    ) : (
                      <>
                        <DoorOpen className="mr-2 h-4 w-4" />
                        Abrir Bar
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() =>
                    alteraAtivo(
                      { id: bar.id, data: { ativo: !bar.ativo } },
                      { onSuccess: () => refetch() }
                    )
                  }
                >
                  <PowerOff className="mr-2 h-4 w-4" />
                  {bar.ativo ? 'Inativar' : 'Ativar'}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#0F1E2E]">Listagem de Bares</h1>
        <Button onClick={() => setModalAberto(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Bar
        </Button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total de Bares', value: totalBares },
          { label: 'Abertos', value: baresAtivos },
          { label: 'Fechados', value: baresFechados },
          { label: 'Inativos', value: baresInativos },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-[#0F1E2E]">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm min-w-[200px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            className="flex-1 bg-transparent outline-none placeholder:text-slate-400"
            placeholder="Buscar por nome do bar.."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <select
          className="rounded-md border bg-white px-3 py-2 text-sm outline-none"
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        >
          <option value="TODOS">Todos os status</option>
          <option value="ABERTO">Aberto</option>
          <option value="FECHADO">Fechado</option>
          <option value="INATIVO">Inativo</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="rounded-xl border bg-white shadow-sm">
        <DataTable columns={colunas} data={filtered} filtro={[]} />
      </div>

      {/* Modal Cadastro */}
      <ModalCadastroBar
        open={modalAberto}
        onOpenChange={setModalAberto}
        eventoId={eventoId}
        onSuccess={() => { setModalAberto(false); refetch() }}
      />

      {/* Modal Edição (reutiliza o mesmo modal com dados preenchidos) */}
      {barEditando && (
        <ModalCadastroBar
          open={!!barEditando}
          onOpenChange={(v) => { if (!v) setBarEditando(null) }}
          eventoId={eventoId}
          barInicial={barEditando}
          onSuccess={() => { setBarEditando(null); refetch() }}
        />
      )}
    </div>
  )
}
