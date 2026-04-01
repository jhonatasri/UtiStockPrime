'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { ListaProdutos200Item } from '@/src/http/generated/api.schemas'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const labelArmazenamento: Record<string, string> = {
  SECO: 'Seco',
  REFRIGERADO: 'Refrigerado',
  CONGELADO: 'Congelado',
  AMBIENTE: 'Ambiente',
}

const labelConsumo: Record<string, string> = {
  CONSUMIVEL: 'Consumível',
  NAO_CONSUMIVEL: 'Não Consumível',
  SEMI_CONSUMIVEL: 'Semi Consumível',
}

const labelConsumoDetalhe: Record<string, string> = {
  POR_DOSE: 'Por Dose',
  POR_UNIDADE: 'Por Unidade',
  POR_VOLUME: 'Por Volume',
}

function Campo({ label, valor }: { label: string; valor?: string | number | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm text-neutral-800">
        {valor != null && valor !== '' ? valor : <span className="text-neutral-300 italic">—</span>}
      </span>
    </div>
  )
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
        {titulo}
      </p>
      {children}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface Props {
  produto: ListaProdutos200Item | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModalVisualizacaoProduto({ produto, open, onOpenChange }: Props) {
  if (!produto) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-neutral-900">
            {produto.nome}
          </DialogTitle>
          <p className="text-sm text-neutral-400">{produto.codigo}</p>
        </DialogHeader>

        <div className="flex flex-col gap-6 mt-2">
          {/* Informações Básicas */}
          <Secao titulo="Informações Básicas">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Campo label="Código" valor={produto.codigo} />
              <Campo label="Nome" valor={produto.nome} />
              <Campo label="Categoria" valor={produto.categoria} />
              <Campo label="Marca" valor={produto.marca} />
              <Campo label="Modelo" valor={produto.modelo} />
              <Campo label="Unidade de Medida" valor={produto.unidadeMedida} />
              <Campo label="Descrição" valor={produto.descricao} />
              <Campo
                label="Status"
                valor={produto.ativo ? 'Ativo' : 'Inativo'}
              />
            </div>
          </Secao>

          <hr className="border-neutral-200" />

          {/* Estoque */}
          <Secao titulo="Estoque">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Campo label="Quantidade Mínima" valor={produto.quantidadeMinima} />
            </div>
          </Secao>

          <hr className="border-neutral-200" />

          {/* Classificação */}
          <Secao titulo="Classificação">
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              <Campo
                label="Armazenamento"
                valor={labelArmazenamento[produto.tipoArmazenamento]}
              />
              <Campo
                label="Tipo de Consumo"
                valor={labelConsumo[produto.tipoConsumo]}
              />
              <Campo
                label="Detalhe de Consumo"
                valor={labelConsumoDetalhe[produto.tipoConsumoDetalhe]}
              />
            </div>
          </Secao>

          {(produto.volumePorUnidade != null ||
            produto.mlPorDose != null ||
            produto.dosesPorUnidade != null) && (
            <>
              <hr className="border-neutral-200" />

              {/* Dados de Volume */}
              <Secao titulo="Dados de Volume">
                <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                  <Campo label="Volume por Unidade" valor={produto.volumePorUnidade} />
                  <Campo label="mL por Dose" valor={produto.mlPorDose} />
                  <Campo label="Doses por Unidade" valor={produto.dosesPorUnidade} />
                </div>
              </Secao>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
