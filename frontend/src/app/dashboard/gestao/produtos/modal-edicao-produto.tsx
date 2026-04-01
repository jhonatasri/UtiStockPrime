'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/src/components/ui/native-select'
import { useAlteraProduto } from '@/src/http/generated/produtos/produtos'
import {
  AlteraProdutoBody,
  AlteraProdutoBodyTipoArmazenamento,
  AlteraProdutoBodyTipoConsumo,
  AlteraProdutoBodyTipoConsumoDetalhe,
  ListaProdutos200Item,
} from '@/src/http/generated/api.schemas'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type FormData = {
  codigo: string
  nome: string
  categoria: string
  marca: string
  modelo: string
  descricao: string
  unidadeMedida: string
  quantidadeMinima: string
  tipoArmazenamento: AlteraProdutoBodyTipoArmazenamento | ''
  tipoConsumo: AlteraProdutoBodyTipoConsumo | ''
  tipoConsumoDetalhe: AlteraProdutoBodyTipoConsumoDetalhe | ''
  volumePorUnidade: string
  mlPorDose: string
  dosesPorUnidade: string
}

function produtoParaForm(produto: ListaProdutos200Item): FormData {
  return {
    codigo: produto.codigo,
    nome: produto.nome,
    categoria: produto.categoria,
    marca: produto.marca,
    modelo: produto.modelo ?? '',
    descricao: produto.descricao ?? '',
    unidadeMedida: produto.unidadeMedida,
    quantidadeMinima: String(produto.quantidadeMinima),
    tipoArmazenamento: produto.tipoArmazenamento as AlteraProdutoBodyTipoArmazenamento,
    tipoConsumo: produto.tipoConsumo as AlteraProdutoBodyTipoConsumo,
    tipoConsumoDetalhe: produto.tipoConsumoDetalhe as AlteraProdutoBodyTipoConsumoDetalhe,
    volumePorUnidade: produto.volumePorUnidade != null ? String(produto.volumePorUnidade) : '',
    mlPorDose: produto.mlPorDose != null ? String(produto.mlPorDose) : '',
    dosesPorUnidade: produto.dosesPorUnidade != null ? String(produto.dosesPorUnidade) : '',
  }
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <Label className="text-sm font-medium text-neutral-700">{label}</Label>
      {children}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface Props {
  produto: ListaProdutos200Item | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ModalEdicaoProduto({ produto, open, onOpenChange, onSuccess }: Props) {
  const [form, setForm] = useState<FormData | null>(null)
  const { mutate: alteraProduto, isPending } = useAlteraProduto()

  useEffect(() => {
    if (produto) setForm(produtoParaForm(produto))
  }, [produto])

  function set(field: keyof FormData, value: string) {
    setForm(prev => prev ? { ...prev, [field]: value } : prev)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form || !produto) return
    if (!form.tipoArmazenamento || !form.tipoConsumo || !form.tipoConsumoDetalhe) return

    const body: AlteraProdutoBody = {
      codigo: form.codigo,
      nome: form.nome,
      categoria: form.categoria,
      marca: form.marca,
      modelo: form.modelo || undefined,
      descricao: form.descricao || undefined,
      unidadeMedida: form.unidadeMedida,
      quantidadeMinima: Number(form.quantidadeMinima),
      tipoArmazenamento: form.tipoArmazenamento,
      tipoConsumo: form.tipoConsumo,
      tipoConsumoDetalhe: form.tipoConsumoDetalhe,
      volumePorUnidade: form.volumePorUnidade ? Number(form.volumePorUnidade) : undefined,
      mlPorDose: form.mlPorDose ? Number(form.mlPorDose) : undefined,
      dosesPorUnidade: form.dosesPorUnidade ? Number(form.dosesPorUnidade) : undefined,
    }

    alteraProduto(
      { id: produto.id, data: body },
      {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess()
        },
      },
    )
  }

  if (!form) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-neutral-900">
            Editar Produto
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
          {/* Seção: Informações Básicas */}
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
              Informações Básicas
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Código *">
                <Input
                  placeholder="Ex: PRD-001"
                  value={form.codigo}
                  onChange={e => set('codigo', e.target.value)}
                  required
                />
              </Field>
              <Field label="Nome *">
                <Input
                  placeholder="Nome do produto"
                  value={form.nome}
                  onChange={e => set('nome', e.target.value)}
                  required
                />
              </Field>
              <Field label="Categoria *">
                <NativeSelect
                  value={form.categoria}
                  onChange={e => set('categoria', e.target.value)}
                  required
                >
                  <NativeSelectOption value="" disabled>Selecione</NativeSelectOption>
                  <NativeSelectOption value="Bebidas">Bebidas</NativeSelectOption>
                  <NativeSelectOption value="Alimentos">Alimentos</NativeSelectOption>
                  <NativeSelectOption value="Descartáveis">Descartáveis</NativeSelectOption>
                  <NativeSelectOption value="Limpeza">Limpeza</NativeSelectOption>
                  <NativeSelectOption value="Equipamentos">Equipamentos</NativeSelectOption>
                  <NativeSelectOption value="Outros">Outros</NativeSelectOption>
                </NativeSelect>
              </Field>
              <Field label="Marca *">
                <Input
                  placeholder="Ex: Ambev"
                  value={form.marca}
                  onChange={e => set('marca', e.target.value)}
                  required
                />
              </Field>
              <Field label="Modelo">
                <Input
                  placeholder="Ex: Long Neck 355ml"
                  value={form.modelo}
                  onChange={e => set('modelo', e.target.value)}
                />
              </Field>
              <Field label="Unidade de Medida *">
                <NativeSelect
                  value={form.unidadeMedida}
                  onChange={e => set('unidadeMedida', e.target.value)}
                  required
                >
                  <NativeSelectOption value="" disabled>Selecione</NativeSelectOption>
                  <NativeSelectOption value="un">un — Unidade</NativeSelectOption>
                  <NativeSelectOption value="cx">cx — Caixa</NativeSelectOption>
                  <NativeSelectOption value="pct">pct — Pacote</NativeSelectOption>
                  <NativeSelectOption value="fd">fd — Fardo</NativeSelectOption>
                  <NativeSelectOption value="kg">kg — Quilograma</NativeSelectOption>
                  <NativeSelectOption value="g">g — Grama</NativeSelectOption>
                  <NativeSelectOption value="L">L — Litro</NativeSelectOption>
                  <NativeSelectOption value="ml">ml — Mililitro</NativeSelectOption>
                </NativeSelect>
              </Field>
              <Field label="Descrição" className="col-span-2">
                <Input
                  placeholder="Descrição opcional do produto"
                  value={form.descricao}
                  onChange={e => set('descricao', e.target.value)}
                />
              </Field>
            </div>
          </div>

          {/* Separador */}
          <hr className="border-neutral-200" />

          {/* Seção: Estoque */}
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
              Estoque
            </p>
            <Field label="Quantidade Mínima *">
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={form.quantidadeMinima}
                onChange={e => set('quantidadeMinima', e.target.value)}
                required
              />
            </Field>
          </div>

          {/* Separador */}
          <hr className="border-neutral-200" />

          {/* Seção: Classificação */}
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
              Classificação
            </p>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Armazenamento *">
                <NativeSelect
                  value={form.tipoArmazenamento}
                  onChange={e => set('tipoArmazenamento', e.target.value as AlteraProdutoBodyTipoArmazenamento)}
                  required
                >
                  <NativeSelectOption value="" disabled>Selecione</NativeSelectOption>
                  <NativeSelectOption value="SECO">Seco</NativeSelectOption>
                  <NativeSelectOption value="REFRIGERADO">Refrigerado</NativeSelectOption>
                  <NativeSelectOption value="CONGELADO">Congelado</NativeSelectOption>
                  <NativeSelectOption value="AMBIENTE">Ambiente</NativeSelectOption>
                </NativeSelect>
              </Field>

              <Field label="Tipo de Consumo *">
                <NativeSelect
                  value={form.tipoConsumo}
                  onChange={e => set('tipoConsumo', e.target.value as AlteraProdutoBodyTipoConsumo)}
                  required
                >
                  <NativeSelectOption value="" disabled>Selecione</NativeSelectOption>
                  <NativeSelectOption value="CONSUMIVEL">Consumível</NativeSelectOption>
                  <NativeSelectOption value="NAO_CONSUMIVEL">Não Consumível</NativeSelectOption>
                  <NativeSelectOption value="SEMI_CONSUMIVEL">Semi Consumível</NativeSelectOption>
                </NativeSelect>
              </Field>

              <Field label="Detalhe de Consumo *">
                <NativeSelect
                  value={form.tipoConsumoDetalhe}
                  onChange={e => set('tipoConsumoDetalhe', e.target.value as AlteraProdutoBodyTipoConsumoDetalhe)}
                  required
                >
                  <NativeSelectOption value="" disabled>Selecione</NativeSelectOption>
                  <NativeSelectOption value="POR_DOSE">Por Dose</NativeSelectOption>
                  <NativeSelectOption value="POR_UNIDADE">Por Unidade</NativeSelectOption>
                  <NativeSelectOption value="POR_VOLUME">Por Volume</NativeSelectOption>
                </NativeSelect>
              </Field>
            </div>
          </div>

          {/* Separador */}
          <hr className="border-neutral-200" />

          {/* Seção: Dados de Volume (opcionais) */}
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
              Dados de Volume{' '}
              <span className="normal-case font-normal">(opcional)</span>
            </p>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Volume por Unidade">
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Ex: 355"
                  value={form.volumePorUnidade}
                  onChange={e => set('volumePorUnidade', e.target.value)}
                />
              </Field>
              <Field label="mL por Dose">
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Ex: 50"
                  value={form.mlPorDose}
                  onChange={e => set('mlPorDose', e.target.value)}
                />
              </Field>
              <Field label="Doses por Unidade">
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Ex: 7"
                  value={form.dosesPorUnidade}
                  onChange={e => set('dosesPorUnidade', e.target.value)}
                />
              </Field>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
