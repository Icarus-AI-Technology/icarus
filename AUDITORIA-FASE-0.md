# Auditoria Fase 0 - ICARUS v5.0

**Data:** 2025-01-27
**Objetivo:** Mapear estado atual do Supabase e Frontend para implementação dos 58 módulos

---

## 1. Auditoria Supabase Schema

### 1.1 Migrations Existentes (19 arquivos)
- `001_icarus_core_schema.sql` - Schema original (inglês)
- `001_icarus_core_schema_ptbr.sql` - Schema PT-BR com 12 tabelas
- `002_rls_policies.sql` - Políticas RLS
- `003_seed_data.sql` - Dados seed
- `004_refactor_ptbr.sql` - Refatoração PT-BR
- `004_rename_tables_ptbr.sql` - Renomeação de tabelas
- `005_create_leads_table.sql` - Tabela leads
- `005_rls_policies_ptbr.sql` - RLS PT-BR
- `006_seed_data_ptbr.sql` - Seed PT-BR
- `007_create_ai_tables.sql` - Tabelas IA
- `007_lgpd_compliance_cirurgias.sql` - Compliance LGPD
- `008_fix_rls_policies_cargo.sql` - Fix RLS cargo
- `009_add_soft_delete.sql` - Soft delete
- `20241127_anvisa_infosimples.sql` - Integração ANVISA
- `20241127_cfm_audit_complete.sql` - Auditoria CFM
- `20241127_langchain_pgvector.sql` - LangChain + pgvector
- `20250117000000_schema_inicial.sql` - Schema inicial consolidado
- `20250117000001_politicas_rls.sql` - Políticas RLS consolidadas
- `20251126_icarus_brain_results.sql` - Resultados IcarusBrain

### 1.2 Tabelas Principais Identificadas (20250117000000_schema_inicial.sql)

#### Core Multi-Tenancy
- `empresas` - Empresas distribuidoras OPME
- `usuarios` - Usuários do sistema
- `perfis` (mencionado em 001_icarus_core_schema_ptbr.sql) - Perfis de usuários

#### Produtos
- `categorias` - Categorias de produtos
- `fornecedores` - Fornecedores de OPME
- `produtos` - Catálogo de produtos OPME

#### Clientes
- `clientes` - Hospitais, clínicas, médicos

#### Cirurgias
- `cirurgias` - Cirurgias agendadas/realizadas
- `cirurgias_produtos` - Produtos usados em cirurgias

#### Financeiro
- `contas_receber` - Contas a receber
- `contas_pagar` - Contas a pagar

#### Estoque
- `movimentacoes_estoque` - Histórico de movimentações

#### IA & Analytics
- `icarus_previsoes` - Previsões do IcarusBrain
- `icarus_registros` - Logs de auditoria

#### Tabelas Adicionais (de outras migrations)
- `leads` - Gestão de leads (005_create_leads_table.sql)
- `opme_produtos` - Produtos OPME com embeddings pgvector (20241127_langchain_pgvector.sql)
- `estoque_lotes` - Lotes de estoque (20241127_langchain_pgvector.sql)
- `audit_logs` - Logs de auditoria 21 CFR Part 11 (20241127_langchain_pgvector.sql)
- `medicos` - Médicos com cache CFM (20241127_cfm_audit_complete.sql)
- `cfm_validacoes_log` - Log de validações CFM (20241127_cfm_audit_complete.sql)

### 1.3 Enums Definidos
- `papel_usuario` - admin, gerente, usuario, visualizador
- `plano_empresa` - inicial, profissional, empresarial
- `tipo_produto` - OPME, Consignado, Compra
- `tipo_cliente` - hospital, clinica, medico
- `status_cirurgia` - agendada, confirmada, realizada, cancelada
- `status_financeiro` - pendente, pago, vencido, cancelado
- `tipo_movimentacao` - entrada, saida, ajuste, transferencia

### 1.4 Functions/Triggers Principais
- `atualizar_timestamp_atualizacao()` - Atualiza `updated_at`
- `obter_estatisticas_dashboard(UUID)` - Estatísticas consolidadas para dashboard
- `calcular_valor_estoque(UUID)` - Valor total do estoque
- `atualizar_estoque_produto()` - Atualiza estoque após movimentação
- `calcular_margem_lucro()` - Calcula margem de lucro de produtos

---

## 2. Auditoria Frontend

### 2.1 Módulos Implementados (23 arquivos em src/components/modules/)
1. `Dashboard.tsx` ✅
2. `AuditorChecklistIntegrations.tsx` ✅
3. `Cadastros.tsx` ✅
4. `Cirurgias.tsx` ✅
5. `ComplianceAuditoria.tsx` ✅
6. `Compras.tsx` ✅
7. `ConfiguracoesSystem.tsx` ✅
8. `ConformidadeDashboard.tsx` ✅
9. `ContasReceber.tsx` ✅
10. `CRMVendas.tsx` ✅
11. `EstoqueIA.tsx` ✅
12. `FaturamentoNFe.tsx` ✅
13. `Financeiro.tsx` ✅
14. `IACentral.tsx` ✅
15. `IntegrationsDashboard.tsx` ✅
16. `Inventario.tsx` ✅
17. `KPIDashboard.tsx` ✅
18. `Licitacoes.tsx` ✅
19. `ModulePlaceholder.tsx` ✅
20. `NFEUploader.tsx` ✅
21. `ProdutoCard.tsx` ✅
22. `ProdutosOPME.tsx` ✅
23. `TabelaPrecos.tsx` ✅

### 2.2 Navegação Atual (navigation.ts)
**10 Categorias, 68 rotas totais:**

1. **Principal** (1 rota) - Dashboard implementado
2. **Cadastros & Gestão** (8 rotas) - 1 implementado (Cadastros)
3. **Core Business** (9 rotas) - 9 implementados ✅
4. **Compras & Fornecedores** (6 rotas) - 2 implementados (Compras, Licitações)
5. **Operações & Logística** (7 rotas) - 0 implementados
6. **Analytics & BI** (7 rotas) - 0 implementados
7. **Marketing & Vendas** (3 rotas) - 0 implementados
8. **Automação & IA** (6 rotas) - 0 implementados
9. **Integrações** (11 rotas) - 2 implementados (IntegrationsDashboard, AuditorChecklistIntegrations)
10. **Dev Tools** (2 rotas) - 2 implementados (Showcase, Contato)

**Total Implementado: 17/68 rotas (25%)**

### 2.3 Análise de Cobertura
- **Módulos no filesystem:** 23 arquivos
- **Rotas na navegação:** 68 rotas
- **Implementados:** 17 rotas (25%)
- **A implementar:** 51 rotas (75%)

---

## 3. Gaps Identificados

### 3.1 Tabelas Supabase Necessárias (Documentação vs Atual)

#### Faltam criar:
- `hospitais` - Cadastro de hospitais
- `medicos_especialistas` - Médicos especialistas (separado de clientes)
- `pacientes` - Pacientes
- `convenios` - Convênios médicos
- `tabelas_precos` - Tabelas de preços
- `itens_tabela_preco` - Itens de tabelas de preços
- `cotacoes` - Cotações de compras
- `pedidos_compra` - Pedidos de compra
- `notas_compra` - Notas de compra
- `oportunidades` - Oportunidades de venda (CRM)
- `propostas` - Propostas comerciais
- `contratos` - Contratos
- `kits_consignados` - Kits de consignação
- `licitacoes` - Licitações públicas
- `campanhas_marketing` - Campanhas de marketing
- `transportadoras` - Transportadoras
- `telemetria_iot` - Dados de telemetria IoT
- `workflows` - Workflows de automação
- `webhooks` - Webhooks configurados
- `api_logs` - Logs de API

### 3.2 Módulos a Implementar (51 rotas)

#### Cadastros & Gestão (7 faltam)
- Contratos
- Contábil
- RH & Pessoas
- Usuários
- Configurações (existe ConfiguracoesSystem.tsx mas não está mapeado)
- Relatórios Financeiros
- Hospitais

#### Compras & Fornecedores (4 faltam)
- Notas de Compra
- Compras Internacionais
- Viabilidade Importação
- Grupos de Produtos

#### Operações & Logística (7 faltam)
- Logística
- Transportadoras
- Consignação
- Rastreabilidade
- Manutenção
- Qualidade
- Compliance

#### Analytics & BI (7 faltam)
- Analytics BI
- Predição
- KPI Dashboard (existe mas não está mapeado)
- BI Interativo
- Relatórios Executivos
- Relatórios Regulatórios
- System Health

#### Marketing & Vendas (3 faltam)
- Leads
- Campanhas
- Relacionamento

#### Automação & IA (6 faltam)
- IA Central (existe IACentral.tsx mas não está mapeado)
- Automação
- Notificações Inteligentes
- Chatbot Metrics
- Tooltip Analytics
- Voice Analytics

#### Integrações (9 faltam)
- API Gateway
- Integrações
- Integrations Manager
- Telemetria IoT
- Voice Biometrics
- Voice Macros
- Video Calls
- Workflow Builder
- Fabricantes

---

## 4. Duplicatas Identificadas

### 4.1 Schemas Duplicados
- `001_icarus_core_schema.sql` (inglês) vs `001_icarus_core_schema_ptbr.sql` (PT-BR)
- `002_rls_policies.sql` vs `005_rls_policies_ptbr.sql`
- `003_seed_data.sql` vs `006_seed_data_ptbr.sql`
- `004_refactor_ptbr.sql` vs `004_rename_tables_ptbr.sql`

**Ação:** Consolidar em um único schema principal PT-BR.

### 4.2 Tabelas Possivelmente Duplicadas
- `produtos` (20250117000000) vs `opme_produtos` (20241127_langchain_pgvector)
- `icarus_registros` (20250117000000) vs `audit_logs` (20241127_langchain_pgvector)

**Ação:** Verificar se `opme_produtos` é extensão ou substituição de `produtos`.

---

## 5. Recomendações Fase 0

### 5.1 Limpeza Supabase
- [ ] Consolidar schemas duplicados em um único arquivo
- [ ] Remover migrations obsoletas ou conflitantes
- [ ] Criar migration `20250127_consolidacao_schema.sql` com schema completo
- [ ] Verificar/unificar tabelas `produtos` vs `opme_produtos`

### 5.2 Limpeza Frontend
- [x] Manter apenas `Dashboard.tsx` e `ModulePlaceholder.tsx`
- [x] Arquivar módulos existentes em `/archive/modules-v5.0/`
- [ ] Limpar `moduleRoutes.tsx` para conter apenas Dashboard
- [ ] Limpar `navigation.ts` para conter estrutura base dos 58 módulos

### 5.3 Estrutura Base
- [ ] Criar template padrão de módulo Dark Glass Medical
- [ ] Criar hooks base: `useModule`, `useCRUD`, `useFilters`
- [ ] Configurar React Query patterns consistentes

---

## 6. Ordem de Implementação (Resumo do Plano)

1. **Fase 1:** Dashboard + Navegação (Semana 1)
2. **Fase 2:** Cadastros & Gestão (8 módulos) (Semana 2)
3. **Fase 3:** Cirurgias & Estoque (9 módulos) (Semana 3)
4. **Fase 4:** Compras/Vendas/Financeiro (16 módulos) (Semana 4)
5. **Fase 5:** Compliance/IA/Sistema (19 módulos) (Semana 5)
6. **Fase 6:** Analytics (5 módulos) + Testes E2E (Semana 6)
7. **Fase 7:** Documentação + Deploy (Semana 7)

---

**Status:** Auditoria Concluída ✅
**Próximo Passo:** Fase 0.2 - Limpeza Frontend

