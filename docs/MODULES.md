# 📦 ICARUS v5.0 - Módulos ERP

Estrutura completa dos 58 módulos funcionais do sistema.

---

## 🏗️ Arquitetura de Módulos

Cada módulo segue a estrutura:

```
src/components/modules/
├── [categoria]/
│   ├── [Modulo].tsx      # Componente principal
│   ├── types.ts          # Tipos TypeScript
│   ├── hooks.ts          # Custom hooks
│   └── api.ts            # Queries Supabase
```

---

## 📊 Categorias e Módulos

### 1. Vendas (12 módulos)

1. **Pedidos** - Gestão de pedidos de venda
2. **Orçamentos** - Criação e aprovação de orçamentos
3. **Propostas Comerciais** - Propostas detalhadas
4. **Contratos** - Gestão de contratos
5. **Comissões** - Cálculo de comissões de vendedores
6. **Metas** - Definição e acompanhamento
7. **Tabela de Preços** - Preços por cliente/região
8. **Descontos** - Regras de desconto
9. **Promotores** - Gestão de promotores
10. **Representantes** - Representantes comerciais
11. **Territórios** - Divisão territorial
12. **Pipeline** - Funil de vendas

### 2. Estoque (8 módulos)

13. **Produtos** - Cadastro de produtos
14. **Categorias** - Categorização de produtos
15. **Movimentações** - Entrada/Saída
16. **Inventário** - Contagem física
17. **Transferências** - Entre depósitos
18. **Reservas** - Produtos reservados
19. **Lote/Série** - Rastreabilidade
20. **Validade** - Controle de vencimentos

### 3. Financeiro (10 módulos)

21. **Contas a Receber** - Títulos a receber
22. **Contas a Pagar** - Títulos a pagar
23. **Fluxo de Caixa** - Projeção financeira
24. **Bancos** - Conciliação bancária
25. **Cartões** - Conciliação de cartões
26. **Boletos** - Geração e gestão
27. **Notas Fiscais** - Emissão NFe/NFSe
28. **Centro de Custos** - Categorização
29. **Plano de Contas** - Estrutura contábil
30. **Relatórios Financeiros** - DRE, Balanço

### 4. CRM (8 módulos)

31. **Clientes** - Cadastro de clientes
32. **Leads** - Gestão de leads
33. **Oportunidades** - Oportunidades de venda
34. **Contatos** - Múltiplos contatos por cliente
35. **Atividades** - Tarefas e compromissos
36. **Email Marketing** - Campanhas
37. **Tickets** - Suporte ao cliente
38. **NPS** - Pesquisas de satisfação

### 5. Compras (6 módulos)

39. **Fornecedores** - Cadastro de fornecedores
40. **Cotações** - Solicitação de cotações
41. **Ordens de Compra** - Pedidos de compra
42. **Recebimentos** - Entrada de mercadorias
43. **Devoluções** - Devolução a fornecedores
44. **Aprovações** - Workflow de aprovação

### 6. Gestão (14 módulos)

45. **Dashboard** - Visão geral
46. **Analytics** - Análises avançadas
47. **Relatórios** - Relatórios gerenciais
48. **KPIs** - Indicadores de performance
49. **Alertas** - Notificações inteligentes
50. **Usuários** - Gestão de usuários
51. **Permissões** - Controle de acesso
52. **Auditoria** - Logs de sistema
53. **Integrações** - APIs externas
54. **Configurações** - Parâmetros do sistema
55. **Backup** - Backup e restore
56. **Empresas** - Multi-empresa
57. **Filiais** - Multi-filial
58. **IA Insights** - Insights com IcarusBrain

---

## 🎨 Padrão de Desenvolvimento

### Exemplo de Módulo Completo

```typescript
// src/components/modules/vendas/Pedidos.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePedidos } from './hooks'
import type { Pedido } from './types'

export function Pedidos() {
  const { pedidos, isLoading, createPedido } = usePedidos()

  if (isLoading) return <div>Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Pedidos</h2>
        <Button onClick={() => createPedido()}>
          Novo Pedido
        </Button>
      </div>

      <Card className="neu-soft">
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {pedidos.map((pedido: Pedido) => (
            <div key={pedido.id} className="p-4 border-b">
              {pedido.numero} - {pedido.cliente}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
```

### Types

```typescript
// src/components/modules/vendas/types.ts
export interface Pedido {
  id: string
  numero: string
  cliente_id: string
  cliente: string
  data: string
  valor_total: number
  status: 'pendente' | 'aprovado' | 'cancelado'
  items: PedidoItem[]
}

export interface PedidoItem {
  id: string
  produto_id: string
  produto: string
  quantidade: number
  preco_unitario: number
  desconto: number
  valor_total: number
}
```

### Hooks

```typescript
// src/components/modules/vendas/hooks.ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { getPedidos, createPedido as createPedidoApi } from './api'

export function usePedidos() {
  const { data: pedidos, isLoading } = useQuery({
    queryKey: ['pedidos'],
    queryFn: getPedidos,
  })

  const createMutation = useMutation({
    mutationFn: createPedidoApi,
  })

  return {
    pedidos: pedidos || [],
    isLoading,
    createPedido: createMutation.mutate,
  }
}
```

### API

```typescript
// src/components/modules/vendas/api.ts
import { supabase } from '@/lib/supabase/client'
import type { Pedido } from './types'

export async function getPedidos(): Promise<Pedido[]> {
  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      *,
      cliente:clientes(nome),
      items:pedido_items(*)
    `)
    .order('data', { ascending: false })

  if (error) throw error
  return data
}

export async function createPedido(pedido: Partial<Pedido>): Promise<Pedido> {
  const { data, error } = await supabase
    .from('pedidos')
    .insert(pedido)
    .select()
    .single()

  if (error) throw error
  return data
}
```

---

## 🚀 Status de Implementação

| Categoria | Módulos | Status |
|-----------|---------|--------|
| Vendas | 12 | 🟡 Base implementada |
| Estoque | 8 | 🟡 Base implementada |
| Financeiro | 10 | 🟡 Base implementada |
| CRM | 8 | 🟡 Base implementada |
| Compras | 6 | 🟡 Base implementada |
| Gestão | 14 | 🟢 Dashboard completo |

**Legenda**:
- 🟢 Completo
- 🟡 Base implementada (scaffold)
- 🔴 Não iniciado

---

## 📝 Roadmap de Desenvolvimento

### Fase 1 (Atual - v5.0.3)
- ✅ Estrutura base de todos os módulos
- ✅ Dashboard funcional
- ✅ Integração Supabase
- ✅ IcarusBrain IA

### Fase 2 (v5.1.0)
- [ ] Módulos de Vendas completos
- [ ] Módulos de Estoque completos
- [ ] Relatórios avançados

### Fase 3 (v5.2.0)
- [ ] Módulos Financeiros completos
- [ ] Módulos CRM completos
- [ ] Integrações externas

### Fase 4 (v6.0.0)
- [ ] Módulos de Compras completos
- [ ] Blockchain traceability
- [ ] Mobile app

---

**v5.0.3** | 58 Módulos | Enterprise-Ready
