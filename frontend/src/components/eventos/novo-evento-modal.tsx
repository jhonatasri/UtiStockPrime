'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Package, Plus, User, Users } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { FiSearch } from 'react-icons/fi'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'
import { NativeSelect, NativeSelectOption } from '@/src/components/ui/native-select'
import { Separator } from '@/src/components/ui/separator'
import { Switch } from '@/src/components/ui/switch'

import { useCriaEvento, getListaEventosQueryKey } from '@/src/http/generated/eventos/eventos'
import { CriaEventoBodyCategoria as CategoriaEvento } from '@/src/http/generated/api.schemas'
import { useListaUsuarios } from '@/src/http/generated/usuários/usuários'

const EMAIL_REGEX = /^[A-Za-z0-9_'+\-.]*[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/

const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  categoria: z.enum(Object.values(CategoriaEvento) as [CategoriaEvento, ...CategoriaEvento[]], { error: 'Selecione uma categoria' }),
  ativo: z.boolean(),
  data: z.string().min(1, 'Data é obrigatória'),
  local: z.string().min(2, 'Local é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  responsavelNome: z.string().min(2, 'Nome do responsável é obrigatório'),
  responsavelTelefone: z.string().min(10, 'Telefone inválido'),
  responsavelEmail: z.string().regex(EMAIL_REGEX, 'E-mail inválido'),
})

type FormData = z.infer<typeof schema>

const categoriaLabels: Record<CategoriaEvento, string> = {
  SHOW: 'Show',
  FESTIVAL: 'Festival',
  CORPORATIVO: 'Corporativo',
  PRIVADO: 'Privado',
}

export function NovoEventoModal() {
  const [open, setOpen] = useState(false)
  const [selectedUsuarios, setSelectedUsuarios] = useState<Set<number>>(new Set())
  const [busca, setBusca] = useState('')

  const queryClient = useQueryClient()
  const { mutateAsync: criarEvento, isPending } = useCriaEvento()
  const { data: usuarios = [] } = useListaUsuarios()

  const usuariosFiltrados = usuarios.filter(u =>
    !busca || u.nome.toLowerCase().includes(busca.toLowerCase())
  )

  function toggleUsuario(id: number) {
    setSelectedUsuarios(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ativo: true },
  })

  const values = useWatch({ control })
  const ativo = values.ativo ?? true

  const requiredFields = [
    { ok: (values.nome?.length ?? 0) >= 3 },
    { ok: !!values.categoria },
    { ok: !!(values.data?.length) },
    { ok: (values.local?.length ?? 0) >= 2 },
    { ok: (values.descricao?.length ?? 0) >= 1 },
    { ok: (values.responsavelNome?.length ?? 0) >= 2 },
    { ok: (values.responsavelTelefone?.length ?? 0) >= 10 },
    { ok: EMAIL_REGEX.test(values.responsavelEmail ?? '') },
  ]

  const progress = Math.round((requiredFields.filter(f => f.ok).length / requiredFields.length) * 100)
  const progressColor = progress === 100 ? '#22c55e' : progress >= 60 ? '#f59e0b' : '#ef4444'

  async function onSubmit(data: FormData) {
    await criarEvento({
      data: {
        nome: data.nome,
        categoria: data.categoria,
        ativo: data.ativo,
        data: new Date(data.data).toISOString(),
        local: data.local,
        descricao: data.descricao,
        responsavelNome: data.responsavelNome,
        responsavelTelefone: data.responsavelTelefone,
        responsavelEmail: data.responsavelEmail,
        usuariosIds: Array.from(selectedUsuarios),
      },
    })

    queryClient.invalidateQueries({ queryKey: getListaEventosQueryKey() })
    reset()
    setSelectedUsuarios(new Set())
    setBusca('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#253158] h-11 text-white hover:bg-[#1a2342] w-full sm:w-auto flex gap-2 items-center">
          <Plus size={20} />
          Novo Evento
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastro do Evento</DialogTitle>
        </DialogHeader>

        <div className="px-1 pb-2 flex flex-col gap-5">
          {/* PROGRESS BAR */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Completar cadastro</span>
              <span className="font-semibold tabular-nums" style={{ color: progressColor }}>
                {progress}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, backgroundColor: progressColor }}
              />
            </div>
          </div>

          {/* ALERTA */}
          <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <span className="mt-0.5 text-blue-500">ℹ</span>
            <span>Preencha os dados do evento para que seja registrado no sistema.</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

            {/* ── DADOS BÁSICOS ─────────────────────────── */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Package size={14} className="text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-gray-800">Dados Básicos</span>
                <Separator className="flex-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="nome">Nome do Evento <span className="text-red-500">*</span></Label>
                  <Input id="nome" placeholder="Ex: Workshop de Inventário" {...register('nome')} />
                  {errors.nome && <span className="text-xs text-red-500">{errors.nome.message}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="categoria">Categoria <span className="text-red-500">*</span></Label>
                  <NativeSelect id="categoria" className="h-9 w-full" {...register('categoria')}>
                    <option value="">(Selecione)</option>
                    {Object.entries(categoriaLabels).map(([value, label]) => (
                      <NativeSelectOption key={value} value={value.toUpperCase()}>{label}</NativeSelectOption>
                    ))}
                  </NativeSelect>
                  {errors.categoria && <span className="text-xs text-red-500">{errors.categoria.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="data">Data e Hora <span className="text-red-500">*</span></Label>
                  <Input id="data" type="datetime-local" {...register('data')} />
                  {errors.data && <span className="text-xs text-red-500">{errors.data.message}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="local">Local <span className="text-red-500">*</span></Label>
                  <Input id="local" placeholder="Ex: Auditório Principal" {...register('local')} />
                  {errors.local && <span className="text-xs text-red-500">{errors.local.message}</span>}
                </div>
              </div>

              {/* Status toggle */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <Switch
                    id="ativo"
                    checked={ativo}
                    onCheckedChange={val => setValue('ativo', val)}
                  />
                  <Label htmlFor="ativo" className="cursor-pointer font-medium">
                    Status do Evento
                  </Label>
                </div>
                <p className="text-xs text-gray-500 ml-10">
                  Novos eventos iniciam como &apos;Aberto&apos; por padrão
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="descricao">Descrição <span className="text-red-500">*</span></Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva os objetivos e detalhes do evento..."
                  rows={4}
                  {...register('descricao')}
                />
                {errors.descricao && <span className="text-xs text-red-500">{errors.descricao.message}</span>}
              </div>
            </section>

            {/* ── RESPONSÁVEL ───────────────────────────── */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <User size={14} className="text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-gray-800">Responsável</span>
                <Separator className="flex-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="responsavelNome">
                    Nome do Organizador/Responsável do Evento <span className="text-red-500">*</span>
                  </Label>
                  <Input id="responsavelNome" placeholder="Ex: João Silva" {...register('responsavelNome')} />
                  {errors.responsavelNome && <span className="text-xs text-red-500">{errors.responsavelNome.message}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="responsavelTelefone">Telefone <span className="text-red-500">*</span></Label>
                  <Input id="responsavelTelefone" placeholder="(00) 00000-0000" {...register('responsavelTelefone')} />
                  {errors.responsavelTelefone && <span className="text-xs text-red-500">{errors.responsavelTelefone.message}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="responsavelEmail">E-mail <span className="text-red-500">*</span></Label>
                <Input id="responsavelEmail" type="email" placeholder="email@empresa.com" {...register('responsavelEmail')} />
                {errors.responsavelEmail && <span className="text-xs text-red-500">{errors.responsavelEmail.message}</span>}
              </div>
            </section>

            {/* ── USUÁRIOS ──────────────────────────────── */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <Users size={14} className="text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-gray-800">Usuários</span>
                <Separator className="flex-1" />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Pesquisar</Label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 bg-white">
                  <FiSearch size={15} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Buscar usuário..."
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    className="flex-1 py-2 text-sm bg-transparent outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto rounded-md border border-gray-100 p-1">
                {usuariosFiltrados.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Nenhum usuário encontrado</p>
                ) : (
                  usuariosFiltrados.map(u => (
                    <label
                      key={u.id}
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-md"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsuarios.has(u.id)}
                        onChange={() => toggleUsuario(u.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-[#253158]"
                      />
                      <div className="flex items-center gap-1.5 text-sm text-gray-700 flex-wrap">
                        <span className="font-medium">{u.nome}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">{u.email}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">{u.telefone}</span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </section>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#253158] text-white hover:bg-[#1a2342] disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={isPending || progress < 100}
              >
                {isPending ? 'Salvando...' : 'Salvar Evento'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
