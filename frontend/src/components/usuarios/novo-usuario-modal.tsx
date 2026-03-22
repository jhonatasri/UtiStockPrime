'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, FileText, Info, Lock, Package, Plus, UserCog } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'
import { NativeSelect, NativeSelectOption } from '@/src/components/ui/native-select'
import { Separator } from '@/src/components/ui/separator'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/src/components/ui/accordion'

import { useCriaUsuario, getListaUsuariosQueryKey } from '@/src/http/generated/usuários/usuários'
import { CriaUsuarioBodyFuncao } from '@/src/http/generated/api.schemas'
import { useListaRotas } from '@/src/http/generated/rotas/rotas'
import { useCadastrarRotaUsuario } from '@/src/http/generated/rotas-usuários/rotas-usuários'

const EMAIL_REGEX = /^[A-Za-z0-9_'+\-.]*[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/

const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.email('E-mail inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  funcao: z.enum(Object.values(CriaUsuarioBodyFuncao) as [CriaUsuarioBodyFuncao, ...CriaUsuarioBodyFuncao[]], { error: 'Selecione uma função' }),
  descricao: z.string().optional(),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  confirmarSenha: z.string().min(1, 'Confirme a senha'),
})

type FormData = z.infer<typeof schema>

const funcaoLabels: Record<CriaUsuarioBodyFuncao, string> = {
  ADMINISTRADOR: 'Administrador',
  GESTOR: 'Gestor',
  COORDENADOR_BAR: 'Coordenador de Bar',
  COORDENADOR_ESTOQUE: 'Coordenador de Estoque',
}

export function NovoUsuarioModal() {
  const [open, setOpen] = useState(false)
  const [showSenha, setShowSenha] = useState(false)
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false)
  const [selectedRotas, setSelectedRotas] = useState<Set<number>>(new Set())

  const { data: rotas = [] } = useListaRotas()

  const rotasPorModulo = rotas.reduce<Record<string, typeof rotas>>((acc, r) => {
    const key = r.modulo ?? '__sem_modulo__'
    acc[key] = acc[key] ? [...acc[key], r] : [r]
    return acc
  }, {})

  function toggleRota(id: number) {
    setSelectedRotas(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const queryClient = useQueryClient()
  const { mutateAsync: criarUsuario, isPending } = useCriaUsuario()
  const { mutateAsync: cadastrarRota } = useCadastrarRotaUsuario()

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const values = useWatch({ control })

  const requiredFields = [
    { ok: (values.nome?.length ?? 0) >= 3 },
    { ok: EMAIL_REGEX.test(values.email ?? '') },
    { ok: (values.telefone?.length ?? 0) >= 10 },
    { ok: !!values.funcao },
    { ok: (values.senha?.length ?? 0) >= 6 },
    { ok: !!values.confirmarSenha && values.confirmarSenha === values.senha },
  ]

  const progress = Math.round((requiredFields.filter(f => f.ok).length / requiredFields.length) * 100)

  const progressColor =
    progress === 100 ? '#22c55e' :
      progress >= 60 ? '#f59e0b' :
        '#ef4444'

  async function onSubmit(data: FormData) {
    if (data.senha !== data.confirmarSenha) {
      setError('confirmarSenha', { message: 'As senhas não coincidem' })
      return
    }

    const novoUsuario = await criarUsuario({
      data: {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        funcao: data.funcao,
        descricao: data.descricao,
        senha: data.senha,
      },
    })

    const usuariosId = (novoUsuario as { id: number }).id

    if (usuariosId && selectedRotas.size > 0) {
      await Promise.all(
        Array.from(selectedRotas).map((rotasId) =>
          cadastrarRota({ data: { rotasId, usuariosId } })
        )
      )
    }

    queryClient.invalidateQueries({ queryKey: getListaUsuariosQueryKey() })
    reset()
    setSelectedRotas(new Set())
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#253158] h-11 text-white hover:bg-[#1a2342] w-full sm:w-auto flex gap-2 items-center">
          <Plus size={20} />
          Novo Usuário
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Usuário</DialogTitle>
        </DialogHeader>

        <div className="px-1 pb-2 flex flex-col gap-5">

          {/* ── PROGRESS BAR ─────────────────────────────── */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Completar cadastro</span>
              <span className="font-semibold tabular-nums" style={{ color: progressColor }}>
                {progress}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, backgroundColor: progressColor }}
              />
            </div>
          </div>

          {/* ── ALERTA ───────────────────────────────────── */}
          <Alert>
            <AlertDescription>
              <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Preencha os dados do usuário para que seja registrado no sistema.</span>
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
                  <Input id="nome" placeholder="Digite o nome completo do usuário" {...register('nome')} />
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
                  <Textarea id="descricao" placeholder="Informações adicionais sobre o usuário..." rows={3} {...register('descricao')} />
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

              <div className="flex flex-col gap-2">
                <Label htmlFor="funcao">Cargo / Função <span className="text-red-500">*</span></Label>
                <NativeSelect id="funcao" className="h-9 w-full" {...register('funcao')}>
                  <option value="">(Selecione)</option>
                  {Object.entries(funcaoLabels).map(([value, label]) => (
                    <NativeSelectOption key={value} value={value}>{label}</NativeSelectOption>
                  ))}
                </NativeSelect>
                {errors.funcao && <span className="text-xs text-red-500">{errors.funcao.message}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <Label>Rotas de Acesso</Label>
                <Accordion type="multiple">
                  {Object.entries(rotasPorModulo).map(([modulo, items]) => (
                    <AccordionItem key={modulo} value={modulo}>
                      <AccordionTrigger className="bg-[#F5F9FF]">
                        {modulo === '__sem_modulo__' ? 'Geral' : modulo}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-1">
                          {items.map((rota) => (
                            <label key={rota.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                              <input
                                type="checkbox"
                                checked={selectedRotas.has(rota.id)}
                                onChange={() => toggleRota(rota.id)}
                                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                              />
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-700">{rota.titulo}</span>
                                {rota.descricao && (
                                  <span className="text-xs text-gray-400">{rota.descricao}</span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>

            {/* ── CONTROLE DE ACESSO ────────────────────── */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-[#253158]" />
                <span className="text-sm font-semibold text-[#253158] whitespace-nowrap">Controle de Acesso</span>
                <Separator className="flex-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="senha">Senha <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={showSenha ? 'text' : 'password'}
                      placeholder="Ex: cza%dHHibruj"
                      className="pr-10"
                      {...register('senha')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSenha(!showSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.senha && <span className="text-xs text-red-500">{errors.senha.message}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirmarSenha">Confirmar Senha <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input
                      id="confirmarSenha"
                      type={showConfirmarSenha ? 'text' : 'password'}
                      placeholder="Ex: cza%dHHibruj"
                      className="pr-10"
                      {...register('confirmarSenha')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmarSenha && <span className="text-xs text-red-500">{errors.confirmarSenha.message}</span>}
                </div>
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
                {isPending ? 'Salvando...' : 'Salvar Usuário'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
