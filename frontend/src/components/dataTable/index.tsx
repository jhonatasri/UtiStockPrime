"use client";

import { Suspense } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Button } from "@/src/components/ui/button";
import { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown, Ellipsis, Filter, FilterX } from "lucide-react";
import { FiltroProps } from "@/types";
import { cn } from "@/src/lib/utils";
import { parseAsInteger, useQueryState } from "nuqs";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filtro: FiltroProps[]
}

function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i);

  const pages: (number | 'ellipsis')[] = [0];

  if (currentPage > 2) pages.push('ellipsis');

  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages - 2, currentPage + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (currentPage < totalPages - 3) pages.push('ellipsis');

  pages.push(totalPages - 1);
  return pages;
}

function DataTableInner<TData, TValue>({
  columns,
  data,
  filtro
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pageIndex, setPageIndex] = useQueryState('pagina', parseAsInteger.withDefault(0));
  const [pageSize] = useState(8);
  const [filter, setFilter] = useState(false);
  const [goToPage, setGoToPage] = useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function'
        ? updater({ pageIndex, pageSize })
        : updater;
      setPageIndex(next.pageIndex);
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    autoResetPageIndex: false,
  });

  const currentPage = table.getState().pagination.pageIndex;
  const totalPages = table.getPageCount();
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="w-full h-full">
      {filtro.length > 0 &&
        <Button className="mb-2" onClick={() => setFilter(!filter)}>
          {filter ? <FilterX /> : <Filter />}
        </Button>
      }
      {filter && (
        <div className="grid grid-cols-4 items-center mb-3 gap-3">
          {filtro.map(({ filtro, placeholder }) => (
            <Input
              key={filtro}
              placeholder={placeholder}
              value={(table.getColumn(filtro)?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn(filtro)?.setFilterValue(event.target.value)
              }
              className="max-w-sm bg-slate-50 drop-shadow-sm"
            />
          ))}
        </div>
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : (
                    header.column.getCanSort() ? (
                      <button
                        className="flex items-center gap-1 select-none hover:text-neutral-900 transition-colors"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc'
                          ? <ChevronUp size={14} />
                          : header.column.getIsSorted() === 'desc'
                            ? <ChevronDown size={14} />
                            : <ChevronsUpDown size={14} className="text-neutral-400" />}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Sem resultados
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* PAGINAÇÃO */}
      <div className="flex items-center justify-center gap-6 py-4">
        {/* Botões de página */}
        <div className="flex items-center gap-1">
          {/* Anterior */}
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="flex items-center gap-1 h-9 px-3 rounded-md text-sm font-medium text-neutral-950 disabled:opacity-40 hover:bg-neutral-100 transition-colors"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>

          {/* Números de página */}
          {pageNumbers.map((page, i) =>
            page === 'ellipsis' ? (
              <span
                key={`ellipsis-${i}`}
                className="flex items-center justify-center w-9 h-9 text-sm font-medium text-neutral-950"
              >
                <Ellipsis size={16} />
              </span>
            ) : (
              <button
                key={page}
                onClick={() => table.setPageIndex(page)}
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-md text-sm font-medium text-neutral-950 transition-colors",
                  page === currentPage
                    ? "bg-white border border-neutral-300 shadow-sm"
                    : "hover:bg-neutral-100"
                )}
              >
                {page + 1}
              </button>
            )
          )}

          {/* Próximo */}
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="flex items-center gap-1 h-9 px-3 rounded-md text-sm font-medium text-neutral-950 disabled:opacity-40 hover:bg-neutral-100 transition-colors"
          >
            Próximo
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Ir para */}
        <div className="flex items-center gap-2 pl-4">
          <span className="text-sm font-medium text-neutral-950">Ir para</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={goToPage}
            onChange={e => setGoToPage(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const page = Number(goToPage) - 1;
                if (page >= 0 && page < totalPages) {
                  table.setPageIndex(page);
                  setGoToPage('');
                }
              }
            }}
            placeholder="1"
            className="w-14 h-9 px-3 py-1 rounded-md bg-white border border-neutral-300 shadow-sm text-base text-neutral-500 outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
    </div>
  );
}

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  return (
    <Suspense>
      <DataTableInner {...props} />
    </Suspense>
  );
}
