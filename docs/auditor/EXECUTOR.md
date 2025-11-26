# ICARUS Auditor - Guia de Execucao para Claude Code

> **Instrucoes passo a passo para executar auditoria completa**

---

## Comandos Rapidos

```bash
# Auditoria completa
@auditor full

# Por area especifica
@auditor frontend
@auditor backend
@auditor database
@auditor security
@auditor compliance
@auditor performance
@auditor ai
@auditor vercel
@auditor integrations

# Correcoes automaticas
@auditor fix rls
@auditor fix indexes
@auditor fix triggers

# Gerar relatorio
@auditor report
```

---

## Fluxo de Execucao Completa

### Passo 1: Preparacao

```markdown
Antes de iniciar a auditoria, o Claude Code deve:

1. Verificar se esta na raiz do projeto ICARUS
2. Verificar acesso ao Supabase (MCP conectado)
3. Verificar acesso ao Vercel (MCP conectado)
4. Carregar os checklists relevantes
```

### Passo 2: Auditoria Frontend

```markdown
## Checklist Frontend

Execute os seguintes comandos e verificacoes:

### 2.1 Estrutura de Pastas
- [ ] Verificar se src/components/ui existe
- [ ] Verificar se src/pages existe
- [ ] Verificar se src/hooks existe
- [ ] Verificar se src/stores existe
- [ ] Verificar se src/types existe

### 2.2 TypeScript
- Comando: `grep -r ": any" src/ | wc -l`
- Target: 0 ocorrencias de 'any'

- Verificar tsconfig.json:
  - strict: true
  - noImplicitAny: true
  - strictNullChecks: true

### 2.3 Dependencies
- Verificar package.json contem:
  - react
  - @tanstack/react-query
  - zustand
  - zod
  - react-hook-form

### 2.4 Build
- Comando: `npm run build`
- Verificar bundle size < 500KB gzipped
```

### Passo 3: Auditoria Backend

```markdown
## Checklist Backend (Edge Functions)

### 3.1 Listar Edge Functions
- Verificar pasta supabase/functions/
- Cada funcao deve ter:
  - index.ts
  - Error handling (try/catch)
  - CORS headers
  - Auth validation

### 3.2 Estrutura de Funcao
Verificar cada funcao contem:
- [ ] Import de cors
- [ ] Validacao de Authorization header
- [ ] Schema Zod para input
- [ ] Try/catch wrapper
- [ ] Response com status correto
```

### Passo 4: Auditoria Database

```markdown
## Checklist Database (Supabase)

### 4.1 Executar Script SQL
Copiar e executar: /supabase/auditor/AUDIT-SQL.sql

### 4.2 Verificacoes Criticas
Execute no SQL Editor:

-- RLS Status
SELECT * FROM audit_check_rls_status() WHERE status != 'OK';

-- Colunas Obrigatorias
SELECT * FROM audit_check_required_columns() WHERE status != 'OK';

-- Indices
SELECT * FROM audit_check_indexes() WHERE status != 'OK';

-- Auditoria Completa
SELECT audit_full_database_check();
```

### Passo 5: Auditoria Security

```markdown
## Checklist Security

### 5.1 Secrets
- Comando: `grep -rn "sk-" src/`
- Comando: `grep -rn "eyJhbGc" src/`
- Target: 0 resultados

### 5.2 .gitignore
- Verificar .env esta listado
- Verificar .env.local esta listado

### 5.3 RLS
- 100% das tabelas com RLS
- Nenhuma policy com USING (true)
```

### Passo 6: Auditoria Compliance

```markdown
## Checklist Compliance

### 6.1 ANVISA
SELECT * FROM audit_check_anvisa_compliance();

Verificar:
- [ ] Todos produtos com registro_anvisa
- [ ] Todos lotes com numero_lote
- [ ] Implantes com numero_serie
- [ ] Sem lotes vencidos disponiveis

### 6.2 LGPD
SELECT * FROM audit_check_lgpd_compliance();

Verificar:
- [ ] paciente_iniciais <= 5 caracteres
- [ ] Tabela de consentimentos existe
- [ ] Audit log implementado
- [ ] Funcoes de direitos do titular
```

### Passo 7: Auditoria Vercel

```markdown
## Checklist Vercel

### 7.1 Usando MCP Vercel
@tool Vercel:get_project

Verificar:
- [ ] Framework detectado corretamente
- [ ] Build command correto
- [ ] Output directory correto

### 7.2 Environment Variables
@tool Vercel:list_projects

Verificar:
- [ ] VITE_SUPABASE_URL configurada
- [ ] VITE_SUPABASE_ANON_KEY configurada
- [ ] Sem SERVICE_ROLE exposta no frontend

### 7.3 Deployment
@tool Vercel:list_deployments

Verificar:
- [ ] Ultimo deploy com sucesso
- [ ] SSL valido
- [ ] Domain configurado
```

### Passo 8: Auditoria AI

```markdown
## Checklist AI/Agents

### 8.1 Embeddings
SELECT COUNT(*) FROM ml_vectors;
SELECT * FROM pg_extension WHERE extname = 'vector';

### 8.2 Metricas
SELECT
  DATE(criado_em) as data,
  COUNT(*) as sessoes,
  SUM(tokens_total) as tokens,
  SUM(custo_estimado) as custo_usd
FROM chatbot_metricas
WHERE criado_em > NOW() - INTERVAL '7 days'
GROUP BY DATE(criado_em);
```

---

## Template de Relatorio

```markdown
# Relatorio de Auditoria ICARUS

**Data:** [DATA]
**Auditor:** Claude Code Agent
**Versao:** 6.0

---

## Resumo Executivo

| Metrica | Valor |
|---------|-------|
| **Score Geral** | XX/100 |
| **Nota** | A/B/C/D/F |
| **Status** | PASSED/WARNING/FAILED/CRITICAL |

---

## Scores por Area

| Area | Score | Issues | Status |
|------|-------|--------|--------|
| Frontend | XX/100 | X | OK/WARNING/CRITICAL |
| Backend | XX/100 | X | OK/WARNING/CRITICAL |
| Database | XX/100 | X | OK/WARNING/CRITICAL |
| Security | XX/100 | X | OK/WARNING/CRITICAL |
| Compliance | XX/100 | X | OK/WARNING/CRITICAL |
| Performance | XX/100 | X | OK/WARNING/CRITICAL |
| AI/Agents | XX/100 | X | OK/WARNING/CRITICAL |
| Vercel | XX/100 | X | OK/WARNING/CRITICAL |

---

## Issues Criticas

[Listar issues criticas encontradas]

---

## Issues de Alta Prioridade

[Listar issues HIGH]

---

## Plano de Acao

| # | Tarefa | Severidade | Prazo |
|---|--------|------------|-------|
| 1 | [Tarefa] | CRITICAL | Imediato |
| 2 | [Tarefa] | HIGH | 24h |
| 3 | [Tarefa] | MEDIUM | 1 semana |

---

## Itens em Conformidade

[Listar itens que passaram]

---

**Proxima auditoria recomendada:** 7 dias
```

---

## Exemplo de Execucao Completa

```markdown
Usuario: @auditor full

Claude Code:
1. Carrega /docs/auditor/AUDITOR.md
2. Carrega checklists relevantes
3. Executa verificacoes:
   - npm run build (frontend)
   - grep patterns (security)
   - SQL queries (database)
   - MCP calls (Vercel)
4. Calcula scores
5. Gera relatorio em Markdown
6. Sugere correcoes
7. Salva relatorio em /audit-reports/[data].md
```

---

**Ultima atualizacao:** 2025-11-25
