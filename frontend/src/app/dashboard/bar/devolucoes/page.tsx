'use client'

import { useContext, useMemo, useState } from 'react'
import { CalendarDays, User, Package, Check, RotateCcw, Undo2, Info, Search } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { useListaBares } from '@/src/http/generated/bares/bares'
import { useListaBar } from '@/src/http/generated/bares/bares'
import { useCriaDevolucao } from '@/src/http/generated/devoluções/devoluções'
import { AuthContext } from '@/src/providers/AuthContext'

// ─── Row de produto ───────────────────────────────────────────────────────────

function ProdutoRow({
  nome,
  unidadeMedida,
  quantidade,
  onChange,
}: {
  nome: string
  unidadeMedida: string
  quantidade: number
  onChange: (novaQtd: number) => void
}) {
  function ajustar(delta: number) {
    onChange(Math.max(0, quantidade + delta))
  }

  return (
    <div
      className="flex items-center justify-between rounded-xl border px-4 py-3 transition-colors"
      style={{
        borderColor: quantidade > 0 ? '#7CBC9E' : '#E5E7EB',
        backgroundColor: quantidade > 0 ? '#F0FDF4' : '#fff',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: quantidade > 0 ? '#DCFCE7' : '#EEF2FF' }}
        >
          <Package
            className="h-5 w-5"
            style={{ color: quantidade > 0 ? '#16A34A' : '#253158' }}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-[#1F2933]">{nome}</p>
          <p className="text-xs text-[#6B7280]">{unidadeMedida}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => ajustar(-10)}
          className="rounded-md border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:bg-slate-50 transition-colors"
        >
          −10
        </button>
        <button
          onClick={() => ajustar(-1)}
          className="rounded-md border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:bg-slate-50 transition-colors"
        >
          −
        </button>
        <input
          type="number"
          min="0"
          value={quantidade === 0 ? '' : quantidade}
          placeholder="0"
          onChange={(e) => {
            const v = parseInt(e.target.value)
            onChange(isNaN(v) || v < 0 ? 0 : v)
          }}
          className="w-14 rounded-md border border-[#E5E7EB] bg-white px-2 py-1.5 text-center text-sm font-semibold text-[#1F2933] outline-none focus:ring-2 focus:ring-[#253158]"
        />
        <button
          onClick={() => ajustar(1)}
          className="rounded-md border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:bg-slate-50 transition-colors"
        >
          +
        </button>
        <button
          onClick={() => ajustar(10)}
          className="rounded-md border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:bg-slate-50 transition-colors"
        >
          +10
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DevolucoesPage() {
  const { user } = useContext(AuthContext)

  const eventoId =
    typeof window !== 'undefined'
      ? Number(localStorage.getItem('selected-team-id')) || undefined
      : undefined

  const usuarioId = user ? Number(user.usuario.id) : undefined

  const dataHora = useMemo(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }, [])
  const [barId, setBarId] = useState<number | ''>('')
  const [responsavel, setResponsavel] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [busca, setBusca] = useState('')
  const [quantidades, setQuantidades] = useState<Record<number, number>>({})
  const [sucesso, setSucesso] = useState(false)

  const { data: bares = [] } = useListaBares({ eventoId, usuarioId })
  const baresAtivos = bares.filter((b) => b.ativo)

  const { data: bar, isLoading: loadingBar } = useListaBar(
    Number(barId),
    { query: { enabled: !!barId } }
  )

  const { mutate: criaDevolucao, isPending } = useCriaDevolucao()

  const produtos = bar?.produtos ?? []

  const produtosFiltrados = useMemo(
    () =>
      busca.trim()
        ? produtos.filter((p) =>
            p.nome.toLowerCase().includes(busca.toLowerCase()) ||
            p.categoria.toLowerCase().includes(busca.toLowerCase())
          )
        : produtos,
    [produtos, busca]
  )

  const itensSelecionados = produtos.filter((p) => (quantidades[p.id] ?? 0) > 0)
  const totalQuantidade = itensSelecionados.reduce((acc, p) => acc + (quantidades[p.id] ?? 0), 0)

  function handleChange(produtoId: number, novaQtd: number) {
    setQuantidades((prev) => ({ ...prev, [produtoId]: novaQtd }))
  }

  function handleLimpar() {
    setQuantidades({})
  }

  function podeRegistrar() {
    return !!barId && responsavel.trim().length > 0 && totalQuantidade > 0
  }

  function handleRegistrar() {
    if (!podeRegistrar() || !usuarioId) return

    criaDevolucao(
      {
        data: {
          barId: Number(barId),
          usuarioId,
          responsavel: responsavel.trim(),
          dataHora: new Date(dataHora).toISOString(),
          observacoes: observacoes.trim() || undefined,
          eventoId,
          itens: itensSelecionados.map((p) => ({
            produtoId: p.id,
            quantidade: quantidades[p.id],
          })),
        },
      },
      {
        onSuccess: () => {
          setSucesso(true)
          setQuantidades({})
          setBarId('')
          setResponsavel('')
          setObservacoes('')
          setTimeout(() => setSucesso(false), 4000)
        },
      }
    )
  }

  return (
    <div className="flex flex-col gap-5 p-6" style={{ backgroundColor: '#F8FAFC', minHeight: '100%' }}>
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F1E2E]">Devolução de Produtos</h1>
        <p className="text-sm text-[#6B7280]">Registre a devolução de produtos de um bar</p>
      </div>

      {/* Banner de sucesso */}
      {sucesso && (
        <div className="flex items-center gap-3 rounded-xl border border-[#7CBC9E] bg-[#F0FDF4] px-5 py-3">
          <Check className="h-5 w-5 text-[#16A34A]" />
          <span className="text-sm font-medium text-[#16A34A]">Devolução registrada com sucesso!</span>
        </div>
      )}

      {/* Card — Informações */}
      <div className="rounded-xl border border-[#D1D5DB] bg-white p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-[#0F1E2E]">Informações da Devolução</h2>
          <p className="text-sm text-[#6B7280]">Preencha os dados antes de selecionar os produtos</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Data e Hora */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2933]">Data e Hora</label>
            <div className="flex items-center gap-2 rounded-md border border-[#D1D5DB] bg-[#F5F7FA] px-3 py-2 cursor-not-allowed opacity-70">
              <CalendarDays className="h-4 w-4 shrink-0 text-[#6B7280]" />
              <input
                type="datetime-local"
                className="flex-1 bg-transparent text-sm outline-none cursor-not-allowed"
                value={dataHora}
                readOnly
              />
            </div>
          </div>

          {/* Bar */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2933]">
              Bar <span className="text-red-500">*</span>
            </label>
            <select
              className="rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#253158]"
              value={barId}
              onChange={(e) => {
                setBarId(e.target.value ? Number(e.target.value) : '')
                setQuantidades({})
                setBusca('')
              }}
            >
              <option value="">(Selecione o Bar)</option>
              {baresAtivos.map((b) => (
                <option key={b.id} value={b.id}>{b.nome}</option>
              ))}
            </select>
          </div>

          {/* Responsável */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2933]">
              Responsável <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 rounded-md border border-[#D1D5DB] bg-white px-3 py-2">
              <User className="h-4 w-4 shrink-0 text-[#6B7280]" />
              <input
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#9D9D9D]"
                placeholder="Nome do responsável"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#1F2933]">Observações</label>
          <textarea
            rows={2}
            className="rounded-md border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#253158] resize-none"
            placeholder="Informações adicionais sobre a devolução..."
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        </div>
      </div>

      {/* Card — Produtos */}
      {barId && (
        <>
          {loadingBar ? (
            <div className="flex items-center justify-center py-10 text-sm text-slate-400">
              Carregando produtos do bar...
            </div>
          ) : (
            <div className="rounded-xl border border-[#D1D5DB] bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Package className="h-4 w-4 text-[#45556C]" />
                    <span className="text-base font-semibold text-[#0F1E2E]">Produtos do Bar</span>
                  </div>
                  <p className="text-sm text-[#6B7280]">
                    Informe a quantidade de cada produto a devolver
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-[#D1D5DB] px-3 py-1 text-xs text-[#6B7280]">
                  <Info className="h-3.5 w-3.5" />
                  {bar?.nome}
                </div>
              </div>

              {/* Busca */}
              {produtos.length > 0 && (
                <div className="flex items-center gap-2 rounded-md border border-[#E5E5E5] bg-white px-3 py-2">
                  <Search className="h-4 w-4 shrink-0 text-[#6B7280]" />
                  <input
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#9D9D9D]"
                    placeholder="Buscar produto..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
              )}

              {produtos.length === 0 ? (
                <p className="py-6 text-center text-sm text-[#9CA3AF]">
                  Nenhum produto associado a este bar.
                </p>
              ) : produtosFiltrados.length === 0 ? (
                <p className="py-6 text-center text-sm text-[#9CA3AF]">
                  Nenhum produto encontrado para &ldquo;{busca}&rdquo;.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {produtosFiltrados.map((p) => (
                    <ProdutoRow
                      key={p.id}
                      nome={p.nome}
                      unidadeMedida={p.unidadeMedida}
                      quantidade={quantidades[p.id] ?? 0}
                      onChange={(qtd) => handleChange(p.id, qtd)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Card — Resumo da devolução */}
      {itensSelecionados.length > 0 && (
        <div className="rounded-xl border border-[#D1D5DB] bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="text-base font-semibold text-[#0F1E2E]">Resumo da Devolução</h2>
            <span className="text-sm text-[#6B7280]">
              {itensSelecionados.length} produto{itensSelecionados.length > 1 ? 's' : ''} selecionado{itensSelecionados.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="divide-y divide-[#F3F4F6]">
            {itensSelecionados.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="text-[#1F2933]">{p.nome}</span>
                <span className="font-semibold text-[#16A34A]">
                  {quantidades[p.id]} {p.unidadeMedida.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t bg-[#F8FAFC] px-5 py-3">
            <span className="text-sm text-[#6B7280]">Total de itens devolvidos:</span>
            <span className="text-lg font-bold text-[#0F1E2E]">{totalQuantidade}</span>
          </div>
        </div>
      )}

      {/* Rodapé */}
      {barId && (
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleLimpar} disabled={totalQuantidade === 0}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Limpar
          </Button>
          <Button
            onClick={handleRegistrar}
            disabled={!podeRegistrar() || isPending}
            className="text-white"
            style={{ backgroundColor: podeRegistrar() ? '#7CBC9E' : undefined }}
          >
            <Undo2 className="mr-2 h-4 w-4" />
            {isPending ? 'Registrando...' : 'Registrar Devolução'}
          </Button>
        </div>
      )}
    </div>
  )
}
