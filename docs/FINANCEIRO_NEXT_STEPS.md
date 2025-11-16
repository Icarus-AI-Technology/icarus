# 💰 Módulo Financeiro Avançado - Próximos Passos

**Status**: Estrutura Base Criada (40% Completo)
**Data**: 2025-11-16
**Prioridade**: Alta

---

## ✅ Já Implementado

### 1. **Database Schema** (`supabase/migrations/004_financial_tables.sql`)

**3 Tabelas Principais:**
- ✅ `financial_accounts` - Contas a pagar/receber unificadas
- ✅ `bank_accounts` - Contas bancárias
- ✅ `cash_flow_entries` - Fluxo de caixa

**Features:**
- ✅ RLS Policies multi-tenant
- ✅ Triggers para updated_at
- ✅ Views para summaries
- ✅ Função de atualização de contas vencidas
- ✅ Seed data demo (10 receivables + 8 payables)
- ✅ Índices otimizados
- ✅ Constraints e validações

### 2. **TypeScript Types** (`src/types/financial.types.ts`)

**Interfaces Criadas:**
- ✅ FinancialAccount + FormData + Filters
- ✅ BankAccount + FormData
- ✅ CashFlowEntry + FormData
- ✅ FinancialSummary
- ✅ MonthlyFinancialData
- ✅ DREData
- ✅ PaymentData + PaymentReceipt
- ✅ CategoryBreakdown

### 3. **Service Layer** (`src/services/financial.service.ts`)

**Métodos Implementados:**
- ✅ `listAccounts(filters)` - Listar com filtros
- ✅ `createAccount(data)` - Criar conta
- ✅ `updateAccount(id, data)` - Atualizar conta
- ✅ `deleteAccount(id)` - Deletar conta
- ✅ `payAccount(paymentData)` - Registrar pagamento
- ✅ `listBankAccounts()` - Listar contas bancárias
- ✅ `getSummary()` - KPIs e totalizadores
- ✅ `getMonthlyData(months)` - Dados mensais
- ✅ `subscribe()` / `unsubscribe()` - Realtime

---

## 🚧 Próximos Passos (60% Restante)

### **Fase 1: Hook e Estado** (1-2 horas)

#### 1.1 Criar `src/hooks/useFinancial.ts`

```typescript
export function useFinancial() {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyFinancialData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadData = async (filters?: FinancialAccountFilters) => {
    // Load all data concurrently
    const [accountsData, banksData, summaryData, monthlyData] = await Promise.all([
      FinancialService.listAccounts(filters),
      FinancialService.listBankAccounts(),
      FinancialService.getSummary(),
      FinancialService.getMonthlyData(),
    ])
    // Set states...
  }

  useEffect(() => {
    loadData()
    // Subscribe to realtime
  }, [])

  return {
    accounts,
    bankAccounts,
    summary,
    monthlyData,
    loading,
    error,
    reload: loadData,
    createAccount: FinancialService.createAccount,
    updateAccount: FinancialService.updateAccount,
    deleteAccount: FinancialService.deleteAccount,
    payAccount: FinancialService.payAccount,
  }
}
```

---

### **Fase 2: Componente Principal** (2-3 horas)

#### 2.1 Criar `src/pages/FinanceiroAvancado.tsx`

**Estrutura:**
```typescript
export default function FinanceiroAvancado() {
  const [activeTab, setActiveTab] = useState<'receivable' | 'payable' | 'cashflow' | 'dre'>('receivable')
  const { accounts, summary, loading, error } = useFinancial()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0f1419]">
        <Header />

        {/* KPIs Grid - 8 Cards */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard label="A Receber (Pendente)" value={summary?.receivables.pending} />
          <KPICard label="A Receber (Vencido)" value={summary?.receivables.overdue} />
          <KPICard label="A Pagar (Pendente)" value={summary?.payables.pending} />
          <KPICard label="A Pagar (Vencido)" value={summary?.payables.overdue} />
          <KPICard label="Saldo Bancário" value={summary?.bankAccounts.totalBalance} />
          <KPICard label="Fluxo Líquido" value={summary?.cashFlow.netFlow} />
          <KPICard label="Receitas Pagas" value={summary?.receivables.paid} />
          <KPICard label="Despesas Pagas" value={summary?.payables.paid} />
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="receivable">Contas a Receber</TabsTrigger>
            <TabsTrigger value="payable">Contas a Pagar</TabsTrigger>
            <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
            <TabsTrigger value="dre">DRE</TabsTrigger>
          </TabsList>

          <TabsContent value="receivable">
            <ContasReceberTab accounts={accounts.filter(a => a.type === 'receivable')} />
          </TabsContent>

          <TabsContent value="payable">
            <ContasPagarTab accounts={accounts.filter(a => a.type === 'payable')} />
          </TabsContent>

          <TabsContent value="cashflow">
            <FluxoCaixaTab monthlyData={monthlyData} />
          </TabsContent>

          <TabsContent value="dre">
            <DRETab />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
```

---

### **Fase 3: Componentes de Tab** (3-4 horas)

#### 3.1 `ContasReceberTab.tsx`

**Features:**
- Tabela com colunas: Descrição, Valor, Vencimento, Status, Ações
- Filtros: Status, Período, Categoria
- Botão "Nova Conta a Receber"
- Dialog/Modal para cadastro/edição
- Botão "Receber" para registrar pagamento
- Indicador visual de vencidas (red) e próximas a vencer (yellow)

**Form Fields:**
- Descrição
- Categoria (dropdown: sale, service, other)
- Valor
- Data de Vencimento
- Observações

#### 3.2 `ContasPagarTab.tsx`

**Features:**
- Similar a ContasReceberTab
- Botão "Nova Conta a Pagar"
- Botão "Pagar" para registrar pagamento
- Categorias: purchase, salary, rent, tax, other

#### 3.3 `FluxoCaixaTab.tsx`

**Features:**
- Gráfico de linha (Receitas vs Despesas)
- Gráfico de área (Fluxo Líquido)
- Tabela de movimentações
- Filtro por período
- Exportar para Excel

#### 3.4 `DRETab.tsx`

**Features:**
- Período selecionável (mês/trimestre/ano)
- Receitas (vendas, serviços, outras)
- (-) Custos (materiais, mão de obra)
- (=) Lucro Bruto
- (-) Despesas (administrativas, vendas, financeiras)
- (=) Lucro Operacional
- (=) Lucro Líquido
- Indicadores: Margem Bruta, Margem Líquida

---

### **Fase 4: Dialogs e Formulários** (2 horas)

#### 4.1 `AccountFormDialog.tsx`

- React Hook Form + Zod validation
- Campos dinâmicos baseados em type (receivable/payable)
- DatePicker para datas
- NumberInput para valores
- Dropdown de categorias
- TextArea para observações

#### 4.2 `PaymentDialog.tsx`

- Exibir dados da conta
- Valor a pagar (editável para pagamento parcial)
- Data do pagamento
- Método de pagamento (dropdown)
- Conta bancária (se bank_transfer/pix)
- Observações
- Botão "Confirmar Pagamento"

---

### **Fase 5: Gráficos** (1 hora)

#### 5.1 Gráficos Necessários:

1. **Receitas vs Despesas** (BarChart)
2. **Fluxo de Caixa Acumulado** (LineChart)
3. **Contas a Receber por Status** (PieChart)
4. **Contas a Pagar por Categoria** (BarChart)

---

### **Fase 6: Integração e Testes** (1-2 horas)

- ✅ Aplicar migration no Supabase
- ✅ Testar CRUD completo
- ✅ Testar realtime updates
- ✅ Testar filtros
- ✅ Testar cálculos de totalizadores
- ✅ Validar RLS policies

---

## 📊 Checklist de Implementação

### Backend/Database
- [x] Criar migration 004_financial_tables.sql
- [x] Definir RLS policies
- [x] Criar views de summary
- [x] Seed data demo
- [ ] Aplicar migration no Supabase Dashboard

### Types & Services
- [x] Definir interfaces TypeScript
- [x] Criar FinancialService
- [ ] Criar useFinancial hook

### UI Components
- [ ] Criar FinanceiroAvancado.tsx (página principal)
- [ ] Criar ContasReceberTab
- [ ] Criar ContasPagarTab
- [ ] Criar FluxoCaixaTab
- [ ] Criar DRETab
- [ ] Criar AccountFormDialog
- [ ] Criar PaymentDialog
- [ ] Criar KPIs cards

### Gráficos (Recharts)
- [ ] Gráfico Receitas vs Despesas
- [ ] Gráfico Fluxo de Caixa
- [ ] Gráfico Status Contas
- [ ] Gráfico Categorias

### Routes & Navigation
- [ ] Adicionar rota /financeiro
- [ ] Adicionar link na sidebar
- [ ] Testar navegação

---

## 🎯 Estimativa de Tempo

| Fase | Descrição | Tempo Estimado |
|------|-----------|----------------|
| 1 | Hook useFinancial | 1-2h |
| 2 | Componente Principal | 2-3h |
| 3 | Componentes de Tab | 3-4h |
| 4 | Dialogs e Forms | 2h |
| 5 | Gráficos | 1h |
| 6 | Testes e Ajustes | 1-2h |
| **TOTAL** | **10-14 horas** | **~2-3 dias** |

---

## 📝 Comandos Úteis

### Aplicar Migration:
```bash
# No Supabase Dashboard
SQL Editor → New Query → Cole 004_financial_tables.sql → Run
```

### Testar Localmente:
```bash
npm run dev
# Acessar http://localhost:5173/financeiro
```

### Verificar Tipos:
```bash
npm run type-check
```

---

## 🔄 Próxima Sessão

**Iniciar com:**
1. Criar `useFinancial` hook
2. Criar componente `FinanceiroAvancado.tsx` com KPIs
3. Implementar primeira tab (Contas a Receber)

**Referências:**
- Dashboard Principal (exemplo de KPIs e gráficos)
- PLANO_CONTINUIDADE.md (estrutura detalhada)
- financial.service.ts (métodos disponíveis)

---

**Versão**: 1.0.0
**Autor**: Claude Code
**Data**: 2025-11-16

💰 **Estrutura base do módulo financeiro criada e pronta para continuação!**
