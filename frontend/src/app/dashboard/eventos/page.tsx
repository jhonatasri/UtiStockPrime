'use client'

import { useState, useMemo } from 'react'
import { CardsComponents } from "@/src/components/cards"
import { NovoEventoModal } from "@/src/components/eventos/novo-evento-modal"
import { DetalheEventoModal } from "@/src/components/eventos/detalhe-evento-modal"
import { EditaEventoModal } from "@/src/components/eventos/edita-evento-modal"
import {
  FiCalendar,
  FiChevronDown,
  FiClock,
  FiEdit,
  FiEye,
  FiMoreHorizontal,
  FiSearch,
} from "react-icons/fi"

import { ColumnDef } from "@tanstack/react-table"
import { useListaEventos } from "@/src/http/generated/eventos/eventos"
import { CategoriaEvento, ListaEventos200Item } from "@/src/http/generated/api.schemas"
import { DataTable } from "@/src/components/dataTable"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"

const CATEGORIA_LABELS: Record<CategoriaEvento, string> = {
  SHOW: 'Show',
  FESTIVAL: 'Festival',
  CORPORATIVO: 'Corporativo',
  PRIVADO: 'Privado',
}

export default function Eventos() {
  const { data } = useListaEventos()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [editId, setEditId] = useState<number | null>(null)
  const [filterNome, setFilterNome] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const agora = new Date()
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() + 1)

  const planejados = useMemo(
    () => (data || []).filter(e => {
      if (!e.ativo) return false
      if (!e.data) return true
      return new Date(e.data) > agora
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  const emAndamento = useMemo(
    () => (data || []).filter(e => {
      if (!e.ativo || !e.data) return false
      const d = new Date(e.data)
      return d >= hoje && d < amanha
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  const finalizados = useMemo(
    () => (data || []).filter(e => !e.ativo),
    [data]
  )

  const filteredData = useMemo(() => {
    return (data || []).filter(evento => {
      const matchNome = !filterNome || evento.nome?.toLowerCase().includes(filterNome.toLowerCase())
      const matchCategoria = !filterCategoria || evento.categoria === filterCategoria
      const matchStatus =
        !filterStatus ||
        (filterStatus === 'aberto' ? evento.ativo === true : evento.ativo === false)
      return matchNome && matchCategoria && matchStatus
    })
  }, [data, filterNome, filterCategoria, filterStatus])

  const columns: ColumnDef<ListaEventos200Item>[] = [
    {
      accessorKey: "nome",
      header: "Nome do Evento",
    },
    {
      accessorKey: "categoria",
      header: "Categoria",
      cell: ({ row }) =>
        CATEGORIA_LABELS[row.original.categoria as CategoriaEvento] ?? row.original.categoria,
    },
    {
      accessorKey: "responsavelNome",
      header: "Responsável",
      cell: ({ row }) => row.original.responsavelNome ?? '—',
    },
    {
      accessorKey: "ativo",
      header: "Status",
      cell: ({ row }) =>
        row.original.ativo ? (
          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
            Aberto
          </span>
        ) : (
          <span className="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full font-medium">
            Fechado
          </span>
        ),
    },
    {
      accessorKey: "id",
      header: "Ações",
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <FiMoreHorizontal className="cursor-pointer" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40" align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={() => setSelectedId(row.original.id)}
              >
                <FiEye /> Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={() => setEditId(row.original.id)}
              >
                <FiEdit /> Editar
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="w-full p-4 md:p-6">
      {/* CARDS */}
      <header className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardsComponents
          Title="Total de Eventos"
          Total={Number(data?.length) || 0}
          Icon={<FiCalendar size={28} color="#64748B" />}
          NumberColor="#64748B"
        />
        <CardsComponents
          Title="Planejados"
          Total={planejados.length}
          Icon={<FiClock size={28} color="#155DFC" />}
          NumberColor="#155DFC"
        />
        <CardsComponents
          Title="Em Andamento"
          Total={emAndamento.length}
          Icon={<FiClock size={28} color="#F59E0B" />}
          NumberColor="#F59E0B"
        />
        <CardsComponents
          Title="Finalizados"
          Total={finalizados.length}
          Icon={<FiClock size={28} color="#00A63E" />}
          NumberColor="#00A63E"
        />
      </header>

      {/* TÍTULO + BOTÃO */}
      <section className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-semibold">Listagem de Eventos</h1>
        <NovoEventoModal />
      </section>

      {/* FILTROS */}
      <div className="mt-4 flex flex-wrap gap-3">
        <div className="flex flex-1 min-w-48 items-center gap-2 bg-white rounded-md border border-gray-200 px-3">
          <FiSearch size={15} className="shrink-0 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome do Evento..."
            value={filterNome}
            onChange={e => setFilterNome(e.target.value)}
            className="flex-1 py-2 text-sm bg-transparent outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="relative">
          <select
            value={filterCategoria}
            onChange={e => setFilterCategoria(e.target.value)}
            className="appearance-none h-10 w-40 rounded-md bg-white border border-gray-200 px-3 pr-8 text-sm font-medium text-gray-700 cursor-pointer outline-none"
          >
            <option value="">Categoria</option>
            {Object.entries(CATEGORIA_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="relative">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="appearance-none h-10 w-44 rounded-md bg-white border border-gray-200 px-3 pr-8 text-sm font-medium text-gray-700 cursor-pointer outline-none"
          >
            <option value="">Todos os status</option>
            <option value="aberto">Aberto</option>
            <option value="fechado">Fechado</option>
          </select>
          <FiChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

      </div>

      {/* TABELA */}
      <div className="mt-5 w-full overflow-x-auto">
        <DataTable
          columns={columns}
          data={filteredData}
          filtro={[]}
        />
      </div>

      <DetalheEventoModal
        id={selectedId}
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
      />

      <EditaEventoModal
        id={editId}
        open={editId !== null}
        onClose={() => setEditId(null)}
      />
    </div>
  )
}
