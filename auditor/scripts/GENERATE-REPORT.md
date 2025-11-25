# ICARUS Auditor - Gerador de Relatorio

> **Instrucoes para geracao de relatorios de auditoria**

---

## Formato do Relatorio

O relatorio de auditoria segue o template em `templates/report-template.md`.

---

## Dados Coletados

### Por Area

```typescript
interface AuditAreaResult {
  area: string;
  weight: number;
  score: number;
  issues: Issue[];
  checks: Check[];
}

interface Issue {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  description: string;
  location?: string;
  fix?: string;
  effort?: 'low' | 'medium' | 'high';
}

interface Check {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP';
  details?: string;
}
```

### Resultado Geral

```typescript
interface AuditReport {
  timestamp: string;
  version: string;
  environment: 'production' | 'staging' | 'development';

  summary: {
    overallScore: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    status: 'PASSED' | 'WARNING' | 'FAILED';
    totalIssues: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    infoCount: number;
  };

  areas: AuditAreaResult[];

  history?: {
    previousScore: number;
    trend: 'up' | 'down' | 'stable';
  };
}
```

---

## Calculo de Score

### Por Area

```typescript
function calculateAreaScore(issues: Issue[]): number {
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
```

### Score Geral (Ponderado)

```typescript
function calculateOverallScore(areas: AuditAreaResult[]): number {
  const weights = {
    frontend: 0.12,
    backend: 0.12,
    database: 0.18,
    security: 0.18,
    compliance: 0.15,
    performance: 0.10,
    ai: 0.05,
    vercel: 0.05,
    integrations: 0.05,
  };

  return Math.round(
    areas.reduce(
      (sum, area) => sum + (area.score * weights[area.area]),
      0
    )
  );
}
```

### Grade

```typescript
function getGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
```

---

## Geracao do Relatorio

### Via Claude Code

```bash
@auditor report
```

### Manual

1. Executar todas as auditorias
2. Coletar resultados
3. Calcular scores
4. Preencher template
5. Salvar arquivo

---

## Salvamento

### Nomenclatura

```
audit-report-YYYY-MM-DD-HHmmss.md
```

### Local

```
./audit-reports/
```

---

## Exemplo de Uso

```typescript
// Gerar relatorio
const report = await generateAuditReport({
  areas: ['frontend', 'backend', 'database', 'security', 'compliance', 'performance', 'ai', 'vercel', 'integrations'],
  output: './audit-reports',
  format: 'markdown',
});

// Salvar
await saveReport(report);

// Comparar com anterior
const comparison = await compareWithPrevious(report);
```

---

**Versao:** 2.0.0
