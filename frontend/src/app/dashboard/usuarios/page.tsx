'use client'

import { useState, useMemo } from 'react'
import { CardsComponents } from "@/src/components/cards";
import { NovoUsuarioModal } from "@/src/components/usuarios/novo-usuario-modal";
import { DetalheUsuarioModal } from "@/src/components/usuarios/detalhe-usuario-modal";
import { EditaUsuarioModal } from "@/src/components/usuarios/edita-usuario-modal";
import {
  FiAlertCircle,
  FiChevronDown,
  FiEdit,
  FiEye,
  FiLock,
  FiMoreHorizontal,
  FiSearch,
  FiUserCheck,
  FiUsers,
  FiUserX
} from "react-icons/fi";

import { ColumnDef } from "@tanstack/react-table";
import { useListaUsuarios } from "@/src/http/generated/usuários/usuários";
import { ListaUsuarios200Item } from "@/src/http/generated/api.schemas";
import { DataTable } from "@/src/components/dataTable";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

export default function Usuarios() {
  const { data } = useListaUsuarios();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [filterNome, setFilterNome] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredData = useMemo(() => {
    return (data || []).filter(usuario => {
      const matchNome = !filterNome || usuario.nome?.toLowerCase().includes(filterNome.toLowerCase());
      const matchStatus =
        !filterStatus ||
        (filterStatus === 'ativo' ? usuario.ativo === true : usuario.ativo === false);
      return matchNome && matchStatus;
    });
  }, [data, filterNome, filterStatus]);

  const columns: ColumnDef<ListaUsuarios200Item>[] = [
    {
      accessorKey: "nome",
      header: "Nome",
    },
    {
      accessorKey: "ativo",
      header: "Status",
      cell: ({ row }) =>
        row.original.ativo ? (
          <span className="bg-[#DCFCE7] text-[#016630] text-xs px-3 py-1 rounded-full">
            Ativo
          </span>
        ) : (
          <span className="bg-[#F1F5F9] text-[#45556C] text-xs px-3 py-1 rounded-full">
            Inativo
          </span>
        ),
    },
    {
      accessorKey: "email",
      header: "E-mail",
    },
    {
      accessorKey: "id",
      header: "Ações",
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

              <DropdownMenuItem className="flex items-center gap-2 text-red-500">
                <FiAlertCircle /> Inativar
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="w-full p-4 md:p-6">
      {/* CARDS */}
      <header className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardsComponents
          Title="Total de Usuários"
          Total={Number(data?.length) || 0}
          Icon={<FiUsers size={28} color="#155DFC" />}
          NumberColor="#155DFC"
        />
        <CardsComponents
          Title="Usuários Ativos"
          Total={Number(data?.filter(usuario => usuario.ativo).length) || 0}
          Icon={<FiUserCheck size={28} color="#00A63E" />}
          NumberColor="#00A63E"
        />
        <CardsComponents
          Title="Usuários Inativos"
          Total={Number(data?.filter(usuario => usuario.ativo === false).length) || 0}
          Icon={<FiUserX size={28} color="#45556C" />}
          NumberColor="#45556C"
        />
        <CardsComponents
          Title="Administradores"
          Total={Number(data?.filter(usuario => usuario.funcao === `ADMINISTRADOR`).length) || 0}
          Icon={<FiLock size={28} color="#9810FA" />}
          NumberColor="#9810FA"
        />
      </header>

      {/* TÍTULO + BOTÃO */}
      <section className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-semibold">Listagem de Usuários</h1>
        <NovoUsuarioModal />
      </section>

      {/* FILTROS */}
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        {/* Filtro por nome */}
        <div className="flex flex-1 items-center gap-2 bg-white rounded-md border border-gray-200 px-3">
          <FiSearch size={16} className="shrink-0 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nome do usuário"
            value={filterNome}
            onChange={e => setFilterNome(e.target.value)}
            className="flex-1 py-2 text-base bg-transparent outline-none placeholder:text-gray-500"
          />
        </div>

        {/* Filtro por status */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="appearance-none h-10 w-48 rounded-md bg-white border border-gray-200 px-3 pr-8 text-sm font-medium text-gray-800 cursor-pointer outline-none"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
          <FiChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 opacity-50"
          />
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

      <DetalheUsuarioModal
        id={selectedId}
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
      />

      <EditaUsuarioModal
        id={editId}
        open={editId !== null}
        onClose={() => setEditId(null)}
      />
    </div>
  );
}
