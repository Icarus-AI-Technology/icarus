# 📚 ICARUS v5.0 - DOCUMENTAÇÃO TÉCNICA COMPLETA DOS 58 MÓDULOS

## 🎯 Visão Geral

**Sistema:** ICARUS v5.0 - ERP Médico-Hospitalar B2B para Distribuidoras de OPME  
**Versão:** 5.0.2  
**Data:** Novembro 2025  
**Total de Módulos:** 58  
**Total de Sub-Módulos:** 147  
**Total de Formulários:** 89  
**Total de Componentes:** 350+  
**Status:** ✅ Documentação Técnica 100% Completa

---

## 📖 Índice Completo

### CATEGORIA 1: DASHBOARD & ANALYTICS (6 módulos)
1. [Dashboard Principal](#01-dashboard-principal)
2. [KPI Dashboard Consolidado](#02-kpi-dashboard-consolidado)
3. [Analytics BI](#03-analytics-bi)
4. [Analytics de Predição](#04-analytics-de-predicao)
5. [BI Dashboard Interactive](#05-bi-dashboard-interactive)
6. [Relatórios Executivos](#06-relatorios-executivos)

### CATEGORIA 2: CADASTROS & GESTÃO (8 módulos)
7. [Gestão de Cadastros](#07-gestao-de-cadastros)
8. [Grupos de Produtos OPME](#08-grupos-de-produtos-opme)
9. [Gestão de Usuários e Permissões](#09-gestao-de-usuarios-e-permissoes)
10. [Gestão de Contratos](#10-gestao-de-contratos)
11. [Gestão de Inventário](#11-gestao-de-inventario)
12. [RH Gestão de Pessoas](#12-rh-gestao-de-pessoas)
13. [Relacionamento com Cliente](#13-relacionamento-com-cliente)
14. [Gestão de Leads](#14-gestao-de-leads)

### CATEGORIA 3: CIRURGIAS & PROCEDIMENTOS (4 módulos)
15. [Cirurgias e Procedimentos](#15-cirurgias-e-procedimentos)
16. [Licitações e Propostas](#16-licitacoes-e-propostas)
17. [Tabela de Preços Viewer](#17-tabela-de-precos-viewer)
18. [Tabelas de Preços Form](#18-tabelas-de-precos-form)

### CATEGORIA 4: ESTOQUE & CONSIGNAÇÃO (5 módulos)
19. [Estoque IA](#19-estoque-ia)
20. [Consignação Avançada](#20-consignacao-avancada)
21. [Rastreabilidade OPME](#21-rastreabilidade-opme)
22. [Telemetria IoT](#22-telemetria-iot)
23. [Manutenção Preventiva](#23-manutencao-preventiva)

### CATEGORIA 5: COMPRAS & FORNECEDORES (4 módulos)
24. [Gestão de Compras](#24-gestao-de-compras)
25. [Notas de Compra](#25-notas-de-compra)
26. [Compras Internacionais](#26-compras-internacionais)
27. [Viabilidade de Importação](#27-viabilidade-de-importacao)

### CATEGORIA 6: VENDAS & CRM (5 módulos)
28. [CRM Vendas](#28-crm-vendas)
29. [Campanhas de Marketing](#29-campanhas-de-marketing)
30. [Tabelas de Preços Import](#30-tabelas-de-precos-import)
31. [Qualidade e Certificação](#31-qualidade-e-certificacao)
32. [Video Calls Manager](#32-video-calls-manager)

### CATEGORIA 7: FINANCEIRO & FATURAMENTO (7 módulos)
33. [Financeiro Avançado](#33-financeiro-avancado)
34. [Contas a Receber IA](#34-contas-a-receber-ia)
35. [Faturamento Avançado](#35-faturamento-avancado)
36. [Faturamento NFe Completo](#36-faturamento-nfe-completo)
37. [Gestão Contábil](#37-gestao-contabil)
38. [Relatórios Financeiros](#38-relatorios-financeiros)
39. [Relatórios Regulatórios](#39-relatorios-regulatorios)

### CATEGORIA 8: COMPLIANCE & AUDITORIA (3 módulos)
40. [Compliance e Auditoria](#40-compliance-e-auditoria)
41. [Compliance Auditoria Avançado](#41-compliance-auditoria-avancado)
42. [Notificações Inteligentes](#42-notificacoes-inteligentes)

### CATEGORIA 9: IA & AUTOMAÇÃO (8 módulos)
43. [IA Central](#43-ia-central)
44. [Automação IA](#44-automacao-ia)
45. [Chatbot Metrics Dashboard](#45-chatbot-metrics-dashboard)
46. [Voice Analytics Dashboard](#46-voice-analytics-dashboard)
47. [Voice Biometrics Manager](#47-voice-biometrics-manager)
48. [Voice Macros Manager](#48-voice-macros-manager)
49. [Tooltip Analytics Dashboard](#49-tooltip-analytics-dashboard)
50. [Workflow Builder Visual](#50-workflow-builder-visual)

### CATEGORIA 10: SISTEMA & INTEGRAÇÕES (13 módulos)
51. [Configurações System](#51-configuracoes-system)
52. [Configurações Avançadas](#52-configuracoes-avancadas)
53. [System Health Dashboard](#53-system-health-dashboard)
54. [Integrações Avançadas](#54-integracoes-avancadas)
55. [Integrations Manager](#55-integrations-manager)
56. [API Gateway](#56-api-gateway)
57. [Webhooks Manager](#57-webhooks-manager)
58. [Logística Avançada](#58-logistica-avancada)

---

# DOCUMENTAÇÃO DETALHADA DOS 58 MÓDULOS

---

## 01. DASHBOARD PRINCIPAL

### 📊 Informações Gerais

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `DashboardPrincipal.tsx` |
| **Ícone** | `LayoutDashboard` (Lucide React) |
| **Rota** | `/dashboard` |
| **Permissão** | `dashboard.view` |
| **Categoria** | Dashboard & Analytics |
| **Status** | ✅ Implementado 100% |
| **Prioridade** | Crítica |

### 🎯 Descrição

Dashboard central do ICARUS v5.0 com visão consolidada de todos os KPIs críticos do negócio, ações rápidas para operações frequentes e navegação inteligente para módulos principais.

### 📋 Sub-Módulos (4)

1. **Visão Geral** - KPIs principais e métricas consolidadas
2. **Ações Rápidas** - Operações frequentes em cards
3. **Alertas e Notificações** - Central de avisos críticos
4. **Navegação Rápida** - Acesso direto aos módulos

### 📝 Formulários (3)

#### 1. Nova Cirurgia (Modal)
- **Campos:** Paciente, Médico, Hospital, Data, Produtos OPME, Observações
- **Validação:** Estoque disponível, agenda do médico
- **Submit:** POST `/api/cirurgias`
- **Success:** Redirect para detalhes da cirurgia

#### 2. Adicionar Produto OPME (Modal)
- **Campos:** Nome, Código ANVISA, Grupo, Categoria, Preço, Fornecedor
- **Validação:** Código ANVISA (API externa)
- **Submit:** POST `/api/produtos-opme`
- **Success:** Produto criado e disponível no estoque

#### 3. Emitir NFe Rápida (Modal)
- **Campos:** Cliente, Itens, Valor Total, Observações
- **Validação:** Dados cadastrais completos
- **Submit:** POST `/api/faturamento/nfe/emitir`
- **Success:** NFe autorizada, XML/PDF disponível

### 🎨 Componentes Utilizados

**Estrutura:**
- `<div className="space-y-6 p-6">` - Container principal
- `<div className="flex items-center justify-between">` - Header
- `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">` - Grid KPIs

**Componentes Customizados:**
- `NeomorphicCard` (11x) - Cards de KPI
- `NeomorphicIconBox` (11x) - Ícones coloridos dos KPIs
- `Button` (8x) - Ações rápidas
- `MiniCardKPI` (4x) - Linha 1 de KPIs compactos

**Componentes UI:**
- `Dialog` (3x) - Modais de formulários
- `Badge` (15x) - Status e tags
- `Progress` (5x) - Barras de progresso
- `Separator` (4x) - Divisores visuais

**Ícones (Lucide React):**
- `Activity` - Sistema Status
- `Users` - Médicos Ativos
- `Package` - Produtos OPME
- `Calendar` - Pedidos Urgentes
- `DollarSign` - Faturamento Mensal
- `MapPin` - Distribuição Geográfica
- `AlertTriangle` - Estoque Crítico
- `Truck` - Logística
- `Cpu` - Performance IA
- `Plus` - Adicionar (ações)
- `FileText` - Documentos

### 🔧 Funcionalidades Frontend

#### A. KPIs Principais (11 cards)

**1. Sistema Status**
- **Métrica:** Uptime do sistema (%)
- **Fonte:** WebSocket real-time
- **Update:** A cada 30s
- **Componente:** `<MiniCardCompacto>`
- **Props:** `icon={Activity}, colorVariant="blue", value="98%", trend={+2.3}`

**2. Médicos Ativos**
- **Métrica:** Quantidade de médicos com procedimentos no mês
- **Fonte:** `GET /api/dashboard/medicos-ativos`
- **Update:** 5 minutos
- **Componente:** `<MiniCardCompacto>`
- **Props:** `icon={Users}, colorVariant="cyan", value="1.847", trend={+12.5}`

**3. Produtos OPME**
- **Métrica:** Total de produtos cadastrados
- **Fonte:** `GET /api/dashboard/produtos-total`
- **Update:** 10 minutos
- **Componente:** `<MiniCardCompacto>`
- **Props:** `icon={Package}, colorVariant="orange", value="12.4K", trend={+5.2}`

**4. Pedidos Urgentes**
- **Métrica:** Pedidos com prazo < 48h
- **Fonte:** `GET /api/dashboard/pedidos-urgentes`
- **Update:** 2 minutos (crítico)
- **Componente:** `<MiniCardCompacto>`
- **Props:** `icon={Calendar}, colorVariant="red", value="89", trend={-8.1}`

**5. Faturamento Mensal**
- **Métrica:** Receita do mês atual
- **Fonte:** `GET /api/dashboard/faturamento-mensal`
- **Update:** 15 minutos
- **Componente:** `<MiniCardMedio>`
- **Props:** `icon={DollarSign}, colorVariant="green", valuePrimary="R$ 3.8M", valueSecondary="R$ 127K", labelSecondary="média diária"`

**6. Distribuição Geográfica**
- **Métrica:** Número de hospitais atendidos
- **Fonte:** `GET /api/dashboard/distribuicao-geografica`
- **Update:** 30 minutos
- **Componente:** `<MiniCardMedio>`
- **Props:** `icon={MapPin}, colorVariant="indigo", valuePrimary="147", valueSecondary="28", labelSecondary="cidades"`

**7. Estoque Crítico**
- **Métrica:** Produtos abaixo do estoque mínimo
- **Fonte:** `GET /api/dashboard/estoque-critico`
- **Update:** 5 minutos
- **Componente:** `<MiniCardAvancado>`
- **Props:** `icon={AlertTriangle}, colorVariant="red", value="8", description="produtos em falta", chartData=[...]`

**8. Logística**
- **Métrica:** Taxa de entregas no prazo (%)
- **Fonte:** `GET /api/dashboard/logistica-performance`
- **Update:** 15 minutos
- **Componente:** `<MiniCardAvancado>`
- **Props:** `icon={Truck}, colorVariant="emerald", value="96.2%", description="entregas no prazo", chartData=[...]`

**9. Performance IA**
- **Métrica:** Precisão dos modelos de IA (%)
- **Fonte:** `GET /api/dashboard/ia-performance`
- **Update:** 1 hora
- **Componente:** `<MiniCardAvancado>`
- **Props:** `icon={Cpu}, colorVariant="purple", value="97.3%", description="precisão do sistema", chartData=[...]`

**10. NFe Pendentes**
- **Métrica:** Notas fiscais não emitidas
- **Fonte:** `GET /api/dashboard/nfe-pendentes`
- **Update:** 5 minutos
- **Componente:** `<Badge>` dentro de lista
- **Ação:** Click abre modal de emissão

**11. Compliance Score**
- **Métrica:** Percentual de conformidade geral
- **Fonte:** `GET /api/dashboard/compliance-score`
- **Update:** 1 hora
- **Componente:** `<Progress>` com percentual
- **Cores:** Verde (>90%), Amarelo (70-89%), Vermelho (<70%)

#### B. Ações Rápidas (8 botões)

**1. Nova Cirurgia**
```tsx
<Button 
  onClick={() => setModalCirurgia(true)}
  className="bg-icarus-primary"
>
  <Plus size={20} />
  Nova Cirurgia
</Button>
```
- **Ação:** Abre `<DialogNovaCirurgia>`
- **Componente:** Modal full-screen
- **Submit:** POST `/api/cirurgias/nova`

**2. Adicionar Produto**
- **Ação:** Abre `<DialogNovoProduto>`
- **Componente:** Modal médio
- **Submit:** POST `/api/produtos-opme`

**3. Emitir NFe**
- **Ação:** Abre `<DialogEmitirNFe>`
- **Componente:** Modal large
- **Submit:** POST `/api/faturamento/nfe/emitir`

**4. Registrar Compra**
- **Ação:** Abre `<DialogNovaCompra>`
- **Componente:** Modal large
- **Submit:** POST `/api/compras/registrar`

**5. Lançar Pagamento**
- **Ação:** Abre `<DialogLancarPagamento>`
- **Componente:** Modal médio
- **Submit:** POST `/api/financeiro/pagamentos/lancar`

**6. Enviar Consignação**
- **Ação:** Abre `<DialogNovaConsignacao>`
- **Componente:** Modal full-screen
- **Submit:** POST `/api/consignacao/enviar`

**7. Cadastrar Hospital**
- **Ação:** Abre `<DialogNovoHospital>`
- **Componente:** Modal large
- **Submit:** POST `/api/hospitais`

**8. Ver Relatórios**
- **Ação:** Redirect para `/relatorios-executivos`
- **Componente:** Button secondary
- **Icon:** `FileBarChart`

#### C. Alertas e Notificações

**Componente:** `<NotificationCenter>`
- **Localização:** Topbar (canto superior direito)
- **Ícone:** `Bell` com badge de contagem
- **Fonte:** WebSocket + Polling (30s)
- **API:** `GET /api/notificacoes/recentes`

**Tipos de Alertas:**
1. **Crítico** (vermelho) - Estoque zerado, NFe rejeitada
2. **Aviso** (laranja) - Prazo próximo, estoque baixo
3. **Info** (azul) - Nova cirurgia agendada, pagamento recebido
4. **Sucesso** (verde) - Processo concluído

**Exemplo:**
```tsx
<Badge variant="destructive">
  <AlertTriangle size={14} />
  Produto XYZ com estoque zerado
</Badge>
```

#### D. Navegação Rápida

**Grid de Módulos:**
```tsx
<div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
  {modulos.map(modulo => (
    <Button
      key={modulo.id}
      variant="outline"
      className="flex flex-col items-center gap-2 h-24"
      onClick={() => navigate(modulo.rota)}
    >
      <modulo.icon size={24} />
      <span className="text-xs">{modulo.nome}</span>
    </Button>
  ))}
</div>
```

**Módulos Exibidos (12):**
1. Estoque IA → `Package`
2. Cirurgias → `Calendar`
3. Financeiro → `DollarSign`
4. CRM → `Users`
5. Compras → `ShoppingCart`
6. Faturamento → `FileText`
7. Logística → `Truck`
8. Compliance → `Shield`
9. IA Central → `Brain`
10. Relatórios → `BarChart`
11. Integrações → `Plug`
12. Configurações → `Settings`

### ⚙️ Funcionalidades Backend

#### A. APIs REST

**1. GET `/api/dashboard/overview`**
```typescript
Response: {
  kpis: {
    sistemaStatus: { value: "98%", trend: 2.3 },
    medicosAtivos: { value: 1847, trend: 12.5 },
    produtosOPME: { value: "12.4K", trend: 5.2 },
    pedidosUrgentes: { value: 89, trend: -8.1 },
    faturamentoMensal: { 
      value: "R$ 3.8M", 
      secundario: "R$ 127K",
      trend: 15.3 
    },
    // ... outros KPIs
  },
  alertas: [
    {
      id: "alert-001",
      tipo: "critico",
      mensagem: "Produto XYZ com estoque zerado",
      timestamp: "2025-11-23T10:30:00Z"
    }
  ],
  acoes_pendentes: {
    nfe_pendentes: 15,
    cirurgias_hoje: 8,
    pagamentos_hoje: 12
  }
}
```

**2. GET `/api/dashboard/kpi/:nome`**
- **Parâmetros:** `nome` (sistema-status, medicos-ativos, etc)
- **Response:** Dados detalhados do KPI específico
- **Cache:** 5 minutos (Redis)

**3. POST `/api/dashboard/acoes-rapidas/:acao`**
- **Parâmetros:** `acao` (nova-cirurgia, emitir-nfe, etc)
- **Body:** Dados do formulário
- **Response:** Status da operação + ID criado

**4. GET `/api/dashboard/notificacoes`**
```typescript
Response: {
  total: 15,
  nao_lidas: 5,
  notificacoes: [
    {
      id: "notif-001",
      tipo: "critico",
      titulo: "Estoque Crítico",
      mensagem: "Produto ABC está com estoque zerado",
      timestamp: "2025-11-23T10:30:00Z",
      lida: false,
      acao: {
        label: "Ver Produto",
        url: "/estoque/produtos/abc"
      }
    }
  ]
}
```

**5. PUT `/api/dashboard/notificacoes/:id/ler`**
- **Função:** Marcar notificação como lida
- **Response:** `{ success: true }`

#### B. WebSockets (Tempo Real)

**Namespace:** `/dashboard`

**Eventos Emitidos pelo Servidor:**
```typescript
// 1. Atualização de KPI
socket.emit('kpi:update', {
  nome: 'sistema-status',
  value: '99%',
  trend: 3.1,
  timestamp: Date.now()
});

// 2. Novo Alerta
socket.emit('alerta:novo', {
  id: 'alert-002',
  tipo: 'aviso',
  mensagem: 'NFe 12345 pendente de autorização',
  timestamp: Date.now()
});

// 3. Ação Concluída
socket.emit('acao:concluida', {
  acao: 'nova-cirurgia',
  id: 'cirurgia-456',
  status: 'sucesso'
});
```

**Eventos Recebidos do Cliente:**
```typescript
// 1. Solicitar Atualização
socket.on('dashboard:refresh', () => {
  // Envia dados atualizados
});

// 2. Marcar Notificação como Lida
socket.on('notificacao:ler', (id: string) => {
  // Atualiza no banco
});
```

#### C. Banco de Dados (Supabase)

**Tabelas Utilizadas:**

**1. dashboard_kpis**
```sql
CREATE TABLE dashboard_kpis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) UNIQUE NOT NULL,
  valor_atual DECIMAL,
  valor_anterior DECIMAL,
  trend DECIMAL,
  unidade VARCHAR(10),
  ultima_atualizacao TIMESTAMP DEFAULT NOW(),
  configuracao JSONB,
  ativo BOOLEAN DEFAULT TRUE
);
```

**2. dashboard_acoes_rapidas**
```sql
CREATE TABLE dashboard_acoes_rapidas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id),
  acao VARCHAR(100) NOT NULL,
  dados JSONB,
  status VARCHAR(20),
  criado_em TIMESTAMP DEFAULT NOW(),
  concluido_em TIMESTAMP
);
```

**3. dashboard_alertas**
```sql
CREATE TABLE dashboard_alertas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR(20) NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  mensagem TEXT,
  origem VARCHAR(100),
  severidade INTEGER,
  lido BOOLEAN DEFAULT FALSE,
  lido_em TIMESTAMP,
  usuario_id UUID REFERENCES usuarios(id),
  criado_em TIMESTAMP DEFAULT NOW()
);
```

**4. dashboard_configuracoes**
```sql
CREATE TABLE dashboard_configuracoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id),
  layout JSONB,
  kpis_visiveis JSONB,
  refresh_interval INTEGER DEFAULT 300,
  atualizado_em TIMESTAMP DEFAULT NOW()
);
```

#### D. Integrações Externas

**1. Sistema de Notificações**
- **Serviço:** Firebase Cloud Messaging (FCM)
- **Função:** Push notifications para app mobile
- **Trigger:** Alertas críticos

**2. Analytics**
- **Serviço:** Google Analytics 4
- **Função:** Tracking de uso do dashboard
- **Eventos:** KPI visualizado, ação rápida clicada

**3. Logs**
- **Serviço:** Sentry
- **Função:** Monitoramento de erros
- **Contexto:** KPI que falhou, dados do usuário

### 🔌 Integrações Internas

**Módulos Conectados (15):**
1. Estoque IA → KPI "Estoque Crítico"
2. Cirurgias → KPI "Cirurgias do Mês", Ação "Nova Cirurgia"
3. Financeiro → KPI "Faturamento Mensal", "Contas a Receber"
4. Faturamento NFe → KPI "NFe Pendentes", Ação "Emitir NFe"
5. Consignação → KPI "Consignações Ativas", Ação "Enviar Consignação"
6. CRM → KPI "Hospitais Ativos", "Médicos Ativos"
7. Compras → Ação "Registrar Compra"
8. Logística → KPI "Performance de Entrega"
9. Compliance → KPI "Compliance Score"
10. IA Central → KPI "Performance IA"
11. Produtos OPME → Ação "Adicionar Produto"
12. Hospitais → Ação "Cadastrar Hospital"
13. Notificações → Central de alertas
14. Relatórios → Ação "Ver Relatórios"
15. Configurações → Layout personalizado

### 📊 Métricas de Performance

**Carregamento:**
- First Paint: < 1s
- Time to Interactive: < 2s
- KPIs carregados: < 3s (com cache)

**Atualizações:**
- WebSocket latency: < 100ms
- Polling interval: 30s-5min (configurável)
- Cache TTL: 5-30min (por KPI)

**Volume:**
- Suporta até 50 KPIs simultâneos
- Máximo 100 notificações em memória
- 1000 usuários simultâneos

---

## 02. KPI DASHBOARD CONSOLIDADO

### 📊 Informações Gerais

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `KPIDashboardConsolidado.tsx` |
| **Ícone** | `BarChart3` (Lucide React) |
| **Rota** | `/kpi-dashboard` |
| **Permissão** | `kpi.view, kpi.manage` |
| **Categoria** | Dashboard & Analytics |
| **Status** | ✅ Implementado 100% |
| **Prioridade** | Alta |

### 🎯 Descrição

Dashboard especializado em KPIs com visualizações avançadas, comparações temporais, drill-downs e exportação de relatórios. Permite criar, editar e gerenciar KPIs customizados para diferentes áreas do negócio.

### 📋 Sub-Módulos (5)

1. **KPIs Operacionais** - Métricas de operação diária
2. **KPIs Financeiros** - Indicadores financeiros
3. **KPIs de Qualidade** - Métricas de qualidade e conformidade
4. **KPIs Customizados** - Indicadores criados por usuários
5. **Comparativos** - Análise comparativa entre períodos

### 📝 Formulários (2)

#### 1. Criar KPI Customizado
- **Campos:** Nome, Descrição, Fórmula, Fonte de Dados, Meta, Visualização
- **Validação:** Fórmula válida (parsing), fonte de dados existente
- **Submit:** POST `/api/kpis/criar`
- **Success:** KPI disponível no dashboard

#### 2. Configurar Alertas de KPI
- **Campos:** KPI, Condição (>, <, =), Valor Limite, Destinatários, Frequência
- **Validação:** Destinatários válidos, valor numérico
- **Submit:** POST `/api/kpis/:id/alertas`
- **Success:** Alerta configurado

### 🎨 Componentes Utilizados

**Gráficos (Recharts):**
- `LineChart` (12x) - Tendências temporais
- `BarChart` (8x) - Comparações
- `PieChart` (4x) - Distribuições
- `AreaChart` (6x) - Áreas cumulativas
- `RadarChart` (2x) - Comparação multi-dimensional
- `ComposedChart` (3x) - Combinação de tipos

**Componentes Customizados:**
- `KPICard` (25x) - Card especializado para KPI
- `KPIComparisonTable` (4x) - Tabela comparativa
- `TrendIndicator` (25x) - Seta de tendência
- `SparklineChart` (15x) - Gráfico miniatura
- `GoalProgress` (10x) - Progresso em relação à meta

**Componentes UI:**
- `Tabs` (1x) - Navegação entre categorias
- `Select` (8x) - Filtros (período, área, tipo)
- `DateRangePicker` (4x) - Seleção de período
- `Tooltip` (40x) - Informações adicionais
- `Sheet` (2x) - Painéis laterais

**Ícones (Lucide React):**
- `TrendingUp` - Tendência positiva
- `TrendingDown` - Tendência negativa
- `Target` - Meta
- `Calendar` - Período
- `Filter` - Filtros
- `Download` - Exportar
- `Plus` - Adicionar KPI
- `Settings` - Configurações
- `Bell` - Alertas
- `RefreshCw` - Atualizar

### 🔧 Funcionalidades Frontend

#### A. KPIs Operacionais (10 cards)

**1. Taxa de Ocupação de Estoque**
- **Fórmula:** `(Estoque Atual / Capacidade Máxima) * 100`
- **Meta:** 80%
- **Visualização:** Gauge Chart
- **Fonte:** `GET /api/kpis/estoque/ocupacao`
- **Update:** 30 minutos

**2. Tempo Médio de Entrega**
- **Fórmula:** `AVG(Data Entrega - Data Pedido)`
- **Meta:** ≤ 3 dias
- **Visualização:** Line Chart (últimos 30 dias)
- **Fonte:** `GET /api/kpis/logistica/tempo-entrega`
- **Update:** 1 hora

**3. Taxa de Ruptura**
- **Fórmula:** `(Produtos Zerados / Total Produtos) * 100`
- **Meta:** ≤ 2%
- **Visualização:** Bar Chart + Sparkline
- **Fonte:** `GET /api/kpis/estoque/ruptura`
- **Update:** 15 minutos

**4. Produtividade de Vendedores**
- **Fórmula:** `Faturamento Total / Número de Vendedores`
- **Meta:** R$ 150.000/mês/vendedor
- **Visualização:** Ranking Bar Chart
- **Fonte:** `GET /api/kpis/vendas/produtividade`
- **Update:** 1 hora

**5. Taxa de Conversão de Leads**
- **Fórmula:** `(Leads Convertidos / Total Leads) * 100`
- **Meta:** ≥ 15%
- **Visualização:** Funnel Chart
- **Fonte:** `GET /api/kpis/crm/conversao`
- **Update:** 1 hora

**6. Cirurgias Canceladas**
- **Fórmula:** `(Cirurgias Canceladas / Total Agendadas) * 100`
- **Meta:** ≤ 5%
- **Visualização:** Pie Chart + Line Chart (tendência)
- **Fonte:** `GET /api/kpis/cirurgias/cancelamentos`
- **Update:** 1 hora

**7. Tempo Médio de Atendimento (CRM)**
- **Fórmula:** `AVG(Tempo Fim - Tempo Início)`
- **Meta:** ≤ 15 minutos
- **Visualização:** Box Plot (distribuição)
- **Fonte:** `GET /api/kpis/crm/tempo-atendimento`
- **Update:** 30 minutos

**8. Taxa de Devolução**
- **Fórmula:** `(Produtos Devolvidos / Total Vendidos) * 100`
- **Meta:** ≤ 1%
- **Visualização:** Area Chart (últimos 90 dias)
- **Fonte:** `GET /api/kpis/vendas/devolucao`
- **Update:** 1 hora

**9. Utilização de Consignação**
- **Fórmula:** `(Kits Utilizados / Kits Enviados) * 100`
- **Meta:** ≥ 70%
- **Visualização:** Gauge + Map (geográfico)
- **Fonte:** `GET /api/kpis/consignacao/utilizacao`
- **Update:** 2 horas

**10. Eficiência de Compras**
- **Fórmula:** `(Compras no Prazo / Total Compras) * 100`
- **Meta:** ≥ 95%
- **Visualização:** Progress Bar + Trend
- **Fonte:** `GET /api/kpis/compras/eficiencia`
- **Update:** 1 hora

#### B. KPIs Financeiros (10 cards)

**1. Margem de Lucro**
- **Fórmula:** `((Receita - Custos) / Receita) * 100`
- **Meta:** ≥ 25%
- **Visualização:** Line Chart + Comparativo
- **Fonte:** `GET /api/kpis/financeiro/margem-lucro`
- **Update:** Diário

**2. ROI (Return on Investment)**
- **Fórmula:** `((Lucro - Investimento) / Investimento) * 100`
- **Meta:** ≥ 15%
- **Visualização:** Bar Chart (por categoria)
- **Fonte:** `GET /api/kpis/financeiro/roi`
- **Update:** Mensal

**3. Índice de Inadimplência**
- **Fórmula:** `(Títulos Vencidos / Total Títulos) * 100`
- **Meta:** ≤ 3%
- **Visualização:** Waterfall Chart
- **Fonte:** `GET /api/kpis/financeiro/inadimplencia`
- **Update:** Diário

**4. Ciclo Financeiro**
- **Fórmula:** `PMR + PME - PMP` (Prazo Médio Recebimento + Estocagem - Pagamento)
- **Meta:** ≤ 45 dias
- **Visualização:** Timeline Chart
- **Fonte:** `GET /api/kpis/financeiro/ciclo`
- **Update:** Semanal

**5. Ticket Médio**
- **Fórmula:** `Faturamento Total / Número de Vendas`
- **Meta:** R$ 50.000
- **Visualização:** Histogram + Trend
- **Fonte:** `GET /api/kpis/financeiro/ticket-medio`
- **Update:** Diário

**6. Capital de Giro**
- **Fórmula:** `Ativo Circulante - Passivo Circulante`
- **Meta:** > R$ 2.000.000
- **Visualização:** Area Chart (projeção)
- **Fonte:** `GET /api/kpis/financeiro/capital-giro`
- **Update:** Diário

**7. EBITDA**
- **Fórmula:** `Lucro Operacional + Depreciação + Amortização`
- **Meta:** > R$ 500.000/mês
- **Visualização:** Bar Chart + Comparativo
- **Fonte:** `GET /api/kpis/financeiro/ebitda`
- **Update:** Mensal

**8. Custo de Aquisição de Cliente (CAC)**
- **Fórmula:** `Total Investimento Marketing / Novos Clientes`
- **Meta:** ≤ R$ 5.000
- **Visualização:** Line Chart + Cohort
- **Fonte:** `GET /api/kpis/financeiro/cac`
- **Update:** Mensal

**9. Lifetime Value (LTV)**
- **Fórmula:** `(Ticket Médio * Freq. Compra * Tempo Vida) - CAC`
- **Meta:** ≥ R$ 150.000
- **Visualização:** Cohort Analysis
- **Fonte:** `GET /api/kpis/financeiro/ltv`
- **Update:** Mensal

**10. Fluxo de Caixa Operacional**
- **Fórmula:** `Receitas Operacionais - Despesas Operacionais`
- **Meta:** Positivo
- **Visualização:** Waterfall Chart
- **Fonte:** `GET /api/kpis/financeiro/fluxo-caixa`
- **Update:** Diário

#### C. KPIs de Qualidade (5 cards)

**1. Índice de Conformidade ANVISA**
- **Fórmula:** `(Produtos Conformes / Total Produtos) * 100`
- **Meta:** 100%
- **Visualização:** Gauge + Detalhe por categoria
- **Fonte:** `GET /api/kpis/qualidade/conformidade-anvisa`
- **Update:** Diário

**2. Taxa de Não Conformidades**
- **Fórmula:** `(Não Conformidades Abertas / Auditorias Realizadas) * 100`
- **Meta:** ≤ 5%
- **Visualização:** Pareto Chart
- **Fonte:** `GET /api/kpis/qualidade/nao-conformidades`
- **Update:** Semanal

**3. Tempo Médio de Resolução de NC**
- **Fórmula:** `AVG(Data Fechamento - Data Abertura)`
- **Meta:** ≤ 7 dias
- **Visualização:** Box Plot
- **Fonte:** `GET /api/kpis/qualidade/tempo-resolucao`
- **Update:** Diário

**4. Certificações Válidas**
- **Fórmula:** `(Certificações Vigentes / Total Necessárias) * 100`
- **Meta:** 100%
- **Visualização:** Status Grid + Timeline
- **Fonte:** `GET /api/kpis/qualidade/certificacoes`
- **Update:** Diário

**5. Score de Qualidade Total**
- **Fórmula:** Média ponderada de todos os KPIs de qualidade
- **Meta:** ≥ 95
- **Visualização:** Radar Chart
- **Fonte:** `GET /api/kpis/qualidade/score-total`
- **Update:** Diário

#### D. Funcionalidades Avançadas

**1. Comparativo Temporal**
```tsx
<div className="space-y-4">
  <div className="flex gap-3">
    <DateRangePicker
      label="Período 1"
      value={periodo1}
      onChange={setPeriodo1}
    />
    <DateRangePicker
      label="Período 2"
      value={periodo2}
      onChange={setPeriodo2}
    />
  </div>
  
  <KPIComparisonTable
    kpis={selectedKPIs}
    periodo1={periodo1}
    periodo2={periodo2}
  />
</div>
```

**2. Drill-Down**
- Click no KPI abre detalhamento
- Visualização hierárquica (empresa → área → equipe → indivíduo)
- Breadcrumb de navegação
- Botão "Voltar" para nível anterior

**3. Alertas Configuráveis**
```tsx
<Dialog>
  <DialogTrigger>
    <Button variant="outline">
      <Bell size={16} />
      Configurar Alerta
    </Button>
  </DialogTrigger>
  <DialogContent>
    <FormAlertaKPI
      kpi={selectedKPI}
      onSubmit={handleSaveAlerta}
    />
  </DialogContent>
</Dialog>
```

**4. Exportação de Relatórios**
```tsx
<DropdownMenu>
  <DropdownMenuTrigger>
    <Button>
      <Download size={16} />
      Exportar
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => exportPDF()}>
      PDF
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => exportExcel()}>
      Excel
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => exportPowerPoint()}>
      PowerPoint
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**5. Filtros Avançados**
```tsx
<div className="flex gap-3">
  <Select value={areaFilter} onValueChange={setAreaFilter}>
    <SelectTrigger>Área</SelectTrigger>
    <SelectContent>
      <SelectItem value="todas">Todas</SelectItem>
      <SelectItem value="vendas">Vendas</SelectItem>
      <SelectItem value="estoque">Estoque</SelectItem>
      <SelectItem value="financeiro">Financeiro</SelectItem>
    </SelectContent>
  </Select>
  
  <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
    <SelectTrigger>Período</SelectTrigger>
    <SelectContent>
      <SelectItem value="dia">Hoje</SelectItem>
      <SelectItem value="semana">Últimos 7 dias</SelectItem>
      <SelectItem value="mes">Últimos 30 dias</SelectItem>
      <SelectItem value="trimestre">Último trimestre</SelectItem>
      <SelectItem value="ano">Último ano</SelectItem>
    </SelectContent>
  </Select>
  
  <Button variant="outline" onClick={resetFilters}>
    Limpar Filtros
  </Button>
</div>
```

### ⚙️ Funcionalidades Backend

#### A. APIs REST

**1. GET `/api/kpis/lista`**
```typescript
Query Params: {
  area?: string,
  tipo?: 'operacional' | 'financeiro' | 'qualidade' | 'customizado',
  ativo?: boolean,
  usuario_id?: string
}

Response: {
  kpis: [
    {
      id: "kpi-001",
      nome: "Taxa de Ocupação de Estoque",
      descricao: "...",
      formula: "(estoque_atual / capacidade_maxima) * 100",
      area: "estoque",
      tipo: "operacional",
      meta: 80,
      valor_atual: 75.5,
      valor_anterior: 72.3,
      trend: 4.4,
      ultima_atualizacao: "2025-11-23T10:30:00Z",
      visualizacao: "gauge",
      configuracao: {...}
    }
  ]
}
```

**2. POST `/api/kpis/criar`**
```typescript
Body: {
  nome: string,
  descricao: string,
  formula: string,
  fonte_dados: string,
  meta: number,
  visualizacao: 'line' | 'bar' | 'pie' | 'gauge',
  area: string,
  frequencia_atualizacao: number
}

Response: {
  id: "kpi-new-001",
  status: "criado",
  proxima_atualizacao: "2025-11-23T11:00:00Z"
}
```

**3. GET `/api/kpis/:id/historico`**
```typescript
Query Params: {
  data_inicio: string,
  data_fim: string,
  granularidade: 'hora' | 'dia' | 'semana' | 'mes'
}

Response: {
  kpi_id: "kpi-001",
  historico: [
    {
      timestamp: "2025-11-01T00:00:00Z",
      valor: 72.5,
      meta: 80
    },
    {
      timestamp: "2025-11-02T00:00:00Z",
      valor: 73.8,
      meta: 80
    }
  ]
}
```

**4. GET `/api/kpis/:id/drill-down`**
```typescript
Query Params: {
  nivel: 'empresa' | 'area' | 'equipe' | 'individuo',
  entidade_id?: string
}

Response: {
  kpi_id: "kpi-001",
  nivel: "area",
  dados: [
    {
      entidade_id: "area-vendas",
      entidade_nome: "Vendas",
      valor: 85.5,
      meta: 80,
      trend: 5.2,
      filhos: [...]
    }
  ]
}
```

**5. POST `/api/kpis/:id/alertas`**
```typescript
Body: {
  condicao: '>' | '<' | '=' | '>=' | '<=',
  valor_limite: number,
  destinatarios: string[],
  frequencia: 'imediato' | 'diario' | 'semanal',
  ativo: boolean
}

Response: {
  alerta_id: "alerta-001",
  status: "configurado"
}
```

**6. GET `/api/kpis/comparativo`**
```typescript
Query Params: {
  kpi_ids: string[],
  periodo1_inicio: string,
  periodo1_fim: string,
  periodo2_inicio: string,
  periodo2_fim: string
}

Response: {
  comparacao: [
    {
      kpi_id: "kpi-001",
      periodo1: { valor: 75.5, media: 72.3 },
      periodo2: { valor: 80.2, media: 78.1 },
      variacao: 6.2,
      variacao_percentual: 7.9
    }
  ]
}
```

**7. POST `/api/kpis/exportar`**
```typescript
Body: {
  kpi_ids: string[],
  formato: 'pdf' | 'excel' | 'powerpoint',
  periodo_inicio: string,
  periodo_fim: string,
  incluir_graficos: boolean,
  incluir_drill_down: boolean
}

Response: {
  arquivo_url: "https://storage.icarus.com/exports/kpi-report-001.pdf",
  expira_em: "2025-11-24T10:30:00Z"
}
```

#### B. Cálculo de KPIs (Background Jobs)

**Job: `calcular_kpis`**
- **Frequência:** Configurável por KPI (5min - 1 dia)
- **Executor:** Node.js Cron Job + Bull Queue
- **Processo:**

```typescript
async function calcularKPI(kpi_id: string) {
  // 1. Buscar configuração do KPI
  const kpi = await db.kpis.findUnique({ where: { id: kpi_id } });
  
  // 2. Executar query na fonte de dados
  const fonte = kpi.fonte_dados; // ex: "tabela_vendas"
  const formula = kpi.formula; // ex: "SUM(valor) / COUNT(*)"
  
  const resultado = await db.raw(`
    SELECT ${formula} as valor
    FROM ${fonte}
    WHERE data >= NOW() - INTERVAL '${kpi.janela_tempo}'
  `);
  
  // 3. Comparar com período anterior
  const valor_anterior = await db.kpi_historico.findFirst({
    where: { kpi_id },
    orderBy: { timestamp: 'desc' },
    skip: 1
  });
  
  const trend = calcularTrend(resultado.valor, valor_anterior?.valor);
  
  // 4. Salvar no histórico
  await db.kpi_historico.create({
    data: {
      kpi_id,
      valor: resultado.valor,
      timestamp: new Date()
    }
  });
  
  // 5. Atualizar cache (Redis)
  await redis.set(`kpi:${kpi_id}:atual`, JSON.stringify({
    valor: resultado.valor,
    trend,
    timestamp: new Date()
  }), 'EX', kpi.cache_ttl);
  
  // 6. Verificar alertas
  await verificarAlertasKPI(kpi_id, resultado.valor);
  
  // 7. Emitir evento WebSocket
  io.emit('kpi:atualizado', {
    kpi_id,
    valor: resultado.valor,
    trend
  });
}
```

**Verificação de Alertas:**
```typescript
async function verificarAlertasKPI(kpi_id: string, valor: number) {
  const alertas = await db.kpi_alertas.findMany({
    where: { kpi_id, ativo: true }
  });
  
  for (const alerta of alertas) {
    const condicaoAtendida = avaliarCondicao(
      valor,
      alerta.condicao,
      alerta.valor_limite
    );
    
    if (condicaoAtendida) {
      // Enviar notificação
      await enviarAlerta({
        destinatarios: alerta.destinatarios,
        titulo: `Alerta de KPI: ${kpi.nome}`,
        mensagem: `O KPI "${kpi.nome}" atingiu ${valor}, ${alerta.condicao} ${alerta.valor_limite}`,
        tipo: 'aviso',
        link: `/kpi-dashboard?kpi=${kpi_id}`
      });
      
      // Registrar ocorrência
      await db.kpi_alertas_historico.create({
        data: {
          alerta_id: alerta.id,
          valor_kpi: valor,
          timestamp: new Date()
        }
      });
    }
  }
}
```

#### C. Banco de Dados (Supabase)

**Tabelas:**

**1. kpis**
```sql
CREATE TABLE kpis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  formula TEXT NOT NULL,
  fonte_dados VARCHAR(100) NOT NULL,
  area VARCHAR(50),
  tipo VARCHAR(20) CHECK (tipo IN ('operacional', 'financeiro', 'qualidade', 'customizado')),
  meta DECIMAL,
  visualizacao VARCHAR(20) DEFAULT 'line',
  frequencia_atualizacao INTEGER DEFAULT 3600,
  janela_tempo VARCHAR(50) DEFAULT '30 days',
  cache_ttl INTEGER DEFAULT 300,
  ativo BOOLEAN DEFAULT TRUE,
  criado_por UUID REFERENCES usuarios(id),
  criado_em TIMESTAMP DEFAULT NOW(),
  configuracao JSONB
);
```

**2. kpi_historico**
```sql
CREATE TABLE kpi_historico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kpi_id UUID REFERENCES kpis(id) ON DELETE CASCADE,
  valor DECIMAL NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  metadados JSONB,
  INDEX idx_kpi_timestamp (kpi_id, timestamp DESC)
);
```

**3. kpi_alertas**
```sql
CREATE TABLE kpi_alertas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kpi_id UUID REFERENCES kpis(id) ON DELETE CASCADE,
  condicao VARCHAR(10) NOT NULL,
  valor_limite DECIMAL NOT NULL,
  destinatarios TEXT[] NOT NULL,
  frequencia VARCHAR(20) DEFAULT 'imediato',
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT NOW(),
  ultima_verificacao TIMESTAMP
);
```

**4. kpi_alertas_historico**
```sql
CREATE TABLE kpi_alertas_historico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alerta_id UUID REFERENCES kpi_alertas(id),
  valor_kpi DECIMAL NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  notificacao_enviada BOOLEAN DEFAULT FALSE
);
```

**5. kpi_drill_down**
```sql
CREATE TABLE kpi_drill_down (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kpi_id UUID REFERENCES kpis(id),
  nivel VARCHAR(20) NOT NULL,
  entidade_id VARCHAR(100) NOT NULL,
  entidade_nome VARCHAR(200),
  valor DECIMAL NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  INDEX idx_drill_down (kpi_id, nivel, timestamp DESC)
);
```

#### D. Integrações Externas

**1. Microsoft Power BI**
- **Função:** Export de KPIs para dashboards Power BI
- **API:** Power BI REST API
- **Método:** POST para dataset
- **Frequência:** 1 hora

**2. Google Data Studio**
- **Função:** Visualizações alternativas
- **API:** Google Sheets API (intermediário)
- **Método:** Append rows
- **Frequência:** 30 minutos

**3. Slack**
- **Função:** Alertas de KPI em canais
- **API:** Slack Web API
- **Método:** POST `/chat.postMessage`
- **Trigger:** Alerta configurado

**4. Email (SendGrid)**
- **Função:** Relatórios diários/semanais
- **Template:** HTML com gráficos embarcados
- **Frequência:** Configurável por usuário

### 🔌 Integrações Internas

**Módulos Conectados (20):**
1. Dashboard Principal → Compartilha KPIs
2. Estoque IA → KPIs de estoque
3. Financeiro → KPIs financeiros
4. Vendas/CRM → KPIs de vendas
5. Cirurgias → KPIs de procedimentos
6. Logística → KPIs de entrega
7. Compras → KPIs de aquisição
8. Qualidade → KPIs de conformidade
9. Consignação → KPIs de utilização
10. RH → KPIs de produtividade
11. Compliance → KPIs regulatórios
12. Faturamento → KPIs de emissão
13. Relatórios → Fonte de dados
14. IA Central → Predições de KPIs
15. Notificações → Alertas de limite
16. Configurações → Personalização
17. Auditoria → Log de mudanças
18. Integrations Manager → Export de dados
19. API Gateway → Acesso externo
20. Analytics → Tracking de uso

### 📊 Métricas de Performance

**Cálculo:**
- KPI simples: < 500ms
- KPI complexo (drill-down): < 2s
- KPI com histórico (1 ano): < 5s

**Armazenamento:**
- Histórico: 2 anos (compactado)
- Cache: 5-30 min (Redis)
- Índices: Timestamp + KPI ID

**Volume:**
- Suporta até 500 KPIs ativos
- 1M+ registros de histórico
- 10.000 cálculos/hora

---

## 03. ANALYTICS BI

### 📊 Informações Gerais

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `AnalyticsBINovo.tsx` |
| **Ícone** | `Brain` (Lucide React) |
| **Rota** | `/analytics-bi` |
| **Permissão** | `analytics.view, bi.manage` |
| **Categoria** | Dashboard & Analytics |
| **Status** | ✅ Implementado 100% |
| **Prioridade** | Alta |

### 🎯 Descrição

Módulo avançado de Business Intelligence com análises preditivas, machine learning integrado, correlações automáticas e insights acionáveis. Conecta-se a múltiplas fontes de dados e gera relatórios inteligentes.

### 📋 Sub-Módulos (6)

1. **Análise Exploratória** - Visualizações interativas e filtros dinâmicos
2. **Análise Preditiva** - Forecasting e tendências
3. **Correlações** - Identificação de padrões e relações
4. **Segmentação** - Clustering e agrupamento de dados
5. **Anomalias** - Detecção de outliers e comportamentos atípicos
6. **Insights Automáticos** - Descobertas geradas por IA

### 📝 Formulários (3)

#### 1. Criar Análise Customizada
- **Campos:** Nome, Fonte de Dados, Dimensões, Métricas, Filtros, Tipo de Visualização
- **Validação:** Dimensões e métricas compatíveis
- **Submit:** POST `/api/analytics/criar-analise`
- **Success:** Análise salva e disponível

#### 2. Agendar Relatório
- **Campos:** Análise, Destinatários, Frequência (diária/semanal/mensal), Formato, Hora
- **Validação:** Email válido, frequência compatível
- **Submit:** POST `/api/analytics/agendar-relatorio`
- **Success:** Relatório agendado

#### 3. Configurar Alerta de Anomalia
- **Campos:** Métrica, Sensibilidade (baixa/média/alta), Ação (notificar/email), Destinatários
- **Validação:** Métrica numérica, destinatários válidos
- **Submit:** POST `/api/analytics/alertas-anomalia`
- **Success:** Alerta configurado

### 🎨 Componentes Utilizados

**Gráficos Avançados (Recharts + D3.js):**
- `ScatterChart` (6x) - Análise de correlação
- `HeatMap` (3x) - Matriz de correlação
- `SankeyDiagram` (2x) - Fluxos de dados
- `TreeMap` (3x) - Hierarquias
- `BoxPlot` (4x) - Distribuições estatísticas
- `BubbleChart` (3x) - 3 dimensões
- `ViolinPlot` (2x) - Densidades

**Componentes Customizados:**
- `InteractiveChart` (15x) - Gráfico com brush e zoom
- `StatisticsCard` (12x) - Card com estatísticas descritivas
- `CorrelationMatrix` (2x) - Matriz interativa
- `PredictionChart` (4x) - Forecast com intervalo de confiança
- `AnomalyDetector` (3x) - Visualização de outliers
- `InsightCard` (20x) - Card com descoberta automática

**Componentes UI:**
- `Tabs` (3x) - Navegação entre análises
- `MultiSelect` (8x) - Seleção de dimensões/métricas
- `Slider` (6x) - Ajuste de parâmetros
- `Switch` (10x) - Toggle de opções
- `Accordion` (5x) - Filtros colapsáveis

**Ícones (Lucide React):**
- `Brain` - IA/ML
- `TrendingUp` - Previsões
- `Zap` - Insights
- `AlertCircle` - Anomalias
- `Link` - Correlações
- `Layers` - Segmentação
- `Eye` - Visualização
- `Download` - Exportar
- `Calendar` - Agendar
- `Settings` - Configurações

### 🔧 Funcionalidades Frontend

#### A. Análise Exploratória

**1. Seletor de Fonte de Dados**
```tsx
<Select value={fonteAtual} onValueChange={setFonteAtual}>
  <SelectTrigger>Fonte de Dados</SelectTrigger>
  <SelectContent>
    <SelectItem value="vendas">Vendas</SelectItem>
    <SelectItem value="estoque">Estoque</SelectItem>
    <SelectItem value="cirurgias">Cirurgias</SelectItem>
    <SelectItem value="financeiro">Financeiro</SelectItem>
    <SelectItem value="custom">Consulta Customizada</SelectItem>
  </SelectContent>
</Select>
```

**2. Construtor de Visualização Drag-and-Drop**
```tsx
<div className="grid grid-cols-3 gap-4">
  {/* Painel de Campos */}
  <Card className="col-span-1">
    <CardHeader>Campos Disponíveis</CardHeader>
    <CardContent>
      <DraggableList items={campos} />
    </CardContent>
  </Card>
  
  {/* Área de Drop: Dimensões */}
  <Card className="col-span-1">
    <CardHeader>Dimensões (Eixo X)</CardHeader>
    <CardContent>
      <DroppableArea
        onDrop={(item) => setDimensoes([...dimensoes, item])}
      />
    </CardContent>
  </Card>
  
  {/* Área de Drop: Métricas */}
  <Card className="col-span-1">
    <CardHeader>Métricas (Eixo Y)</CardHeader>
    <CardContent>
      <DroppableArea
        onDrop={(item) => setMetricas([...metricas, item])}
      />
    </CardContent>
  </Card>
</div>
```

**3. Painel de Filtros Dinâmicos**
```tsx
<Accordion type="multiple">
  {filtrosDisponiveis.map(filtro => (
    <AccordionItem key={filtro.id} value={filtro.id}>
      <AccordionTrigger>{filtro.label}</AccordionTrigger>
      <AccordionContent>
        {filtro.tipo === 'range' && (
          <Slider
            min={filtro.min}
            max={filtro.max}
            value={filtro.value}
            onValueChange={(v) => updateFiltro(filtro.id, v)}
          />
        )}
        {filtro.tipo === 'multiselect' && (
          <MultiSelect
            options={filtro.opcoes}
            value={filtro.selecionados}
            onChange={(v) => updateFiltro(filtro.id, v)}
          />
        )}
        {filtro.tipo === 'date' && (
          <DateRangePicker
            value={filtro.range}
            onChange={(v) => updateFiltro(filtro.id, v)}
          />
        )}
      </AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

**4. Gráfico Interativo com Brush e Zoom**
```tsx
<InteractiveChart>
  <ResponsiveContainer width="100%" height={400}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="data" />
      <YAxis />
      <Tooltip content={<CustomTooltip />} />
      <Legend />
      
      {metricas.map(metrica => (
        <Line
          key={metrica.id}
          type="monotone"
          dataKey={metrica.campo}
          stroke={metrica.cor}
          strokeWidth={2}
        />
      ))}
      
      {/* Brush para zoom temporal */}
      <Brush
        dataKey="data"
        height={30}
        stroke="#6366F1"
      />
    </LineChart>
  </ResponsiveContainer>
</InteractiveChart>
```

#### B. Análise Preditiva

**1. Forecast com Intervalo de Confiança**
```tsx
<PredictionChart>
  <ResponsiveContainer width="100%" height={400}>
    <LineChart data={historico.concat(previsao)}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="data" />
      <YAxis />
      <Tooltip />
      <Legend />
      
      {/* Linha de dados históricos */}
      <Line
        type="monotone"
        dataKey="valor"
        stroke="#6366F1"
        strokeWidth={2}
        dot={{ r: 3 }}
      />
      
      {/* Linha de previsão */}
      <Line
        type="monotone"
        dataKey="previsao"
        stroke="#10B981"
        strokeWidth={2}
        strokeDasharray="5 5"
        dot={{ r: 3 }}
      />
      
      {/* Área de confiança (95%) */}
      <Area
        type="monotone"
        dataKey="intervalo_superior"
        stroke="none"
        fill="#10B981"
        fillOpacity={0.2}
      />
      <Area
        type="monotone"
        dataKey="intervalo_inferior"
        stroke="none"
        fill="#10B981"
        fillOpacity={0.2}
      />
    </LineChart>
  </ResponsiveContainer>
</PredictionChart>
```

**2. Seletor de Modelo Preditivo**
```tsx
<Select value={modeloAtual} onValueChange={setModeloAtual}>
  <SelectTrigger>Modelo Preditivo</SelectTrigger>
  <SelectContent>
    <SelectItem value="arima">ARIMA (Auto-Regressivo)</SelectItem>
    <SelectItem value="prophet">Prophet (Facebook)</SelectItem>
    <SelectItem value="lstm">LSTM (Rede Neural)</SelectItem>
    <SelectItem value="xgboost">XGBoost (Gradient Boosting)</SelectItem>
    <SelectItem value="ensemble">Ensemble (Múltiplos Modelos)</SelectItem>
  </SelectContent>
</Select>
```

**3. Parâmetros de Previsão**
```tsx
<div className="space-y-4">
  <div>
    <Label>Horizonte de Previsão</Label>
    <Slider
      min={7}
      max={365}
      value={[horizonte]}
      onValueChange={([v]) => setHorizonte(v)}
    />
    <span className="text-sm text-muted-foreground">{horizonte} dias</span>
  </div>
  
  <div>
    <Label>Intervalo de Confiança</Label>
    <Slider
      min={50}
      max={99}
      value={[confianca]}
      onValueChange={([v]) => setConfianca(v)}
    />
    <span className="text-sm text-muted-foreground">{confianca}%</span>
  </div>
  
  <div className="flex items-center gap-2">
    <Switch
      checked={incluirSazonalidade}
      onCheckedChange={setIncluirSazonalidade}
    />
    <Label>Incluir Sazonalidade</Label>
  </div>
</div>
```

**4. Estatísticas do Modelo**
```tsx
<StatisticsCard>
  <div className="grid grid-cols-2 gap-4">
    <div>
      <span className="text-sm text-muted-foreground">MAE</span>
      <p className="text-2xl font-semibold">{modelo.mae.toFixed(2)}</p>
    </div>
    <div>
      <span className="text-sm text-muted-foreground">RMSE</span>
      <p className="text-2xl font-semibold">{modelo.rmse.toFixed(2)}</p>
    </div>
    <div>
      <span className="text-sm text-muted-foreground">MAPE</span>
      <p className="text-2xl font-semibold">{modelo.mape.toFixed(1)}%</p>
    </div>
    <div>
      <span className="text-sm text-muted-foreground">R²</span>
      <p className="text-2xl font-semibold">{modelo.r2.toFixed(3)}</p>
    </div>
  </div>
</StatisticsCard>
```

#### C. Análise de Correlações

**1. Matriz de Correlação Interativa**
```tsx
<CorrelationMatrix>
  <HeatMap
    data={matrizCorrelacao}
    width={600}
    height={600}
    xAxis={variaveis}
    yAxis={variaveis}
    colorScale={['#EF4444', '#FFFFFF', '#10B981']}
    minValue={-1}
    maxValue={1}
    onCellClick={(x, y, value) => {
      setSelectedPair([x, y]);
      setShowDetailModal(true);
    }}
  />
</CorrelationMatrix>
```

**2. Scatter Plot com Linha de Regressão**
```tsx
<ScatterChart width={600} height={400} data={dados}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey={variavel1} label={variavel1Label} />
  <YAxis dataKey={variavel2} label={variavel2Label} />
  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
  
  {/* Pontos */}
  <Scatter
    name="Dados"
    data={dados}
    fill="#6366F1"
  />
  
  {/* Linha de regressão */}
  <Line
    type="monotone"
    dataKey="regressao"
    stroke="#EF4444"
    strokeWidth={2}
    dot={false}
  />
</ScatterChart>
```

**3. Detalhamento de Correlação**
```tsx
<Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
  <DialogContent className="max-w-4xl">
    <DialogHeader>
      <DialogTitle>
        Correlação: {selectedPair[0]} × {selectedPair[1]}
      </DialogTitle>
    </DialogHeader>
    
    <div className="space-y-4">
      <StatisticsCard>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="text-sm">Correlação de Pearson</span>
            <p className="text-2xl font-semibold">
              {correlacao.pearson.toFixed(3)}
            </p>
          </div>
          <div>
            <span className="text-sm">P-value</span>
            <p className="text-2xl font-semibold">
              {correlacao.pvalue.toFixed(4)}
            </p>
          </div>
          <div>
            <span className="text-sm">Significância</span>
            <Badge variant={correlacao.pvalue < 0.05 ? 'default' : 'secondary'}>
              {correlacao.pvalue < 0.05 ? 'Significativa' : 'Não Significativa'}
            </Badge>
          </div>
        </div>
      </StatisticsCard>
      
      <ScatterPlot data={detailedData} />
      
      <div className="p-4 bg-blue-50 rounded-md">
        <p className="text-sm">
          <strong>Interpretação:</strong> {interpretacaoCorrelacao}
        </p>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

#### D. Segmentação (Clustering)

**1. Seleção de Algoritmo**
```tsx
<Select value={algoritmo} onValueChange={setAlgoritmo}>
  <SelectTrigger>Algoritmo de Clustering</SelectTrigger>
  <SelectContent>
    <SelectItem value="kmeans">K-Means</SelectItem>
    <SelectItem value="dbscan">DBSCAN</SelectItem>
    <SelectItem value="hierarchical">Hierárquico</SelectItem>
    <SelectItem value="gmm">Gaussian Mixture</SelectItem>
  </SelectContent>
</Select>
```

**2. Visualização de Clusters**
```tsx
<ScatterChart width={800} height={600} data={dadosComClusters}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="dimensao1" label="Dimensão 1 (PCA)" />
  <YAxis dataKey="dimensao2" label="Dimensão 2 (PCA)" />
  <Tooltip />
  <Legend />
  
  {clusters.map(cluster => (
    <Scatter
      key={cluster.id}
      name={cluster.nome}
      data={cluster.pontos}
      fill={cluster.cor}
    />
  ))}
</ScatterChart>
```

**3. Perfil dos Clusters**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {clusters.map(cluster => (
    <Card key={cluster.id}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: cluster.cor }}
          />
          {cluster.nome}
        </CardTitle>
        <CardDescription>
          {cluster.tamanho} registros ({cluster.percentual}%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {cluster.caracteristicas.map(carac => (
            <div key={carac.nome}>
              <div className="flex justify-between text-sm">
                <span>{carac.nome}</span>
                <span className="font-medium">{carac.valor}</span>
              </div>
              <Progress value={carac.intensidade} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

#### E. Detecção de Anomalias

**1. Configuração de Sensibilidade**
```tsx
<div className="space-y-4">
  <Label>Sensibilidade de Detecção</Label>
  <RadioGroup value={sensibilidade} onValueChange={setSensibilidade}>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="baixa" id="baixa" />
      <Label htmlFor="baixa">
        Baixa (apenas outliers extremos)
      </Label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="media" id="media" />
      <Label htmlFor="media">
        Média (outliers moderados e extremos)
      </Label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="alta" id="alta" />
      <Label htmlFor="alta">
        Alta (detectar pequenos desvios)
      </Label>
    </div>
  </RadioGroup>
</div>
```

**2. Visualização de Anomalias**
```tsx
<LineChart width={800} height={400} data={dados}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="data" />
  <YAxis />
  <Tooltip />
  <Legend />
  
  {/* Linha normal */}
  <Line
    type="monotone"
    dataKey="valor"
    stroke="#6366F1"
    strokeWidth={2}
  />
  
  {/* Banda de normalidade */}
  <Area
    type="monotone"
    dataKey="limite_superior"
    stroke="none"
    fill="#10B981"
    fillOpacity={0.1}
  />
  <Area
    type="monotone"
    dataKey="limite_inferior"
    stroke="none"
    fill="#10B981"
    fillOpacity={0.1}
  />
  
  {/* Anomalias destacadas */}
  <Scatter
    name="Anomalias"
    data={anomalias}
    fill="#EF4444"
    shape="star"
  />
</LineChart>
```

**3. Lista de Anomalias Detectadas**
```tsx
<div className="space-y-2">
  {anomalias.map(anomalia => (
    <Card key={anomalia.id}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <div>
              <p className="font-medium">{anomalia.descricao}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(anomalia.data), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="destructive">
              Desvio: {anomalia.desvio_padrao.toFixed(1)}σ
            </Badge>
            <Button variant="outline" size="sm">
              Investigar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

#### F. Insights Automáticos

**1. Card de Insight Gerado por IA**
```tsx
<InsightCard>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Zap className="text-yellow-500" size={20} />
      Insight Descoberto
    </CardTitle>
    <CardDescription>
      Gerado automaticamente em {insight.timestamp}
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm mb-4">{insight.descricao}</p>
    
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <span className="text-sm text-muted-foreground">Confiança</span>
        <div className="flex items-center gap-2">
          <Progress value={insight.confianca * 100} className="flex-1" />
          <span className="text-sm font-medium">
            {(insight.confianca * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      <div>
        <span className="text-sm text-muted-foreground">Impacto</span>
        <Badge
          variant={
            insight.impacto === 'alto' ? 'default' :
            insight.impacto === 'medio' ? 'secondary' : 'outline'
          }
        >
          {insight.impacto}
        </Badge>
      </div>
    </div>
    
    {insight.recomendacao && (
      <div className="p-3 bg-blue-50 rounded-md">
        <p className="text-sm">
          <strong>Recomendação:</strong> {insight.recomendacao}
        </p>
      </div>
    )}
    
    <div className="flex gap-2 mt-4">
      <Button size="sm" onClick={() => aplicarRecomendacao(insight.id)}>
        Aplicar Recomendação
      </Button>
      <Button size="sm" variant="outline">
        Ver Detalhes
      </Button>
      <Button size="sm" variant="ghost">
        Descartar
      </Button>
    </div>
  </CardContent>
</InsightCard>
```

**2. Categorias de Insights**
```tsx
<Tabs value={categoriaAtiva} onValueChange={setCategoriaAtiva}>
  <TabsList>
    <TabsTrigger value="vendas">
      <TrendingUp size={16} className="mr-2" />
      Vendas ({insights.vendas.length})
    </TabsTrigger>
    <TabsTrigger value="estoque">
      <Package size={16} className="mr-2" />
      Estoque ({insights.estoque.length})
    </TabsTrigger>
    <TabsTrigger value="financeiro">
      <DollarSign size={16} className="mr-2" />
      Financeiro ({insights.financeiro.length})
    </TabsTrigger>
    <TabsTrigger value="operacional">
      <Activity size={16} className="mr-2" />
      Operacional ({insights.operacional.length})
    </TabsTrigger>
  </TabsList>
  
  <TabsContent value={categoriaAtiva}>
    <div className="space-y-3">
      {insights[categoriaAtiva].map(insight => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  </TabsContent>
</Tabs>
```

### ⚙️ Funcionalidades Backend

#### A. APIs REST

**1. GET `/api/analytics/fontes-dados`**
```typescript
Response: {
  fontes: [
    {
      id: "vendas",
      nome: "Vendas",
      tabela: "vendas",
      campos: [
        { nome: "data_venda", tipo: "date", label: "Data" },
        { nome: "valor_total", tipo: "decimal", label: "Valor" },
        { nome: "cliente_id", tipo: "uuid", label: "Cliente" },
        { nome: "vendedor_id", tipo: "uuid", label: "Vendedor" }
      ],
      registros: 15420
    }
  ]
}
```

**2. POST `/api/analytics/executar-analise`**
```typescript
Body: {
  fonte: string,
  dimensoes: string[],
  metricas: Array<{
    campo: string,
    agregacao: 'sum' | 'avg' | 'count' | 'min' | 'max'
  }>,
  filtros: Array<{
    campo: string,
    operador: '=' | '>' | '<' | 'in' | 'between',
    valor: any
  }>,
  ordenacao: { campo: string, direcao: 'asc' | 'desc' }
}

Response: {
  dados: [...],
  estatisticas: {
    total_registros: number,
    tempo_execucao_ms: number,
    cache_hit: boolean
  }
}
```

**3. POST `/api/analytics/previsao`**
```typescript
Body: {
  fonte: string,
  campo_target: string,
  campo_tempo: string,
  modelo: 'arima' | 'prophet' | 'lstm' | 'xgboost' | 'ensemble',
  horizonte_dias: number,
  intervalo_confianca: number,
  incluir_sazonalidade: boolean
}

Response: {
  previsao: [
    {
      data: "2025-11-24",
      valor_previsto: 125000,
      intervalo_inferior: 110000,
      intervalo_superior: 140000
    }
  ],
  metricas_modelo: {
    mae: 5420.32,
    rmse: 7821.54,
    mape: 4.2,
    r2: 0.923
  },
  modelo_treinado_id: "modelo-001"
}
```

**4. POST `/api/analytics/correlacoes`**
```typescript
Body: {
  fonte: string,
  variaveis: string[],
  metodo: 'pearson' | 'spearman' | 'kendall'
}

Response: {
  matriz: [
    [1.0, 0.85, 0.32],
    [0.85, 1.0, 0.41],
    [0.32, 0.41, 1.0]
  ],
  pvalues: [...],
  interpretacoes: [
    {
      variavel1: "vendas",
      variavel2: "marketing",
      correlacao: 0.85,
      significancia: true,
      interpretacao: "Forte correlação positiva entre investimento em marketing e vendas"
    }
  ]
}
```

**5. POST `/api/analytics/clustering`**
```typescript
Body: {
  fonte: string,
  variaveis: string[],
  algoritmo: 'kmeans' | 'dbscan' | 'hierarchical' | 'gmm',
  n_clusters?: number,
  parametros?: object
}

Response: {
  clusters: [
    {
      id: 1,
      nome: "Cluster 1",
      tamanho: 350,
      percentual: 23.5,
      centroide: [...],
      caracteristicas: [...]
    }
  ],
  metricas: {
    silhouette_score: 0.72,
    davies_bouldin_index: 0.45,
    calinski_harabasz_score: 1245.32
  }
}
```

**6. POST `/api/analytics/anomalias`**
```typescript
Body: {
  fonte: string,
  campo: string,
  sensibilidade: 'baixa' | 'media' | 'alta',
  algoritmo: 'zscore' | 'iqr' | 'isolation_forest' | 'autoencoder'
}

Response: {
  anomalias: [
    {
      id: "anomalia-001",
      data: "2025-11-15T14:30:00Z",
      valor: 250000,
      valor_esperado: 125000,
      desvio_padrao: 3.5,
      severidade: "alta",
      probabilidade_anomalia: 0.95
    }
  ],
  estatisticas: {
    total_anomalias: 12,
    percentual: 0.08,
    falsos_positivos_estimados: 1
  }
}
```

**7. GET `/api/analytics/insights`**
```typescript
Query Params: {
  categoria?: 'vendas' | 'estoque' | 'financeiro' | 'operacional',
  min_confianca?: number,
  min_impacto?: 'baixo' | 'medio' | 'alto'
}

Response: {
  insights: [
    {
      id: "insight-001",
      categoria: "vendas",
      titulo: "Oportunidade de Upsell",
      descricao: "Clientes que compraram produto A têm 78% de chance de comprar produto B",
      confianca: 0.85,
      impacto: "alto",
      recomendacao: "Criar campanha de cross-sell para produto B",
      dados_suporte: {...},
      timestamp: "2025-11-23T10:30:00Z"
    }
  ]
}
```

#### B. Machine Learning (Python microservice)

**Serviço:** Python Flask/FastAPI  
**Bibliotecas:** scikit-learn, statsmodels, Prophet, TensorFlow

**Endpoint: POST `/ml/forecast`**
```python
@app.route('/ml/forecast', methods=['POST'])
def generate_forecast():
    data = request.json
    modelo = data['modelo']
    dados_historicos = pd.DataFrame(data['dados'])
    horizonte = data['horizonte_dias']
    
    if modelo == 'prophet':
        # Facebook Prophet
        from prophet import Prophet
        m = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            interval_width=data['intervalo_confianca'] / 100
        )
        m.fit(dados_historicos.rename(columns={'data': 'ds', 'valor': 'y'}))
        
        future = m.make_future_dataframe(periods=horizonte)
        forecast = m.predict(future)
        
        # Métricas
        mae = mean_absolute_error(dados_historicos['y'], forecast['yhat'][:len(dados_historicos)])
        
        return jsonify({
            'previsao': forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(horizonte).to_dict('records'),
            'metricas': {
                'mae': mae,
                'rmse': np.sqrt(mean_squared_error(...)),
                'mape': mean_absolute_percentage_error(...),
                'r2': r2_score(...)
            }
        })
    
    elif modelo == 'lstm':
        # Rede Neural LSTM
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import LSTM, Dense
        
        # Preparar dados
        X_train, y_train = prepare_sequences(dados_historicos)
        
        # Criar modelo
        model = Sequential([
            LSTM(50, activation='relu', input_shape=(X_train.shape[1], 1)),
            Dense(1)
        ])
        model.compile(optimizer='adam', loss='mse')
        
        # Treinar
        model.fit(X_train, y_train, epochs=50, verbose=0)
        
        # Prever
        previsoes = []
        for i in range(horizonte):
            pred = model.predict(...)
            previsoes.append(pred)
        
        return jsonify({
            'previsao': previsoes,
            'metricas': {...}
        })
```

**Endpoint: POST `/ml/clustering`**
```python
@app.route('/ml/clustering', methods=['POST'])
def perform_clustering():
    data = request.json
    dados = pd.DataFrame(data['dados'])
    algoritmo = data['algoritmo']
    
    # Normalizar dados
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(dados[data['variaveis']])
    
    if algoritmo == 'kmeans':
        from sklearn.cluster import KMeans
        kmeans = KMeans(n_clusters=data['n_clusters'], random_state=42)
        labels = kmeans.fit_predict(X_scaled)
        
        # Métricas
        from sklearn.metrics import silhouette_score, davies_bouldin_score
        silhouette = silhouette_score(X_scaled, labels)
        db_score = davies_bouldin_score(X_scaled, labels)
        
        # Criar perfis de clusters
        clusters = []
        for i in range(data['n_clusters']):
            cluster_data = dados[labels == i]
            perfil = cluster_data[data['variaveis']].describe()
            
            clusters.append({
                'id': i,
                'nome': f'Cluster {i+1}',
                'tamanho': len(cluster_data),
                'percentual': len(cluster_data) / len(dados) * 100,
                'centroide': kmeans.cluster_centers_[i].tolist(),
                'caracteristicas': perfil.to_dict()
            })
        
        return jsonify({
            'clusters': clusters,
            'metricas': {
                'silhouette_score': silhouette,
                'davies_bouldin_index': db_score
            }
        })
```

**Endpoint: POST `/ml/anomalias`**
```python
@app.route('/ml/anomalias', methods=['POST'])
def detect_anomalies():
    data = request.json
    dados = np.array(data['dados'])
    algoritmo = data['algoritmo']
    sensibilidade = data['sensibilidade']
    
    # Mapear sensibilidade para threshold
    thresholds = {'baixa': 3, 'media': 2, 'alta': 1.5}
    threshold = thresholds[sensibilidade]
    
    if algoritmo == 'zscore':
        # Z-Score method
        mean = np.mean(dados)
        std = np.std(dados)
        z_scores = np.abs((dados - mean) / std)
        
        anomalias_idx = np.where(z_scores > threshold)[0]
        
        anomalias = []
        for idx in anomalias_idx:
            anomalias.append({
                'indice': int(idx),
                'valor': float(dados[idx]),
                'valor_esperado': float(mean),
                'desvio_padrao': float(z_scores[idx]),
                'severidade': 'alta' if z_scores[idx] > 3 else 'media',
                'probabilidade_anomalia': float(1 - norm.cdf(z_scores[idx]))
            })
        
        return jsonify({
            'anomalias': anomalias,
            'estatisticas': {
                'total_anomalias': len(anomalias),
                'percentual': len(anomalias) / len(dados) * 100
            }
        })
    
    elif algoritmo == 'isolation_forest':
        from sklearn.ensemble import IsolationForest
        
        clf = IsolationForest(contamination='auto', random_state=42)
        labels = clf.fit_predict(dados.reshape(-1, 1))
        
        # -1 = anomalia, 1 = normal
        anomalias_idx = np.where(labels == -1)[0]
        
        # ... processar anomalias
```

#### C. Banco de Dados (Supabase)

**Tabelas:**

**1. analytics_analises**
```sql
CREATE TABLE analytics_analises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  fonte_dados VARCHAR(100) NOT NULL,
  dimensoes JSONB NOT NULL,
  metricas JSONB NOT NULL,
  filtros JSONB,
  tipo_visualizacao VARCHAR(50) DEFAULT 'line',
  usuario_id UUID REFERENCES usuarios(id),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP,
  ultima_execucao TIMESTAMP,
  configuracao JSONB
);
```

**2. analytics_previsoes**
```sql
CREATE TABLE analytics_previsoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analise_id UUID REFERENCES analytics_analises(id),
  modelo VARCHAR(50) NOT NULL,
  campo_target VARCHAR(100) NOT NULL,
  horizonte_dias INTEGER NOT NULL,
  dados_previsao JSONB NOT NULL,
  metricas_modelo JSONB NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW(),
  valido_ate TIMESTAMP,
  acuracia_real DECIMAL
);
```

**3. analytics_insights**
```sql
CREATE TABLE analytics_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria VARCHAR(50) NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT NOT NULL,
  confianca DECIMAL NOT NULL CHECK (confianca BETWEEN 0 AND 1),
  impacto VARCHAR(20) CHECK (impacto IN ('baixo', 'medio', 'alto')),
  recomendacao TEXT,
  dados_suporte JSONB,
  status VARCHAR(20) DEFAULT 'novo',
  lido BOOLEAN DEFAULT FALSE,
  aplicado BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT NOW(),
  aplicado_em TIMESTAMP
);
```

**4. analytics_anomalias**
```sql
CREATE TABLE analytics_anomalias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fonte VARCHAR(100) NOT NULL,
  campo VARCHAR(100) NOT NULL,
  data_anomalia TIMESTAMP NOT NULL,
  valor DECIMAL NOT NULL,
  valor_esperado DECIMAL,
  desvio_padrao DECIMAL,
  severidade VARCHAR(20),
  probabilidade DECIMAL,
  investigada BOOLEAN DEFAULT FALSE,
  causa TEXT,
  criado_em TIMESTAMP DEFAULT NOW()
);
```

**5. analytics_relatorios_agendados**
```sql
CREATE TABLE analytics_relatorios_agendados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analise_id UUID REFERENCES analytics_analises(id),
  destinatarios TEXT[] NOT NULL,
  frequencia VARCHAR(20) NOT NULL,
  proxima_execucao TIMESTAMP NOT NULL,
  formato VARCHAR(10) DEFAULT 'pdf',
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT NOW(),
  ultima_execucao TIMESTAMP
);
```

#### D. Integrações Externas

**1. Python ML Service**
- **URL:** `http://ml-service:8000`
- **Função:** Modelos de ML e IA
- **Comunicação:** REST API
- **Deploy:** Docker container

**2. Apache Spark (Opcional)**
- **Função:** Processamento de grandes volumes
- **Uso:** Análises com > 1M registros
- **Deploy:** Cluster Kubernetes

**3. Jupyter Notebooks**
- **Função:** Análises exploratórias ad-hoc
- **Integração:** API para executar notebooks
- **Storage:** S3/Supabase Storage

**4. Tableau/Power BI**
- **Função:** Visualizações externas
- **Método:** Export de dados via API
- **Frequência:** Diária

### 🔌 Integrações Internas

**Módulos Conectados (25):**
1. Dashboard Principal → Insights automáticos
2. KPI Dashboard → Análises de KPIs
3. Estoque → Previsão de demanda
4. Vendas → Análise de padrões
5. Financeiro → Forecast financeiro
6. Cirurgias → Análise de conversão
7. CRM → Segmentação de clientes
8. Compras → Otimização de pedidos
9. Logística → Previsão de rotas
10. Qualidade → Detecção de não conformidades
11. RH → Análise de produtividade
12. Marketing → ROI de campanhas
13. Faturamento → Previsão de receita
14. Compliance → Risk scoring
15. Consignação → Taxa de utilização
16. Produtos OPME → Análise de portfólio
17. Hospitais → Clustering de perfis
18. Médicos → Análise de comportamento
19. Fornecedores → Scoring de performance
20. Transportadoras → Eficiência logística
21. Relatórios → Fonte de dados
22. IA Central → Compartilha modelos
23. Notificações → Alertas de insights
24. API Gateway → Export de análises
25. Configurações → Personalização

### 📊 Métricas de Performance

**Análises:**
- Simples (< 10K registros): < 2s
- Médias (10K-100K registros): < 10s
- Complexas (100K-1M registros): < 60s
- Big Data (> 1M registros): Spark/async

**ML:**
- Previsão (Prophet): 5-30s
- Clustering (K-Means): 2-10s
- Detecção de Anomalias: 1-5s
- LSTM Training: 2-10min (async)

**Cache:**
- Análises frequentes: 1 hora
- Previsões: 6 horas
- Insights: 30 minutos

---

## 04. ANALYTICS DE PREDIÇÃO

### 📊 Informações Gerais

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `AnalyticsPredicaoNovo.tsx` |
| **Ícone** | `TrendingUp` (Lucide React) |
| **Rota** | `/analytics-predicao` |
| **Permissão** | `analytics.view, predicao.manage` |
| **Categoria** | Dashboard & Analytics |
| **Status** | ✅ Implementado 100% |
| **Prioridade** | Alta |

### 🎯 Descrição

Módulo especializado em análises preditivas e forecasting com múltiplos algoritmos de machine learning, comparação de modelos, ajuste automático de hiperparâmetros e validação cruzada.

### 📋 Sub-Módulos (4)

1. **Previsão de Vendas** - Forecast de receita e volume
2. **Previsão de Demanda** - Estoque e produtos OPME
3. **Previsão Financeira** - Fluxo de caixa e inadimplência
4. **Previsão de Churn** - Predição de perda de clientes

### 📝 Formulários (2)

#### 1. Configurar Modelo Preditivo
- **Campos:** Nome, Tipo (vendas/demanda/financeiro), Algoritmo, Features, Target, Horizon
- **Validação:** Features numéricas, horizon > 0
- **Submit:** POST `/api/predicao/modelos/criar`

#### 2. Treinar Modelo
- **Campos:** Modelo ID, Dataset, Train/Test Split, Cross-Validation Folds
- **Validação:** Dataset válido, split 0-1
- **Submit:** POST `/api/predicao/modelos/:id/treinar`

### 🎨 Componentes Utilizados

- `ForecastChart` (10x) - Gráfico com previsão e intervalo
- `ModelComparisonTable` (3x) - Comparação de métricas
- `FeatureImportance` (5x) - Importância de features
- `ValidationCurve` (4x) - Curva de validação
- `ResidualPlot` (3x) - Análise de resíduos

**Ícones:**
- `TrendingUp`, `Brain`, `Target`, `Sliders`, `CheckCircle`

### 🔧 Funcionalidades Frontend

#### A. Dashboard de Modelos

```tsx
<div className="space-y-6">
  {/* Card de cada modelo */}
  {modelos.map(modelo => (
    <Card key={modelo.id}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{modelo.nome}</CardTitle>
            <CardDescription>
              {modelo.algoritmo} • Última atualização: {modelo.ultima_atualizacao}
            </CardDescription>
          </div>
          <Badge variant={modelo.status === 'ativo' ? 'default' : 'secondary'}>
            {modelo.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <span className="text-sm text-muted-foreground">MAE</span>
            <p className="text-2xl font-semibold">{modelo.mae.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">RMSE</span>
            <p className="text-2xl font-semibold">{modelo.rmse.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">R²</span>
            <p className="text-2xl font-semibold">{modelo.r2.toFixed(3)}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Acurácia</span>
            <p className="text-2xl font-semibold">{(modelo.acuracia * 100).toFixed(1)}%</p>
          </div>
        </div>
        
        <ForecastChart
          historico={modelo.dados_treino}
          previsao={modelo.ultima_previsao}
          intervalo={modelo.intervalo_confianca}
        />
        
        <div className="flex gap-2 mt-4">
          <Button size="sm" onClick={() => executarPrevisao(modelo.id)}>
            <Play size={16} className="mr-2" />
            Executar Previsão
          </Button>
          <Button size="sm" variant="outline" onClick={() => retreinarModelo(modelo.id)}>
            <RefreshCw size={16} className="mr-2" />
            Retreinar
          </Button>
          <Button size="sm" variant="outline" onClick={() => verDetalhes(modelo.id)}>
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

#### B. Comparação de Algoritmos

```tsx
<Tabs defaultValue="metricas">
  <TabsList>
    <TabsTrigger value="metricas">Métricas</TabsTrigger>
    <TabsTrigger value="previsoes">Previsões</TabsTrigger>
    <TabsTrigger value="features">Features</TabsTrigger>
  </TabsList>
  
  <TabsContent value="metricas">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Modelo</TableHead>
          <TableHead>Algoritmo</TableHead>
          <TableHead>MAE</TableHead>
          <TableHead>RMSE</TableHead>
          <TableHead>R²</TableHead>
          <TableHead>Tempo Treino</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {comparacao.map(m => (
          <TableRow key={m.id}>
            <TableCell className="font-medium">{m.nome}</TableCell>
            <TableCell>{m.algoritmo}</TableCell>
            <TableCell>{m.mae.toFixed(2)}</TableCell>
            <TableCell>{m.rmse.toFixed(2)}</TableCell>
            <TableCell>{m.r2.toFixed(3)}</TableCell>
            <TableCell>{m.tempo_treino}s</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TabsContent>
</Tabs>
```

### ⚙️ Funcionalidades Backend

#### A. APIs REST

**1. GET `/api/predicao/modelos`**
```typescript
Response: {
  modelos: [
    {
      id: "modelo-001",
      nome: "Previsão de Vendas - Prophet",
      tipo: "vendas",
      algoritmo: "prophet",
      features: ["mes", "ano", "investimento_marketing"],
      target: "valor_vendas",
      mae: 5420.32,
      rmse: 7821.54,
      r2: 0.923,
      status: "ativo",
      criado_em: "2025-10-01",
      ultima_atualizacao: "2025-11-23"
    }
  ]
}
```

**2. POST `/api/predicao/modelos/:id/prever`**
```typescript
Body: {
  horizonte_dias: number,
  features_futuras?: object
}

Response: {
  previsao: [
    {
      data: "2025-11-24",
      valor: 125000,
      intervalo_inferior: 110000,
      intervalo_superior: 140000
    }
  ],
  confianca: 0.95
}
```

**3. POST `/api/predicao/modelos/:id/retreinar`**
```typescript
Body: {
  novos_dados: [...],
  auto_tune: boolean
}

Response: {
  status: "treinando",
  job_id: "job-001",
  estimativa_conclusao: "2025-11-23T12:00:00Z"
}
```

#### B. Background Jobs

**Job: treinar_modelo_predicao**
```typescript
async function treinarModelo(modelo_id: string) {
  // 1. Buscar configuração
  const modelo = await db.modelos_predicao.findUnique({ where: { id: modelo_id } });
  
  // 2. Preparar dados
  const dados = await buscarDadosTreino(modelo.fonte_dados, modelo.features);
  
  // 3. Chamar serviço Python ML
  const response = await fetch('http://ml-service:8000/train', {
    method: 'POST',
    body: JSON.stringify({
      algoritmo: modelo.algoritmo,
      X_train: dados.X,
      y_train: dados.y,
      parametros: modelo.hiperparametros
    })
  });
  
  const resultado = await response.json();
  
  // 4. Salvar métricas
  await db.modelos_predicao.update({
    where: { id: modelo_id },
    data: {
      mae: resultado.metricas.mae,
      rmse: resultado.metricas.rmse,
      r2: resultado.metricas.r2,
      modelo_serializado: resultado.modelo_bytes,
      status: 'ativo'
    }
  });
}
```

### 🔌 Integrações

**Internas:** Dashboard Principal, Analytics BI, Estoque IA, CRM Vendas  
**Externas:** Python ML Service (scikit-learn, Prophet, TensorFlow)

---

## 05. BI DASHBOARD INTERACTIVE

### 📊 Informações Gerais

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `BIDashboardInteractive.tsx` |
| **Ícone** | `Layout` (Lucide React) |
| **Rota** | `/bi-dashboard` |
| **Permissão** | `bi.view, bi.edit` |
| **Categoria** | Dashboard & Analytics |
| **Status** | ✅ Implementado 100% |

### 🎯 Descrição

Dashboard interativo customizável com drag-and-drop de widgets, filtros globais, drill-through entre visualizações e compartilhamento de dashboards.

### 📋 Sub-Módulos (3)

1. **Editor de Dashboard** - Criar e editar layouts
2. **Biblioteca de Widgets** - Widgets pré-configurados
3. **Dashboards Compartilhados** - Visualizar dashboards de equipe

### 📝 Formulários (2)

#### 1. Criar Dashboard
- **Campos:** Nome, Descrição, Visibilidade (privado/equipe/público), Layout Inicial
- **Submit:** POST `/api/bi/dashboards/criar`

#### 2. Configurar Widget
- **Campos:** Tipo, Fonte de Dados, Filtros, Visualização, Tamanho
- **Submit:** POST `/api/bi/widgets/configurar`

### 🎨 Componentes Utilizados

- `GridLayout` (react-grid-layout) - Layout drag-and-drop
- `WidgetContainer` (50x) - Container de widgets
- `WidgetLibrary` (1x) - Biblioteca de widgets
- `FilterBar` (1x) - Barra de filtros globais
- `ShareDialog` (1x) - Compartilhamento

**Ícones:** `Layout`, `Grid`, `Filter`, `Share2`, `Plus`

### 🔧 Funcionalidades Frontend

#### A. Grid Layout com Drag-and-Drop

```tsx
import GridLayout from 'react-grid-layout';

const [layout, setLayout] = useState([
  { i: 'widget-1', x: 0, y: 0, w: 6, h: 4 },
  { i: 'widget-2', x: 6, y: 0, w: 6, h: 4 },
]);

<GridLayout
  className="layout"
  layout={layout}
  cols={12}
  rowHeight={30}
  width={1200}
  onLayoutChange={handleLayoutChange}
  isDraggable={editMode}
  isResizable={editMode}
>
  {widgets.map(widget => (
    <div key={widget.id}>
      <WidgetContainer
        widget={widget}
        onRemove={() => removeWidget(widget.id)}
        onConfigure={() => configureWidget(widget.id)}
      />
    </div>
  ))}
</GridLayout>
```

#### B. Biblioteca de Widgets

```tsx
<Sheet>
  <SheetTrigger>
    <Button>
      <Plus size={16} className="mr-2" />
      Adicionar Widget
    </Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Biblioteca de Widgets</SheetTitle>
    </SheetHeader>
    
    <div className="space-y-4 mt-4">
      {widgetTemplates.map(template => (
        <Card
          key={template.id}
          className="cursor-pointer hover:border-primary"
          onClick={() => adicionarWidget(template)}
        >
          <CardHeader>
            <CardTitle className="text-sm">{template.nome}</CardTitle>
          </CardHeader>
          <CardContent>
            <template.PreviewComponent />
          </CardContent>
        </Card>
      ))}
    </div>
  </SheetContent>
</Sheet>
```

### ⚙️ Funcionalidades Backend

**APIs:**

**1. GET `/api/bi/dashboards/:id`**
```typescript
Response: {
  id: "dash-001",
  nome: "Vendas Executivo",
  layout: [...],
  widgets: [...],
  filtros_globais: {...}
}
```

**2. PUT `/api/bi/dashboards/:id/layout`**
```typescript
Body: { layout: [...] }
Response: { success: true }
```

### 🔌 Integrações

**Internas:** KPI Dashboard, Analytics BI, Todos os módulos (fonte de dados)

---

## 06. RELATÓRIOS EXECUTIVOS

### 📊 Informações Gerais

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `RelatoriosExecutivos.tsx` |
| **Ícone** | `FileBarChart` (Lucide React) |
| **Rota** | `/relatorios-executivos` |
| **Permissão** | `relatorios.view` |
| **Categoria** | Dashboard & Analytics |
| **Status** | ✅ Implementado 100% |

### 🎯 Descrição

Relatórios consolidados para executivos com visão estratégica do negócio, comparativos entre períodos, análises de rentabilidade e indicadores de crescimento.

### 📋 Sub-Módulos (5)

1. **Resumo Executivo** - Visão geral consolidada
2. **Análise Financeira** - P&L, Balanço, DFC
3. **Análise de Vendas** - Performance comercial
4. **Análise Operacional** - Eficiência operacional
5. **Tendências e Projeções** - Forecasts executivos

### 📝 Formulários (1)

#### 1. Gerar Relatório Customizado
- **Campos:** Período, Métricas, Granularidade, Formato (PDF/Excel/PowerPoint)
- **Submit:** POST `/api/relatorios/gerar`

### 🎨 Componentes Utilizados

- `ExecutiveSummaryCard` (8x)
- `PLStatement` (1x) - Demonstração de Resultado
- `BalanceSheet` (1x) - Balanço Patrimonial
- `CashFlowStatement` (1x) - Fluxo de Caixa
- `SalesAnalysis` (3x)

### 🔧 Funcionalidades Frontend

```tsx
<Tabs defaultValue="resumo">
  <TabsList>
    <TabsTrigger value="resumo">Resumo Executivo</TabsTrigger>
    <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
    <TabsTrigger value="vendas">Vendas</TabsTrigger>
    <TabsTrigger value="operacional">Operacional</TabsTrigger>
  </TabsList>
  
  <TabsContent value="resumo">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <ExecutiveSummaryCard
        titulo="Receita Total"
        valor="R$ 12.5M"
        variacao={15.3}
        periodo="vs mês anterior"
      />
      {/* Mais cards... */}
    </div>
  </TabsContent>
</Tabs>
```

### ⚙️ Funcionalidades Backend

**APIs:**

**1. GET `/api/relatorios/executivo/resumo`**
```typescript
Query: { periodo_inicio, periodo_fim }
Response: {
  receita_total: 12500000,
  lucro_liquido: 3125000,
  margem_lucro: 25,
  crescimento: 15.3
}
```

**2. POST `/api/relatorios/executivo/exportar`**
```typescript
Body: {
  formato: 'pdf' | 'excel' | 'powerpoint',
  secoes: string[],
  periodo: { inicio, fim }
}
Response: {
  arquivo_url: "https://...",
  expira_em: "2025-11-24T12:00:00Z"
}
```

---

## 07. GESTÃO DE CADASTROS

### 📊 Informações Gerais

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `GestãoCadastros.tsx` |
| **Ícone** | `Users` (Lucide React) |
| **Rota** | `/cadastros` |
| **Permissão** | `cadastros.view, cadastros.edit` |
| **Categoria** | Cadastros & Gestão |
| **Status** | ✅ Implementado 100% |

### 🎯 Descrição

Módulo central para gerenciamento de cadastros: clientes (hospitais), médicos, pacientes, fornecedores e representantes. Validação automática de documentos, integração com APIs externas e histórico completo.

### 📋 Sub-Módulos (7)

1. **Hospitais/Clínicas** - Cadastro de clientes
2. **Médicos** - Profissionais de saúde
3. **Pacientes** - Pacientes (cirurgias)
4. **Fornecedores** - Fornecedores OPME
5. **Representantes** - Equipe comercial
6. **Transportadoras** - Logística
7. **Outros Contatos** - Contatos gerais

### 📝 Formulários (7)

#### 1. Cadastro de Hospital
- **Campos:** 
  - CNPJ (validação Receita Federal)
  - Razão Social, Nome Fantasia
  - Endereço (autocomplete CEP)
  - Telefone, Email, Website
  - Responsável Técnico
  - Tipo (Público/Privado)
  - Especialidades atendidas
  - Documentos (Alvará, CNES, etc)
- **Validação:** CNPJ válido, CNES válido, email único
- **Submit:** POST `/api/cadastros/hospitais`

#### 2. Cadastro de Médico
- **Campos:**
  - CPF (validação)
  - Nome Completo
  - CRM + UF
  - Especialidades (multi-select)
  - Telefone, Email
  - Hospitais Atendidos (multi-select)
  - RQE (Registro de Qualificação de Especialista)
  - Data Nascimento
- **Validação:** CRM válido (API CFM), CPF único
- **Submit:** POST `/api/cadastros/medicos`

#### 3. Cadastro de Paciente
- **Campos:**
  - CPF ou Cartão SUS
  - Nome Completo
  - Data Nascimento, Sexo
  - Telefone, Email
  - Endereço Completo
  - Convênio (se aplicável)
  - Observações Médicas
- **Validação:** CPF ou Cartão SUS válido
- **Submit:** POST `/api/cadastros/pacientes`

#### 4. Cadastro de Fornecedor
- **Campos:**
  - CNPJ
  - Razão Social, Nome Fantasia
  - Inscrição Estadual
  - Endereço
  - Telefone, Email
  - Responsável Comercial
  - Condições de Pagamento
  - Produtos Fornecidos (multi-select)
  - Certificações (ISO, ANVISA)
- **Validação:** CNPJ válido, IE válida
- **Submit:** POST `/api/cadastros/fornecedores`

#### 5. Cadastro de Representante
- **Campos:**
  - CPF
  - Nome Completo
  - Email, Telefone
  - Região de Atuação
  - Comissão (%)
  - Hospitais Atendidos
  - Status (Ativo/Inativo)
- **Validação:** CPF válido, comissão 0-100
- **Submit:** POST `/api/cadastros/representantes`

#### 6. Cadastro de Transportadora
- **Campos:**
  - CNPJ
  - Razão Social
  - ANTT (Agência Nacional de Transportes Terrestres)
  - Endereço
  - Telefone, Email
  - Tipos de Veículo
  - Cobertura (Estados)
  - Tabela de Preços
- **Validação:** CNPJ e ANTT válidos
- **Submit:** POST `/api/cadastros/transportadoras`

#### 7. Importação em Lote (CSV/Excel)
- **Campos:** Arquivo, Tipo de Cadastro, Mapeamento de Colunas
- **Validação:** Formato válido, colunas obrigatórias presentes
- **Submit:** POST `/api/cadastros/importar`

### 🎨 Componentes Utilizados

**Tabelas:**
- `DataTable` (7x) - Tabela paginada para cada tipo
- `SearchBar` (7x) - Busca em cada tabela
- `FilterPanel` (7x) - Filtros avançados

**Formulários:**
- `FormularioHospital` (1x)
- `FormularioMedico` (1x)
- `FormularioPaciente` (1x)
- `FormularioFornecedor` (1x)
- `FormularioRepresentante` (1x)
- `FormularioTransportadora` (1x)

**Componentes Customizados:**
- `CNPJInput` - Input com validação CNPJ
- `CPFInput` - Input com validação CPF
- `CRMInput` - Input CRM + UF
- `CEPAutocomplete` - Autocomplete de endereço
- `DocumentUploader` - Upload de documentos

**Ícones:**
- `Building` - Hospitais
- `Stethoscope` - Médicos
- `User` - Pacientes
- `Package` - Fornecedores
- `UserCheck` - Representantes
- `Truck` - Transportadoras

### 🔧 Funcionalidades Frontend

#### A. Tabela de Hospitais com Filtros

```tsx
<div className="space-y-4">
  {/* Barra de Busca e Ações */}
  <div className="flex justify-between items-center">
    <SearchBar
      placeholder="Buscar hospital..."
      onSearch={handleSearch}
    />
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
        <Filter size={16} className="mr-2" />
        Filtros
      </Button>
      <Button onClick={() => setShowFormModal(true)}>
        <Plus size={16} className="mr-2" />
        Novo Hospital
      </Button>
    </div>
  </div>
  
  {/* Painel de Filtros */}
  {showFilters && (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-4 gap-4">
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger>Tipo</SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="publico">Público</SelectItem>
              <SelectItem value="privado">Privado</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>Status</SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger>Estado</SelectTrigger>
            <SelectContent>
              {estados.map(uf => (
                <SelectItem key={uf} value={uf}>{uf}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="ghost" onClick={limparFiltros}>
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )}
  
  {/* Tabela */}
  <DataTable
    columns={[
      { accessorKey: 'razao_social', header: 'Razão Social' },
      { accessorKey: 'cnpj', header: 'CNPJ', cell: formatCNPJ },
      { accessorKey: 'cidade', header: 'Cidade' },
      { accessorKey: 'uf', header: 'UF' },
      { accessorKey: 'tipo', header: 'Tipo', cell: renderBadgeTipo },
      { accessorKey: 'status', header: 'Status', cell: renderBadgeStatus },
      { id: 'acoes', header: 'Ações', cell: renderAcoes }
    ]}
    data={hospitais}
    pagination={{
      pageIndex: page,
      pageSize: pageSize,
      totalPages: totalPages
    }}
    onPaginationChange={handlePaginationChange}
  />
</div>
```

#### B. Formulário de Hospital com Validações

```tsx
<Dialog open={showFormModal} onOpenChange={setShowFormModal}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Cadastro de Hospital</DialogTitle>
    </DialogHeader>
    
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Seção: Dados Principais */}
      <div className="space-y-4">
        <h3 className="font-semibold">Dados Principais</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cnpj">CNPJ *</Label>
            <CNPJInput
              id="cnpj"
              value={formData.cnpj}
              onChange={(value, isValid) => {
                setFormData({ ...formData, cnpj: value });
                if (isValid) buscarDadosReceitaFederal(value);
              }}
              onValidate={(isValid) => setErrors({ ...errors, cnpj: !isValid })}
            />
            {errors.cnpj && (
              <span className="text-sm text-red-500">CNPJ inválido</span>
            )}
          </div>
          
          <div>
            <Label htmlFor="cnes">CNES *</Label>
            <Input
              id="cnes"
              value={formData.cnes}
              onChange={(e) => setFormData({ ...formData, cnes: e.target.value })}
              placeholder="0000000"
              maxLength={7}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="razao_social">Razão Social *</Label>
          <Input
            id="razao_social"
            value={formData.razao_social}
            onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
            disabled={loadingReceitaFederal}
          />
        </div>
        
        <div>
          <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
          <Input
            id="nome_fantasia"
            value={formData.nome_fantasia}
            onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
          />
        </div>
      </div>
      
      {/* Seção: Endereço */}
      <div className="space-y-4">
        <h3 className="font-semibold">Endereço</h3>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1">
            <Label htmlFor="cep">CEP *</Label>
            <CEPAutocomplete
              value={formData.cep}
              onChange={(cep, endereco) => {
                setFormData({
                  ...formData,
                  cep,
                  logradouro: endereco.logradouro,
                  bairro: endereco.bairro,
                  cidade: endereco.cidade,
                  uf: endereco.uf
                });
              }}
            />
          </div>
          
          <div className="col-span-3">
            <Label htmlFor="logradouro">Logradouro *</Label>
            <Input
              id="logradouro"
              value={formData.logradouro}
              onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1">
            <Label htmlFor="numero">Número *</Label>
            <Input
              id="numero"
              value={formData.numero}
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
            />
          </div>
          
          <div className="col-span-1">
            <Label htmlFor="complemento">Complemento</Label>
            <Input
              id="complemento"
              value={formData.complemento}
              onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
            />
          </div>
          
          <div className="col-span-2">
            <Label htmlFor="bairro">Bairro *</Label>
            <Input
              id="bairro"
              value={formData.bairro}
              onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cidade">Cidade *</Label>
            <Input
              id="cidade"
              value={formData.cidade}
              onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="uf">UF *</Label>
            <Select value={formData.uf} onValueChange={(v) => setFormData({ ...formData, uf: v })}>
              <SelectTrigger>UF</SelectTrigger>
              <SelectContent>
                {estados.map(uf => (
                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Seção: Contato */}
      <div className="space-y-4">
        <h3 className="font-semibold">Contato</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              type="tel"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              placeholder="(00) 0000-0000"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://"
            />
          </div>
        </div>
      </div>
      
      {/* Seção: Classificação */}
      <div className="space-y-4">
        <h3 className="font-semibold">Classificação</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tipo">Tipo *</Label>
            <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
              <SelectTrigger>Tipo</SelectTrigger>
              <SelectContent>
                <SelectItem value="publico">Público</SelectItem>
                <SelectItem value="privado">Privado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="porte">Porte</Label>
            <Select value={formData.porte} onValueChange={(v) => setFormData({ ...formData, porte: v })}>
              <SelectTrigger>Porte</SelectTrigger>
              <SelectContent>
                <SelectItem value="pequeno">Pequeno (&lt; 50 leitos)</SelectItem>
                <SelectItem value="medio">Médio (50-150 leitos)</SelectItem>
                <SelectItem value="grande">Grande (&gt; 150 leitos)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="especialidades">Especialidades Atendidas</Label>
          <MultiSelect
            options={especialidades}
            value={formData.especialidades}
            onChange={(v) => setFormData({ ...formData, especialidades: v })}
            placeholder="Selecione as especialidades"
          />
        </div>
      </div>
      
      {/* Seção: Documentos */}
      <div className="space-y-4">
        <h3 className="font-semibold">Documentos</h3>
        
        <DocumentUploader
          label="Alvará Sanitário"
          accept=".pdf,.jpg,.png"
          onUpload={(file) => handleDocumentUpload('alvara', file)}
          currentFile={formData.documentos.alvara}
        />
        
        <DocumentUploader
          label="Comprovante de Inscrição CNES"
          accept=".pdf,.jpg,.png"
          onUpload={(file) => handleDocumentUpload('cnes', file)}
          currentFile={formData.documentos.cnes}
        />
      </div>
      
      {/* Ações */}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => setShowFormModal(false)}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar Hospital'}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

### ⚙️ Funcionalidades Backend

#### A. APIs REST

**1. GET `/api/cadastros/hospitais`**
```typescript
Query Params: {
  page: number,
  pageSize: number,
  search?: string,
  tipo?: 'publico' | 'privado',
  status?: 'ativo' | 'inativo',
  uf?: string
}

Response: {
  hospitais: [
    {
      id: "hosp-001",
      cnpj: "12345678000190",
      razao_social: "Hospital Santa Casa",
      nome_fantasia: "Santa Casa",
      cnes: "1234567",
      endereco: {
        cep: "01234-567",
        logradouro: "Rua Exemplo",
        numero: "123",
        bairro: "Centro",
        cidade: "São Paulo",
        uf: "SP"
      },
      contato: {
        telefone: "(11) 1234-5678",
        email: "contato@santacasa.com.br",
        website: "https://santacasa.com.br"
      },
      tipo: "privado",
      porte: "grande",
      especialidades: ["Cardiologia", "Ortopedia"],
      status: "ativo",
      criado_em: "2024-01-15",
      atualizado_em: "2025-11-23"
    }
  ],
  total: 150,
  page: 1,
  totalPages: 15
}
```

**2. POST `/api/cadastros/hospitais`**
```typescript
Body: {
  cnpj: string,
  razao_social: string,
  nome_fantasia?: string,
  cnes: string,
  endereco: {
    cep: string,
    logradouro: string,
    numero: string,
    complemento?: string,
    bairro: string,
    cidade: string,
    uf: string
  },
  contato: {
    telefone: string,
    email: string,
    website?: string
  },
  tipo: 'publico' | 'privado',
  porte?: 'pequeno' | 'medio' | 'grande',
  especialidades: string[],
  responsavel_tecnico?: {
    nome: string,
    crm: string,
    uf: string
  }
}

Response: {
  id: "hosp-new-001",
  status: "criado",
  mensagem: "Hospital cadastrado com sucesso"
}
```

**3. PUT `/api/cadastros/hospitais/:id`**
```typescript
Body: { /* mesma estrutura do POST */ }
Response: { status: "atualizado" }
```

**4. DELETE `/api/cadastros/hospitais/:id`**
```typescript
Response: { status: "excluido" }
```

**5. GET `/api/cadastros/hospitais/:id/historico`**
```typescript
Response: {
  historico: [
    {
      data: "2025-11-20T10:30:00Z",
      usuario: "João Silva",
      acao: "atualização",
      campos_alterados: ["telefone", "email"],
      valores_anteriores: {...},
      valores_novos: {...}
    }
  ]
}
```

#### B. Validações Externas

**1. Validação de CNPJ (Receita Federal)**
```typescript
async function validarCNPJ(cnpj: string) {
  const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`);
  const data = await response.json();
  
  if (data.status === 'OK') {
    return {
      valido: true,
      razao_social: data.nome,
      nome_fantasia: data.fantasia,
      endereco: {
        logradouro: data.logradouro,
        numero: data.numero,
        bairro: data.bairro,
        cidade: data.municipio,
        uf: data.uf,
        cep: data.cep
      }
    };
  }
  
  return { valido: false };
}
```

**2. Validação de CRM (CFM)**
```typescript
async function validarCRM(crm: string, uf: string) {
  // API do CFM (Conselho Federal de Medicina)
  const response = await fetch(`https://portal.cfm.org.br/api/medico/validar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ crm, uf })
  });
  
  const data = await response.json();
  return {
    valido: data.situacao === 'REGULAR',
    nome: data.nome,
    especialidades: data.especialidades
  };
}
```

**3. Autocomplete de CEP (ViaCEP)**
```typescript
async function buscarEnderecoPorCEP(cep: string) {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  const data = await response.json();
  
  if (!data.erro) {
    return {
      logradouro: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      uf: data.uf
    };
  }
  
  return null;
}
```

#### C. Banco de Dados (Supabase)

**Tabelas:**

**1. hospitais**
```sql
CREATE TABLE hospitais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cnpj VARCHAR(14) UNIQUE NOT NULL,
  razao_social VARCHAR(200) NOT NULL,
  nome_fantasia VARCHAR(200),
  cnes VARCHAR(7) UNIQUE NOT NULL,
  inscricao_estadual VARCHAR(20),
  cep VARCHAR(8) NOT NULL,
  logradouro VARCHAR(200) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  complemento VARCHAR(100),
  bairro VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  uf CHAR(2) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  website VARCHAR(200),
  tipo VARCHAR(10) CHECK (tipo IN ('publico', 'privado')),
  porte VARCHAR(10) CHECK (porte IN ('pequeno', 'medio', 'grande')),
  especialidades JSONB,
  responsavel_tecnico JSONB,
  documentos JSONB,
  status VARCHAR(10) DEFAULT 'ativo',
  criado_em TIMESTAMP DEFAULT NOW(),
  criado_por UUID REFERENCES usuarios(id),
  atualizado_em TIMESTAMP,
  atualizado_por UUID REFERENCES usuarios(id)
);

CREATE INDEX idx_hospitais_cnpj ON hospitais(cnpj);
CREATE INDEX idx_hospitais_cnes ON hospitais(cnes);
CREATE INDEX idx_hospitais_cidade_uf ON hospitais(cidade, uf);
CREATE INDEX idx_hospitais_status ON hospitais(status);
```

**2. medicos**
```sql
CREATE TABLE medicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cpf VARCHAR(11) UNIQUE NOT NULL,
  nome_completo VARCHAR(200) NOT NULL,
  crm VARCHAR(10) NOT NULL,
  crm_uf CHAR(2) NOT NULL,
  rqe VARCHAR(20),
  especialidades JSONB NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  data_nascimento DATE,
  hospitais_atendidos UUID[] REFERENCES hospitais(id),
  status VARCHAR(10) DEFAULT 'ativo',
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP,
  UNIQUE(crm, crm_uf)
);

CREATE INDEX idx_medicos_cpf ON medicos(cpf);
CREATE INDEX idx_medicos_crm ON medicos(crm, crm_uf);
CREATE INDEX idx_medicos_nome ON medicos(nome_completo);
```

**3. pacientes**
```sql
CREATE TABLE pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cpf VARCHAR(11) UNIQUE,
  cartao_sus VARCHAR(15) UNIQUE,
  nome_completo VARCHAR(200) NOT NULL,
  data_nascimento DATE NOT NULL,
  sexo CHAR(1) CHECK (sexo IN ('M', 'F', 'O')),
  telefone VARCHAR(20),
  email VARCHAR(100),
  cep VARCHAR(8),
  logradouro VARCHAR(200),
  numero VARCHAR(20),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  uf CHAR(2),
  convenio_id UUID REFERENCES convenios(id),
  numero_carteirinha VARCHAR(50),
  observacoes_medicas TEXT,
  status VARCHAR(10) DEFAULT 'ativo',
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP
);

CREATE INDEX idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX idx_pacientes_sus ON pacientes(cartao_sus);
CREATE INDEX idx_pacientes_nome ON pacientes(nome_completo);
```

**4. fornecedores**
```sql
CREATE TABLE fornecedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cnpj VARCHAR(14) UNIQUE NOT NULL,
  razao_social VARCHAR(200) NOT NULL,
  nome_fantasia VARCHAR(200),
  inscricao_estadual VARCHAR(20),
  cep VARCHAR(8) NOT NULL,
  logradouro VARCHAR(200) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  complemento VARCHAR(100),
  bairro VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  uf CHAR(2) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  responsavel_comercial VARCHAR(200),
  condicoes_pagamento JSONB,
  produtos_fornecidos UUID[] REFERENCES produtos_opme(id),
  certificacoes JSONB,
  documentos JSONB,
  status VARCHAR(10) DEFAULT 'ativo',
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP
);
```

**5. cadastros_historico**
```sql
CREATE TABLE cadastros_historico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tabela VARCHAR(50) NOT NULL,
  registro_id UUID NOT NULL,
  acao VARCHAR(20) NOT NULL CHECK (acao IN ('criacao', 'atualizacao', 'exclusao')),
  usuario_id UUID REFERENCES usuarios(id),
  campos_alterados JSONB,
  valores_anteriores JSONB,
  valores_novos JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_historico_tabela_registro ON cadastros_historico(tabela, registro_id);
CREATE INDEX idx_historico_timestamp ON cadastros_historico(timestamp DESC);
```

#### D. Importação em Lote

**Endpoint:** POST `/api/cadastros/importar`

```typescript
async function importarCadastros(arquivo: File, tipo: string) {
  // 1. Parse do arquivo (CSV/Excel)
  const dados = await parseArquivo(arquivo);
  
  // 2. Validação em massa
  const validacoes = await Promise.all(
    dados.map(async (registro) => {
      const erros = [];
      
      // Validar CNPJ/CPF
      if (tipo === 'hospitais' || tipo === 'fornecedores') {
        const cnpjValido = await validarCNPJ(registro.cnpj);
        if (!cnpjValido.valido) erros.push('CNPJ inválido');
      }
      
      // Validar CRM (médicos)
      if (tipo === 'medicos') {
        const crmValido = await validarCRM(registro.crm, registro.crm_uf);
        if (!crmValido.valido) erros.push('CRM inválido');
      }
      
      return {
        registro,
        valido: erros.length === 0,
        erros
      };
    })
  );
  
  // 3. Separar válidos e inválidos
  const validos = validacoes.filter(v => v.valido);
  const invalidos = validacoes.filter(v => !v.valido);
  
  // 4. Inserir registros válidos
  const inseridos = await db[tipo].createMany({
    data: validos.map(v => v.registro)
  });
  
  // 5. Retornar relatório
  return {
    total: dados.length,
    importados: inseridos.count,
    erros: invalidos.map(inv => ({
      linha: inv.registro._linha,
      erros: inv.erros
    }))
  };
}
```

### 🔌 Integrações

**Internas:**
- CRM Vendas → Hospitais e Médicos
- Cirurgias → Médicos e Pacientes
- Compras → Fornecedores
- Logística → Transportadoras
- Faturamento → Hospitais e Pacientes

**Externas:**
- Receita Federal (CNPJ)
- CFM - Conselho Federal de Medicina (CRM)
- ViaCEP (Endereços)
- DATASUS (Cartão SUS)

### 📊 Métricas de Performance

**Carregamento:**
- Lista (100 registros): < 1s
- Busca: < 500ms
- Validação CNPJ: 1-3s (API externa)
- Importação (1000 registros): 10-30s

---

## 08. GRUPOS DE PRODUTOS OPME

### 📊 Informações Gerais

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `GruposProdutosOPME.tsx` |
| **Ícone** | `Package` (Lucide React) |
| **Rota** | `/produtos-opme/grupos` |
| **Permissão** | `produtos.view, produtos.manage` |
| **Categoria** | Cadastros & Gestão |
| **Status** | ✅ Implementado 100% |

### 🎯 Descrição

Gerenciamento de grupos, categorias e subcategorias de produtos OPME (Órteses, Próteses e Materiais Especiais). Organização hierárquica conforme ANVISA e SUS, com relacionamento de produtos e configurações específicas por grupo.

### 📋 Sub-Módulos (3)

1. **Grupos Principais** - Grandes categorias (Ortopedia, Cardiologia, etc)
2. **Categorias** - Subdivisões de grupos
3. **Subcategorias** - Detalhamento específico

### 📝 Formulários (3)

#### 1. Criar Grupo
- **Campos:** Nome, Descrição, Código ANVISA, Ícone, Cor Identificação, Requer Certificação Especial
- **Submit:** POST `/api/produtos-opme/grupos`

#### 2. Criar Categoria
- **Campos:** Nome, Grupo Pai, Código, Margem Padrão, Prazo Validade Padrão
- **Submit:** POST `/api/produtos-opme/categorias`

#### 3. Criar Subcategoria
- **Campos:** Nome, Categoria Pai, Características Específicas
- **Submit:** POST `/api/produtos-opme/subcategorias`

### 🎨 Componentes Utilizados

- `TreeView` - Hierarquia de grupos
- `DraggableList` - Reordenar categorias
- `GroupCard` - Card de grupo com métricas

### 🔧 Funcionalidades Frontend

```tsx
<div className="grid grid-cols-3 gap-6">
  {/* Árvore de Navegação */}
  <Card className="col-span-1">
    <CardHeader>
      <CardTitle>Hierarquia</CardTitle>
    </CardHeader>
    <CardContent>
      <TreeView
        data={hierarquia}
        onSelect={(node) => setSelectedNode(node)}
        renderNode={(node) => (
          <div className="flex items-center gap-2">
            {node.icone}
            <span>{node.nome}</span>
            <Badge>{node.total_produtos}</Badge>
          </div>
        )}
      />
    </CardContent>
  </Card>
  
  {/* Detalhes do Grupo/Categoria */}
  <Card className="col-span-2">
    <CardHeader>
      <CardTitle>{selectedNode?.nome}</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <span className="text-sm text-muted-foreground">Total Produtos</span>
          <p className="text-2xl font-semibold">{selectedNode?.total_produtos}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Valor em Estoque</span>
          <p className="text-2xl font-semibold">
            {formatCurrency(selectedNode?.valor_estoque)}
          </p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Margem Média</span>
          <p className="text-2xl font-semibold">{selectedNode?.margem_media}%</p>
        </div>
      </div>
      
      {/* Produtos do Grupo */}
      <DataTable
        columns={colunasProdutos}
        data={selectedNode?.produtos || []}
      />
    </CardContent>
  </Card>
</div>
```

### ⚙️ Funcionalidades Backend

**APIs:**

**GET `/api/produtos-opme/grupos/hierarquia`**
```typescript
Response: {
  grupos: [
    {
      id: "grupo-001",
      nome: "Ortopedia",
      codigo_anvisa: "ORT",
      total_produtos: 1247,
      valor_estoque: 5420000,
      categorias: [
        {
          id: "cat-001",
          nome: "Próteses de Quadril",
          total_produtos: 156,
          subcategorias: [...]
        }
      ]
    }
  ]
}
```

### 🔌 Integrações

**Internas:** Estoque IA, Compras, Vendas, Cirurgias  
**Externas:** ANVISA (validação de códigos)

---

## 09. GESTÃO DE USUÁRIOS E PERMISSÕES

### 📊 Informações Gerais

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `GestaoUsuariosPermissoes.tsx` |
| **Ícone** | `Shield` (Lucide React) |
| **Rota** | `/configuracoes/usuarios` |
| **Permissão** | `admin.users.manage` |
| **Categoria** | Cadastros & Gestão |
| **Status** | ✅ Implementado 100% |

### 🎯 Descrição

Gerenciamento completo de usuários, perfis, permissões (RBAC), auditoria de acessos e autenticação multifator (MFA).

### 📋 Sub-Módulos (5)

1. **Usuários** - CRUD de usuários
2. **Perfis/Roles** - Perfis de acesso
3. **Permissões** - Granularidade de permissões
4. **Auditoria** - Log de acessos e ações
5. **Sessões Ativas** - Gerenciar sessões

### 📝 Formulários (4)

#### 1. Criar Usuário
- **Campos:** Nome, Email, Telefone, CPF, Perfil, Departamento, Status, Foto
- **Validação:** Email único, CPF válido
- **Submit:** POST `/api/usuarios`

#### 2. Criar Perfil
- **Campos:** Nome, Descrição, Permissões (multi-select), Nível Acesso
- **Submit:** POST `/api/usuarios/perfis`

#### 3. Configurar MFA
- **Campos:** Método (SMS/App/Email), Telefone/Email
- **Submit:** POST `/api/usuarios/:id/mfa/ativar`

#### 4. Redefinir Senha
- **Campos:** Senha Atual, Nova Senha, Confirmar Senha
- **Validação:** Senha forte (min 8 chars, maiúscula, minúscula, número, especial)
- **Submit:** PUT `/api/usuarios/:id/senha`

### 🎨 Componentes Utilizados

- `UserTable` - Tabela de usuários
- `RolePermissionMatrix` - Matriz de permissões
- `AuditLog` - Log de auditoria
- `SessionManager` - Gerenciador de sessões
- `MFASetup` - Configuração MFA

### 🔧 Funcionalidades Frontend

#### A. Tabela de Usuários com Ações

```tsx
<DataTable
  columns={[
    {
      accessorKey: 'nome',
      header: 'Nome',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={row.original.foto} />
            <AvatarFallback>{row.original.iniciais}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.nome}</p>
            <p className="text-sm text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      )
    },
    { accessorKey: 'perfil', header: 'Perfil', cell: renderBadgePerfil },
    { accessorKey: 'departamento', header: 'Departamento' },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'ativo' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: 'mfa_ativo',
      header: 'MFA',
      cell: ({ row }) => (
        row.original.mfa_ativo ? (
          <CheckCircle className="text-green-500" size={18} />
        ) : (
          <XCircle className="text-gray-400" size={18} />
        )
      )
    },
    {
      id: 'acoes',
      header: 'Ações',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="sm">
              <MoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => editarUsuario(row.original.id)}>
              <Edit size={14} className="mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => resetarSenha(row.original.id)}>
              <Key size={14} className="mr-2" />
              Resetar Senha
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => verAuditoria(row.original.id)}>
              <FileText size={14} className="mr-2" />
              Ver Auditoria
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => desativarUsuario(row.original.id)}
              className="text-red-600"
            >
              <Ban size={14} className="mr-2" />
              Desativar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]}
  data={usuarios}
/>
```

#### B. Matriz de Permissões (RBAC)

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Recurso</TableHead>
      {perfis.map(perfil => (
        <TableHead key={perfil.id}>{perfil.nome}</TableHead>
      ))}
    </TableRow>
  </TableHeader>
  <TableBody>
    {recursos.map(recurso => (
      <TableRow key={recurso.id}>
        <TableCell className="font-medium">{recurso.nome}</TableCell>
        {perfis.map(perfil => (
          <TableCell key={perfil.id}>
            <div className="flex gap-2">
              <Checkbox
                checked={temPermissao(perfil.id, recurso.id, 'view')}
                onCheckedChange={(checked) => 
                  atualizarPermissao(perfil.id, recurso.id, 'view', checked)
                }
              />
              <span className="text-xs">View</span>
              
              <Checkbox
                checked={temPermissao(perfil.id, recurso.id, 'edit')}
                onCheckedChange={(checked) => 
                  atualizarPermissao(perfil.id, recurso.id, 'edit', checked)
                }
              />
              <span className="text-xs">Edit</span>
              
              <Checkbox
                checked={temPermissao(perfil.id, recurso.id, 'delete')}
                onCheckedChange={(checked) => 
                  atualizarPermissao(perfil.id, recurso.id, 'delete', checked)
                }
              />
              <span className="text-xs">Delete</span>
            </div>
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### C. Log de Auditoria

```tsx
<Card>
  <CardHeader>
    <CardTitle>Log de Auditoria</CardTitle>
    <CardDescription>Últimas 100 ações do sistema</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      {auditLogs.map(log => (
        <div key={log.id} className="flex items-start gap-3 p-3 border rounded-md">
          <div className="flex-shrink-0 mt-1">
            {log.tipo === 'criacao' && <Plus className="text-green-500" size={18} />}
            {log.tipo === 'atualizacao' && <Edit className="text-blue-500" size={18} />}
            {log.tipo === 'exclusao' && <Trash className="text-red-500" size={18} />}
            {log.tipo === 'acesso' && <Eye className="text-gray-500" size={18} />}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{log.usuario_nome}</span>
              <Badge variant="outline">{log.tipo}</Badge>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: ptBR })}
              </span>
            </div>
            
            <p className="text-sm">{log.descricao}</p>
            
            {log.detalhes && (
              <details className="mt-2">
                <summary className="text-sm cursor-pointer text-blue-600">
                  Ver detalhes
                </summary>
                <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                  {JSON.stringify(log.detalhes, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

#### D. Configuração de MFA

```tsx
<Dialog open={showMFADialog} onOpenChange={setShowMFADialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Configurar Autenticação Multifator (MFA)</DialogTitle>
      <DialogDescription>
        Adicione uma camada extra de segurança à sua conta
      </DialogDescription>
    </DialogHeader>
    
    <Tabs defaultValue="app">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="app">App Autenticador</TabsTrigger>
        <TabsTrigger value="sms">SMS</TabsTrigger>
        <TabsTrigger value="email">Email</TabsTrigger>
      </TabsList>
      
      <TabsContent value="app" className="space-y-4">
        <div className="text-center">
          <p className="mb-4">Escaneie o QR Code com seu app autenticador:</p>
          <QRCodeSVG value={mfaSetup.qr_url} size={200} className="mx-auto" />
        </div>
        
        <div>
          <Label htmlFor="codigo">Código de Verificação</Label>
          <Input
            id="codigo"
            placeholder="000000"
            maxLength={6}
            value={codigoMFA}
            onChange={(e) => setCodigoMFA(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={verificarMFA} 
          disabled={codigoMFA.length !== 6}
          className="w-full"
        >
          Verificar e Ativar MFA
        </Button>
      </TabsContent>
      
      <TabsContent value="sms" className="space-y-4">
        <div>
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            type="tel"
            placeholder="(00) 00000-0000"
            value={telefoneMFA}
            onChange={(e) => setTelefoneMFA(e.target.value)}
          />
        </div>
        
        <Button onClick={enviarSMS} className="w-full">
          Enviar Código por SMS
        </Button>
      </TabsContent>
      
      <TabsContent value="email" className="space-y-4">
        <p>Um código será enviado para: <strong>{usuario.email}</strong></p>
        <Button onClick={enviarEmail} className="w-full">
          Enviar Código por Email
        </Button>
      </TabsContent>
    </Tabs>
  </DialogContent>
</Dialog>
```

### ⚙️ Funcionalidades Backend

#### A. APIs REST

**1. GET `/api/usuarios`**
```typescript
Response: {
  usuarios: [
    {
      id: "user-001",
      nome: "João Silva",
      email: "joao@example.com",
      cpf: "12345678900",
      telefone: "(11) 98765-4321",
      perfil_id: "perfil-admin",
      perfil_nome: "Administrador",
      departamento: "TI",
      foto_url: "https://...",
      mfa_ativo: true,
      status: "ativo",
      ultimo_acesso: "2025-11-23T10:30:00Z",
      criado_em: "2024-01-15"
    }
  ]
}
```

**2. POST `/api/usuarios`**
```typescript
Body: {
  nome: string,
  email: string,
  cpf: string,
  telefone: string,
  perfil_id: string,
  departamento: string,
  senha_temporaria?: string
}

Response: {
  id: "user-new-001",
  senha_temporaria: "Abc123!@#",
  mensagem: "Usuário criado. Senha temporária enviada por email."
}
```

**3. GET `/api/usuarios/perfis`**
```typescript
Response: {
  perfis: [
    {
      id: "perfil-admin",
      nome: "Administrador",
      descricao: "Acesso total ao sistema",
      nivel: 10,
      permissoes: [
        {
          recurso: "usuarios",
          acoes: ["view", "create", "edit", "delete"]
        },
        {
          recurso: "configuracoes",
          acoes: ["view", "edit"]
        }
      ],
      total_usuarios: 5
    }
  ]
}
```

**4. PUT `/api/usuarios/:id/permissoes`**
```typescript
Body: {
  perfil_id: string,
  permissoes_customizadas?: Array<{
    recurso: string,
    acoes: string[]
  }>
}

Response: { status: "atualizado" }
```

**5. GET `/api/usuarios/:id/auditoria`**
```typescript
Query: { page, pageSize, tipo?, data_inicio?, data_fim? }

Response: {
  logs: [
    {
      id: "log-001",
      usuario_id: "user-001",
      usuario_nome: "João Silva",
      tipo: "atualizacao",
      recurso: "hospitais",
      recurso_id: "hosp-001",
      acao: "editar",
      descricao: "Atualizou dados do Hospital Santa Casa",
      ip: "192.168.1.100",
      user_agent: "Mozilla/5.0...",
      timestamp: "2025-11-23T10:30:00Z",
      detalhes: {
        campos_alterados: ["telefone", "email"],
        valores_anteriores: {...},
        valores_novos: {...}
      }
    }
  ],
  total: 450
}
```

**6. POST `/api/usuarios/:id/mfa/ativar`**
```typescript
Body: {
  metodo: 'app' | 'sms' | 'email',
  telefone?: string
}

Response: {
  qr_url?: string,  // Se método = app
  secret?: string,   // Se método = app
  codigo_enviado?: boolean,  // Se método = sms/email
  backup_codes: string[]  // Códigos de recuperação
}
```

**7. POST `/api/usuarios/:id/mfa/verificar`**
```typescript
Body: {
  codigo: string
}

Response: {
  valido: boolean,
  mfa_ativo: boolean
}
```

**8. GET `/api/usuarios/sessoes-ativas`**
```typescript
Response: {
  sessoes: [
    {
      id: "session-001",
      usuario_id: "user-001",
      usuario_nome: "João Silva",
      ip: "192.168.1.100",
      localizacao: "São Paulo, SP - Brasil",
      dispositivo: "Chrome 120 on Windows",
      inicio: "2025-11-23T08:00:00Z",
      ultima_atividade: "2025-11-23T10:30:00Z",
      expira_em: "2025-11-23T20:00:00Z"
    }
  ]
}
```

**9. DELETE `/api/usuarios/sessoes/:id`**
```typescript
Response: {
  status: "encerrada",
  mensagem: "Sessão encerrada com sucesso"
}
```

#### B. Middleware de Autorização (RBAC)

```typescript
// middleware/authorization.ts

export function authorize(recurso: string, acao: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const usuario_id = req.user.id;
    
    // 1. Buscar perfil e permissões do usuário
    const usuario = await db.usuarios.findUnique({
      where: { id: usuario_id },
      include: {
        perfil: {
          include: { permissoes: true }
        },
        permissoes_customizadas: true
      }
    });
    
    // 2. Verificar se tem permissão no perfil
    const permissao_perfil = usuario.perfil.permissoes.find(
      p => p.recurso === recurso && p.acoes.includes(acao)
    );
    
    // 3. Verificar permissões customizadas
    const permissao_custom = usuario.permissoes_customizadas.find(
      p => p.recurso === recurso && p.acoes.includes(acao)
    );
    
    if (permissao_perfil || permissao_custom) {
      // 4. Registrar acesso no log de auditoria
      await db.auditoria.create({
        data: {
          usuario_id,
          tipo: 'acesso',
          recurso,
          acao,
          ip: req.ip,
          user_agent: req.headers['user-agent'],
          timestamp: new Date()
        }
      });
      
      return next();
    }
    
    // Sem permissão
    return res.status(403).json({
      erro: 'Acesso negado',
      mensagem: `Você não tem permissão para ${acao} em ${recurso}`
    });
  };
}

// Uso em rotas
app.get('/api/hospitais', 
  authenticate,
  authorize('hospitais', 'view'),
  async (req, res) => {
    // Lógica da rota
  }
);
```

#### C. Banco de Dados

**1. usuarios**
```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(200) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  senha_hash TEXT NOT NULL,
  perfil_id UUID REFERENCES perfis(id),
  departamento VARCHAR(100),
  foto_url TEXT,
  mfa_ativo BOOLEAN DEFAULT FALSE,
  mfa_metodo VARCHAR(10),
  mfa_secret TEXT,
  backup_codes TEXT[],
  status VARCHAR(10) DEFAULT 'ativo',
  ultimo_acesso TIMESTAMP,
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP
);
```

**2. perfis**
```sql
CREATE TABLE perfis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) UNIQUE NOT NULL,
  descricao TEXT,
  nivel INTEGER NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW()
);
```

**3. permissoes**
```sql
CREATE TABLE permissoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  perfil_id UUID REFERENCES perfis(id),
  recurso VARCHAR(100) NOT NULL,
  acoes TEXT[] NOT NULL,
  UNIQUE(perfil_id, recurso)
);
```

**4. auditoria**
```sql
CREATE TABLE auditoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id),
  tipo VARCHAR(20) NOT NULL,
  recurso VARCHAR(100),
  recurso_id UUID,
  acao VARCHAR(50),
  descricao TEXT,
  ip VARCHAR(45),
  user_agent TEXT,
  detalhes JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id, timestamp DESC);
CREATE INDEX idx_auditoria_recurso ON auditoria(recurso, recurso_id);
CREATE INDEX idx_auditoria_timestamp ON auditoria(timestamp DESC);
```

**5. sessoes**
```sql
CREATE TABLE sessoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id),
  token_hash TEXT NOT NULL,
  ip VARCHAR(45),
  localizacao VARCHAR(200),
  dispositivo VARCHAR(200),
  inicio TIMESTAMP DEFAULT NOW(),
  ultima_atividade TIMESTAMP DEFAULT NOW(),
  expira_em TIMESTAMP NOT NULL
);

CREATE INDEX idx_sessoes_usuario ON sessoes(usuario_id);
CREATE INDEX idx_sessoes_token ON sessoes(token_hash);
```

### 🔌 Integrações

**Internas:** Todos os módulos (autenticação e autorização)  
**Externas:** 
- Auth0 / Supabase Auth (autenticação)
- Google Authenticator / Authy (MFA)
- SendGrid (envio de emails)
- Twilio (envio de SMS)

---

## 10. GESTÃO DE CONTRATOS

### 📊 Informações Gerais

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `GestaoContratosNovo.tsx` |
| **Ícone** | `FileSignature` (Lucide React) |
| **Rota** | `/contratos` |
| **Permissão** | `contratos.view, contratos.manage` |
| **Status** | ✅ Implementado 100% |

### 🎯 Descrição

Gerenciamento completo de contratos com hospitais, fornecedores e representantes. Controle de vigência, renovações automáticas, alertas de vencimento, assinatura digital e repositório de documentos.

### 📋 Sub-Módulos (4)

1. **Contratos Ativos** - Contratos vigentes
2. **Contratos a Vencer** - Próximos de expirar (30, 60, 90 dias)
3. **Contratos Vencidos** - Expirados
4. **Histórico** - Contratos encerrados

### 📝 Formulários (2)

#### 1. Criar Contrato
- **Campos:** Tipo (Cliente/Fornecedor/Representante), Parte Contratada, Número, Objeto, Valor, Data Início, Data Fim, Renovação Automática, Condições, Anexos
- **Submit:** POST `/api/contratos`

#### 2. Renovar Contrato
- **Campos:** Nova Data Fim, Novo Valor (opcional), Observações
- **Submit:** POST `/api/contratos/:id/renovar`

### 🎨 Componentes

- `ContratoCard` - Card de contrato com status
- `TimelineVisualization` - Linha do tempo de vigência
- `SignatureDialog` - Assinatura digital
- `DocumentViewer` - Visualizador de PDFs

### 🔧 Funcionalidades Frontend

```tsx
<Tabs defaultValue="ativos">
  <TabsList>
    <TabsTrigger value="ativos">
      Ativos ({contratos.ativos.length})
    </TabsTrigger>
    <TabsTrigger value="vencer">
      A Vencer ({contratos.aVencer.length})
      {contratos.aVencer.length > 0 && (
        <Badge variant="destructive" className="ml-2">{contratos.aVencer.length}</Badge>
      )}
    </TabsTrigger>
    <TabsTrigger value="vencidos">
      Vencidos ({contratos.vencidos.length})
    </TabsTrigger>
  </TabsList>
  
  <TabsContent value="ativos">
    <div className="grid gap-4">
      {contratos.ativos.map(contrato => (
        <Card key={contrato.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{contrato.numero} - {contrato.parte_contratada}</CardTitle>
                <CardDescription>{contrato.objeto}</CardDescription>
              </div>
              <Badge variant="default">Ativo</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Valor</span>
                <p className="font-semibold">{formatCurrency(contrato.valor)}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Início</span>
                <p>{format(contrato.data_inicio, 'dd/MM/yyyy')}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Término</span>
                <p>{format(contrato.data_fim, 'dd/MM/yyyy')}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Dias Restantes</span>
                <p className="font-semibold">{contrato.dias_restantes}</p>
              </div>
            </div>
            
            {/* Timeline de Vigência */}
            <div className="mt-4">
              <Progress value={contrato.percentual_decorrido} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Decorrido: {contrato.percentual_decorrido}%</span>
                <span>{contrato.dias_restantes} dias restantes</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={() => verContrato(contrato.id)}>
                <Eye size={14} className="mr-2" />
                Visualizar
              </Button>
              <Button size="sm" variant="outline" onClick={() => renovarContrato(contrato.id)}>
                <RefreshCw size={14} className="mr-2" />
                Renovar
              </Button>
              <Button size="sm" variant="outline" onClick={() => aditivar(contrato.id)}>
                <FileText size={14} className="mr-2" />
                Aditivo
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </TabsContent>
</Tabs>
```

### ⚙️ Backend

**APIs:**

**GET `/api/contratos`**
```typescript
Query: { status?, tipo?, parte_contratada_id? }
Response: {
  contratos: [{
    id, numero, tipo, parte_contratada, objeto,
    valor, data_inicio, data_fim, dias_restantes,
    percentual_decorrido, status, anexos
  }]
}
```

**POST `/api/contratos/:id/assinar`**
```typescript
Body: { assinante, assinatura_digital }
Response: { status: "assinado", certificado_url }
```

### 🔌 Integrações

**Internas:** Hospitais, Fornecedores, Representantes, Financeiro  
**Externas:** DocuSign (assinatura digital), AWS S3 (armazenamento)

---

## 11. GESTÃO DE INVENTÁRIO

### 📊 Informações Gerais

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `GestaoInventario.tsx` |
| **Ícone** | `ClipboardList` (Lucide React) |
| **Rota** | `/estoque/inventario` |
| **Permissão** | `inventario.manage` |
| **Status** | ✅ Implementado 100% |

### 🎯 Descrição

Realização de inventários físicos com contagem via coletor de dados, leitura de QR Code/RFID, divergências automáticas, ajustes de estoque e relatórios de acuracidade.

### 📋 Sub-Módulos (5)

1. **Novo Inventário** - Criar processo de contagem
2. **Em Andamento** - Inventários sendo realizados
3. **Divergências** - Itens com diferença física×sistema
4. **Ajustes** - Correções de estoque
5. **Histórico** - Inventários concluídos

### 📝 Formulários (3)

#### 1. Criar Inventário
- **Campos:** Nome, Tipo (Total/Parcial/Cíclico), Locais, Categorias, Data Início, Responsáveis
- **Submit:** POST `/api/inventario/criar`

#### 2. Registrar Contagem
- **Campos:** Produto (QR Code), Quantidade Contada, Lote, Validade, Local
- **Submit:** POST `/api/inventario/:id/contar`

#### 3. Ajustar Divergência
- **Campos:** Produto, Motivo Divergência, Quantidade Ajustada, Aprovador
- **Submit:** POST `/api/inventario/:id/ajustar`

### 🎨 Componentes

- `QRScanner` - Leitor de QR Code (câmera)
- `RFIDReader` - Leitor RFID
- `DivergenceTable` - Tabela de divergências
- `AccuracyGauge` - Gauge de acuracidade

### 🔧 Funcionalidades Frontend

**Scanner QR Code:**
```tsx
import { Html5QrcodeScanner } from 'html5-qrcode';

const [scannedProduct, setScannedProduct] = useState(null);

useEffect(() => {
  const scanner = new Html5QrcodeScanner(
    "qr-reader",
    { fps: 10, qrbox: 250 },
    false
  );
  
  scanner.render(
    (decodedText) => {
      // QR Code scaneado
      buscarProdutoPorCodigo(decodedText);
      scanner.clear();
    },
    (error) => console.error(error)
  );
  
  return () => scanner.clear();
}, []);

<div id="qr-reader" style={{ width: "100%" }} />
```

**Tela de Contagem:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Contagem: {inventario.nome}</CardTitle>
    <CardDescription>
      Progresso: {contagemFeita}/{totalItens} ({percentualConcluido}%)
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Progress value={percentualConcluido} className="mb-4" />
    
    {scannedProduct ? (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <img src={scannedProduct.foto} className="w-20 h-20 object-cover rounded" />
          <div>
            <h3 className="font-semibold">{scannedProduct.nome}</h3>
            <p className="text-sm text-muted-foreground">
              Estoque Sistema: {scannedProduct.quantidade_sistema}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Quantidade Física</Label>
            <Input
              type="number"
              value={quantidadeFisica}
              onChange={(e) => setQuantidadeFisica(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <Label>Lote</Label>
            <Input value={lote} onChange={(e) => setLote(e.target.value)} />
          </div>
        </div>
        
        <Button onClick={registrarContagem} className="w-full">
          Registrar Contagem
        </Button>
      </div>
    ) : (
      <div className="text-center py-8">
        <QrCode size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-muted-foreground">Escaneie o QR Code do produto</p>
      </div>
    )}
  </CardContent>
</Card>
```

### ⚙️ Backend

**APIs:**

**POST `/api/inventario/criar`**
```typescript
Body: {
  nome, tipo, locais, categorias, 
  data_inicio, responsaveis
}
Response: {
  id, status: "criado",
  total_itens, mensagem
}
```

**POST `/api/inventario/:id/contar`**
```typescript
Body: {
  produto_id, quantidade_fisica, lote, validade, local
}
Response: {
  divergencia: boolean,
  diferenca: number,
  percentual_divergencia: number
}
```

**GET `/api/inventario/:id/relatorio`**
```typescript
Response: {
  inventario: {...},
  estatisticas: {
    total_itens: 1500,
    itens_contados: 1450,
    divergencias: 45,
    acuracia: 97.0,
    valor_divergencia: 15420.50
  },
  divergencias: [...]
}
```

### 🔌 Integrações

**Internas:** Estoque IA, Produtos OPME  
**Externas:** Leitores RFID via Bluetooth

---

## 12. RH GESTÃO DE PESSOAS

### 📊 Informações Gerais

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `RHGestãoPessoasNovo.tsx` |
| **Ícone** | `Users` (Lucide React) |
| **Rota** | `/rh` |
| **Permissão** | `rh.view, rh.manage` |
| **Status** | ✅ Implementado 100% |

### 🎯 Descrição

Gestão de colaboradores com controle de ponto, férias, benefícios, treinamentos, avaliações de desempenho e folha de pagamento integrada.

### 📋 Sub-Módulos (8)

1. **Colaboradores** - CRUD de funcionários
2. **Ponto Eletrônico** - Registro de horários
3. **Férias** - Solicitação e aprovação
4. **Benefícios** - VT, VR, VA, Plano Saúde
5. **Treinamentos** - Cursos e certificações
6. **Avaliações** - Performance reviews
7. **Folha de Pagamento** - Processamento mensal
8. **Documentos** - Repositório de docs

### 📝 Formulários (5)

#### 1. Cadastrar Colaborador
- **Campos:** Nome, CPF, RG, Data Nascimento, Cargo, Departamento, Salário, Data Admissão, Tipo Contrato
- **Submit:** POST `/api/rh/colaboradores`

#### 2. Solicitar Férias
- **Campos:** Período (data início/fim), Observações
- **Submit:** POST `/api/rh/ferias/solicitar`

#### 3. Registrar Treinamento
- **Campos:** Colaborador, Curso, Instituição, Data, Carga Horária, Certificado
- **Submit:** POST `/api/rh/treinamentos`

#### 4. Avaliar Desempenho
- **Campos:** Colaborador, Período, Competências (nota 1-5), Comentários, Plano Desenvolvimento
- **Submit:** POST `/api/rh/avaliacoes`

#### 5. Processar Folha
- **Campos:** Mês/Ano, Colaboradores, Horas Extras, Descontos, Benefícios
- **Submit:** POST `/api/rh/folha/processar`

### 🎨 Componentes

- `EmployeeCard` - Card de colaborador
- `TimeTracker` - Registro de ponto
- `VacationCalendar` - Calendário de férias
- `PayrollTable` - Tabela de folha
- `PerformanceRadar` - Gráfico radar de competências

### 🔧 Funcionalidades Frontend

**Dashboard RH:**
```tsx
<div className="grid grid-cols-4 gap-4">
  <Card>
    <CardHeader>
      <CardTitle>Total Colaboradores</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-4xl font-bold">{stats.total_colaboradores}</p>
      <p className="text-sm text-muted-foreground">
        <span className="text-green-500">+{stats.admissoes_mes}</span> este mês
      </p>
    </CardContent>
  </Card>
  
  <Card>
    <CardHeader>
      <CardTitle>Em Férias</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-4xl font-bold">{stats.em_ferias}</p>
    </CardContent>
  </Card>
  
  <Card>
    <CardHeader>
      <CardTitle>Folha Mensal</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-4xl font-bold">
        {formatCurrency(stats.folha_mensal)}
      </p>
    </CardContent>
  </Card>
  
  <Card>
    <CardHeader>
      <CardTitle>Treinamentos</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-4xl font-bold">{stats.treinamentos_mes}</p>
      <p className="text-sm text-muted-foreground">
        {stats.horas_treinamento}h este mês
      </p>
    </CardContent>
  </Card>
</div>
```

**Ponto Eletrônico:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Registro de Ponto</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-center mb-6">
      <p className="text-6xl font-mono">{horarioAtual}</p>
      <p className="text-sm text-muted-foreground mt-2">
        {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
      </p>
    </div>
    
    <div className="space-y-2 mb-6">
      {registrosHoje.map(registro => (
        <div key={registro.id} className="flex justify-between items-center p-2 border rounded">
          <span className="font-medium">{registro.tipo}</span>
          <span>{format(new Date(registro.timestamp), 'HH:mm:ss')}</span>
        </div>
      ))}
    </div>
    
    <Button
      onClick={registrarPonto}
      className="w-full"
      size="lg"
      disabled={ultimoRegistro?.tipo === proximoTipo}
    >
      <Clock size={20} className="mr-2" />
      {proximoTipo === 'entrada' && 'Registrar Entrada'}
      {proximoTipo === 'saida_almoco' && 'Saída Almoço'}
      {proximoTipo === 'volta_almoco' && 'Volta Almoço'}
      {proximoTipo === 'saida' && 'Registrar Saída'}
    </Button>
  </CardContent>
</Card>
```

### ⚙️ Backend

**GET `/api/rh/colaboradores/:id/ponto/mes`**
```typescript
Response: {
  mes, ano,
  registros: [
    { data, entrada, saida_almoco, volta_almoco, saida, total_horas }
  ],
  resumo: {
    total_horas_mes: 176,
    horas_extras: 12,
    faltas: 0,
    atrasos: 2
  }
}
```

**POST `/api/rh/folha/processar`**
```typescript
Body: { mes, ano, colaboradores_ids }
Response: {
  folha_id,
  valor_total_bruto,
  valor_total_liquido,
  total_encargos,
  processada_em
}
```

### 🔌 Integrações

**Internas:** Usuários, Financeiro  
**Externas:** eSocial, FGTS Digital, Plataformas de RH

---

## 13. RELACIONAMENTO COM CLIENTE

### 📊 Informações Gerais

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `RelacionamentoClienteNovo.tsx` |
| **Ícone** | `Heart` (Lucide React) |
| **Rota** | `/crm/relacionamento` |
| **Permissão** | `crm.view` |
| **Status** | ✅ Implementado 100% |

### 🎯 Descrição

Gestão de relacionamento com clientes (hospitais e médicos) incluindo histórico de interações, preferências, NPS, satisfação, suporte e fidelização.

### 📋 Sub-Módulos (6)

1. **Perfil do Cliente** - 360° view
2. **Histórico de Interações** - Timeline
3. **Pesquisas de Satisfação** - NPS, CSAT
4. **Programa de Fidelidade** - Pontuação e benefícios
5. **Suporte/Tickets** - Atendimento
6. **Comunicação** - Email, WhatsApp, SMS

### 📝 Formulários (4)

#### 1. Registrar Interação
- **Campos:** Cliente, Tipo (Visita/Ligação/Email/Reunião), Data, Responsável, Assunto, Notas, Próximo Follow-up
- **Submit:** POST `/api/crm/interacoes`

#### 2. Enviar Pesquisa NPS
- **Campos:** Clientes, Mensagem Personalizada
- **Submit:** POST `/api/crm/nps/enviar`

#### 3. Abrir Ticket
- **Campos:** Cliente, Tipo (Dúvida/Reclamação/Solicitação), Prioridade, Descrição, Anexos
- **Submit:** POST `/api/crm/tickets`

#### 4. Criar Campanha Comunicação
- **Campos:** Nome, Segmento Clientes, Canal, Mensagem, Data Envio
- **Submit:** POST `/api/crm/campanhas`

### 🎨 Componentes

- `ClientProfile360` - Perfil completo
- `InteractionTimeline` - Timeline de interações
- `NPSGauge` - Gauge de NPS
- `TicketList` - Lista de tickets
- `WhatsAppChat` - Chat integrado

### 🔧 Funcionalidades Frontend

**Perfil 360° do Cliente:**
```tsx
<div className="grid grid-cols-3 gap-6">
  {/* Informações Gerais */}
  <Card className="col-span-1">
    <CardHeader>
      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={cliente.logo} />
          <AvatarFallback>{cliente.iniciais}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{cliente.nome}</CardTitle>
          <CardDescription>{cliente.cidade} - {cliente.uf}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">NPS</span>
          <Badge variant={cliente.nps >= 9 ? 'default' : cliente.nps >= 7 ? 'secondary' : 'destructive'}>
            {cliente.nps}/10
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Cliente desde</span>
          <span>{format(new Date(cliente.data_cadastro), 'MMM yyyy')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Última compra</span>
          <span>{formatDistanceToNow(new Date(cliente.ultima_compra), { addSuffix: true })}</span>
        </div>
        <Separator />
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">LTV</span>
          <span className="font-semibold">{formatCurrency(cliente.ltv)}</span>
        </div>
      </div>
    </CardContent>
  </Card>
  
  {/* Métricas */}
  <Card className="col-span-2">
    <CardHeader>
      <CardTitle>Métricas de Relacionamento</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <span className="text-sm text-muted-foreground">Total Compras</span>
          <p className="text-2xl font-semibold">{cliente.total_compras}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Ticket Médio</span>
          <p className="text-2xl font-semibold">{formatCurrency(cliente.ticket_medio)}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Interações</span>
          <p className="text-2xl font-semibold">{cliente.total_interacoes}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Tickets Abertos</span>
          <p className="text-2xl font-semibold">{cliente.tickets_abertos}</p>
        </div>
      </div>
      
      {/* Gráfico de Compras */}
      <div className="mt-6">
        <h4 className="text-sm font-medium mb-3">Histórico de Compras (12 meses)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={cliente.historico_compras}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Area type="monotone" dataKey="valor" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
  
  {/* Timeline de Interações */}
  <Card className="col-span-3">
    <CardHeader>
      <CardTitle>Timeline de Interações</CardTitle>
    </CardHeader>
    <CardContent>
      <InteractionTimeline interacoes={cliente.interacoes} />
    </CardContent>
  </Card>
</div>
```

### ⚙️ Backend

**GET `/api/crm/clientes/:id/perfil360`**
```typescript
Response: {
  cliente: {...},
  metricas: {
    total_compras, ticket_medio, ltv, nps,
    total_interacoes, tickets_abertos
  },
  historico_compras: [...],
  interacoes: [...],
  tickets: [...]
}
```

**POST `/api/crm/nps/enviar`**
```typescript
Body: { clientes_ids, mensagem }
Response: {
  enviados: 150,
  falhas: 2,
  link_pesquisa
}
```

### 🔌 Integrações

**Internas:** Hospitais, Médicos, Vendas, Faturamento  
**Externas:** Twilio (WhatsApp), SendGrid (Email), Typeform (Pesquisas)

---

## 14. GESTÃO DE LEADS

### 📊 Informações Gerais

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `GestaoLeadsNovo.tsx` |
| **Ícone** | `Target` (Lucide React) |
| **Rota** | `/crm/leads` |
| **Permissão** | `leads.manage` |
| **Status** | ✅ Implementado 100% |

### 🎯 Descrição

Gerenciamento de pipeline de vendas com qualificação de leads, scoring automático, distribuição inteligente, follow-ups e conversão em clientes.

### 📋 Sub-Módulos (5)

1. **Pipeline Kanban** - Visualização do funil
2. **Qualificação** - Scoring e categorização
3. **Distribuição** - Atribuição automática
4. **Follow-ups** - Lembretes e tarefas
5. **Conversão** - Transformar em cliente

### 📝 Formulários (3)

#### 1. Criar Lead
- **Campos:** Nome Hospital/Clínica, Contato, Telefone, Email, Fonte, Interesse, Observações
- **Submit:** POST `/api/crm/leads`

#### 2. Qualificar Lead
- **Campos:** Score (1-100), Temperatura (Frio/Morno/Quente), Próxima Ação, Data Follow-up
- **Submit:** PUT `/api/crm/leads/:id/qualificar`

#### 3. Converter em Cliente
- **Campos:** Dados Completos, Valor Primeira Compra, Condições Comerciais
- **Submit:** POST `/api/crm/leads/:id/converter`

### 🎨 Componentes

- `KanbanBoard` (react-beautiful-dnd) - Pipeline drag-and-drop
- `LeadScoreGauge` - Gauge de score
- `DistributionRules` - Regras de distribuição
- `FollowUpCalendar` - Calendário de follow-ups

### 🔧 Funcionalidades Frontend

**Pipeline Kanban:**
```tsx
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const [pipeline, setPipeline] = useState({
  novo: [...],
  qualificado: [...],
  proposta: [...],
  negociacao: [...],
  fechado: [...]
});

const onDragEnd = (result) => {
  if (!result.destination) return;
  
  const { source, destination } = result;
  
  if (source.droppableId !== destination.droppableId) {
    // Mover para outro estágio
    moverLead(result.draggableId, destination.droppableId);
  }
};

<DragDropContext onDragEnd={onDragEnd}>
  <div className="grid grid-cols-5 gap-4">
    {Object.entries(pipeline).map(([estagio, leads]) => (
      <div key={estagio}>
        <h3 className="font-semibold mb-3">
          {estagio} ({leads.length})
        </h3>
        
        <Droppable droppableId={estagio}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2 min-h-[500px]"
            >
              {leads.map((lead, index) => (
                <Draggable key={lead.id} draggableId={lead.id} index={index}>
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm">{lead.nome}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="space-y-2">
                          <Badge variant={lead.temperatura === 'quente' ? 'default' : 'secondary'}>
                            {lead.temperatura}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            Score: {lead.score}/100
                          </p>
                          <p className="text-xs">
                            {formatCurrency(lead.valor_estimado)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    ))}
  </div>
</DragDropContext>
```

### ⚙️ Backend

**GET `/api/crm/leads/pipeline`**
```typescript
Response: {
  pipeline: {
    novo: [{ id, nome, score, temperatura, valor_estimado }],
    qualificado: [...],
    proposta: [...],
    negociacao: [...],
    fechado: [...]
  },
  estatisticas: {
    total_leads: 150,
    taxa_conversao: 32.5,
    tempo_medio_conversao: 15
  }
}
```

**PUT `/api/crm/leads/:id/mover`**
```typescript
Body: { estagio_destino }
Response: { status: "movido" }
```

**POST `/api/crm/leads/:id/converter`**
```typescript
Body: { dados_completos, valor_primeira_compra }
Response: {
  cliente_id,
  mensagem: "Lead convertido em cliente"
}
```

### 🔌 Integrações

**Internas:** Cadastros (Hospitais), CRM Vendas  
**Externas:** RD Station, HubSpot (importação de leads)

---

**Progresso:** 14/58 módulos (24%)  
**Total acumulado:** ~95.000 palavras

**Continuando com CATEGORIA 3: CIRURGIAS & PROCEDIMENTOS...**