# ICARUS Auditor Agent - Auditoria Completa do Sistema

> **Agente especializado em auditoria 360 do projeto ICARUS**
> Frontend - Backend - Database - Security - Compliance - Performance - AI - Vercel - Integrations

**Versao:** 2.0.0
**Ultima Atualizacao:** 2025-11-25
**Autor:** Claude Code Agent

---

## INICIO RAPIDO

### Executar Auditoria Completa

```
@auditor full
```

Este comando executa auditoria de TODAS as areas e gera relatorio completo.

### Comandos Especificos

```bash
@auditor frontend      # React, TypeScript, UI/UX
@auditor backend       # Edge Functions, APIs
@auditor database      # Schema, RLS, Indices, Queries
@auditor security      # Auth, Secrets, Validacao
@auditor compliance    # ANVISA, LGPD, SEFAZ
@auditor performance   # Core Web Vitals, Bundle, DB
@auditor ai            # Chatbot, Embeddings, Custos
@auditor vercel        # Deploy, Env Vars, Domains
@auditor integrations  # MS365, Pluggy, SEFAZ

@auditor fix rls       # Habilitar RLS faltante
@auditor fix indexes   # Criar indices recomendados
@auditor fix triggers  # Criar triggers de updated_at

@auditor report        # Gerar relatorio em Markdown
```

---

## Visao Geral do Auditor

O **ICARUS Auditor** e um agente do Claude Code projetado para realizar auditoria completa e continua de todo o sistema ICARUS, garantindo qualidade, seguranca, performance e conformidade regulatoria.

### Escopo de Auditoria

```
+------------------------------------------------------------------+
|                    ICARUS AUDITOR AGENT                          |
+------------------------------------------------------------------+
|                                                                  |
|  +---------------+  +---------------+  +---------------+         |
|  |   FRONTEND    |  |   BACKEND     |  |   DATABASE    |         |
|  |  - React      |  |  - Edge Func  |  |  - Schema     |         |
|  |  - TypeScript |  |  - APIs       |  |  - RLS        |         |
|  |  - Components |  |  - Auth       |  |  - Indices    |         |
|  |  - Routes     |  |  - Storage    |  |  - Triggers   |         |
|  +---------------+  +---------------+  +---------------+         |
|                                                                  |
|  +---------------+  +---------------+  +---------------+         |
|  |   SECURITY    |  |  COMPLIANCE   |  | PERFORMANCE   |         |
|  |  - Auth       |  |  - ANVISA     |  |  - Bundle     |         |
|  |  - CORS       |  |  - LGPD       |  |  - Queries    |         |
|  |  - Secrets    |  |  - SEFAZ      |  |  - Caching    |         |
|  |  - RLS        |  |  - Audit Log  |  |  - Indices    |         |
|  +---------------+  +---------------+  +---------------+         |
|                                                                  |
|  +---------------+  +---------------+  +---------------+         |
|  |  AI/AGENTS    |  | INTEGRATIONS  |  |   VERCEL      |         |
|  |  - Chatbot    |  |  - MS365      |  |  - Deploy     |         |
|  |  - Embeddings |  |  - Pluggy     |  |  - Env Vars   |         |
|  |  - GPT Funcs  |  |  - SEFAZ      |  |  - Domains    |         |
|  +---------------+  +---------------+  +---------------+         |
|                                                                  |
+------------------------------------------------------------------+
```

---

## Calculo de Scores

### Formula por Area

```typescript
function calculateSectionScore(issues: Issue[]): number {
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

### Formula Geral (Ponderada)

```typescript
function calculateOverallScore(sections: Section[]): number {
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
    sections.reduce(
      (sum, section) => sum + (section.score * weights[section.name]),
      0
    )
  );
}
```

### Classificacao

| Score | Nota | Status |
|-------|------|--------|
| 90-100 | A | PASSED |
| 80-89 | B | PASSED |
| 70-79 | C | WARNING |
| 60-69 | D | WARNING |
| 0-59 | F | FAILED |

---

## Checklist Master

### Frontend (React/TypeScript)
- [ ] Componentes seguem Design System Dark Glass Medical
- [ ] TypeScript strict mode habilitado
- [ ] Sem `any` types desnecessarios
- [ ] React hooks seguem regras
- [ ] Error boundaries implementados
- [ ] Loading/Error states em todas as paginas
- [ ] Formularios com validacao Zod
- [ ] Responsividade testada
- [ ] Acessibilidade (WCAG 2.1)
- [ ] Bundle size otimizado

### Backend (Supabase Edge Functions)
- [ ] Todas as functions com error handling
- [ ] CORS configurado corretamente
- [ ] Rate limiting implementado
- [ ] Logs estruturados
- [ ] Timeouts definidos
- [ ] Secrets nao hardcoded
- [ ] Validacao de input
- [ ] Response types definidos

### Database (PostgreSQL)
- [ ] Todas as tabelas com `empresa_id`
- [ ] RLS habilitado em todas as tabelas
- [ ] Policies corretas (SELECT, INSERT, UPDATE)
- [ ] Indices para queries frequentes
- [ ] Foreign keys definidas
- [ ] Soft delete (`excluido_em`)
- [ ] Timestamps (`criado_em`, `atualizado_em`)
- [ ] Triggers de audit log
- [ ] Backup configurado
- [ ] Extensions necessarias habilitadas

### Security
- [ ] Auth configurado corretamente
- [ ] JWT helpers funcionando
- [ ] 2FA disponivel
- [ ] Senhas com politica forte
- [ ] Sessions com timeout
- [ ] IP whitelist (se aplicavel)
- [ ] Rate limits por usuario
- [ ] HTTPS enforced
- [ ] Secrets no Vault
- [ ] Sem dados sensiveis em logs

### Compliance
- [ ] Rastreabilidade ANVISA completa
- [ ] Dados de paciente minimizados (LGPD)
- [ ] Audit log imutavel
- [ ] Consentimento documentado
- [ ] Direito de exclusao implementado
- [ ] Retencao de 5 anos
- [ ] Processo de recall documentado
- [ ] Documentacao tecnica atualizada

### Performance
- [ ] Queries otimizadas (EXPLAIN)
- [ ] Indices utilizados
- [ ] N+1 queries eliminadas
- [ ] Caching implementado
- [ ] Lazy loading de componentes
- [ ] Imagens otimizadas
- [ ] Bundle splitting
- [ ] CDN configurado
- [ ] Real-time apenas quando necessario

### Integrations
- [ ] Microsoft 365 OAuth funcionando
- [ ] Pluggy webhooks configurados
- [ ] SEFAZ certificado valido
- [ ] ANVISA API acessivel
- [ ] Tokens refreshing corretamente
- [ ] Error handling em todas integracoes
- [ ] Retry logic implementado
- [ ] Fallbacks definidos

### AI/Agents
- [ ] Chatbot respondendo corretamente
- [ ] Embeddings atualizados
- [ ] Rate limits OpenAI respeitados
- [ ] Prompts versionados
- [ ] Feedback loop implementado
- [ ] Metricas de uso coletadas
- [ ] Fallback para erros de IA
- [ ] Custo monitorado

### Vercel
- [ ] Deployment automatico funcionando
- [ ] Environment variables configuradas
- [ ] Domain configurado
- [ ] SSL valido
- [ ] Edge functions otimizadas
- [ ] Analytics habilitado
- [ ] Speed Insights ativo
- [ ] Preview deployments funcionando

---

## Formato de Saida

### Durante Execucao

```markdown
Iniciando auditoria...

Frontend (12%)
   - TypeScript strict mode habilitado
   - 3 usos de 'any' encontrados
   - Score: 85/100

Backend (12%)
   - 10 Edge Functions encontradas
   - CORS configurado
   - Score: 95/100

Database (18%)
   - 2 tabelas sem RLS
   - 5 tabelas sem indice em empresa_id
   - Score: 70/100

[... continua para todas as areas ...]

===========================================
RESULTADO FINAL
   Score: 82/100
   Nota: B
   Status: PASSED
===========================================
```

---

## Comandos de Correcao Automatica

O auditor pode sugerir e executar correcoes automaticas:

```bash
# Corrigir issues de lint
@auditor fix lint

# Adicionar RLS faltante
@auditor fix rls

# Adicionar indices recomendados
@auditor fix indexes

# Atualizar dependencies
@auditor fix dependencies

# Gerar types do Supabase
@auditor fix types
```

---

## Metricas de Qualidade

### KPIs do Projeto

| Metrica | Target | Atual |
|---------|--------|-------|
| Code Coverage | > 80% | -% |
| TypeScript Strict | 100% | -% |
| RLS Coverage | 100% | -% |
| Lighthouse Score | > 90 | - |
| Bundle Size | < 500KB | -KB |
| Build Time | < 60s | -s |
| Deploy Success Rate | > 99% | -% |

---

**Versao do Auditor:** 2.0.0
**Ultima atualizacao:** 2025-11-25
