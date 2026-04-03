'use client'

import { useState, useEffect, useMemo } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Check, Store, User, MapPin, Package, Users } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { useCriaBar, useAlteraBar, useListaBar } from '@/src/http/generated/bares/bares'
import { useListaProdutos } from '@/src/http/generated/produtos/produtos'
import { useListaUsuarios } from '@/src/http/generated/usuários/usuários'
import { ListaBares200Item, ListaProdutos200Item, ListaUsuarios200Item } from '@/src/http/generated/api.schemas'

// ─── Types ───────────────────────────────────────────────────────────────────

interface DadosBar {
  nome: string
  liderNome: string
  area: string
  setor: string
  descricao: string
}

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  eventoId?: number
  barInicial?: ListaBares200Item | null
  onSuccess: () => void
}

// ─── Stepper ─────────────────────────────────────────────────────────────────

const PASSOS = [
  { num: 1, titulo: 'Dados do Bar', sub: 'Informações do Bar' },
  { num: 2, titulo: 'Produtos', sub: 'Itens disponíveis' },
  { num: 3, titulo: 'Sangrias', sub: 'Usuários responsáveis' },
  { num: 4, titulo: 'Resumo', sub: 'Revisar e ativar' },
]

function Stepper({ passo }: { passo: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {PASSOS.map((p, i) => (
        <div key={p.num} className="flex items-center">
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium"
              style={{
                backgroundColor: '#1D3A59',
                border: passo === p.num ? '2px solid #7CBC9E' : passo > p.num ? '2px solid #1D3A59' : '2px solid rgba(29,58,89,0.4)',
                color: '#7CBC9E',
              }}
            >
              {passo > p.num ? <Check className="h-4 w-4" /> : p.num}
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs font-bold text-center" style={{ color: passo >= p.num ? '#0F1E2E' : '#6A7282' }}>{p.titulo}</span>
              <span className="text-[11px] text-center text-slate-400">{p.sub}</span>
            </div>
          </div>
          {i < PASSOS.length - 1 && (
            <div className="mx-2 mb-6 h-0.5 w-16 bg-slate-200" />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Passo 1: Dados do Bar ────────────────────────────────────────────────────

function PassoDados({ dados, onChange }: { dados: DadosBar; onChange: (d: DadosBar) => void }) {
  function set(key: keyof DadosBar, val: string) {
    onChange({ ...dados, [key]: val })
  }
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-medium text-[#0A0A0A]">Dados Básicos</h3>
      </div>

      {/* Nome */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">
          Nome do Bar <span className="text-red-500">*</span>
        </label>
        <input
          className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D3A59]"
          placeholder="Ex: Bar Principal, Bar VIP, Bar Área Externa"
          value={dados.nome}
          onChange={(e) => set('nome', e.target.value)}
        />
      </div>

      {/* Líder */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Líder do Bar</label>
        <input
          className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D3A59]"
          placeholder="Digite o nome do líder..."
          value={dados.liderNome}
          onChange={(e) => set('liderNome', e.target.value)}
        />
      </div>

      {/* Localização */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Localização</label>
        <p className="text-xs text-slate-400">Informe a área e setor onde o bar estará localizado no evento</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">Área <span className="text-red-500">*</span></label>
            <input
              className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D3A59]"
              placeholder="Ex: Área Externa"
              value={dados.area}
              onChange={(e) => set('area', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">Setor <span className="text-red-500">*</span></label>
            <input
              className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D3A59]"
              placeholder="Ex: 1"
              value={dados.setor}
              onChange={(e) => set('setor', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Descrição */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Descrição</label>
        <textarea
          className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D3A59] resize-none"
          rows={3}
          placeholder='Adicione informações complementares sobre a localização... Ex: "Próximo ao palco principal"'
          value={dados.descricao}
          onChange={(e) => set('descricao', e.target.value)}
        />
      </div>
    </div>
  )
}

// ─── Passo 2: Produtos ────────────────────────────────────────────────────────

function PassoProdutos({
  eventoId,
  selecionados,
  onChange,
}: {
  eventoId?: number
  selecionados: number[]
  onChange: (ids: number[]) => void
}) {
  const [busca, setBusca] = useState('')
  const { data: produtos = [] } = useListaProdutos({ eventoId })

  const ativos = produtos.filter(p => p.ativo)

  const filtrados = useMemo(
    () => ativos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase())),
    [ativos, busca]
  )

  const porCategoria = useMemo(() => {
    return filtrados.reduce<Record<string, ListaProdutos200Item[]>>((acc, p) => {
      acc[p.categoria] = acc[p.categoria] ? [...acc[p.categoria], p] : [p]
      return acc
    }, {})
  }, [filtrados])

  function toggle(id: number) {
    onChange(selecionados.includes(id) ? selecionados.filter(s => s !== id) : [...selecionados, id])
  }

  function toggleAll() {
    if (selecionados.length === ativos.length) onChange([])
    else onChange(ativos.map(p => p.id))
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-base font-medium text-[#0A0A0A]">Associar Produtos ao Bar</h3>
        <p className="text-sm text-slate-400">Selecione os produtos que estarão disponíveis neste bar</p>
      </div>

      {/* Contagem + Selecionar todos */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{selecionados.length} produtos selecionados</span>
        <button
          type="button"
          onClick={toggleAll}
          className="text-sm font-medium text-[#1D3A59] hover:underline"
        >
          {selecionados.length === ativos.length ? 'Desmarcar todos' : 'Selecionar todos'}
        </button>
      </div>

      {/* Busca */}
      <input
        className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D3A59]"
        placeholder="Buscar produtos..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      {/* Lista por categoria */}
      <div className="flex flex-col gap-4 max-h-80 overflow-y-auto pr-1">
        {Object.entries(porCategoria).map(([cat, itens]) => (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase text-slate-500">{cat}</span>
              <span className="text-xs text-slate-400">{itens.length}</span>
            </div>
            <div className="flex flex-col gap-1">
              {itens.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
                  style={selecionados.includes(p.id) ? { borderColor: '#1D3A59', backgroundColor: '#F0F4F8' } : {}}
                >
                  <input
                    type="checkbox"
                    checked={selecionados.includes(p.id)}
                    onChange={() => toggle(p.id)}
                    className="accent-[#1D3A59]"
                  />
                  <div className="flex flex-1 items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{p.nome}</span>
                    <span className="text-xs text-slate-400">Unidade: {p.unidadeMedida.toUpperCase()}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
        {filtrados.length === 0 && (
          <p className="text-sm text-center text-slate-400 py-4">Nenhum produto encontrado</p>
        )}
      </div>
    </div>
  )
}

// ─── Passo 3: Sangrias ────────────────────────────────────────────────────────

function PassoSangrias({
  selecionados,
  onChange,
}: {
  selecionados: number[]
  onChange: (ids: number[]) => void
}) {
  const [busca, setBusca] = useState('')
  const { data: usuarios = [] } = useListaUsuarios()

  const ativos = usuarios.filter((u) => u.ativo)

  const filtrados = useMemo(
    () =>
      ativos.filter(
        (u) =>
          u.nome.toLowerCase().includes(busca.toLowerCase()) ||
          u.email.toLowerCase().includes(busca.toLowerCase())
      ),
    [ativos, busca]
  )

  function toggle(id: number) {
    onChange(selecionados.includes(id) ? selecionados.filter((s) => s !== id) : [...selecionados, id])
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-base font-medium text-[#0A0A0A]">Usuários de Sangria</h3>
        <p className="text-sm text-slate-400">Selecione os usuários que realizarão sangrias neste bar</p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{selecionados.length} usuário{selecionados.length !== 1 ? 's' : ''} selecionado{selecionados.length !== 1 ? 's' : ''}</span>
        <button
          type="button"
          onClick={() => onChange(selecionados.length === ativos.length ? [] : ativos.map((u) => u.id))}
          className="text-sm font-medium text-[#1D3A59] hover:underline"
        >
          {selecionados.length === ativos.length ? 'Desmarcar todos' : 'Selecionar todos'}
        </button>
      </div>

      <input
        className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D3A59]"
        placeholder="Buscar por nome ou e-mail..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <div className="flex flex-col gap-1 max-h-80 overflow-y-auto pr-1">
        {filtrados.length === 0 ? (
          <p className="text-sm text-center text-slate-400 py-4">Nenhum usuário encontrado</p>
        ) : (
          filtrados.map((u) => (
            <label
              key={u.id}
              className="flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
              style={selecionados.includes(u.id) ? { borderColor: '#1D3A59', backgroundColor: '#F0F4F8' } : {}}
            >
              <input
                type="checkbox"
                checked={selecionados.includes(u.id)}
                onChange={() => toggle(u.id)}
                className="accent-[#1D3A59]"
              />
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">{u.nome}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                <span className="text-xs text-slate-400">{u.funcao as string}</span>
              </div>
            </label>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Passo 4: Resumo ──────────────────────────────────────────────────────────

function PassoResumo({
  dados,
  eventoId,
  produtosIds,
  usuariosIds,
}: {
  dados: DadosBar
  eventoId?: number
  produtosIds: number[]
  usuariosIds: number[]
}) {
  const { data: produtos = [] } = useListaProdutos({ eventoId })
  const selecionados = produtos.filter(p => produtosIds.includes(p.id))

  const itens = [
    { icon: Store, label: 'Nome do Bar', value: dados.nome || '—' },
    { icon: User, label: 'Líder Definido', value: dados.liderNome || '—' },
    { icon: MapPin, label: 'Localização', value: [dados.area, dados.setor].filter(Boolean).join(' - ') || '—' },
    { icon: Package, label: 'Produtos Associados', value: `${produtosIds.length} produto${produtosIds.length !== 1 ? 's' : ''}` },
    { icon: Users, label: 'Usuários de Sangria', value: `${usuariosIds.length} usuário${usuariosIds.length !== 1 ? 's' : ''}` },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-medium text-[#0A0A0A]">Resumo</h3>
        <p className="text-sm text-slate-400">Revise os dados do bar antes de ativá-lo</p>
      </div>

      {/* Alert */}
      <div className="flex items-start gap-3 rounded-xl border border-[#00A63E] bg-[#F0FDF4] p-4">
        <Check className="mt-0.5 h-4 w-4 text-[#016630]" />
        <div>
          <p className="text-sm font-bold text-[#016630]">Tudo pronto!</p>
          <p className="text-sm text-[#016630]">
            O bar está configurado e pode ser ativado. Após a ativação, você poderá registrar movimentações de estoque.
          </p>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="flex flex-col gap-3">
        {itens.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border px-4 py-3">
            <Icon className="h-5 w-5 text-slate-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-[#0A0A0A]">{label}</p>
              <p className="text-sm text-slate-500">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lista de produtos */}
      {selecionados.length > 0 && (
        <div className="rounded-xl border px-4 py-3">
          <p className="text-sm font-medium text-[#0A0A0A] mb-3">Produtos do Bar</p>
          <div className="flex flex-wrap gap-2">
            {selecionados.map(p => (
              <div key={p.id} className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[#155DFC]" />
                <span className="text-sm text-slate-500">{p.nome}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Modal Principal ──────────────────────────────────────────────────────────

export function ModalCadastroBar({ open, onOpenChange, eventoId, barInicial, onSuccess }: Props) {
  const isEdicao = !!barInicial

  const [passo, setPasso] = useState(1)
  const [dados, setDados] = useState<DadosBar>({
    nome: '', liderNome: '', area: '', setor: '', descricao: '',
  })
  const [produtosSelecionados, setProdutosSelecionados] = useState<number[]>([])
  const [usuariosSelecionados, setUsuariosSelecionados] = useState<number[]>([])
  const [carregandoInicial, setCarregandoInicial] = useState(isEdicao)

  const { data: barDetalhe } = useListaBar(barInicial?.id ?? 0, {
    query: { enabled: isEdicao && open },
  })

  useEffect(() => {
    if (!open) {
      setPasso(1)
      setDados({ nome: '', liderNome: '', area: '', setor: '', descricao: '' })
      setProdutosSelecionados([])
      setUsuariosSelecionados([])
      setCarregandoInicial(isEdicao)
    }
  }, [open, isEdicao])

  useEffect(() => {
    if (barDetalhe) {
      setDados({
        nome: barDetalhe.nome ?? '',
        liderNome: barDetalhe.liderNome ?? '',
        area: barDetalhe.area ?? '',
        setor: barDetalhe.setor ?? '',
        descricao: barDetalhe.descricao ?? '',
      })
      setProdutosSelecionados(barDetalhe.produtos.map(p => p.id))
      setUsuariosSelecionados(barDetalhe.usuarios.map(u => u.id))
      setCarregandoInicial(false)
    }
  }, [barDetalhe])

  const { mutate: criaBar, isPending: criando } = useCriaBar()
  const { mutate: alteraBar, isPending: alterando } = useAlteraBar()
  const salvando = criando || alterando

  function podeAvancar() {
    if (passo === 1) return dados.nome.trim().length > 0
    return true
  }

  function avancar() {
    if (passo < 4) setPasso(p => p + 1)
  }

  function voltar() {
    if (passo > 1) setPasso(p => p - 1)
  }

  function salvar() {
    const body = {
      nome: dados.nome,
      liderNome: dados.liderNome || undefined,
      area: dados.area || undefined,
      setor: dados.setor || undefined,
      descricao: dados.descricao || undefined,
      eventoId,
      produtosIds: produtosSelecionados,
      usuariosIds: usuariosSelecionados,
      ativo: true,
      status: 'ABERTO',
    }

    if (isEdicao && barInicial) {
      alteraBar({ id: barInicial.id, data: body }, { onSuccess })
    } else {
      criaBar({ data: body }, { onSuccess })
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl outline-none">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <Dialog.Title className="text-lg font-semibold text-[#0F1E2E]">
              {isEdicao ? 'Editar Bar' : 'Novo Bar'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-md p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Stepper */}
          <div className="border-b px-6 py-5">
            <Stepper passo={passo} />
          </div>

          {/* Conteúdo */}
          <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
            {carregandoInicial ? (
              <p className="text-center text-sm text-slate-400 py-8">Carregando dados...</p>
            ) : (
              <>
                {passo === 1 && <PassoDados dados={dados} onChange={setDados} />}
                {passo === 2 && (
                  <PassoProdutos
                    eventoId={eventoId}
                    selecionados={produtosSelecionados}
                    onChange={setProdutosSelecionados}
                  />
                )}
                {passo === 3 && (
                  <PassoSangrias
                    selecionados={usuariosSelecionados}
                    onChange={setUsuariosSelecionados}
                  />
                )}
                {passo === 4 && (
                  <PassoResumo
                    dados={dados}
                    eventoId={eventoId}
                    produtosIds={produtosSelecionados}
                    usuariosIds={usuariosSelecionados}
                  />
                )}
              </>
            )}
          </div>

          {/* Rodapé */}
          <div className="flex items-center justify-between border-t px-6 py-4">
            <Button variant="outline" onClick={passo === 1 ? () => onOpenChange(false) : voltar}>
              Voltar
            </Button>
            {passo < 4 ? (
              <Button onClick={avancar} disabled={!podeAvancar()}>
                Continuar
              </Button>
            ) : (
              <Button onClick={salvar} disabled={salvando} style={{ backgroundColor: '#1D3A59' }}>
                {salvando ? 'Salvando...' : isEdicao ? 'Salvar alterações' : 'Ativar Bar'}
              </Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
