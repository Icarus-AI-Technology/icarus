# ICARUS Auditor - Instrucoes para Claude Code

> **Este arquivo contem as instrucoes que o Claude Code deve seguir para executar auditorias**

---

## Reconhecimento de Comandos

Quando o usuario digitar qualquer um destes padroes, ativar o modo auditor:

```regex
@auditor\s+(\w+)
auditor\s+(\w+)
auditoria\s+(\w+)
audit\s+(\w+)
verificar\s+(\w+)
checar\s+(\w+)
```

### Mapeamento de Comandos

| Comando | Acao |
|---------|------|
| `@auditor full` | Executar auditoria completa de todas as areas |
| `@auditor frontend` | Carregar e executar `/auditor/checklists/FRONTEND.md` |
| `@auditor backend` | Carregar e executar `/auditor/checklists/BACKEND.md` |
| `@auditor database` | Carregar e executar `/auditor/checklists/DATABASE.md` + SQL |
| `@auditor security` | Carregar e executar `/auditor/checklists/SECURITY.md` |
| `@auditor compliance` | Carregar e executar `/auditor/checklists/COMPLIANCE.md` + SQL |
| `@auditor performance` | Carregar e executar `/auditor/checklists/PERFORMANCE.md` |
| `@auditor ai` | Carregar e executar `/auditor/checklists/AI.md` |
| `@auditor vercel` | Carregar e executar `/auditor/checklists/VERCEL.md` + MCP |
| `@auditor integrations` | Carregar e executar `/auditor/checklists/INTEGRATIONS.md` |
| `@auditor fix rls` | Executar SQL de correcao de RLS |
| `@auditor fix indexes` | Executar SQL de criacao de indices |
| `@auditor fix triggers` | Executar SQL de criacao de triggers |
| `@auditor report` | Gerar relatorio usando template |

---

## Fluxo de Execucao

### 1. Auditoria Completa (`@auditor full`)

```
INICIO
|
+-- 1. Carregar configuracao (auditor-config.json)
|
+-- 2. Para cada area habilitada:
|   |
|   +-- Frontend
|   |   +-- Verificar estrutura de pastas
|   |   +-- Executar: grep -r ": any" src/ | wc -l
|   |   +-- Verificar tsconfig.json
|   |   +-- Verificar package.json dependencies
|   |   +-- Executar: npm run build (opcional)
|   |
|   +-- Backend
|   |   +-- Listar supabase/functions/
|   |   +-- Verificar estrutura de cada funcao
|   |   +-- Checar CORS, error handling, auth
|   |
|   +-- Database (via Supabase MCP)
|   |   +-- Executar: SELECT * FROM audit_check_rls_status()
|   |   +-- Executar: SELECT * FROM audit_check_required_columns()
|   |   +-- Executar: SELECT * FROM audit_check_indexes()
|   |   +-- Executar: SELECT * FROM audit_check_anvisa_compliance()
|   |   +-- Executar: SELECT * FROM audit_check_lgpd_compliance()
|   |   +-- Executar: SELECT audit_full_database_check()
|   |
|   +-- Security
|   |   +-- Executar: grep -rn "sk-" src/
|   |   +-- Verificar .gitignore contem .env
|   |   +-- Verificar RLS em todas as tabelas
|   |
|   +-- Compliance
|   |   +-- Executar queries ANVISA
|   |   +-- Executar queries LGPD
|   |
|   +-- Performance
|   |   +-- Verificar bundle size
|   |   +-- Verificar queries lentas
|   |
|   +-- AI
|   |   +-- Verificar pgvector extension
|   |   +-- Contar embeddings
|   |   +-- Verificar custos
|   |
|   +-- Vercel (via Vercel MCP)
|   |   +-- @tool Vercel:get_project
|   |   +-- @tool Vercel:list_deployments
|   |   +-- Verificar env vars
|   |
|   +-- Integrations
|       +-- Verificar config Microsoft 365
|       +-- Verificar webhooks Pluggy
|       +-- Verificar certificado SEFAZ
|
+-- 3. Calcular scores por area
|
+-- 4. Calcular score geral
|
+-- 5. Gerar relatorio
|
+-- FIM
```

### 2. Auditoria Especifica (`@auditor [area]`)

```
INICIO
|
+-- 1. Carregar checklist da area
|
+-- 2. Executar todas as verificacoes
|
+-- 3. Coletar issues
|
+-- 4. Calcular score
|
+-- 5. Apresentar resultados
|
+-- FIM
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

### Formula Geral

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

## Comandos de Correcao

### `@auditor fix rls`

```sql
-- Executar no Supabase
SELECT * FROM audit_fix_enable_rls();
```

**Acoes:**
1. Identificar tabelas sem RLS
2. Executar `ALTER TABLE xxx ENABLE ROW LEVEL SECURITY`
3. Reportar sucesso/falha por tabela

### `@auditor fix indexes`

```sql
-- Executar no Supabase
SELECT * FROM audit_fix_create_empresa_indexes();
```

**Acoes:**
1. Identificar tabelas com empresa_id sem indice
2. Criar indice partial `WHERE excluido_em IS NULL`
3. Reportar sucesso/falha por tabela

### `@auditor fix triggers`

```sql
-- Executar no Supabase
SELECT * FROM audit_fix_create_updated_at_triggers();
```

**Acoes:**
1. Identificar tabelas com atualizado_em sem trigger
2. Criar funcao `update_updated_at()` se nao existir
3. Criar trigger `trg_xxx_updated_at`
4. Reportar sucesso/falha por tabela

---

## Formato de Saida

### Durante Execucao

```markdown
Iniciando auditoria...

Frontend (12%)
   +-- TypeScript strict mode habilitado
   +-- 3 usos de 'any' encontrados
   +-- Score: 85/100

Backend (12%)
   +-- 10 Edge Functions encontradas
   +-- CORS configurado
   +-- Score: 95/100

Database (18%)
   +-- 2 tabelas sem RLS
   +-- 5 tabelas sem indice em empresa_id
   +-- Score: 70/100

[... continua para todas as areas ...]

===========================================
RESULTADO FINAL
   Score: 82/100
   Nota: B
   Status: PASSED
===========================================
```

### Relatorio Final

Usar template de `/auditor/templates/report-template.md`

---

## Tratamento de Erros

### Supabase nao conectado

```markdown
Erro: Supabase MCP nao conectado

Para executar auditoria de database, compliance e AI, conecte o Supabase MCP.

Continuando com verificacoes que nao requerem Supabase...
```

### Vercel nao conectado

```markdown
Erro: Vercel MCP nao conectado

Para executar auditoria de Vercel, conecte o Vercel MCP.

Continuando com verificacoes que nao requerem Vercel...
```

### Arquivo nao encontrado

```markdown
Aviso: Arquivo [path] nao encontrado

Pulando verificacao. Score da area pode estar incompleto.
```

---

## Prioridades de Issue

### Apresentacao

Sempre apresentar issues nesta ordem:
1. CRITICAL (vermelho)
2. HIGH (laranja)
3. MEDIUM (amarelo)
4. LOW (verde)
5. INFO (cinza)

### Acoes Recomendadas

| Severidade | Prazo | Acao |
|------------|-------|------|
| CRITICAL | Imediato | Bloquear deploy, corrigir agora |
| HIGH | 24 horas | Priorizar na proxima sprint |
| MEDIUM | 1 semana | Adicionar ao backlog prioritario |
| LOW | Backlog | Adicionar ao backlog |
| INFO | Opcional | Considerar para melhoria continua |

---

## Seguranca

### Dados Sensiveis

- Nunca logar secrets, tokens ou senhas
- Ofuscar dados de paciente em relatorios
- Nao expor chaves de API nos resultados

### Acesso

- Auditor requer acesso de leitura ao codigo
- SQL queries usam SECURITY DEFINER
- MCP usa tokens autorizados

---

## Notas Importantes

1. **Auditoria e nao-destrutiva** - Apenas le, nunca modifica (exceto `fix`)
2. **Correcoes sao opcionais** - Sempre perguntar antes de executar `fix`
3. **Scores sao aproximados** - Usar como guia, nao como metrica absoluta
4. **Manter historico** - Salvar relatorios para comparacao

---

**Versao:** 2.0.0
**Ultima Atualizacao:** 2025-11-25
