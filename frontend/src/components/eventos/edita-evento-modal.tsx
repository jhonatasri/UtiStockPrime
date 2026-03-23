'use client'

import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Package, User, Users } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { FiSearch } from 'react-icons/fi'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'
import { NativeSelect, NativeSelectOption } from '@/src/components/ui/native-select'
import { Separator } from '@/src/components/ui/separator'
import { Switch } from '@/src/components/ui/switch'

import { useAlteraEvento, useListaEvento, getListaEventosQueryKey } from '@/src/http/generated/eventos/eventos'
import { CategoriaEvento } from '@/src/http/generated/api.schemas'
import { useListaUsuarios } from '@/src/http/generated/usuários/usuários'

type Props = {
  id: number | null
  open: boolean
  onClose: () => void
}

const EMAIL_REGEX = /^[A-Za-z0-9_'+\-.]*[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/

const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  categoria: z.enum(Object.values(CategoriaEvento) as [CategoriaEvento, ...CategoriaEvento[]], { error: 'Selecione uma categoria' }),
  ativo: z.boolean(),
  data: z.string().optional(),
  local: z.string().optional(),
  descricao: z.string().optional(),
  responsavelNome: z.string().optional(),
  responsavelTelefone: z.string().optional(),
  responsavelEmail: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const categoriaLabels: Record<CategoriaEvento, string> = {
  SHOW: 'Show',
  FESTIVAL: 'Festival',
  CORPORATIVO: 'Corporativo',
  PRIVADO: 'Privado',
}

export function EditaEventoModal({ id, open, onClose }: Props) {
  const [selectedUsuarios, setSelectedUsuarios] = useState<Set<number>>(new Set())
  const [busca, setBusca] = useState('')

  const queryClient = useQueryClient()
  const { mutateAsync: alterarEvento, isPending } = useAlteraEvento()
  const { data: usuarios = [] } = useListaUsuarios()

  const { data: evento } = useListaEvento(id ?? 0, {
    query: { enabled: open && id !== null },
  })

  const usuariosFiltrados = usuarios.filter(u =>
    !busca || u.nome.toLowerCase().includes(busca.toLowerCase())
  )

  function toggleUsuario(uid: number) {
    setSelectedUsuarios(prev => {
      const next = new Set(prev)
      next.has(uid) ? next.delete(uid) : next.add(uid)
      return next
    })
  }

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const ativo = watch('ativo')
  useWatch({ control })

  useEffect(() => {
    if (evento) {
      reset({
        nome: evento.nome,
        categoria: evento.categoria as CategoriaEvento,
        ativo: evento.ativo,
        data: evento.data ? evento.data.slice(0, 16) : '',
        local: evento.local ?? '',
        descricao: evento.descricao ?? '',
        responsavelNome: evento.responsavelNome ?? '',
        responsavelTelefone: evento.responsavelTelefone ?? '',
        responsavelEmail: evento.responsavelEmail ?? '',
      })
      setSelectedUsuarios(new Set(evento.usuariosIds ?? []))
    }
  }, [evento, reset])

  async function onSubmit(data: FormData) {
    if (!id) return

    await alterarEvento({
      id,
      data: {
        nome: data.nome,
        categoria: data.categoria,
        ativo: data.ativo,
        data: data.data ? new Date(data.data).toISOString() : undefined,
        local: data.local,
        descricao: data.descricao,
        responsavelNome: data.responsavelNome,
        responsavelTelefone: data.responsavelTelefone,
        responsavelEmail: data.responsavelEmail,
        usuariosIds: Array.from(selectedUsuarios),
      },
    })

    queryClient.invalidateQueries({ queryKey: getListaEventosQueryKey() })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
        </DialogHeader>

        <div className="px-1 pb-2 flex flex-col gap-5">
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
                      <NativeSelectOption key={value} value={value}>{label}</NativeSelectOption>
                    ))}
                  </NativeSelect>
                  {errors.categoria && <span className="text-xs text-red-500">{errors.categoria.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="data">Data e Hora</Label>
                  <Input id="data" type="datetime-local" {...register('data')} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="local">Local</Label>
                  <Input id="local" placeholder="Ex: Auditório Principal" {...register('local')} />
                </div>
              </div>

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
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva os objetivos e detalhes do evento..."
                  rows={4}
                  {...register('descricao')}
                />
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
                  <Label htmlFor="responsavelNome">Nome do Responsável</Label>
                  <Input id="responsavelNome" placeholder="Ex: João Silva" {...register('responsavelNome')} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="responsavelTelefone">Telefone</Label>
                  <Input id="responsavelTelefone" placeholder="(00) 00000-0000" {...register('responsavelTelefone')} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="responsavelEmail">E-mail</Label>
                <Input id="responsavelEmail" type="email" placeholder="email@empresa.com" {...register('responsavelEmail')} />
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
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#253158] text-white hover:bg-[#1a2342] disabled:opacity-40"
                disabled={isPending}
              >
                {isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
