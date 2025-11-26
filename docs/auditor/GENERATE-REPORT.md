# ICARUS Auditor - Gerador de Relatorio

> **Script para execucao completa de auditoria e geracao de relatorio**

---

## Uso Rapido

```bash
# Auditoria completa
@auditor run --full

# Auditoria por area
@auditor run --area=frontend
@auditor run --area=database
@auditor run --area=security
@auditor run --area=compliance
@auditor run --area=vercel

# Gerar relatorio
@auditor report --format=markdown --output=./audit-report.md
```

---

## Fluxo de Auditoria

```
+-------------------------------------------------------------+
|                    FLUXO DE AUDITORIA                       |
+-------------------------------------------------------------+
|                                                             |
|  1. COLETA       2. ANALISE       3. SCORING     4. RELAT   |
|  +---------+    +---------+      +---------+    +---------+ |
|  | Frontend|---\>| Compare |-----\>|Calculate|---\>| Generate| |
|  | Backend |    | against |      | scores  |    |  report | |
|  | Database|    | checklst|      | & grade |    |  + plan | |
|  | Security|    |         |      |         |    |         | |
|  | etc...  |    |         |      |         |    |         | |
|  +---------+    +---------+      +---------+    +---------+ |
|                                                             |
+-------------------------------------------------------------+
```

---

## Script de Auditoria Completa

```typescript
// scripts/full-audit.ts

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Types
interface AuditIssue {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  category: string;
  subcategory: string;
  message: string;
  details?: string;
  file?: string;
  line?: number;
  suggestion?: string;
  effort?: 'low' | 'medium' | 'high';
}

interface AuditSection {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
  issues: AuditIssue[];
  passed: string[];
}

interface AuditReport {
  timestamp: string;
  version: string;
  duration: number;
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  status: 'PASSED' | 'WARNING' | 'FAILED' | 'CRITICAL';
  sections: AuditSection[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    passed: number;
  };
  actionPlan: ActionItem[];
}

interface ActionItem {
  priority: number;
  title: string;
  description: string;
  effort: string;
  deadline: string;
  assignee?: string;
}

// Main audit function
async function runFullAudit(): Promise<AuditReport> {
  const startTime = Date.now();
  const sections: AuditSection[] = [];

  console.log('Iniciando auditoria completa do ICARUS...\n');

  // 1. Frontend Audit
  console.log('Auditando Frontend...');
  sections.push(await auditFrontend());

  // 2. Backend Audit
  console.log('Auditando Backend...');
  sections.push(await auditBackend());

  // 3. Database Audit
  console.log('Auditando Database...');
  sections.push(await auditDatabase());

  // 4. Security Audit
  console.log('Auditando Security...');
  sections.push(await auditSecurity());

  // 5. Compliance Audit
  console.log('Auditando Compliance...');
  sections.push(await auditCompliance());

  // Calculate overall score
  const overallScore = calculateOverallScore(sections);
  const grade = calculateGrade(overallScore);
  const status = calculateStatus(sections);

  // Generate summary
  const summary = generateSummary(sections);

  // Generate action plan
  const actionPlan = generateActionPlan(sections);

  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    version: '6.0',
    duration: Date.now() - startTime,
    overallScore,
    grade,
    status,
    sections,
    summary,
    actionPlan,
  };

  console.log('\nAuditoria concluida!');
  console.log(`Score: ${overallScore}/100 (${grade})`);
  console.log(`Duracao: ${report.duration}ms`);

  return report;
}

// Helper functions
function calculateSectionScore(issues: AuditIssue[]): number {
  const penalties = {
    CRITICAL: 30,
    HIGH: 15,
    MEDIUM: 5,
    LOW: 2,
    INFO: 0,
  };

  const totalPenalty = issues.reduce(
    (sum, issue) => sum + penalties[issue.severity],
    0
  );

  return Math.max(0, 100 - totalPenalty);
}

function calculateOverallScore(sections: AuditSection[]): number {
  return Math.round(
    sections.reduce(
      (sum, section) => sum + (section.score * section.weight),
      0
    )
  );
}

function calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function calculateStatus(sections: AuditSection[]): AuditReport['status'] {
  const hasCritical = sections.some(s =>
    s.issues.some(i => i.severity === 'CRITICAL')
  );
  const hasHigh = sections.some(s =>
    s.issues.some(i => i.severity === 'HIGH')
  );

  if (hasCritical) return 'CRITICAL';
  if (hasHigh) return 'FAILED';
  if (sections.some(s => s.score < 80)) return 'WARNING';
  return 'PASSED';
}

function generateSummary(sections: AuditSection[]): AuditReport['summary'] {
  const allIssues = sections.flatMap(s => s.issues);
  const allPassed = sections.flatMap(s => s.passed);

  return {
    critical: allIssues.filter(i => i.severity === 'CRITICAL').length,
    high: allIssues.filter(i => i.severity === 'HIGH').length,
    medium: allIssues.filter(i => i.severity === 'MEDIUM').length,
    low: allIssues.filter(i => i.severity === 'LOW').length,
    info: allIssues.filter(i => i.severity === 'INFO').length,
    passed: allPassed.length,
  };
}

function generateActionPlan(sections: AuditSection[]): ActionItem[] {
  const allIssues = sections.flatMap(s => s.issues);

  return allIssues
    .filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH')
    .sort((a, b) => {
      const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .map((issue, index) => ({
      priority: index + 1,
      title: issue.message,
      description: issue.suggestion || 'Investigar e corrigir',
      effort: issue.effort || 'medium',
      deadline: issue.severity === 'CRITICAL' ? 'Imediato' : '24 horas',
    }));
}

// Export
export { runFullAudit, AuditReport };
```

---

## Template de Relatorio Markdown

```markdown
# Relatorio de Auditoria ICARUS

**Gerado em:** {{timestamp}}
**Versao do Sistema:** {{version}}
**Duracao da Auditoria:** {{duration}}ms

---

## Resumo Executivo

| Metrica | Valor |
|---------|-------|
| **Score Geral** | {{overallScore}}/100 |
| **Nota** | {{grade}} |
| **Status** | {{status}} |

### Distribuicao de Issues

| Severidade | Quantidade |
|------------|------------|
| Criticas | {{summary.critical}} |
| Altas | {{summary.high}} |
| Medias | {{summary.medium}} |
| Baixas | {{summary.low}} |
| Info | {{summary.info}} |
| Passou | {{summary.passed}} |

---

## Scores por Area

| Area | Score | Status |
|------|-------|--------|
{{#each sections}}
| {{name}} | {{score}}/{{maxScore}} | {{#if (gte score 80)}}OK{{else}}{{#if (gte score 60)}}WARNING{{else}}CRITICAL{{/if}}{{/if}} |
{{/each}}

---

## Issues Criticas

{{#each sections}}
{{#each issues}}
{{#if (eq severity "CRITICAL")}}
### [{{id}}] {{message}}

- **Categoria:** {{category}} > {{subcategory}}
- **Severidade:** CRITICAL
- **Sugestao:** {{suggestion}}
- **Esforco:** {{effort}}
{{#if file}}- **Arquivo:** {{file}}:{{line}}{{/if}}

{{/if}}
{{/each}}
{{/each}}

---

## Issues de Alta Prioridade

{{#each sections}}
{{#each issues}}
{{#if (eq severity "HIGH")}}
### [{{id}}] {{message}}

- **Categoria:** {{category}} > {{subcategory}}
- **Severidade:** HIGH
- **Sugestao:** {{suggestion}}
- **Esforco:** {{effort}}

{{/if}}
{{/each}}
{{/each}}

---

## Plano de Acao

| # | Tarefa | Esforco | Prazo |
|---|--------|---------|-------|
{{#each actionPlan}}
| {{priority}} | {{title}} | {{effort}} | {{deadline}} |
{{/each}}

---

## Itens em Conformidade

{{#each sections}}
### {{name}}
{{#each passed}}
- {{this}}
{{/each}}

{{/each}}

---

**Relatorio gerado automaticamente pelo ICARUS Auditor Agent**
**Proxima auditoria recomendada:** 7 dias
```

---

**Ultima atualizacao:** 2025-11-25
