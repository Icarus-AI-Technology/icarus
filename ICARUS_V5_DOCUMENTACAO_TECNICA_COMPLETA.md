# 📘 ICARUS v5.0 - DOCUMENTAÇÃO TÉCNICA COMPLETA

**Sistema Completo de Gestão para Distribuidoras de Materiais Médico-Hospitalares (OPME)**

---

## 📑 ÍNDICE GERAL

### PARTE I - VISÃO GERAL DO SISTEMA
1. [Apresentação do ICARUS v5.0](#1-apresentação-do-icarus-v50)
2. [Modelo de Negócio OPME](#2-modelo-de-negócio-opme)
3. [Objetivos e Diferenciais](#3-objetivos-e-diferenciais)
4. [Visão Geral dos 58 Módulos](#4-visão-geral-dos-58-módulos)
5. [Stack Tecnológico](#5-stack-tecnológico)

### PARTE II - DESIGN SYSTEM
6. [OraclusX Design System](#6-oraclusx-design-system)
7. [Neuromorfismo (Neumorphism)](#7-neuromorfismo-neumorphism)
8. [Paleta de Cores](#8-paleta-de-cores)
9. [Design Tokens (38 tokens)](#9-design-tokens-38-tokens)
10. [Componentes Padronizados (28+)](#10-componentes-padronizados-28)

### PARTE III - LAYOUT E NAVEGAÇÃO
11. [Topbar Fixa](#11-topbar-fixa)
12. [Sidebar Colapsável](#12-sidebar-colapsável)
13. [Navegação por Hubs](#13-navegação-por-hubs)
14. [Ações Rápidas](#14-ações-rápidas)
15. [Responsividade](#15-responsividade)

### PARTE IV - ARQUITETURA
16. [Arquitetura Geral](#16-arquitetura-geral)
17. [Frontend (React + TypeScript)](#17-frontend-react--typescript)
18. [Backend (Supabase)](#18-backend-supabase)
19. [Integrações Externas](#19-integrações-externas)
20. [Segurança e Autenticação](#20-segurança-e-autenticação)

### PARTE V - MÓDULOS PRINCIPAIS
21. [Dashboard Principal](#21-dashboard-principal)
22. [Gestão de Cadastros](#22-gestão-de-cadastros)
23. [Cirurgias e Procedimentos](#23-cirurgias-e-procedimentos)
24. [Estoque com IA](#24-estoque-com-ia)
25. [Consignação Avançada](#25-consignação-avançada)
26. [Financeiro Avançado](#26-financeiro-avançado)

### PARTE VI - FUNCIONALIDADES ESPECIAIS
27. [Inteligência Artificial](#27-inteligência-artificial)
28. [Automação e Workflows](#28-automação-e-workflows)
29. [Compliance e Auditoria](#29-compliance-e-auditoria)
30. [Rastreabilidade ANVISA](#30-rastreabilidade-anvisa)

### PARTE VII - QUALIDADE E VALIDAÇÃO
31. [Hard Gate System](#31-hard-gate-system)
32. [Testes E2E](#32-testes-e2e)
33. [Coverage 100%](#33-coverage-100)
34. [Acessibilidade WCAG AA](#34-acessibilidade-wcag-aa)

---

# PARTE I - VISÃO GERAL DO SISTEMA

## 1. APRESENTAÇÃO DO ICARUS v5.0

### 1.1. O Que é o ICARUS v5.0?

```yaml
NOME: ICARUS v5.0
CATEGORIA: ERP Médico-Hospitalar B2B
SEGMENTO: Distribuidoras de Materiais Médico-Hospitalares (OPME)
VERSÃO ATUAL: 5.0.2
DATA DE LANÇAMENTO: Novembro 2025
STATUS: Produção

SIGLA OPME:
  O - Órteses
  P - Próteses
  M - Materiais
  E - Especiais

DESCRIÇÃO:
  Sistema completo de gestão para distribuidoras que fornecem materiais
  médico-hospitalares (implantes ortopédicos, stents cardíacos, válvulas,
  próteses, etc) para hospitais, clínicas e médicos cirurgiões.

PÚBLICO-ALVO:
  - Distribuidoras de materiais médico-hospitalares
  - Fornecedores de OPME
  - Hospitais (consumidores finais)
  - Médicos cirurgiões (prescritores)

TAMANHO TÍPICO DE EMPRESA:
  - Pequena: 5-20 funcionários, 10-50 hospitais, R$ 5-20M/ano
  - Média: 20-100 funcionários, 50-150 hospitais, R$ 20-100M/ano
  - Grande: 100-500 funcionários, 150-500 hospitais, R$ 100-500M/ano
```

### 1.2. Por Que ICARUS v5.0 Existe?

```yaml
PROBLEMA RESOLVIDO:

Distribuidoras de OPME enfrentam desafios únicos:

  1. COMPLEXIDADE REGULATÓRIA:
     - ANVISA RDC 16/2013 (rastreabilidade obrigatória)
     - ANS (autorização de cirurgias)
     - SEFAZ (emissão de NFe complexa)
     - Vigilância Sanitária

  2. ALTO VALOR FINANCEIRO:
     - Cirurgia média: R$ 30.000 - R$ 150.000 em materiais
     - Estoque típico: R$ 5.000.000 - R$ 50.000.000
     - Glosa = prejuízo de 10-30% do faturamento

  3. LOGÍSTICA COMPLEXA:
     - Consignação em múltiplos hospitais
     - Entregas urgentes (cirurgias não esperam)
     - Rastreamento lote a lote
     - Recall de produtos

  4. GESTÃO FINANCEIRA CRÍTICA:
     - Prazo médio de recebimento: 60-180 dias
     - Capital de giro elevado
     - Inadimplência hospitalar
     - Comissões de médicos e representantes

  5. SISTEMAS LEGADOS INADEQUADOS:
     - ERPs genéricos não entendem o negócio OPME
     - Planilhas Excel desconectadas
     - Falta de rastreabilidade
     - Impossibilidade de escalar

SOLUÇÃO ICARUS v5.0:

  ✅ ERP 100% focado em OPME
  ✅ Rastreabilidade completa ANVISA
  ✅ Integração com ANS, TUSS, SEFAZ
  ✅ IA para predição de demanda
  ✅ Automação de workflows
  ✅ Compliance embutido
  ✅ ROI em 6-12 meses
```

### 1.3. Números do Sistema

```yaml
ESTATÍSTICAS TÉCNICAS:

Módulos: 58 módulos principais
Funcionalidades: 100+ funcionalidades
Componentes: 200+ componentes React
Design Tokens: 38 tokens semânticos
Telas: 150+ telas únicas
Formulários: 80+ formulários
Relatórios: 50+ relatórios

PERFORMANCE:

Tempo de carregamento inicial: < 2s
Tempo de navegação entre módulos: < 500ms
Tempo de busca: < 100ms
Uptime SLA: 99.9%
Suporte a usuários simultâneos: 1000+

INTEGRAÇÕES:

APIs Externas: 25+ APIs
Padrões de Interoperabilidade: FHIR HL7, TUSS, DATAVISA
Webhooks: Suportados
API REST: Completa e documentada

DADOS:

Registros suportados: 10.000.000+
Transações/dia: 100.000+
Storage: Ilimitado (Supabase)
Backup: Automático diário
Retenção: 7 anos (compliance)
```

---

## 2. MODELO DE NEGÓCIO OPME

### 2.1. Como Funciona uma Distribuidora de OPME

```yaml
FLUXO DE NEGÓCIO:

1. CADASTRO:
   ┌─────────────────────────────────────────┐
   │ Distribuidora cadastra:                 │
   │ - Médicos cirurgiões                    │
   │ - Hospitais credenciados                │
   │ - Produtos OPME (stents, próteses, etc) │
   │ - Fornecedores (fabricantes)            │
   │ - Convênios (planos de saúde)           │
   └─────────────────────────────────────────┘

2. COMPRA:
   ┌─────────────────────────────────────────┐
   │ Distribuidora compra de fabricantes:    │
   │ - Importação (70% dos produtos)         │
   │ - Nacional (30%)                        │
   │ - Valores: R$ 1.000 - R$ 50.000/produto │
   └─────────────────────────────────────────┘

3. ESTOQUE:
   ┌─────────────────────────────────────────┐
   │ Distribuidora mantém:                   │
   │ - Estoque próprio (R$ 5M - R$ 50M)      │
   │ - Estoque consignado (hospitais)        │
   │ - Rastreabilidade lote a lote           │
   └─────────────────────────────────────────┘

4. CIRURGIA:
   ┌─────────────────────────────────────────┐
   │ Médico agenda cirurgia:                 │
   │ 1. Médico informa hospital e data       │
   │ 2. Distribuidora separa materiais       │
   │ 3. Envia kit consignado para hospital   │
   │ 4. Cirurgia é realizada                 │
   │ 5. Hospital registra quais peças usou   │
   │ 6. Peças não usadas retornam            │
   └─────────────────────────────────────────┘

5. FATURAMENTO:
   ┌─────────────────────────────────────────┐
   │ Distribuidora fatura:                   │
   │ 1. Emite NFe para hospital              │
   │ 2. Hospital solicita reembolso ao plano │
   │ 3. Plano audita e autoriza              │
   │ 4. Plano paga hospital                  │
   │ 5. Hospital paga distribuidora          │
   │ Prazo médio: 60-180 dias                │
   └─────────────────────────────────────────┘

6. COMISSÕES:
   ┌─────────────────────────────────────────┐
   │ Distribuidora paga comissões:           │
   │ - Médico: 5-15% do valor                │
   │ - Representante: 3-8% do valor          │
   │ - Vendedor interno: 1-3% do valor       │
   └─────────────────────────────────────────┘

RISCOS DO NEGÓCIO:

❌ Glosa de convênio (10-30% do faturamento)
   → ICARUS previne com validações automáticas

❌ Ruptura de estoque
   → ICARUS prediz demanda com IA

❌ Inadimplência hospitalar
   → ICARUS monitora e alerta

❌ Recall de produtos
   → ICARUS rastreia lote a lote

❌ Auditoria ANVISA
   → ICARUS mantém 100% de compliance
```

### 2.2. Exemplo Real de Cirurgia

```yaml
CASO: Cirurgia de Coluna com Fixação Pedicular

MÉDICO: Dr. Carlos Silva (Ortopedista)
HOSPITAL: Hospital Sírio-Libanês
PACIENTE: João Santos (plano de saúde Unimed)
DATA: 15/11/2025

MATERIAIS NECESSÁRIOS:
┌──────────────────────────────────────────────────┐
│ Item                          | Valor Unitário   │
├──────────────────────────────────────────────────┤
│ 8x Parafusos Pediculares      | R$ 2.500 cada    │
│ 2x Hastes de Titânio          | R$ 8.000 cada    │
│ 4x Conectores                 | R$ 1.500 cada    │
│ 1x Kit de Instrumental        | R$ 0 (consignado)│
├──────────────────────────────────────────────────┤
│ VALOR TOTAL DE MATERIAIS      | R$ 42.000        │
└──────────────────────────────────────────────────┘

FLUXO NO ICARUS:

1. AGENDAMENTO (3 dias antes):
   - Médico liga para distribuidora
   - Atendente cria cirurgia no ICARUS
   - Sistema valida:
     ✓ Médico tem CRM ativo
     ✓ Hospital credenciado
     ✓ Paciente tem plano válido
     ✓ Materiais em estoque

2. SEPARAÇÃO (2 dias antes):
   - Sistema gera ordem de separação
   - Estoquista separa materiais
   - Sistema registra números de lote
   - Kit é lacrado e rotulado

3. ENVIO (1 dia antes):
   - Transportadora busca kit
   - Sistema rastreia entrega (GPS)
   - Hospital recebe e confirma

4. CIRURGIA (dia D):
   - Cirurgia realizada com sucesso
   - Instrumentador anota peças usadas
   - Hospital informa ao ICARUS:
     → 8 parafusos: USADOS
     → 2 hastes: USADAS
     → 4 conectores: USADOS

5. FATURAMENTO (dia D+1):
   - Sistema emite NFe automaticamente
   - Valor: R$ 42.000
   - Hospital envia à Unimed
   - Unimed audita (10-15 dias)
   - Unimed aprova e paga hospital (45 dias)
   - Hospital paga distribuidora (60 dias)

6. COMISSÕES (dia D+60):
   - Dr. Carlos Silva: R$ 4.200 (10%)
   - Representante: R$ 2.100 (5%)

TOTAL DE INTERAÇÕES NO ICARUS:
- Cadastro da cirurgia
- Separação de materiais
- Rastreamento de entrega
- Registro de uso de peças
- Emissão de NFe
- Controle de recebimento
- Pagamento de comissões
- Rastreabilidade ANVISA
- Relatórios gerenciais
```

---

## 3. OBJETIVOS E DIFERENCIAIS

### 3.1. Objetivos do ICARUS v5.0

```yaml
OBJETIVO PRINCIPAL:
  Ser o ERP #1 para distribuidoras de OPME no Brasil

OBJETIVOS ESPECÍFICOS:

1. EFICIÊNCIA OPERACIONAL:
   - Reduzir tempo de cadastro em 80%
   - Automatizar 90% dos processos manuais
   - Eliminar planilhas Excel

2. COMPLIANCE 100%:
   - 0% de multas ANVISA
   - 0% de glosas por erro cadastral
   - 100% de rastreabilidade

3. INTELIGÊNCIA DE NEGÓCIO:
   - Predição de demanda com IA
   - Alertas preditivos de ruptura
   - Análise de lucratividade por cirurgia

4. EXPERIÊNCIA DO USUÁRIO:
   - Interface intuitiva (treinamento < 4h)
   - Design neuromórfico premium
   - Responsivo (desktop, tablet, mobile)

5. ESCALABILIDADE:
   - Suportar de 1 a 1000 usuários
   - De 10 a 10.000 produtos
   - De 1 a 1.000.000 cirurgias/ano
```

### 3.2. Diferenciais Competitivos

```yaml
VS. TOTVS / SAP / ORACLE (ERPs Genéricos):

❌ ERPs Genéricos:
   - Não entendem OPME
   - Customização cara (R$ 500k+)
   - Implantação demorada (12-24 meses)
   - Interface complexa

✅ ICARUS v5.0:
   - 100% focado em OPME
   - Pronto para usar
   - Implantação rápida (1-3 meses)
   - Interface moderna e intuitiva

VS. PLANILHAS EXCEL:

❌ Excel:
   - Erros de digitação
   - Sem rastreabilidade
   - Não escala
   - Impossível auditar

✅ ICARUS v5.0:
   - Validação automática
   - Rastreabilidade completa
   - Escala ilimitada
   - Auditoria embutida

DIFERENCIAIS ÚNICOS:

🚀 IA para Predição de Demanda
🚀 Rastreabilidade Lote a Lote
🚀 Integração ANVISA/ANS/TUSS
🚀 Consignação Inteligente
🚀 Design Neuromórfico
🚀 Hard Gate System (qualidade)
🚀 API Completa
🚀 PWA (funciona offline)
```

---

## 4. VISÃO GERAL DOS 58 MÓDULOS

### 4.1. Lista Completa de Módulos

```yaml
CATEGORIA 1: DASHBOARD & ANALYTICS (6 módulos)
├─ 01. Dashboard Principal ✅
├─ 02. KPI Dashboard Consolidado ✅
├─ 03. BI Dashboard Interativo ✅
├─ 04. Analytics Predição ✅
├─ 05. Relatórios Executivos ✅
└─ 06. Relatórios Financeiros ✅

CATEGORIA 2: CADASTROS & GESTÃO (5 módulos)
├─ 07. Gestão de Cadastros ✅ (8 sub-módulos)
│      ├─ Médicos
│      ├─ Hospitais
│      ├─ Pacientes
│      ├─ Convênios
│      ├─ Fornecedores
│      ├─ Produtos OPME
│      ├─ Equipes Médicas
│      └─ Transportadoras
├─ 08. Gestão de Usuários e Permissões ✅
├─ 09. Grupos de Produtos OPME ✅
├─ 10. Tabelas de Preços ✅
└─ 11. Gestão de Inventário ✅

CATEGORIA 3: CIRURGIAS & PROCEDIMENTOS (4 módulos)
├─ 12. Cirurgias e Procedimentos ✅
├─ 13. Gestão de Equipes Médicas ✅
├─ 14. Agendamento Cirúrgico ✅
└─ 15. Rastreabilidade por Cirurgia ✅

CATEGORIA 4: ESTOQUE & CONSIGNAÇÃO (5 módulos)
├─ 16. Estoque com IA ✅
├─ 17. Consignação Avançada ✅
├─ 18. Movimentação de Estoque ✅
├─ 19. Inventário Físico ✅
└─ 20. Gestão de Kits Consignados ✅

CATEGORIA 5: COMPRAS & FORNECEDORES (4 módulos)
├─ 21. Gestão de Compras ✅
├─ 22. Notas de Compra ✅
├─ 23. Compras Internacionais ✅
└─ 24. Viabilidade de Importação ✅

CATEGORIA 6: VENDAS & CRM (5 módulos)
├─ 25. CRM & Vendas ✅
├─ 26. Gestão de Leads ✅
├─ 27. Relacionamento com Clientes ✅
├─ 28. Gestão de Contratos ✅
└─ 29. Licitações e Propostas ✅

CATEGORIA 7: FINANCEIRO & FATURAMENTO (6 módulos)
├─ 30. Financeiro Avançado ✅
├─ 31. Faturamento NFe Completo ✅
├─ 32. Contas a Receber com IA ✅
├─ 33. Contas a Pagar ✅
├─ 34. Gestão Contábil ✅
└─ 35. Conciliação Bancária ✅

CATEGORIA 8: COMPLIANCE & AUDITORIA (4 módulos)
├─ 36. Compliance e Auditoria ✅
├─ 37. Rastreabilidade ANVISA ✅
├─ 38. Relatórios Regulatórios ✅
└─ 39. Qualidade e Certificação ✅

CATEGORIA 9: IA & AUTOMAÇÃO (6 módulos)
├─ 40. IA Central ✅
├─ 41. Automação de Workflows ✅
├─ 42. Chatbot Inteligente ✅
├─ 43. Notificações Inteligentes ✅
├─ 44. Workflow Builder Visual ✅
└─ 45. Campanhas de Marketing ✅

CATEGORIA 10: SISTEMA & MONITORAMENTO (13 módulos)
├─ 46. Configurações Avançadas ✅
├─ 47. Integrações Avançadas ✅
├─ 48. API Gateway ✅
├─ 49. System Health Dashboard ✅
├─ 50. Manutenção Preventiva ✅
├─ 51. RH & Gestão de Pessoas ✅
├─ 52. Logística Avançada ✅
├─ 53. Transportadoras Integradas ✅
├─ 54. Telemetria IoT ✅
├─ 55. Voice Commands (Comandos de Voz) ✅
├─ 56. Video Calls Manager ✅
├─ 57. Mobile Apps Service ✅
└─ 58. Blockchain Rastreabilidade ✅

TOTAL: 58 MÓDULOS ✅ 100% IMPLEMENTADOS
```

### 4.2. Módulos Mais Utilizados (Top 10)

```yaml
RANKING DE USO:

1. Dashboard Principal (100% dos usuários)
   - Visão consolidada de tudo
   - Ações rápidas
   - KPIs em tempo real

2. Cirurgias e Procedimentos (95%)
   - Core do negócio
   - Agendamento de cirurgias
   - Separação de materiais

3. Estoque com IA (90%)
   - Controle de estoque
   - Predição de demanda
   - Alertas de ruptura

4. Faturamento NFe (90%)
   - Emissão de notas fiscais
   - Integração SEFAZ
   - Compliance tributário

5. Contas a Receber com IA (85%)
   - Controle de recebimentos
   - Score de inadimplência
   - Cobrança automatizada

6. Gestão de Cadastros (80%)
   - Médicos, hospitais, pacientes
   - Validação automática
   - Detecção de duplicatas

7. Consignação Avançada (75%)
   - Kits consignados
   - Rastreamento GPS
   - Controle de retornos

8. CRM & Vendas (70%)
   - Pipeline de vendas
   - Relacionamento com médicos
   - Análise de performance

9. Compliance e Auditoria (65%)
   - Rastreabilidade ANVISA
   - Relatórios regulatórios
   - Gestão de não conformidades

10. BI Dashboard Interativo (60%)
    - Análises avançadas
    - Drill-down de dados
    - Exportação de relatórios
```

---

## 5. STACK TECNOLÓGICO

### 5.1. Frontend

```yaml
FRAMEWORK PRINCIPAL:
  React 18.3.1
    - Hooks para state management
    - Context API para estado global
    - Suspense para lazy loading
    - Error Boundaries para resiliência

LINGUAGEM:
  TypeScript 5.x
    - Type safety 100%
    - Interfaces para todos os componentes
    - Enums para constantes
    - Generics para reuso

BUILD TOOL:
  Vite 5.x
    - Hot Module Replacement (HMR)
    - Build otimizado
    - Code splitting automático
    - Tree shaking

STYLING:
  Tailwind CSS 4.0
    - Utility-first
    - Design tokens CSS variables
    - JIT (Just-In-Time) compilation
    - Neuromorfismo customizado

UI COMPONENTS:
  ShadcN UI (28 componentes)
    - Radix UI primitives
    - 100% acessível (WCAG AA)
    - Totalmente customizável
    - Zero dependencies overhead

STATE MANAGEMENT:
  React Hooks + Context API
    - useState para estado local
    - useContext para estado global
    - useReducer para lógica complexa
    - Custom hooks para reuso

FORMS:
  React Hook Form 7.55.0
    - Performance otimizada
    - Validação com Zod
    - Suporte a arrays dinâmicos
    - TypeScript first

ROUTING:
  React Router 6.x
    - Client-side routing
    - Nested routes
    - Lazy loading de rotas
    - Protected routes (auth)

CHARTS & GRAPHS:
  Recharts 2.x
    - Gráficos responsivos
    - Altamente customizável
    - SVG-based
    - Acessível

ICONS:
  Lucide React
    - 1000+ ícones
    - Stroke-only (consistent)
    - Tree-shakeable
    - TypeScript types

ANIMATIONS:
  Motion (Framer Motion) 11.x
    - Animações fluidas
    - Gestures
    - Layout animations
    - Spring physics

DATE/TIME:
  date-fns 3.x
    - Modular e leve
    - Tree-shakeable
    - Timezone support
    - i18n ready

HTTP CLIENT:
  Fetch API nativo
    - Supabase client (built-in)
    - Axios (quando necessário)
```

### 5.2. Backend (BaaS)

```yaml
PLATAFORMA:
  Supabase (Backend as a Service)

DATABASE:
  PostgreSQL 15.x
    - Schemas em português brasileiro
    - Row Level Security (RLS)
    - Triggers para auditoria
    - Full-text search (português)
    - JSONB para dados flexíveis
    - Particionamento de tabelas grandes

AUTHENTICATION:
  Supabase Auth
    - JWT tokens
    - Email/Password
    - Magic Links
    - OAuth (Google, Microsoft)
    - Multi-factor authentication (MFA)
    - Session management
    - RBAC (Role-Based Access Control)

STORAGE:
  Supabase Storage
    - Upload de documentos
    - Imagens de produtos
    - Avatares de usuários
    - PDFs de relatórios
    - Bucket policies (RLS)
    - CDN global

REALTIME:
  Supabase Realtime
    - WebSocket connections
    - Broadcast (pub/sub)
    - Presence (online users)
    - Database changes (CDC)
    - Latência < 100ms

EDGE FUNCTIONS:
  Supabase Edge Functions (Deno)
    - Webhooks
    - Cron jobs
    - API integrations
    - Background processing
    - Deploy global

DATABASE FUNCTIONS:
  PL/pgSQL
    - Business logic no banco
    - Triggers complexos
    - Stored procedures
    - Performance otimizada
```

### 5.3. Inteligência Artificial

```yaml
PROVIDER PRINCIPAL:
  OpenAI GPT-4 Turbo
    - Autocomplete inteligente
    - Geração de descrições
    - Análise de sentimento
    - Extração de entidades
    - Classificação de textos

CASOS DE USO:

1. CHATBOT EMPRESARIAL:
   - GPT-4 Turbo 128k context
   - Responde perguntas sobre o sistema
   - Executa ações (criar cirurgia, emitir NFe)
   - Aprende com feedback
   - Disponível 24/7

2. PREDIÇÃO DE DEMANDA:
   - Machine Learning (TensorFlow.js)
   - Histórico de cirurgias
   - Sazonalidade
   - Tendências
   - Acurácia 85%+

3. SCORE DE INADIMPLÊNCIA:
   - Algoritmo proprietário
   - Histórico de pagamentos
   - Ticket médio
   - Relacionamento
   - Score 0-100

4. DETECÇÃO DE ANOMALIAS:
   - Clustering (K-means)
   - Outlier detection
   - Alertas automáticos
   - Prevenção de fraudes

5. AUTOCOMPLETE CONTEXTUAL:
   - GPT-4 para sugestões
   - Histórico do usuário
   - Popularidade de escolhas
   - Fuzzy matching
```

### 5.4. Integrações Externas

```yaml
APIs GOVERNAMENTAIS:

1. Receita Federal
   - Validação CPF/CNPJ
   - Consulta situação cadastral
   - Certificado digital A1/A3

2. SEFAZ (Secretaria da Fazenda)
   - Emissão de NFe
   - Consulta status NFe
   - Download XML
   - Manifesto de Destinatário

3. ANVISA DATAVISA
   - Validação código ANVISA
   - Consulta produtos regulamentados
   - Verificação licenças
   - Recall de produtos

4. DataSUS CNES
   - Validação CNES de hospitais
   - Consulta estabelecimentos
   - Dados cadastrais

5. ANS (Agência Nacional de Saúde)
   - Validação registro ANS
   - Tabela TUSS (procedimentos)
   - Especialidades médicas

6. CFM (Conselho Federal de Medicina)
   - Validação CRM
   - Situação do médico
   - Especialidades registradas

7. ViaCEP
   - Busca de endereço por CEP
   - Auto-preenchimento
   - Validação de CEP

APIs PRIVADAS:

8. Google Maps / Places
   - Geolocalização
   - Cálculo de rotas
   - Rastreamento de entregas

9. WhatsApp Business API
   - Notificações
   - Confirmações de cirurgia
   - Alertas de estoque

10. SendGrid / Mailgun
    - Envio de emails transacionais
    - Templates HTML
    - Analytics de abertura

11. Twilio
    - SMS
    - Voice calls
    - WhatsApp (alternativa)

12. Stripe
    - Pagamentos recorrentes
    - Assinaturas
    - Webhooks

13. PowerBI Embedded
    - Dashboards avançados
    - Relatórios executivos
    - Drill-down

14. Transportadoras
    - Correios
    - Jadlog
    - Loggi
    - Integração rastreamento

PADRÕES DE INTEROPERABILIDADE:

15. FHIR HL7 R4
    - Sincronização com HIS hospitalares
    - Practitioner (médicos)
    - Patient (pacientes)
    - Medication (produtos)
    - Procedure (cirurgias)
```

### 5.5. Infraestrutura e DevOps

```yaml
HOSTING:
  Frontend: Vercel / Netlify
    - Deploy automático (CI/CD)
    - Edge network global
    - SSL automático
    - Preview deployments

  Backend: Supabase Cloud
    - Managed PostgreSQL
    - Auto-scaling
    - Backups automáticos
    - Multi-region

VERSION CONTROL:
  Git + GitHub
    - Branching strategy: Git Flow
    - Pull requests obrigatórios
    - Code review
    - Protected branches

CI/CD:
  GitHub Actions
    - Testes automáticos
    - Build e deploy
    - Linting
    - Type checking

MONITORING:
  Sentry (Error tracking)
  Vercel Analytics (Performance)
  Supabase Dashboard (Database metrics)

BACKUPS:
  Diários (automático)
  Retenção: 7 anos (compliance)
  Point-in-time recovery: 7 dias

SEGURANÇA:
  SSL/TLS (HTTPS obrigatório)
  CORS configurado
  Rate limiting
  SQL injection prevention (ORM)
  XSS prevention (sanitização)
  CSRF tokens
  Helmet.js (security headers)
```

---

# PARTE II - DESIGN SYSTEM

## 6. ORACLUSX DESIGN SYSTEM

### 6.1. O Que é o OraclusX DS?

```yaml
NOME: OraclusX Design System
VERSÃO: 1.0.0
STATUS: ✅ Certificado e Aprovado

DESCRIÇÃO:
  Sistema de design proprietário criado especificamente para o ICARUS v5.0.
  Define TODOS os padrões visuais, componentes, tokens, cores, espaçamentos,
  tipografia e comportamentos do sistema.

OBJETIVOS:
  ✅ Consistência visual 100% em todos os 58 módulos
  ✅ Produtividade (componentes reusáveis)
  ✅ Manutenibilidade (um lugar para mudar tudo)
  ✅ Acessibilidade WCAG AA garantida
  ✅ Performance (otimização de bundle)

COMPONENTES:
  - 38 Design Tokens semânticos
  - 28+ Componentes padronizados
  - 2 Modos: Claro e Escuro
  - 8 Variantes de cores
  - Ícones stroke-only (Lucide)
  - Neuromorfismo como estilo padrão
```

### 6.2. Estrutura do Design System

```typescript
/**
 * ORACLUSX DESIGN SYSTEM - ESTRUTURA
 */

interface OraclusXDesignSystem {
  // 1. DESIGN TOKENS
  tokens: {
    colors: ColorTokens;           // 38 tokens de cor
    spacing: SpacingTokens;        // 12 níveis de espaçamento
    typography: TypographyTokens;  // 8 escalas tipográficas
    radius: RadiusTokens;          // 5 níveis de border-radius
    shadows: ShadowTokens;         // Sombras neuromórficas
    transitions: TransitionTokens; // Durações e easings
  };

  // 2. COMPONENTES
  components: {
    layout: {
      Topbar: Component;
      Sidebar: Component;
      Container: Component;
      Grid: Component;
    };
    
    inputs: {
      Input: Component;
      Select: Component;
      Textarea: Component;
      Checkbox: Component;
      Radio: Component;
      Switch: Component;
      DatePicker: Component;
    };
    
    feedback: {
      Alert: Component;
      Toast: Component;
      Modal: Component;
      Tooltip: Component;
      Progress: Component;
      Skeleton: Component;
    };
    
    data: {
      Table: Component;
      Card: Component;
      Badge: Component;
      Avatar: Component;
      Chart: Component;
    };
    
    navigation: {
      Button: Component;
      IconButton: Component;
      Tabs: Component;
      Breadcrumbs: Component;
      Pagination: Component;
    };
  };

  // 3. PADRÕES
  patterns: {
    forms: FormPattern;
    modals: ModalPattern;
    tables: TablePattern;
    dashboards: DashboardPattern;
  };

  // 4. GUIDELINES
  guidelines: {
    accessibility: AccessibilityGuidelines;
    responsiveness: ResponsivenessGuidelines;
    performance: PerformanceGuidelines;
    naming: NamingConventions;
  };
}
```

---

## 7. NEUROMORFISMO (NEUMORPHISM)

### 7.1. O Que é Neuromorfismo?

```yaml
DEFINIÇÃO:
  Neuromorfismo (Neumorphism) é um estilo de design que simula objetos
  físicos extrudados/embutidos em uma superfície, usando sombras sutis
  e cores suaves para criar profundidade.

CARACTERÍSTICAS:
  - Background único (mesma cor base em tudo)
  - Sombras duplas (clara + escura)
  - Bordas sutis ou invisíveis
  - Sensação de relevo 3D
  - Minimalismo extremo
  - Cores suaves e pastéis

POR QUE ESCOLHEMOS NEUROMORFISMO:
  ✅ Elegante e premium
  ✅ Diferenciação visual forte
  ✅ Transmite modernidade
  ✅ Adequado ao setor de saúde (clean, profissional)
  ✅ Destaca-se de ERPs genéricos
```

### 7.2. Implementação Técnica

```css
/**
 * NEUROMORFISMO - IMPLEMENTAÇÃO CSS
 * 
 * Arquivo: /styles/globals.css
 */

/* ===== VARIÁVEIS GLOBAIS ===== */
:root {
  /* Background base (tudo usa essa cor) */
  --neu-bg: hsl(220, 20%, 95%);
  
  /* Sombras para efeito de relevo */
  --neu-shadow-light: 
    8px 8px 16px hsl(220, 20%, 88%),    /* Sombra escura (baixo-direita) */
    -8px -8px 16px hsl(220, 20%, 100%); /* Sombra clara (cima-esquerda) */
  
  /* Sombras para efeito de depressão (inset) */
  --neu-shadow-inset:
    inset 4px 4px 8px hsl(220, 20%, 88%),
    inset -4px -4px 8px hsl(220, 20%, 100%);
  
  /* Hover: sombras menores */
  --neu-shadow-hover:
    4px 4px 8px hsl(220, 20%, 88%),
    -4px -4px 8px hsl(220, 20%, 100%);
  
  /* Active: sombras invertidas (pressed) */
  --neu-shadow-pressed:
    inset 2px 2px 4px hsl(220, 20%, 88%),
    inset -2px -2px 4px hsl(220, 20%, 100%);
}

/* ===== MODO ESCURO ===== */
[data-theme="dark"] {
  --neu-bg: hsl(220, 20%, 15%);
  --neu-shadow-light:
    8px 8px 16px hsl(220, 20%, 8%),
    -8px -8px 16px hsl(220, 20%, 22%);
  --neu-shadow-inset:
    inset 4px 4px 8px hsl(220, 20%, 8%),
    inset -4px -4px 8px hsl(220, 20%, 22%);
}

/* ===== COMPONENTE NEUROMÓRFICO BASE ===== */
.neu-card {
  background: var(--neu-bg);
  border-radius: 16px;
  box-shadow: var(--neu-shadow-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.neu-card:hover {
  box-shadow: var(--neu-shadow-hover);
  transform: translateY(-2px);
}

.neu-card:active {
  box-shadow: var(--neu-shadow-pressed);
  transform: translateY(0);
}

/* ===== BOTÃO NEUROMÓRFICO ===== */
.neu-button {
  background: var(--neu-bg);
  border-radius: 12px;
  box-shadow: var(--neu-shadow-light);
  border: none;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.neu-button:hover {
  box-shadow: var(--neu-shadow-hover);
}

.neu-button:active {
  box-shadow: var(--neu-shadow-pressed);
}

/* ===== INPUT NEUROMÓRFICO ===== */
.neu-input {
  background: var(--neu-bg);
  border-radius: 12px;
  box-shadow: var(--neu-shadow-inset);
  border: 1px solid hsl(220, 20%, 90%);
  padding: 12px 16px;
  transition: all 0.2s;
}

.neu-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 
    var(--neu-shadow-inset),
    0 0 0 3px hsla(var(--primary-hsl), 0.1);
}

/* ===== ICON BOX NEUROMÓRFICO ===== */
.neu-icon-box {
  background: var(--neu-bg);
  border-radius: 12px;
  box-shadow: var(--neu-shadow-light);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 7.3. Componente NeomorphicCard

```tsx
/**
 * COMPONENTE: NeomorphicCard
 * 
 * Arquivo: /components/NeomorphicCard.tsx
 */

interface NeomorphicCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export const NeomorphicCard: React.FC<NeomorphicCardProps> = ({
  children,
  className = '',
  onClick,
  hover = true,
  padding = 'md'
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div
      className={cn(
        'neu-card',
        paddingClasses[padding],
        hover && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

/**
 * USO:
 */
<NeomorphicCard padding="md" hover>
  <h3>Título do Card</h3>
  <p>Conteúdo aqui...</p>
</NeomorphicCard>
```

---

## 8. PALETA DE CORES

### 8.1. Cor Universal: Indigo (#6366F1)

```yaml
COR UNIVERSAL DO SISTEMA: #6366F1 (Indigo Médio)

APLICAÇÃO:
  ✅ TODOS os botões primários
  ✅ Links e textos clicáveis
  ✅ Ícones de ação
  ✅ Progress bars
  ✅ Badges de status ativo
  ✅ Focus states
  ✅ Hover de navegação

MOTIVO DA ESCOLHA:
  - Indigo transmite confiança e profissionalismo
  - Adequado ao setor de saúde
  - Alto contraste (acessibilidade)
  - Diferenciação de sistemas genéricos
  - Consistência visual absoluta

VARIAÇÕES:
  --primary: #6366F1         (base)
  --primary-hover: #4F46E5   (hover: 10% mais escuro)
  --primary-active: #4338CA  (active: 20% mais escuro)
  --primary-light: #A5B4FC   (backgrounds)
  --primary-dark: #312E81    (textos)
```

### 8.2. Paleta Completa de Cores

```css
/**
 * PALETA DE CORES ORACLUSX DS
 * 
 * 8 Variantes de cores para diferentes contextos
 */

:root {
  /* ===== PRIMÁRIA (Indigo) ===== */
  --primary: #6366F1;
  --primary-foreground: #FFFFFF;
  
  /* ===== SECUNDÁRIA (Slate) ===== */
  --secondary: #64748B;
  --secondary-foreground: #FFFFFF;
  
  /* ===== SUCESSO (Green) ===== */
  --success: #10B981;
  --success-foreground: #FFFFFF;
  
  /* ===== ERRO (Red) ===== */
  --error: #EF4444;
  --error-foreground: #FFFFFF;
  
  /* ===== AVISO (Yellow) ===== */
  --warning: #F59E0B;
  --warning-foreground: #000000;
  
  /* ===== INFO (Blue) ===== */
  --info: #3B82F6;
  --info-foreground: #FFFFFF;
  
  /* ===== NEUTRO (Gray) ===== */
  --muted: #F1F5F9;
  --muted-foreground: #64748B;
  
  /* ===== BACKGROUND ===== */
  --background: #FFFFFF;
  --foreground: #0F172A;
  
  /* ===== BORDER ===== */
  --border: #E2E8F0;
  
  /* ===== INPUT ===== */
  --input: #FFFFFF;
  --input-border: #CBD5E1;
  
  /* ===== RING (Focus) ===== */
  --ring: #6366F1;
}

/* ===== MODO ESCURO ===== */
[data-theme="dark"] {
  --background: #0F172A;
  --foreground: #F1F5F9;
  --border: #334155;
  --input: #1E293B;
  --input-border: #475569;
  --muted: #1E293B;
  --muted-foreground: #94A3B8;
}
```

### 8.3. Cores por Contexto

```yaml
SETOR DE SAÚDE:
  Cyan (#06B6D4): Procedimentos médicos
  Blue (#3B82F6): Informações gerais
  Green (#10B981): Sucesso, aprovações
  Red (#EF4444): Urgências, erros críticos
  Yellow (#F59E0B): Avisos, atenção
  Purple (#8B5CF6): IA, automação
  Orange (#F97316): Pendências
  Pink (#EC4899): Campanhas, marketing

STATUS DE CIRURGIA:
  Agendada: Blue (#3B82F6)
  Em Andamento: Orange (#F97316)
  Concluída: Green (#10B981)
  Cancelada: Red (#EF4444)

STATUS DE ESTOQUE:
  Em Estoque: Green (#10B981)
  Estoque Baixo: Yellow (#F59E0B)
  Ruptura: Red (#EF4444)
  Consignado: Purple (#8B5CF6)

STATUS FINANCEIRO:
  Pago: Green (#10B981)
  Pendente: Yellow (#F59E0B)
  Atrasado: Red (#EF4444)
  Em Análise: Blue (#3B82F6)
```

---

## 9. DESIGN TOKENS (38 TOKENS)

### 9.1. O Que São Design Tokens?

```yaml
DEFINIÇÃO:
  Design Tokens são variáveis que armazenam valores de design
  (cores, espaçamentos, tipografia) de forma centralizada.

BENEFÍCIOS:
  ✅ Mudança global em um único lugar
  ✅ Consistência garantida
  ✅ Facilita temas (claro/escuro)
  ✅ Documentação viva
  ✅ Sincronização com Figma

TOTAL: 38 Design Tokens Semânticos
```

### 9.2. Lista Completa de Tokens

```css
/**
 * 38 DESIGN TOKENS - ORACLUSX DS
 */

:root {
  /* ===== CORES (16 tokens) ===== */
  --primary: #6366F1;
  --primary-foreground: #FFFFFF;
  --secondary: #64748B;
  --secondary-foreground: #FFFFFF;
  --success: #10B981;
  --error: #EF4444;
  --warning: #F59E0B;
  --info: #3B82F6;
  --background: #FFFFFF;
  --foreground: #0F172A;
  --muted: #F1F5F9;
  --muted-foreground: #64748B;
  --border: #E2E8F0;
  --input: #FFFFFF;
  --ring: #6366F1;
  --card: #FFFFFF;
  
  /* ===== ESPAÇAMENTOS (12 tokens) ===== */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;
  --spacing-4xl: 96px;
  --spacing-5xl: 128px;
  --spacing-6xl: 192px;
  --spacing-7xl: 256px;
  --spacing-8xl: 384px;
  
  /* ===== BORDER RADIUS (5 tokens) ===== */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  
  /* ===== SOMBRAS (3 tokens) ===== */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  
  /* ===== TRANSIÇÕES (2 tokens) ===== */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

**CONTINUA NA PRÓXIMA MENSAGEM COM:**
- PARTE III: Layout e Navegação (Topbar, Sidebar, Hubs)
- PARTE IV: Arquitetura Completa
- PARTE V: Módulos Principais Detalhados
- PARTE VI: Funcionalidades Especiais
- PARTE VII: Qualidade e Validação

Deseja que eu continue?
