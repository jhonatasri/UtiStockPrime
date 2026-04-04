'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link2, ArrowRight, Check, RotateCcw, ClipboardList, Package } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { useListaSangria, useRegistraContagem } from '@/src/http/generated/sangrias/sangrias'
import { useListaBar } from '@/src/http/generated/bares/bares'

// ─── Stepper ─────────────────────────────────────────────────────────────────

function Stepper({ passo }: { passo: 1 | 2 }) {
  const passos = [
    { num: 1, label: 'Recebimento de Fichas' },
    { num: 2, label: 'Contagem' },
  ]
  return (
    <div className="flex items-center gap-0">
      {passos.map((p, i) => (
        <div key={p.num} className="flex items-center">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
              style={{
                backgroundColor: passo >= p.num ? '#253158' : '#E5E7EB',
                color: passo >= p.num ? '#fff' : '#9CA3AF',
              }}
            >
              {passo > p.num ? <Check className="h-4 w-4" /> : p.num}
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: passo >= p.num ? '#0F1E2E' : '#9CA3AF' }}
            >
              {p.label}
            </span>
          </div>
          {i < passos.length - 1 && (
            <ArrowRight className="mx-4 h-4 w-4 text-slate-300" />
          )}
        </div>
      ))}
    </div>
  )
}

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
    <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] px-4 py-3">
      {/* Ícone + info */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF2FF]">
          <Package className="h-5 w-5 text-[#253158]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#1F2933]">{nome}</p>
          <p className="text-xs text-[#6B7280]">{unidadeMedida}</p>
        </div>
      </div>

      {/* Controles */}
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
        <span className="w-10 text-center text-sm font-semibold text-[#1F2933]">
          {quantidade}
        </span>
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

export default function ContagemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const sangriaId = Number(id)
  const router = useRouter()

  const { data: sangria, isLoading: loadingSangria } = useListaSangria(sangriaId)
  const { data: bar, isLoading: loadingBar } = useListaBar(
    sangria?.barId ?? 0,
    { query: { enabled: !!sangria?.barId } }
  )

  // Estado das quantidades por produtoId
  const [quantidades, setQuantidades] = useState<Record<number, number>>({})

  const { mutate: registraContagem, isPending } = useRegistraContagem()

  const produtos = bar?.produtos ?? []

  const totalQuantidade = Object.values(quantidades).reduce((a, b) => a + b, 0)

  function handleChange(produtoId: number, novaQtd: number) {
    setQuantidades((prev) => ({ ...prev, [produtoId]: novaQtd }))
  }

  function handleLimpar() {
    setQuantidades({})
  }

  function handleRegistrar() {
    if (totalQuantidade === 0) return
    registraContagem(
      {
        id: sangriaId,
        data: {
          itens: produtos.map((p) => ({
            produtoId: p.id,
            quantidade: quantidades[p.id] ?? 0,
          })),
        },
      },
      {
        onSuccess: () => {
          router.push('/dashboard/bar/sangrias')
        },
      }
    )
  }

  if (loadingSangria || loadingBar) {
    return (
      <div className="flex h-full items-center justify-center p-10 text-sm text-slate-400">
        Carregando contagem...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 p-6" style={{ backgroundColor: '#F8FAFC', minHeight: '100%' }}>
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1E2E]">Recebimento de Produtos</h1>
          <p className="text-sm text-[#6B7280]">Registre o recebimento dos produtos para iniciar a contagem</p>
        </div>
        <Stepper passo={2} />
      </div>

      {/* Card — Info do bar */}
      <div className="flex items-center justify-between rounded-xl border border-[#D1D5DB] bg-white px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF2FF]">
            <ClipboardList className="h-5 w-5 text-[#253158]" />
          </div>
          <div>
            <p className="text-xs text-[#6B7280]">Contagem de Produtos</p>
            <p className="text-base font-bold text-[#0F1E2E]">{sangria?.barNome}</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-[#7CBC9E] px-3 py-1 text-xs font-medium text-[#7CBC9E]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7CBC9E]" />
          Em Contagem
        </span>
      </div>

      {/* Card — Instruções */}
      <div className="rounded-xl border border-[#CBD5E1] bg-[#EEF2FF] p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Link2 className="h-4 w-4 text-[#45556C]" />
          <span className="text-sm font-semibold text-[#1F2933]">Instruções</span>
        </div>
        <p className="text-sm text-[#45556C]">
          Conte todos os produtos do bar e insira as quantidades abaixo. O sistema calculará automaticamente o total.
        </p>
      </div>

      {/* Card — Contagem por Produto */}
      <div className="rounded-xl border border-[#D1D5DB] bg-white p-5 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Package className="h-4 w-4 text-[#45556C]" />
            <span className="text-base font-semibold text-[#0F1E2E]">Contagem por Produto</span>
          </div>
          <p className="text-sm text-[#6B7280]">Registre a quantidade de cada produto</p>
        </div>

        {produtos.length === 0 ? (
          <p className="text-sm text-[#9CA3AF] py-4 text-center">Nenhum produto associado a este bar.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {produtos.map((p) => (
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

      {/* Barra de totais */}
      <div className="flex items-center justify-center rounded-xl border-2 border-[#253158] bg-white px-6 py-5">
        <div className="text-center">
          <p className="text-sm text-[#6B7280]">Total de Produtos</p>
          <p className="text-3xl font-bold text-[#0F1E2E]">{totalQuantidade}</p>
        </div>
      </div>

      {/* Rodapé */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={handleLimpar}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Limpar Contagem
        </Button>
        <Button
          onClick={handleRegistrar}
          disabled={totalQuantidade === 0 || isPending}
          className="text-white"
          style={{ backgroundColor: totalQuantidade > 0 ? '#7CBC9E' : undefined }}
        >
          <Check className="mr-2 h-4 w-4" />
          {isPending ? 'Registrando...' : 'Registrar Contagem'}
        </Button>
      </div>
    </div>
  )
}
