# 🎯 ICARUS v5.0 - Próximos Passos

**Status Atual**: ✅ Infraestrutura completa | Branch pronto para desenvolvimento

---

## 📋 Fase 1: Setup Local e Validação (Hoje)

### 1.1 Instalar Dependências
```bash
npm install
```

**Tempo estimado**: 5-10 minutos

---

### 1.2 Validar Configuração
```bash
# Verificar variáveis de ambiente
cat .env.local

# Deve conter:
# VITE_SUPABASE_URL=https://oshgkugagyixutiqyjsq.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...
# VITE_ANTHROPIC_API_KEY=sk-ant-...

# Verificar TypeScript
npm run type-check

# Verificar linting
npm run lint
```

**Tempo estimado**: 5 minutos

---

### 1.3 Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```

**Acesse**: http://localhost:5173

**Validar**:
- ✅ Dashboard carrega sem erros
- ✅ Sidebar com navegação
- ✅ Efeitos neumórficos visíveis
- ✅ Console sem erros

**Tempo estimado**: 2 minutos

---

### 1.4 Testar Integração AI (Opcional)
```bash
# Criar arquivo de teste
cat > test-ai.ts << 'EOF'
import { icarusBrain } from './src/lib/ai/icarus-brain'

async function testAI() {
  const result = await icarusBrain.predict('demanda', {
    produto_id: 'teste-123',
    dias: 7
  })
  console.log('Resultado AI:', result)
}

testAI()
EOF

# Executar teste
npx tsx test-ai.ts
```

**Tempo estimado**: 5 minutos

---

## 🗄️ Fase 2: Configurar Database Supabase (1-2 horas)

### 2.1 Criar Schema de Banco de Dados

**Acesse**: https://app.supabase.com/project/oshgkugagyixutiqyjsq/editor

#### Tabelas Essenciais (Ordem de criação):

```sql
-- 1. Tabela de Empresas (Multi-tenant)
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(14) UNIQUE NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Usuários
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  nome_completo VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'usuario',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Produtos
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id),
  codigo VARCHAR(50) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  preco_venda DECIMAL(15,2) NOT NULL,
  preco_custo DECIMAL(15,2),
  estoque_atual INTEGER DEFAULT 0,
  estoque_minimo INTEGER DEFAULT 0,
  unidade_medida VARCHAR(10) DEFAULT 'UN',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

-- 4. Tabela de Clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id),
  tipo VARCHAR(10) CHECK (tipo IN ('PF', 'PJ')),
  cpf_cnpj VARCHAR(14) UNIQUE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco JSONB,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Pedidos
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id),
  numero VARCHAR(50) NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  data_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'pendente',
  valor_total DECIMAL(15,2) NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, numero)
);

-- 6. Tabela de Itens do Pedido
CREATE TABLE pedido_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(15,2) NOT NULL,
  desconto DECIMAL(15,2) DEFAULT 0,
  valor_total DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_produtos_empresa ON produtos(empresa_id);
CREATE INDEX idx_clientes_empresa ON clientes(empresa_id);
CREATE INDEX idx_pedidos_empresa ON pedidos(empresa_id);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_data ON pedidos(data_pedido);
```

---

### 2.2 Configurar Row Level Security (RLS)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_items ENABLE ROW LEVEL SECURITY;

-- Policies para Produtos (exemplo)
CREATE POLICY "Usuários podem ver produtos da sua empresa"
  ON produtos FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios WHERE id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem inserir produtos"
  ON produtos FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- Repetir para outras tabelas...
```

---

### 2.3 Atualizar Types TypeScript

```bash
# Gerar types do Supabase
npx supabase gen types typescript --project-id oshgkugagyixutiqyjsq > src/lib/supabase/database.types.ts
```

---

## 🎨 Fase 3: Implementar Módulos Core (2-4 semanas)

### Prioridade Alta (Semana 1-2)

#### 3.1 Módulo de Produtos ✅
**Status**: Template já existe em `src/components/modules/Produtos.tsx`

**Tarefas**:
- [ ] Conectar ao Supabase
- [ ] Implementar CRUD completo
- [ ] Adicionar validações (Zod)
- [ ] Testes unitários

**Arquivo**: `src/components/modules/vendas/Produtos.tsx`

---

#### 3.2 Módulo de Clientes
**Criar**: `src/components/modules/crm/Clientes.tsx`

**Funcionalidades**:
- [ ] Listagem com paginação
- [ ] Formulário de cadastro
- [ ] Busca e filtros
- [ ] Importação CSV
- [ ] Integração com IA (lead scoring)

**Estimativa**: 3-5 dias

---

#### 3.3 Módulo de Pedidos
**Criar**: `src/components/modules/vendas/Pedidos.tsx`

**Funcionalidades**:
- [ ] Criar pedido
- [ ] Adicionar itens (autocomplete de produtos)
- [ ] Calcular totais
- [ ] Workflow de aprovação
- [ ] Integração com estoque

**Estimativa**: 5-7 dias

---

### Prioridade Média (Semana 3)

#### 3.4 Dashboard Avançado
**Melhorar**: `src/pages/Dashboard.tsx`

**Adicionar**:
- [ ] Gráficos com Recharts (vendas, estoque)
- [ ] KPIs dinâmicos (dados reais do Supabase)
- [ ] Insights de IA (IcarusBrain)
- [ ] Realtime updates

**Estimativa**: 3-4 dias

---

#### 3.5 Módulo de Estoque
**Criar**: `src/components/modules/estoque/Movimentacoes.tsx`

**Funcionalidades**:
- [ ] Entrada de produtos
- [ ] Saída de produtos
- [ ] Transferências entre depósitos
- [ ] Inventário
- [ ] Alertas de estoque baixo (IA)

**Estimativa**: 4-5 dias

---

### Prioridade Baixa (Semana 4)

#### 3.6 Relatórios
**Criar**: `src/components/modules/gestao/Relatorios.tsx`

**Funcionalidades**:
- [ ] Relatório de vendas
- [ ] Relatório de estoque
- [ ] Relatório financeiro
- [ ] Exportar PDF/Excel
- [ ] Dashboards customizáveis

**Estimativa**: 5-7 dias

---

## 🧠 Fase 4: Integração Avançada de IA (1-2 semanas)

### 4.1 Previsão de Demanda
**Arquivo**: `src/features/ai/DemandForecast.tsx`

```typescript
import { useIcarusBrain } from '@/hooks/useIcarusBrain'

export function DemandForecast({ produtoId }: { produtoId: string }) {
  const { predict } = useIcarusBrain()

  const getForecast = async () => {
    const result = await predict('demanda', {
      produto_id: produtoId,
      dias: 30
    })
    // Exibir gráfico com previsões
  }
}
```

**Tarefas**:
- [ ] Componente de visualização
- [ ] Integração com histórico de vendas
- [ ] Gráficos de tendência
- [ ] Alertas automáticos

---

### 4.2 Score de Inadimplência
**Arquivo**: `src/features/ai/CreditScore.tsx`

**Funcionalidades**:
- [ ] Análise automática de clientes
- [ ] Score visual (0-100)
- [ ] Recomendações de ação
- [ ] Histórico de análises

---

### 4.3 Recomendações de Produtos
**Arquivo**: `src/features/ai/ProductRecommendations.tsx`

**Usar em**:
- Tela de pedidos (sugerir produtos)
- Tela de clientes (cross-sell)
- Dashboard (insights)

---

## 🧪 Fase 5: Testes Completos (1 semana)

### 5.1 Testes Unitários
```bash
# Criar testes para cada módulo
# Exemplo: src/components/modules/vendas/Produtos.test.tsx

npm test
npm run test:coverage
```

**Meta**: 85% coverage

---

### 5.2 Testes E2E
```bash
# Criar fluxos E2E com Playwright
# Exemplo: e2e/pedidos.spec.ts

npm run test:e2e
```

**Fluxos principais**:
- [ ] Login e navegação
- [ ] Criar produto
- [ ] Criar cliente
- [ ] Criar pedido completo
- [ ] Consultar relatórios

---

## 🚀 Fase 6: Deploy e Produção (2-3 dias)

### 6.1 Configurar Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variáveis de ambiente no dashboard:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_ANTHROPIC_API_KEY
```

---

### 6.2 Configurar Domínio
- Adicionar domínio customizado no Vercel
- Configurar DNS
- Habilitar SSL automático

---

### 6.3 Monitoramento
**Adicionar**:
- Sentry para error tracking
- Analytics (Vercel Analytics)
- Performance monitoring

---

## 📊 Cronograma Resumido

| Fase | Duração | Status |
|------|---------|--------|
| 1. Setup Local | 1 dia | 🔄 Próximo |
| 2. Database | 1-2 dias | ⏳ Pendente |
| 3. Módulos Core | 2-4 semanas | ⏳ Pendente |
| 4. IA Avançada | 1-2 semanas | ⏳ Pendente |
| 5. Testes | 1 semana | ⏳ Pendente |
| 6. Deploy | 2-3 dias | ⏳ Pendente |
| **TOTAL** | **5-8 semanas** | |

---

## 🎯 Quick Wins (Primeiros Resultados)

### Semana 1
- ✅ Ambiente local funcionando
- ✅ Database configurado
- ✅ Módulo de Produtos funcional
- ✅ Dashboard com dados reais

### Semana 2
- ✅ Módulo de Clientes completo
- ✅ Módulo de Pedidos funcionando
- ✅ Primeira integração de IA (previsão de demanda)

### Semana 3-4
- ✅ Módulo de Estoque
- ✅ Relatórios básicos
- ✅ Testes principais
- ✅ Deploy em staging

---

## 📝 Checklist de Ação Imediata

### Hoje (próximas 2 horas):
- [ ] `npm install`
- [ ] `npm run dev` - Validar que funciona
- [ ] Acessar Supabase Dashboard
- [ ] Criar tabelas básicas (empresas, usuarios, produtos)
- [ ] Testar query no Supabase

### Amanhã:
- [ ] Implementar CRUD de Produtos
- [ ] Conectar Dashboard ao Supabase
- [ ] Testar integração AI
- [ ] Criar primeira feature branch

### Esta Semana:
- [ ] Completar módulo de Produtos
- [ ] Iniciar módulo de Clientes
- [ ] Configurar RLS no Supabase
- [ ] Adicionar validações com Zod

---

## 🛠️ Ferramentas Necessárias

### Desenvolvimento
- ✅ VS Code (ou editor preferido)
- ✅ Node.js 18+ e npm
- ✅ Git
- ⏳ Docker (opcional, para Supabase local)

### Contas/Serviços
- ✅ Supabase (já configurado)
- ✅ Anthropic API (já configurado)
- ⏳ Vercel (criar conta)
- ⏳ Figma (para Code Connect)

### Extensões VS Code Recomendadas
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript + JavaScript
- GitLens

---

## 📚 Documentação de Referência

### Durante o Desenvolvimento, Consulte:
1. `CLAUDE.md` - Contexto AI e arquitetura
2. `.clinerules` - Padrões de código
3. `docs/MODULES.md` - Estrutura de módulos
4. `docs/skills/SKILL_*.md` - Guias específicos
5. `TROUBLESHOOTING.md` - Problemas comuns

---

## 🎯 Objetivos por Sprint

### Sprint 1 (Semana 1-2): Foundation
**Objetivo**: Sistema funcionando com módulos básicos
- Produtos CRUD completo
- Clientes básico
- Dashboard com dados reais

### Sprint 2 (Semana 3-4): Core Features
**Objetivo**: Fluxo de vendas completo
- Pedidos funcionando
- Estoque integrado
- IA básica (previsões)

### Sprint 3 (Semana 5-6): Advanced
**Objetivo**: Features avançadas
- Relatórios
- IA avançada
- Integrações

### Sprint 4 (Semana 7-8): Polish & Deploy
**Objetivo**: Production ready
- Testes completos
- Performance
- Deploy produção

---

## 💡 Dicas para Desenvolvimento

### 1. Desenvolva Incrementalmente
```bash
# Sempre em feature branches
git checkout -b feat/modulo-clientes
# Desenvolver...
git add .
git commit -m "feat(crm): implementar CRUD de clientes"
git push
```

### 2. Use os Hooks Customizados
```typescript
// Aproveite os hooks prontos
import { useIcarusBrain } from '@/hooks/useIcarusBrain'
import { useSupabase } from '@/hooks/useSupabase'
```

### 3. Siga os Padrões
- Sempre use `neu-soft`, `neu-hard` em cards
- TypeScript strict (sem `any`)
- Componentes funcionais
- React Query para server state

### 4. Teste Continuamente
```bash
# Sempre rode antes de commit
npm run type-check
npm run lint
npm test
```

---

## 🆘 Precisa de Ajuda?

### Recursos
- **Docs**: Leia `docs/` para referências
- **Skills**: Use `docs/skills/` para tutoriais
- **Issues**: Consulte problemas conhecidos
- **Troubleshooting**: `TROUBLESHOOTING.md`

### Próximo Suporte
Se precisar de ajuda com:
- Implementação de módulos específicos
- Configuração de Supabase
- Integração de IA
- Debug de problemas

**Avise!** 🙋‍♂️

---

**Última atualização**: 2025-11-16
**Versão**: 5.0.3
**Status**: ✅ Pronto para começar!

🚀 **Vamos construir o melhor ERP hospitalar do Brasil!**
