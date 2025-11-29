# 📘 Guia de Integração Supabase - Dados Reais

**Versão:** 1.0.0  
**Data:** 29/11/2025  
**Status:** ✅ Implementado

---

## 🎯 Objetivo

Este guia documenta como integrar dados reais do Supabase em todos os 46 módulos do ICARUS v5.0, substituindo o mock data por queries e mutations reais.

---

## 📚 Hooks Disponíveis

### Hook Genérico

```typescript
import { useModuleData } from '@/hooks/useModuleData'

// Uso genérico
const { data, isLoading, error } = useModuleData({
  tableName: 'sua_tabela',
  selectFields: '*, relacao:tabela_relacionada(*)',
  orderBy: { column: 'created_at', ascending: false },
  filters: { status: 'ativo' },
  enableRealtime: true // Opcional: updates em tempo real
})
```

### Hooks Específicos por Módulo

#### Sprint 1 - Analytics e BI

```typescript
import { 
  useKPIData,
  useDashboardData,
  usePredicoesData,
  useRelatoriosData 
} from '@/hooks/useModuleData'

// KPI Dashboard
const { data: kpis } = useKPIData()

// Dashboards BI
const { data: dashboards } = useDashboardData()

// Predições ML
const { data: predicoes } = usePredicoesData('demanda') // 'demanda' | 'inadimplencia' | 'churn' | 'estoque'

// Relatórios
const { data: relatorios } = useRelatoriosData()
```

#### Sprint 2 - Cadastros e Gestão

```typescript
import { 
  useGruposOPME,
  useUsuarios,
  useInventarios,
  useLeads 
} from '@/hooks/useModuleData'

// Grupos de Produtos OPME
const { data: grupos } = useGruposOPME()

// Usuários e Permissões
const { data: usuarios } = useUsuarios()

// Inventários
const { data: inventarios } = useInventarios()

// Gestão de Leads
const { data: leads } = useLeads()
```

#### Sprint 3 - Estoque, Consignação e IoT

```typescript
import { 
  useConsignacao,
  useLotesRastreabilidade,
  useSensoresIoT,
  useManutencoes 
} from '@/hooks/useModuleData'

// Consignação Avançada
const { data: consignacao } = useConsignacao()

// Rastreabilidade OPME (com Realtime)
const { data: lotes } = useLotesRastreabilidade() // Realtime ativo

// Telemetria IoT (com Realtime)
const { data: sensores } = useSensoresIoT() // Realtime ativo

// Manutenção Preventiva
const { data: manutencoes } = useManutencoes()
```

#### Sprint 4 - Compras

```typescript
import { 
  useCompras,
  useNotasEntrada 
} from '@/hooks/useModuleData'

// Gestão de Compras
const { data: compras } = useCompras()

// Notas Fiscais de Entrada
const { data: notasEntrada } = useNotasEntrada()
```

#### Sprint 5 - Vendas/CRM

```typescript
import { 
  useOportunidades,
  useCampanhas 
} from '@/hooks/useModuleData'

// CRM Vendas
const { data: oportunidades } = useOportunidades()

// Campanhas de Marketing
const { data: campanhas } = useCampanhas()
```

#### Sprint 6 - Financeiro

```typescript
import { 
  useContasReceber,
  useFaturamentos,
  useNFeSaida 
} from '@/hooks/useModuleData'

// Contas a Receber IA
const { data: contasReceber } = useContasReceber()

// Faturamento Avançado
const { data: faturamentos } = useFaturamentos()

// NF-e de Saída
const { data: nfeSaida } = useNFeSaida()
```

#### Sprint 7 - Compliance

```typescript
import { 
  useAuditorias,
  useNotificacoes 
} from '@/hooks/useModuleData'

// Compliance e Auditoria
const { data: auditorias } = useAuditorias()

// Notificações Inteligentes (com Realtime)
const { data: notificacoes } = useNotificacoes() // Realtime ativo
```

#### Sprint 8 - IA e Automação

```typescript
import { 
  useAgentesIA,
  useWorkflows 
} from '@/hooks/useModuleData'

// IA Central
const { data: agentes } = useAgentesIA()

// Workflow Builder
const { data: workflows } = useWorkflows()
```

#### Sprint 9 - Sistema e Integrações

```typescript
import { 
  useIntegracoes,
  useWebhooks 
} from '@/hooks/useModuleData'

// Integrações Avançadas
const { data: integracoes } = useIntegracoes()

// Webhooks Manager
const { data: webhooks } = useWebhooks()
```

#### Sprint 10 - Cirurgias Complementar

```typescript
import { 
  useLicitacoes,
  useTabelasPrecos 
} from '@/hooks/useModuleData'

// Licitações e Propostas
const { data: licitacoes } = useLicitacoes()

// Tabelas de Preços
const { data: tabelasPrecos } = useTabelasPrecos()
```

---

## 🔧 Mutations (Create, Update, Delete)

```typescript
import { useModuleMutation } from '@/hooks/useModuleData'

function MeuModulo() {
  const mutations = useModuleMutation('minha_tabela')

  // Create
  const handleCreate = async () => {
    await mutations.create.mutateAsync({
      nome: 'Novo Registro',
      status: 'ativo',
      // ... outros campos
    })
    // Toast de sucesso automático
  }

  // Update
  const handleUpdate = async (id: string) => {
    await mutations.update.mutateAsync({
      id,
      data: {
        nome: 'Registro Atualizado',
        // ... campos a atualizar
      }
    })
  }

  // Delete
  const handleDelete = async (id: string) => {
    await mutations.delete.mutateAsync(id)
  }

  return (
    <div>
      <Button onClick={handleCreate}>Criar</Button>
      <Button onClick={() => handleUpdate('123')}>Atualizar</Button>
      <Button onClick={() => handleDelete('123')}>Deletar</Button>
    </div>
  )
}
```

---

## 📊 Estatísticas Agregadas

```typescript
import { useModuleStats } from '@/hooks/useModuleData'

function MeuModulo() {
  const { data: stats } = useModuleStats('vendas', ['count', 'sum'])

  return (
    <div>
      <p>Total de vendas: {stats?.total || 0}</p>
    </div>
  )
}
```

---

## 🎨 Exemplo Completo: KPIDashboardModule

Veja o arquivo completo em: `src/components/modules/KPIDashboardModule-with-supabase.tsx`

### Estrutura Padrão

```typescript
import { useKPIData, useModuleStats } from '@/hooks/useModuleData'

export function MeuModulo() {
  // 1. Buscar dados reais
  const { data: kpisData, isLoading, error } = useKPIData()
  const { data: stats } = useModuleStats('vendas', ['count'])

  // 2. Fallback para mock data
  const useMockData = !kpisData || kpisData.length === 0

  // 3. Processar dados reais
  const kpisProcessados = useMockData 
    ? mockData 
    : kpisData.map(kpi => ({
        mes: new Date(kpi.mes).toLocaleDateString('pt-BR', { month: 'short' }),
        valor: kpi.valor_real,
        meta: kpi.valor_meta
      }))

  // 4. Loading state
  if (isLoading) {
    return <Loader2 className="w-8 h-8 animate-spin" />
  }

  // 5. Error state
  if (error) {
    return <p>Erro ao carregar dados: {error.message}</p>
  }

  // 6. Render com dados reais ou mock
  return (
    <div>
      <h1>
        Meu Módulo 
        {useMockData && <span>(Mock Data)</span>}
      </h1>
      {/* ... resto do componente */}
    </div>
  )
}
```

---

## ⚡ Funcionalidades Avançadas

### Realtime Subscriptions

```typescript
// Ativa automaticamente para módulos críticos
const { data: sensores } = useSensoresIoT() // Realtime ativo
const { data: notificacoes } = useNotificacoes() // Realtime ativo
const { data: lotes } = useLotesRastreabilidade() // Realtime ativo
```

### Relações (Joins)

```typescript
// Busca com relações
const { data: compras } = useModuleData({
  tableName: 'compras',
  selectFields: `
    *,
    fornecedor:fornecedores(nome_fantasia, cnpj),
    items:compra_items(produto:produtos(nome), quantidade, valor)
  `,
})
```

### Filtros Customizados

```typescript
// Filtros dinâmicos
const [filtros, setFiltros] = useState({ status: 'ativo', tipo: 'cirurgia' })

const { data } = useModuleData({
  tableName: 'agendamentos',
  filters: filtros, // Reativo aos filtros
})
```

---

## 📋 Checklist de Integração

Para cada módulo:

- [ ] Importar hook específico do módulo
- [ ] Substituir mock data por `data` do hook
- [ ] Implementar loading state (`isLoading`)
- [ ] Implementar error handling (`error`)
- [ ] Manter mock data como fallback
- [ ] Adicionar indicador visual quando usar mock
- [ ] Testar CRUD operations (se aplicável)
- [ ] Verificar Realtime (se aplicável)
- [ ] Validar formatação de dados
- [ ] Testar filtros e ordenação

---

## 🗄️ Schema Supabase Esperado

### Tabelas Principais

```sql
-- KPIs
CREATE TABLE kpis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR NOT NULL, -- 'faturamento_mes', 'receita_recorrente', etc.
  categoria VARCHAR NOT NULL, -- 'financeiro', 'operacional', 'comercial', 'rh'
  valor DECIMAL NOT NULL,
  valor_meta DECIMAL,
  tendencia DECIMAL, -- % de variação
  mes DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Dashboards
CREATE TABLE dashboards (
  id UUID PRIMARY KEY,
  nome VARCHAR NOT NULL,
  tipo VARCHAR, -- 'executivo', 'operacional', etc.
  config JSONB, -- Configurações de widgets
  usuario_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Predições
CREATE TABLE predicoes (
  id UUID PRIMARY KEY,
  tipo VARCHAR NOT NULL, -- 'demanda', 'inadimplencia', 'churn', 'estoque'
  data_previsao DATE NOT NULL,
  valor_previsto DECIMAL,
  confianca DECIMAL, -- Intervalo de confiança
  modelo VARCHAR, -- 'prophet', 'arima', 'lightgbm'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sensores IoT
CREATE TABLE sensores_iot (
  id UUID PRIMARY KEY,
  nome VARCHAR NOT NULL,
  tipo VARCHAR, -- 'temperatura', 'umidade', etc.
  localizacao VARCHAR,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE leituras_iot (
  id UUID PRIMARY KEY,
  sensor_id UUID REFERENCES sensores_iot(id),
  temperatura DECIMAL,
  umidade DECIMAL,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- ... outras tabelas conforme necessário
```

### Indexes Recomendados

```sql
CREATE INDEX idx_kpis_mes ON kpis(mes DESC);
CREATE INDEX idx_kpis_tipo ON kpis(tipo);
CREATE INDEX idx_predicoes_data ON predicoes(data_previsao DESC);
CREATE INDEX idx_sensores_ativo ON sensores_iot(ativo) WHERE ativo = TRUE;
```

---

## 🚀 Performance

### Otimizações Implementadas

1. **Stale Time:** 5 minutos (evita refetches desnecessários)
2. **Refetch on Focus:** Desativado (menos chamadas API)
3. **Select Fields:** Apenas campos necessários
4. **Indexes:** Criar indexes nas colunas de ordenação
5. **Pagination:** Implementar para tabelas grandes
6. **Caching:** React Query gerencia automaticamente

### Pagination (Futura Implementação)

```typescript
// TODO: Adicionar suporte a paginação
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['compras'],
  queryFn: ({ pageParam = 0 }) => {
    return supabase
      .from('compras')
      .select('*')
      .range(pageParam * 50, (pageParam + 1) * 50 - 1)
  },
  getNextPageParam: (lastPage, pages) => pages.length
})
```

---

## 🔒 Row Level Security (RLS)

Todos os hooks respeitam automaticamente as políticas RLS do Supabase:

```sql
-- Exemplo de política RLS
CREATE POLICY "Usuários veem apenas sua empresa"
  ON kpis
  FOR SELECT
  USING (empresa_id = auth.jwt() ->> 'empresa_id');
```

---

## 📚 Referências

- [React Query Docs](https://tanstack.com/query/latest)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

---

## 🎯 Próximos Passos

1. Criar migrations para todas as tabelas necessárias
2. Popular banco com dados de seed/demo
3. Atualizar todos os 46 módulos com hooks reais
4. Implementar pagination em módulos grandes
5. Adicionar cache strategies avançadas
6. Configurar Realtime em mais módulos

---

**Versão:** 1.0.0  
**Status:** ✅ Pronto para uso

🎯 **Use este guia para integrar dados reais em todos os módulos do ICARUS v5.0!**

