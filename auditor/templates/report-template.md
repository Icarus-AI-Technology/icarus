# ICARUS Audit Report

**Data:** {{timestamp}}
**Versao:** {{version}}
**Ambiente:** {{environment}}
**Auditor:** Claude Code Agent v2.0.0

---

## Resumo Executivo

| Metrica | Valor |
|---------|-------|
| **Score Geral** | {{overallScore}}/100 |
| **Nota** | {{grade}} |
| **Status** | {{status}} |
| **Issues Criticas** | {{criticalCount}} |
| **Issues High** | {{highCount}} |
| **Issues Medium** | {{mediumCount}} |
| **Issues Low** | {{lowCount}} |
| **Total Issues** | {{totalIssues}} |

{{#if history}}
### Comparativo com Auditoria Anterior

| Metrica | Anterior | Atual | Variacao |
|---------|----------|-------|----------|
| Score | {{history.previousScore}} | {{overallScore}} | {{history.trend}} |
{{/if}}

---

## Scores por Area

| Area | Score | Status | Issues |
|------|-------|--------|--------|
{{#each areas}}
| {{name}} | {{score}}/100 | {{statusIcon}} | {{issueCount}} |
{{/each}}

### Grafico de Scores

```
Frontend      [{{frontendBar}}] {{frontendScore}}%
Backend       [{{backendBar}}] {{backendScore}}%
Database      [{{databaseBar}}] {{databaseScore}}%
Security      [{{securityBar}}] {{securityScore}}%
Compliance    [{{complianceBar}}] {{complianceScore}}%
Performance   [{{performanceBar}}] {{performanceScore}}%
AI            [{{aiBar}}] {{aiScore}}%
Vercel        [{{vercelBar}}] {{vercelScore}}%
Integrations  [{{integrationsBar}}] {{integrationsScore}}%
```

---

## Issues Criticas (Acao Imediata)

{{#if criticalIssues}}
{{#each criticalIssues}}
### [CRITICAL] {{title}}

- **Area:** {{area}}
- **Localizacao:** {{location}}
- **Descricao:** {{description}}
- **Correcao:** {{fix}}
- **Esforco:** {{effort}}

{{/each}}
{{else}}
Nenhuma issue critica encontrada.
{{/if}}

---

## Issues High (Corrigir em 24h)

{{#if highIssues}}
{{#each highIssues}}
### [HIGH] {{title}}

- **Area:** {{area}}
- **Localizacao:** {{location}}
- **Descricao:** {{description}}
- **Correcao:** {{fix}}
- **Esforco:** {{effort}}

{{/each}}
{{else}}
Nenhuma issue high encontrada.
{{/if}}

---

## Issues Medium (Corrigir em 1 semana)

{{#if mediumIssues}}
{{#each mediumIssues}}
### [MEDIUM] {{title}}

- **Area:** {{area}}
- **Descricao:** {{description}}

{{/each}}
{{else}}
Nenhuma issue medium encontrada.
{{/if}}

---

## Issues Low (Backlog)

{{#if lowIssues}}
{{#each lowIssues}}
- [LOW] {{title}} ({{area}})
{{/each}}
{{else}}
Nenhuma issue low encontrada.
{{/if}}

---

## Plano de Acao

### Prioridade 1 (Imediato)

{{#each actionPlan.immediate}}
- [ ] {{description}}
  - Responsavel: {{owner}}
  - Esforco: {{effort}}
{{/each}}

### Prioridade 2 (Esta Semana)

{{#each actionPlan.thisWeek}}
- [ ] {{description}}
  - Esforco: {{effort}}
{{/each}}

### Prioridade 3 (Backlog)

{{#each actionPlan.backlog}}
- [ ] {{description}}
{{/each}}

---

## Itens em Conformidade

### Frontend
{{#each compliance.frontend}}
- [x] {{item}}
{{/each}}

### Backend
{{#each compliance.backend}}
- [x] {{item}}
{{/each}}

### Database
{{#each compliance.database}}
- [x] {{item}}
{{/each}}

### Security
{{#each compliance.security}}
- [x] {{item}}
{{/each}}

### Compliance (ANVISA/LGPD)
{{#each compliance.compliance}}
- [x] {{item}}
{{/each}}

---

## Metricas de Qualidade

| KPI | Target | Atual | Status |
|-----|--------|-------|--------|
| Code Coverage | > 80% | {{metrics.coverage}}% | {{metrics.coverageStatus}} |
| TypeScript Strict | 100% | {{metrics.tsStrict}}% | {{metrics.tsStrictStatus}} |
| RLS Coverage | 100% | {{metrics.rlsCoverage}}% | {{metrics.rlsStatus}} |
| Bundle Size | < 500KB | {{metrics.bundleSize}}KB | {{metrics.bundleStatus}} |
| Build Time | < 60s | {{metrics.buildTime}}s | {{metrics.buildStatus}} |

---

## Detalhes por Area

{{#each areaDetails}}
### {{name}}

**Score:** {{score}}/100
**Peso:** {{weight}}%
**Status:** {{status}}

#### Verificacoes

| Check | Status | Detalhes |
|-------|--------|----------|
{{#each checks}}
| {{name}} | {{statusIcon}} | {{details}} |
{{/each}}

#### Issues Encontradas

{{#if issues}}
{{#each issues}}
- [{{severity}}] {{title}}
{{/each}}
{{else}}
Nenhuma issue encontrada nesta area.
{{/if}}

---

{{/each}}

## Historico de Auditorias

| Data | Score | Nota | Issues |
|------|-------|------|--------|
{{#each auditHistory}}
| {{date}} | {{score}} | {{grade}} | {{issues}} |
{{/each}}

---

## Proximos Passos

1. **Imediato:** Corrigir todas as issues CRITICAL
2. **24h:** Corrigir issues HIGH
3. **1 semana:** Corrigir issues MEDIUM
4. **Continuo:** Monitorar metricas e executar auditoria semanal

---

## Apendice

### Metodologia

- **Score:** Calculado com base em penalidades por severidade
- **Peso por Area:** Conforme configuracao em auditor-config.json
- **Severidades:**
  - CRITICAL: -30 pontos
  - HIGH: -15 pontos
  - MEDIUM: -5 pontos
  - LOW: -2 pontos
  - INFO: 0 pontos

### Ferramentas Utilizadas

- TypeScript Compiler (tsc)
- ESLint
- Supabase SQL Functions
- Vercel CLI/MCP
- npm audit

---

**Relatorio gerado automaticamente pelo ICARUS Auditor Agent**
**Versao do Auditor:** 2.0.0
**Proximo agendamento:** {{nextAuditDate}}
