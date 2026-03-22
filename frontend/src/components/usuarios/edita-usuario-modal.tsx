'use client'

import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, Info, Package, UserCog } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'
import { NativeSelect, NativeSelectOption } from '@/src/components/ui/native-select'
import { Separator } from '@/src/components/ui/separator'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/src/components/ui/accordion'
import { Switch } from '@/src/components/ui/switch'

import { useAlteraUsuario, useListaUsuario, getListaUsuariosQueryKey } from '@/src/http/generated/usuários/usuários'
import { AlteraUsuarioBodyFuncao } from '@/src/http/generated/api.schemas'
import { useListaRotas } from '@/src/http/generated/rotas/rotas'
import {
  useCadastrarRotaUsuario,
  useRemoveRotaUsuario,
  useListaRotasPorUsuario,
  getListaRotasPorUsuarioQueryKey,
} from '@/src/http/generated/rotas-usuários/rotas-usuários'

type Props = {
  id: number | null
  open: boolean
  onClose: () => void
}

const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.email('E-mail inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  funcao: z.enum(Object.values(AlteraUsuarioBodyFuncao) as [AlteraUsuarioBodyFuncao, ...AlteraUsuarioBodyFuncao[]], { error: 'Selecione uma função' }),
  descricao: z.string().optional(),
  ativo: z.boolean(),
})

type FormData = z.infer<typeof schema>

const funcaoLabels: Record<AlteraUsuarioBodyFuncao, string> = {
  ADMINISTRADOR: 'Administrador',
  GESTOR: 'Gestor',
  COORDENADOR_BAR: 'Coordenador de Bar',
  COORDENADOR_ESTOQUE: 'Coordenador de Estoque',
}

export function EditaUsuarioModal({ id, open, onClose }: Props) {
  const queryClient = useQueryClient()

  const { data: usuario, isLoading } = useListaUsuario(id ?? 0, {
    query: { enabled: open && id !== null },
  })

  const { data: allRotas = [] } = useListaRotas()

  const { data: userRotas = [], refetch: refetchUserRotas } = useListaRotasPorUsuario(id ?? 0, {
    query: { enabled: open && id !== null, staleTime: 0 },
  })

  useEffect(() => {
    if (open && id !== null) {
      refetchUserRotas()
    }
  }, [open, id, refetchUserRotas])

  // Map: rota URL → junction record ID (para DELETE)
  const userRotaMap = useMemo(
    () => new Map(userRotas.map((r) => [r.rota, r.id])),
    [userRotas]
  )

  const rotasPorModulo = useMemo(
    () =>
      allRotas.reduce<Record<string, typeof allRotas>>((acc, r) => {
        const key = r.modulo ?? '__sem_modulo__'
        acc[key] = acc[key] ? [...acc[key], r] : [r]
        return acc
      }, {}),
    [allRotas]
  )

  const { mutateAsync: alterarUsuario, isPending } = useAlteraUsuario()
  const { mutateAsync: cadastrarRota, isPending: isAddingRota } = useCadastrarRotaUsuario()
  const { mutateAsync: removerRota, isPending: isRemovingRota } = useRemoveRotaUsuario()

  const isTogglingRota = isAddingRota || isRemovingRota

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const ativo = useWatch({ control, name: 'ativo' })

  useEffect(() => {
    if (usuario) {
      reset({
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        funcao: String(usuario.funcao) as AlteraUsuarioBodyFuncao,
        descricao: usuario.descricao ?? '',
        ativo: usuario.ativo,
      })
    }
  }, [usuario, reset])

  async function toggleRota(rotaUrl: string, rotaId: number) {
    if (!id) return

    const junctionId = userRotaMap.get(rotaUrl)

    if (junctionId !== undefined) {
      await removerRota({ id: junctionId })
    } else {
      await cadastrarRota({ data: { rotasId: rotaId, usuariosId: id } })
    }

    refetchUserRotas()
    queryClient.invalidateQueries({ queryKey: getListaRotasPorUsuarioQueryKey(id) })
  }

  async function onSubmit(data: FormData) {
    if (!id) return

    await alterarUsuario({
      id,
      data: {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        funcao: data.funcao,
        descricao: data.descricao,
        ativo: data.ativo,
      },
    })

    queryClient.invalidateQueries({ queryKey: getListaUsuariosQueryKey() })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>

        {isLoading || !usuario ? (
          <div className="py-12 text-center text-sm text-gray-500">Carregando...</div>
        ) : (
          <div className="px-1 pb-2 flex flex-col gap-5">

            <Alert>
              <AlertDescription>
                <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Altere os dados do usuário. A senha não pode ser alterada por aqui.</span>
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

              {/* ── DADOS BÁSICOS ─────────────────────────── */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-[#253158]" />
                  <span className="text-sm font-semibold text-[#253158]">Dados Básicos</span>
                  <Separator className="flex-1" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="nome">Nome Completo <span className="text-red-500">*</span></Label>
                    <Input id="nome" placeholder="Nome completo" {...register('nome')} />
                    {errors.nome && <span className="text-xs text-red-500">{errors.nome.message}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">E-mail <span className="text-red-500">*</span></Label>
                    <Input id="email" type="email" placeholder="usuario@empresa.com" {...register('email')} />
                    {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                  </div>
                </div>
              </section>

              {/* ── INFORMAÇÕES COMPLEMENTARES ────────────── */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-[#253158]" />
                  <span className="text-sm font-semibold text-[#253158] whitespace-nowrap">Informações Complementares</span>
                  <Separator className="flex-1" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="telefone">Telefone <span className="text-red-500">*</span></Label>
                    <Input id="telefone" placeholder="(00) 00000-0000" {...register('telefone')} />
                    {errors.telefone && <span className="text-xs text-red-500">{errors.telefone.message}</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea id="descricao" placeholder="Informações adicionais..." rows={3} {...register('descricao')} />
                  </div>
                </div>
              </section>

              {/* ── PERFIL E PERMISSÕES ───────────────────── */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <UserCog size={18} className="text-[#253158]" />
                  <span className="text-sm font-semibold text-[#253158] whitespace-nowrap">Perfil e Permissões</span>
                  <Separator className="flex-1" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-2 flex-1 mr-8">
                    <Label htmlFor="funcao">Cargo / Função <span className="text-red-500">*</span></Label>
                    <NativeSelect id="funcao" className="h-9 w-full" {...register('funcao')}>
                      {Object.entries(funcaoLabels).map(([value, label]) => (
                        <NativeSelectOption key={value} value={value}>{label}</NativeSelectOption>
                      ))}
                    </NativeSelect>
                    {errors.funcao && <span className="text-xs text-red-500">{errors.funcao.message}</span>}
                  </div>

                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <Label>Status</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={ativo}
                        onCheckedChange={(checked) => setValue('ativo', checked)}
                      />
                      <span className={`text-xs font-medium ${ativo ? 'text-green-600' : 'text-gray-400'}`}>
                        {ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── ROTAS DE ACESSO ──────────────────────── */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Rotas de Acesso</Label>
                    {isTogglingRota && (
                      <span className="text-xs text-gray-400">Salvando...</span>
                    )}
                  </div>
                  <Accordion type="multiple">
                    {Object.entries(rotasPorModulo).map(([modulo, items]) => (
                      <AccordionItem key={modulo} value={modulo}>
                        <AccordionTrigger className="bg-[#F5F9FF]">
                          {modulo === '__sem_modulo__' ? 'Geral' : modulo}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col gap-1">
                            {items.map((rota) => {
                              const checked = userRotaMap.has(rota.rota)
                              return (
                                <label
                                  key={rota.id}
                                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled={isTogglingRota}
                                    onChange={() => toggleRota(rota.rota, rota.id)}
                                    className="w-4 h-4 rounded border-gray-300 cursor-pointer disabled:cursor-not-allowed"
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-sm text-gray-700">{rota.titulo}</span>
                                    {rota.descricao && (
                                      <span className="text-xs text-gray-400">{rota.descricao}</span>
                                    )}
                                  </div>
                                </label>
                              )
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </section>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#253158] text-white hover:bg-[#1a2342] disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={isPending}
                >
                  {isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </DialogFooter>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
