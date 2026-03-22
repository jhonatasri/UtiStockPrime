'use client'

import { useState } from 'react'
import { CardsComponents } from "@/src/components/cards";
import { NovoUsuarioModal } from "@/src/components/usuarios/novo-usuario-modal";
import { DetalheUsuarioModal } from "@/src/components/usuarios/detalhe-usuario-modal";
import { EditaUsuarioModal } from "@/src/components/usuarios/edita-usuario-modal";
import {
  FiAlertCircle,
  FiEdit,
  FiEye,
  FiLock,
  FiMoreHorizontal,
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

      {/* TABELA */}
      <div className="mt-5 w-full overflow-x-auto">
        <DataTable
          columns={columns}
          data={data || []}
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
