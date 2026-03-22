export interface Permission {
  id: string
  label: string
  checked: boolean
}

export interface PermissionModule {
  name: string
  permissions: Permission[]
}

export const PERMISSION_MODULES: PermissionModule[] = [
  {
    name: 'Gestão de Produtos',
    permissions: [
      { id: 'produtos.produtos', label: 'Produtos', checked: false },
      { id: 'produtos.entrada', label: 'Entrada', checked: false },
      { id: 'produtos.saida', label: 'Saída', checked: false },
    ],
  },
  {
    name: 'Gestão de Estoque',
    permissions: [
      { id: 'estoque.solicitacoes', label: 'Solicitações', checked: false },
      { id: 'estoque.organizacao', label: 'Organização', checked: false },
      { id: 'estoque.minhas_tarefas', label: 'Minhas Tarefas', checked: false },
    ],
  },
  {
    name: 'Bar',
    permissions: [
      { id: 'bar.cardapio', label: 'Cardápio', checked: false },
      { id: 'bar.pedidos', label: 'Pedidos', checked: false },
      { id: 'bar.consumo', label: 'Consumo', checked: false },
    ],
  },
  {
    name: 'Auditoria',
    permissions: [
      { id: 'auditoria.logs', label: 'Logs do Sistema', checked: false },
      { id: 'auditoria.relatorios', label: 'Relatórios', checked: false },
    ],
  },
]
