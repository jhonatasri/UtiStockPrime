'use client'

import { useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, User, Link2, Check, ArrowRight } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { useListaBares } from '@/src/http/generated/bares/bares'
import { useListaSangrias, useCriaSangria } from '@/src/http/generated/sangrias/sangrias'
import { AuthContext } from '@/src/providers/AuthContext'

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SangriasPage() {
  const router = useRouter()
  const { user } = useContext(AuthContext)

  const eventoId =
    typeof window !== 'undefined'
      ? Number(localStorage.getItem('selected-team-id')) || undefined
      : undefined

  const usuarioId = user ? Number(user.usuario.id) : undefined

  // Checa se há sangria aberta para este evento + usuário — redireciona automaticamente
  const { data: sangriasAbertas = [], isLoading: verificando } = useListaSangrias(
    { eventoId, usuarioId, status: 'ABERTA' },
    { query: { enabled: !!usuarioId } }
  )

  useEffect(() => {
    if (!verificando && sangriasAbertas.length > 0) {
      router.replace(`/dashboard/bar/sangrias/${sangriasAbertas[0].id}/contagem`)
    }
  }, [sangriasAbertas, verificando, router])

  const dataHora = useMemo(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }, [])
  const [barId, setBarId] = useState<number | ''>('')
  const [responsavel, setResponsavel] = useState('')

  const { data: bares = [] } = useListaBares({ eventoId, usuarioId })
  const baresAtivos = bares.filter((b) => b.ativo)
  const barSelecionado = baresAtivos.find((b) => b.id === barId)

  const { mutate: criaSangria, isPending } = useCriaSangria()

  function podeIniciar() {
    return !!barId && responsavel.trim().length > 0
  }

  function handleIniciarContagem() {
    if (!podeIniciar() || !usuarioId) return
    criaSangria(
      {
        data: {
          barId: Number(barId),
          usuarioId,
          responsavel: responsavel.trim(),
          dataHora: new Date(dataHora).toISOString(),
          eventoId,
        },
      },
      {
        onSuccess: ({ id }) => {
          router.push(`/dashboard/bar/sangrias/${id}/contagem`)
        },
      }
    )
  }

  function formatarDataHora(iso: string) {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (verificando) {
    return (
      <div className="flex h-full items-center justify-center p-10 text-sm text-slate-400">
        Verificando sangrias em andamento...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 p-6" style={{ backgroundColor: '#F8FAFC', minHeight: '100%' }}>
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1E2E]">Recebimento de Fichas</h1>
          <p className="text-sm text-[#6B7280]">Registre o recebimento de fichas para iniciar a contagem</p>
        </div>
        <Stepper passo={1} />
      </div>

      {/* Card — Informações do Bar */}
      <div className="rounded-xl border border-[#D1D5DB] bg-white p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-[#0F1E2E]">Informações do Bar</h2>
          <p className="text-sm text-[#6B7280]">Selecione o bar que está enviando as fichas para contagem</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Data e Hora */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2933]">Data e Hora do Recebimento</label>
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

          {/* Bar Origem */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2933]">Bar Origem</label>
            <select
              className="rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#253158]"
              value={barId}
              onChange={(e) => setBarId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">(Selecione o Bar)</option>
              {baresAtivos.map((b) => (
                <option key={b.id} value={b.id}>{b.nome}</option>
              ))}
            </select>
          </div>

          {/* Responsável */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1F2933]">Responsável pela Envio</label>
            <div className="flex items-center gap-2 rounded-md border border-[#D1D5DB] bg-white px-3 py-2">
              <User className="h-4 w-4 shrink-0 text-[#6B7280]" />
              <input
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#9D9D9D]"
                placeholder="Digite o nome do responsável"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card — Instruções */}
      <div className="rounded-xl border border-[#CBD5E1] bg-[#EEF2FF] p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-[#45556C]" />
          <span className="text-sm font-semibold text-[#1F2933]">Instruções</span>
        </div>
        <ul className="space-y-1.5 pl-1">
          {[
            'Confirme o recebimento das fichas do bar selecionado',
            'Verifique se o responsável está correto',
            'Após confirmar, você será direcionado para a contagem',
            'A contagem deve ser feita imediatamente após o recebimento',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-[#45556C]">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#45556C]" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Card — Resumo (aparece quando bar está selecionado) */}
      {barSelecionado && (
        <div className="rounded-xl border border-[#D1D5DB] bg-white p-5 space-y-3">
          <h2 className="text-base font-semibold text-[#0F1E2E]">Resumo do Recebimento</h2>
          <div className="flex flex-col divide-y divide-[#F3F4F6]">
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-[#6B7280]">Bar:</span>
              <span className="font-medium text-[#1F2933]">{barSelecionado.nome}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-[#6B7280]">Responsável:</span>
              <span className="font-medium text-[#1F2933]">{responsavel || '—'}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-[#6B7280]">Data/Hora:</span>
              <span className="font-medium text-[#1F2933]">{formatarDataHora(dataHora)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Botão Iniciar Contagem */}
      {barSelecionado && (
        <div className="flex justify-end">
          <Button
            onClick={handleIniciarContagem}
            disabled={!podeIniciar() || isPending}
            className="text-white"
            style={{ backgroundColor: '#7CBC9E' }}
          >
            <Check className="mr-2 h-4 w-4" />
            {isPending ? 'Registrando...' : 'Iniciar Contagem'}
          </Button>
        </div>
      )}
    </div>
  )
}
