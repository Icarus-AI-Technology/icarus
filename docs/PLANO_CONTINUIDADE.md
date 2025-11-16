# 🚀 ICARUS v5.0 - Plano de Continuidade

**Versão**: 1.0.0
**Data**: 2025-11-16
**Status Atual**: Autenticação Completa + Banco Configurado
**Próxima Fase**: Expansão de Módulos e Features

---

## 📊 Status Atual do Projeto

### ✅ Implementado (100%)

| Componente | Status | Commit |
|------------|--------|--------|
| **Documentação Completa** | ✅ 100% | `e45cc46` |
| **Estrutura Next.js** | ✅ 100% | `7e96c7a` |
| **OraclusX Design System** | ✅ 100% | `7e96c7a` |
| **Módulo Produtos (completo)** | ✅ 100% | `f60eb2d` |
| **Supabase Integration** | ✅ 100% | `8665aa0` |
| **Autenticação (Supabase Auth)** | ✅ 100% | `ddad85d` |

### 📦 Componentes Prontos

- ✅ 11 documentos de especificação
- ✅ AuthContext com session management
- ✅ ProtectedRoute guard
- ✅ Login/SignUp/Reset Password UI
- ✅ Header com logout
- ✅ Supabase Client configurado
- ✅ 12 tabelas no banco de dados
- ✅ RLS policies multi-tenant
- ✅ Seed data carregado
- ✅ Módulo Produtos funcionando com CRUD real

### 🎯 Score Atual

```typescript
{
  documentation: "100%",
  authentication: "100%",
  database: "100%",
  designSystem: "100%",
  modulesImplemented: "1/58 (Produtos)",
  infrastructureReady: "100%",
  productionReadiness: "25%"
}
```

---

## 🎯 Objetivos Estratégicos

### Curto Prazo (1-2 semanas)
1. Implementar módulos core business (10 módulos)
2. Expandir módulos de cadastros
3. Configurar CI/CD pipeline
4. Testes automatizados básicos

### Médio Prazo (1 mês)
1. Implementar 30+ módulos
2. Integração com APIs governamentais
3. Dashboard BI completo
4. Deploy staging

### Longo Prazo (2-3 meses)
1. Completar 58 módulos
2. Testes E2E completos
3. Deploy produção
4. Treinamento usuários

---

## 📋 Plano de Implementação Detalhado

## **FASE 1: Core Business Modules (Prioridade ALTA)**

### 1.1 Dashboard Principal
**Prazo**: 2-3 dias
**Complexidade**: Média

#### Tarefas:
- [ ] Criar componente DashboardPrincipal.tsx
- [ ] Implementar 6 KPIs principais:
  - Total de Cirurgias Hoje
  - Faturamento do Mês
  - Estoque Crítico
  - Contas a Receber
  - Taxa de Aprovação
  - Performance Geral
- [ ] Criar gráficos com Recharts:
  - Faturamento últimos 12 meses
  - Top 10 produtos
  - Cirurgias por especialidade
  - Inadimplência
- [ ] Integrar com dados reais do Supabase
- [ ] Adicionar realtime updates
- [ ] Testes de performance

#### Queries Supabase Necessárias:
```typescript
// lib/services/dashboard.service.ts
- getTodaySurgeries()
- getMonthRevenue()
- getCriticalStock()
- getAccountsReceivable()
- getApprovalRate()
- getFaturamentoChart()
- getTopProducts()
```

#### Tabelas Envolvidas:
- `surgeries`
- `invoices`
- `products`
- `accounts_receivable`
- `stock_movements`

---

### 1.2 Módulo de Cirurgias e Procedimentos
**Prazo**: 3-4 dias
**Complexidade**: Alta

#### Tarefas:
- [ ] Criar CirurgiasProcedimentos.tsx
- [ ] Implementar CRUD completo:
  - Listar cirurgias (tabela paginada)
  - Criar nova cirurgia (formulário)
  - Editar cirurgia existente
  - Cancelar/Reagendar
  - Visualizar detalhes
- [ ] Sistema de tabs:
  - Agendadas
  - Em Andamento
  - Concluídas
  - Canceladas
- [ ] Associar produtos OPME à cirurgia
- [ ] Cálculo automático de valor
- [ ] Integração com estoque (reserva de produtos)
- [ ] Geração de protocolo único
- [ ] Status workflow (Agendada → Confirmada → Realizada → Faturada)

#### Formulário Cirurgia:
```typescript
interface CirurgiaFormData {
  hospital_id: string
  doctor_id: string
  patient_name: string
  patient_cpf: string
  procedure_name: string
  specialty: string
  scheduled_date: Date
  scheduled_time: string
  estimated_duration: number
  products: Array<{
    product_id: string
    quantity: number
    unit_price: number
  }>
  observations: string
}
```

#### Serviços:
```typescript
// lib/services/surgeries.service.ts
class SurgeryService {
  create(data: CirurgiaFormData): Promise<Surgery>
  list(filters: SurgeryFilters): Promise<Surgery[]>
  getById(id: string): Promise<Surgery>
  update(id: string, data: Partial<CirurgiaFormData>): Promise<Surgery>
  cancel(id: string, reason: string): Promise<void>
  reschedule(id: string, newDate: Date): Promise<Surgery>
  addProducts(surgeryId: string, products: ProductItem[]): Promise<void>
  removeProduct(surgeryId: string, productId: string): Promise<void>
  updateStatus(id: string, status: SurgeryStatus): Promise<Surgery>
  getKPIs(): Promise<SurgeryKPIs>
}
```

#### Validações:
- ✅ Data não pode ser passada
- ✅ Horário comercial (6h-20h)
- ✅ Médico disponível (não conflitar com outra cirurgia)
- ✅ Produtos em estoque suficiente
- ✅ Hospital ativo

---

### 1.3 Módulo Financeiro Avançado
**Prazo**: 3-4 dias
**Complexidade**: Alta

#### Tarefas:
- [ ] Criar FinanceiroAvancado.tsx
- [ ] Dashboard financeiro:
  - Receitas vs Despesas (gráfico)
  - Fluxo de Caixa
  - Projeção 30/60/90 dias
  - DRE simplificado
- [ ] Contas a Pagar:
  - Listar contas pendentes
  - Registrar pagamento
  - Agendar pagamentos
  - Parcelamento
- [ ] Contas a Receber:
  - Listar recebíveis
  - Baixar recebimento
  - Enviar cobrança
  - Relatório inadimplência
- [ ] Conciliação Bancária:
  - Importar OFX
  - Match automático
  - Reconciliação manual
- [ ] Relatórios:
  - Balancete
  - DRE
  - Fluxo de Caixa
  - Aging List

#### Nova Tabela Necessária:
```sql
-- /supabase/migrations/004_financial_tables.sql

CREATE TABLE financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('receivable', 'payable')),
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  related_invoice_id UUID REFERENCES invoices(id),
  related_surgery_id UUID REFERENCES surgeries(id),
  category TEXT,
  payment_method TEXT,
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_financial_accounts_company ON financial_accounts(company_id);
CREATE INDEX idx_financial_accounts_due_date ON financial_accounts(due_date);
CREATE INDEX idx_financial_accounts_status ON financial_accounts(status);
```

---

### 1.4 CRM & Vendas
**Prazo**: 2-3 dias
**Complexidade**: Média

#### Tarefas:
- [ ] Criar CRMVendas.tsx
- [ ] Gestão de Leads:
  - Captura de leads
  - Qualificação (scoring)
  - Funil de vendas
  - Follow-up automático
- [ ] Oportunidades:
  - Criar oportunidade
  - Estágios do pipeline
  - Probabilidade de fechamento
  - Previsão de receita
- [ ] Relacionamento:
  - Histórico de interações
  - Emails/Ligações/Reuniões
  - Notas e anexos
  - Timeline
- [ ] Relatórios:
  - Taxa de conversão
  - Ciclo de vendas médio
  - Top vendedores
  - Forecast

#### Nova Tabela:
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  hospital_name TEXT,
  position TEXT,
  source TEXT,
  score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'new',
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  lead_id UUID REFERENCES leads(id),
  title TEXT NOT NULL,
  value DECIMAL(10,2),
  probability INTEGER CHECK (probability BETWEEN 0 AND 100),
  stage TEXT,
  expected_close_date DATE,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 1.5 Gestão de Estoque (Avançado)
**Prazo**: 3 dias
**Complexidade**: Média

#### Tarefas:
- [ ] Expandir módulo Produtos existente
- [ ] Movimentações de Estoque:
  - Entrada (compra)
  - Saída (venda/cirurgia)
  - Transferência entre locais
  - Ajuste de inventário
  - Devolução
- [ ] Inventário:
  - Contagem periódica
  - Auditoria
  - Divergências
  - Acurácia
- [ ] Rastreabilidade:
  - Número de série
  - Lote
  - Validade
  - Histórico completo
- [ ] Alertas:
  - Estoque mínimo
  - Produto vencendo
  - Produto parado (sem movimento)
  - Ruptura de estoque

#### Atualizar Tabela:
```sql
-- Adicionar campos em products
ALTER TABLE products ADD COLUMN serial_tracking BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN batch_tracking BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN shelf_life_days INTEGER;

-- Criar tabela de lotes
CREATE TABLE product_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  batch_number TEXT NOT NULL,
  manufacturing_date DATE,
  expiration_date DATE,
  quantity INTEGER NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## **FASE 2: Cadastros e Gestão (Prioridade MÉDIA)**

### 2.1 Gestão de Contratos
**Prazo**: 2 dias

#### Tarefas:
- [ ] CRUD de contratos
- [ ] Tipos: Fornecedor, Hospital, Convênio
- [ ] Vigência e renovação automática
- [ ] Anexos (PDFs)
- [ ] Alertas de vencimento
- [ ] Histórico de aditivos

---

### 2.2 Gestão de Usuários e Permissões
**Prazo**: 3 dias

#### Tarefas:
- [ ] CRUD de usuários
- [ ] Perfis de acesso (Roles):
  - Admin
  - Gerente
  - Vendedor
  - Operacional
  - Financeiro
  - Visualizador
- [ ] Permissões granulares por módulo
- [ ] Auditoria de ações
- [ ] Log de acessos
- [ ] Integração com Supabase Auth

#### Nova Tabela:
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL,
  permissions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  module TEXT,
  entity_type TEXT,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 2.3 RH & Gestão de Pessoas
**Prazo**: 2-3 dias

#### Tarefas:
- [ ] CRUD de funcionários
- [ ] Departamentos e cargos
- [ ] Folha de pagamento básica
- [ ] Controle de ponto
- [ ] Férias e afastamentos
- [ ] Documentos

---

## **FASE 3: Integrações e APIs (Prioridade MÉDIA)**

### 3.1 Integração ANVISA
**Prazo**: 2 dias

#### Tarefas:
- [ ] Consulta de produtos regulamentados
- [ ] Validação de registro ANVISA
- [ ] Alertas sanitários
- [ ] Cache de consultas (evitar rate limit)

#### Serviço:
```typescript
// lib/services/governamentais/anvisa.service.ts
class ANVISAService {
  async consultarProduto(anvisaCode: string): Promise<ANVISAProduct>
  async validarRegistro(code: string): Promise<boolean>
  async getAlertasSanitarios(): Promise<ANVISAAlert[]>
  async buscarPorCategoria(categoria: string): Promise<ANVISAProduct[]>
}
```

---

### 3.2 Integração NFe (SEFAZ)
**Prazo**: 3-4 dias
**Complexidade**: Alta

#### Tarefas:
- [ ] Emissão de NFe
- [ ] Consulta status
- [ ] Cancelamento
- [ ] Carta de Correção
- [ ] Download XML
- [ ] Envio email cliente
- [ ] Armazenamento no Supabase Storage

#### Bibliotecas:
- `node-nfe` ou `nfe-io` ou API Focus NFe

---

### 3.3 Integração Boletos & PIX
**Prazo**: 2 dias

#### Tarefas:
- [ ] Geração de boletos (Banco do Brasil, Itaú, etc)
- [ ] Geração de PIX Copia e Cola
- [ ] QR Code PIX
- [ ] Webhook de confirmação de pagamento
- [ ] Baixa automática de contas a receber

---

## **FASE 4: Analytics e BI (Prioridade MÉDIA-BAIXA)**

### 4.1 Dashboard BI Executivo
**Prazo**: 3 dias

#### Tarefas:
- [ ] Indicadores estratégicos
- [ ] Gráficos avançados (Recharts)
- [ ] Filtros por período
- [ ] Exportação PDF/Excel
- [ ] Agendamento de relatórios

---

### 4.2 Relatórios Regulatórios
**Prazo**: 2 dias

#### Tarefas:
- [ ] Relatório ANVISA
- [ ] Relatório de rastreabilidade
- [ ] Relatório de inventário
- [ ] Conformidade LGPD

---

## **FASE 5: Automação e IA (Prioridade BAIXA)**

### 5.1 Assistente IA (Chatbot)
**Prazo**: 4-5 dias

#### Tarefas:
- [ ] Interface de chat
- [ ] Integração Claude API ou GPT-4
- [ ] Contexto ICARUS (RAG)
- [ ] Comandos:
  - Consultar estoque
  - Agendar cirurgia
  - Buscar NFe
  - Gerar relatório
- [ ] Histórico de conversas

---

### 5.2 Predição de Demanda (IA)
**Prazo**: 3 dias

#### Tarefas:
- [ ] Análise histórica de vendas
- [ ] Previsão próximos 30/60/90 dias
- [ ] Sugestão de compra
- [ ] Alertas de tendências

---

## **FASE 6: Testes e Qualidade (Prioridade ALTA)**

### 6.1 Testes Unitários
**Prazo**: Contínuo

#### Setup:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

#### Tarefas:
- [ ] Configurar Vitest
- [ ] Testes de componentes UI
- [ ] Testes de serviços
- [ ] Testes de hooks
- [ ] Coverage mínimo 70%

---

### 6.2 Testes E2E
**Prazo**: 1 semana

#### Setup:
```bash
npm install -D playwright
```

#### Tarefas:
- [ ] Configurar Playwright
- [ ] Testes de fluxos críticos:
  - Login/Logout
  - Criar cirurgia
  - Emitir NFe
  - Gerar relatório
- [ ] CI/CD pipeline

---

## **FASE 7: Deploy e DevOps (Prioridade ALTA)**

### 7.1 CI/CD Pipeline
**Prazo**: 1 dia

#### Tarefas:
- [ ] Configurar GitHub Actions
- [ ] Build automático
- [ ] Testes automáticos
- [ ] Deploy staging (Vercel)
- [ ] Deploy produção (aprovação manual)

#### Arquivo:
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build
```

---

### 7.2 Deploy Staging
**Prazo**: 1 dia

#### Tarefas:
- [ ] Configurar Vercel/Netlify
- [ ] Variáveis de ambiente
- [ ] Domínio staging (icarus-staging.vercel.app)
- [ ] SSL certificado
- [ ] Monitoramento (Sentry)

---

### 7.3 Deploy Produção
**Prazo**: 1 dia

#### Tarefas:
- [ ] Domínio customizado
- [ ] CDN configurado
- [ ] Backup Supabase
- [ ] Plano de rollback
- [ ] Documentação de deploy

---

## 📅 Cronograma Sugerido

### Sprint 1 (Semana 1-2)
- ✅ Autenticação (CONCLUÍDO)
- ⏳ Dashboard Principal
- ⏳ Módulo Cirurgias
- ⏳ Módulo Financeiro Básico

### Sprint 2 (Semana 3-4)
- ⏳ CRM & Vendas
- ⏳ Gestão de Estoque Avançado
- ⏳ Gestão de Contratos
- ⏳ Gestão de Usuários

### Sprint 3 (Semana 5-6)
- ⏳ Integração ANVISA
- ⏳ Integração NFe
- ⏳ Integração Boletos/PIX
- ⏳ RH Básico

### Sprint 4 (Semana 7-8)
- ⏳ Dashboard BI
- ⏳ Relatórios Regulatórios
- ⏳ Testes Unitários
- ⏳ CI/CD Pipeline

### Sprint 5 (Semana 9-10)
- ⏳ Assistente IA
- ⏳ Predição de Demanda
- ⏳ Testes E2E
- ⏳ Deploy Staging

### Sprint 6 (Semana 11-12)
- ⏳ Ajustes finais
- ⏳ Documentação de usuário
- ⏳ Deploy Produção
- ⏳ Treinamento

---

## 🎯 Priorização Recomendada

### Próximos 3 Módulos (Ordem de Implementação):

1. **Dashboard Principal** ⭐⭐⭐
   - Visão geral do sistema
   - Impacto visual alto
   - Demonstra valor imediato
   - Prazo: 2-3 dias

2. **Módulo de Cirurgias** ⭐⭐⭐
   - Core business OPME
   - Alto valor para usuários
   - Integra com produtos e estoque
   - Prazo: 3-4 dias

3. **Financeiro Avançado** ⭐⭐⭐
   - Essencial para gestão
   - Contas a pagar/receber
   - ROI direto
   - Prazo: 3-4 dias

---

## 📦 Dependências e Instalações Necessárias

### Para Gráficos e Charts:
```bash
npm install recharts
npm install @tremor/react  # Opcional: biblioteca de charts enterprise
```

### Para Formulários Avançados:
```bash
npm install @hookform/resolvers
npm install react-select  # Selects customizados
npm install react-datepicker
```

### Para Exportação:
```bash
npm install jspdf jspdf-autotable  # PDF
npm install xlsx  # Excel
```

### Para Notificações:
```bash
npm install sonner  # Toast notifications (já tem?)
```

### Para Edição de Texto Rico:
```bash
npm install @tiptap/react @tiptap/starter-kit  # Editor WYSIWYG
```

### Para Upload de Arquivos:
```bash
npm install react-dropzone
```

---

## 🔍 Checklist de Qualidade (Cada Módulo)

Antes de considerar um módulo "pronto":

- [ ] **UI**: Segue 100% OraclusX Design System
- [ ] **Responsivo**: Funciona em mobile/tablet/desktop
- [ ] **Acessibilidade**: WCAG 2.1 AA
- [ ] **Performance**: Lazy loading, otimizações
- [ ] **Dados Reais**: Integrado com Supabase
- [ ] **RLS**: Policies configuradas corretamente
- [ ] **Validação**: Zod schemas implementados
- [ ] **Loading States**: Feedback visual adequado
- [ ] **Error Handling**: Tratamento de erros robusto
- [ ] **Testes**: Mínimo testes básicos
- [ ] **Documentação**: README do módulo
- [ ] **TypeScript**: Sem erros de tipo
- [ ] **Lint**: Sem warnings ESLint
- [ ] **Git**: Commit descritivo e bem formatado

---

## 🚨 Riscos e Mitigações

### Risco 1: Complexidade das Integrações
**Mitigação**: Começar com mock data, depois integrar APIs reais

### Risco 2: Performance com Muitos Dados
**Mitigação**: Paginação, virtualização, lazy loading

### Risco 3: Prazo Apertado
**Mitigação**: Priorizar MVP de cada módulo, depois incrementar

### Risco 4: Mudanças de Requisitos
**Mitigação**: Documentação clara, validação com stakeholders

---

## 📞 Próximos Passos Imediatos

### Agora (Hoje):
1. ✅ Push das atualizações (FEITO)
2. ✅ Criar plano de continuidade (ESTE DOCUMENTO)
3. ⏳ Decidir próximo módulo a implementar

### Amanhã:
1. ⏳ Iniciar Dashboard Principal
2. ⏳ Criar migration 004_financial_tables.sql
3. ⏳ Implementar serviço dashboard.service.ts

### Esta Semana:
1. ⏳ Completar Dashboard Principal
2. ⏳ Iniciar Módulo de Cirurgias
3. ⏳ Configurar CI/CD básico

---

## 📚 Recursos e Referências

### Documentação Projeto:
- `docs/INDEX.md` - Índice mestre
- `docs/CLAUDE.md` - Contexto para desenvolvimento
- `docs/AUTH_SETUP.md` - Setup de autenticação
- `docs/SUPABASE_SETUP.md` - Setup do banco

### Código Referência:
- `src/modules/estoque/produtos/` - Módulo completo de exemplo
- `src/contexts/AuthContext.tsx` - Padrão de context
- `src/components/auth/ProtectedRoute.tsx` - Padrão de guard

### Design System:
- `.clinerules` - Regras obrigatórias
- `SKILL_ORACLUSX_DS.md` - Componentes e padrões

---

## ✅ Critérios de Sucesso

### Fase 1 (Mês 1):
- ✅ 10 módulos core implementados
- ✅ Autenticação funcionando
- ✅ Banco de dados robusto
- ✅ CI/CD configurado

### Fase 2 (Mês 2):
- ✅ 30+ módulos implementados
- ✅ Integrações principais funcionando
- ✅ Testes automatizados
- ✅ Deploy staging estável

### Fase 3 (Mês 3):
- ✅ 58 módulos completos
- ✅ Todas as integrações
- ✅ Deploy produção
- ✅ Sistema em uso real

---

**Versão**: 1.0.0
**Autor**: Claude Code
**Data**: 2025-11-16
**Status**: 🚀 Pronto para Execução

---

## 🎯 DECISÃO NECESSÁRIA

**Qual módulo implementar primeiro?**

Opções recomendadas:

**A)** Dashboard Principal (impacto visual, 2-3 dias)
**B)** Módulo de Cirurgias (core business, 3-4 dias)
**C)** Financeiro Avançado (ROI direto, 3-4 dias)

Aguardando sua decisão para prosseguir! 🚀
