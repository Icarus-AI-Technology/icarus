# ICARUS Auditor Agent

> **Sistema completo de auditoria automatizada para o projeto ICARUS v6.0**

## Inicio Rapido

### Executar Auditoria Completa

```bash
@auditor full
```

Este comando executa auditoria de **todas** as 9 areas e gera um relatorio completo.

### Executar Auditoria Especifica

```bash
@auditor [area]
```

Onde `[area]` pode ser:
- `frontend` - React, TypeScript, UI/UX
- `backend` - Edge Functions, APIs
- `database` - Schema, RLS, Indices
- `security` - Auth, Secrets, Validacao
- `compliance` - ANVISA, LGPD, SEFAZ
- `performance` - Web Vitals, Queries
- `ai` - Chatbot, Embeddings
- `vercel` - Deploy, Domains
- `integrations` - MS365, Pluggy

---

## Comandos Disponiveis

| Comando | Descricao |
|---------|-----------|
| `@auditor full` | Auditoria completa (todas as areas) |
| `@auditor frontend` | Auditoria de Frontend |
| `@auditor backend` | Auditoria de Backend |
| `@auditor database` | Auditoria de Database |
| `@auditor security` | Auditoria de Seguranca |
| `@auditor compliance` | Auditoria de Compliance |
| `@auditor performance` | Auditoria de Performance |
| `@auditor ai` | Auditoria de IA/Agents |
| `@auditor vercel` | Auditoria de Vercel |
| `@auditor integrations` | Auditoria de Integracoes |
| `@auditor fix rls` | Habilitar RLS faltante |
| `@auditor fix indexes` | Criar indices recomendados |
| `@auditor fix triggers` | Criar triggers de updated_at |
| `@auditor report` | Gerar relatorio em Markdown |

---

## Estrutura de Arquivos

```
auditor/
├── README.md                     # Este arquivo
├── AUDITOR.md                    # Visao geral do agente
├── CLAUDE-INSTRUCTIONS.md        # Instrucoes para Claude Code
├── auditor-config.json           # Configuracao JSON
│
├── checklists/                   # Checklists por area
│   ├── FRONTEND.md               # React, TypeScript, UI
│   ├── BACKEND.md                # Edge Functions, APIs
│   ├── DATABASE.md               # PostgreSQL, RLS, Indices
│   ├── SECURITY.md               # Auth, Secrets, Validacao
│   ├── COMPLIANCE.md             # ANVISA, LGPD, SEFAZ
│   ├── PERFORMANCE.md            # Web Vitals, Queries
│   ├── AI.md                     # Chatbot, Embeddings
│   ├── VERCEL.md                 # Deploy, Domains
│   └── INTEGRATIONS.md           # MS365, Pluggy, SEFAZ
│
├── scripts/                      # Scripts de execucao
│   ├── AUDIT-SQL.sql             # Funcoes SQL para Supabase
│   ├── EXECUTOR.md               # Guia de execucao
│   └── GENERATE-REPORT.md        # Gerador de relatorio
│
├── templates/                    # Templates
│   └── report-template.md        # Template do relatorio
│
└── workflows/                    # CI/CD
    └── github-audit.yml          # GitHub Actions workflow
```

---

## Resumo por Area

| Area | Arquivo | Itens | Peso |
|------|---------|-------|------|
| Frontend | `checklists/FRONTEND.md` | ~50 | 12% |
| Backend | `checklists/BACKEND.md` | ~40 | 12% |
| Database | `checklists/DATABASE.md` | ~60 | 18% |
| Security | `checklists/SECURITY.md` | ~50 | 18% |
| Compliance | `checklists/COMPLIANCE.md` | ~45 | 15% |
| Performance | `checklists/PERFORMANCE.md` | ~40 | 10% |
| AI | `checklists/AI.md` | ~35 | 5% |
| Vercel | `checklists/VERCEL.md` | ~30 | 5% |
| Integrations | `checklists/INTEGRATIONS.md` | ~40 | 5% |

---

## Severidades

| Nivel | Icone | Peso | Prazo |
|-------|-------|------|-------|
| CRITICAL | (vermelho) | -30 pts | Imediato |
| HIGH | (laranja) | -15 pts | 24h |
| MEDIUM | (amarelo) | -5 pts | 1 semana |
| LOW | (verde) | -2 pts | Backlog |
| INFO | (cinza) | 0 pts | Opcional |

---

## Targets de Score

| Nota | Score | Status |
|------|-------|--------|
| A | 90-100 | Excelente |
| B | 80-89 | Bom |
| C | 70-79 | Atencao |
| D | 60-69 | Requer acao |
| F | 0-59 | Critico |

---

## KPIs Monitorados

- Code Coverage: > 80%
- TypeScript Strict: 100%
- RLS Coverage: 100%
- Lighthouse Score: > 90
- Bundle Size: < 500KB
- Query P95: < 100ms

---

**Versao:** 2.0.0
**Ultima Atualizacao:** 2025-11-25
