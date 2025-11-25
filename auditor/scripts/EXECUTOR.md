# ICARUS Auditor - Guia de Execucao

> **Manual de execucao das funcoes de auditoria**

---

## Funcoes de Verificacao

### 1. Verificar Status de RLS

```sql
SELECT * FROM audit_check_rls_status();
```

**Retorno:**
| Coluna | Descricao |
|--------|-----------|
| table_name | Nome da tabela |
| rls_enabled | Se RLS esta habilitado |
| policy_count | Numero de policies |
| status | OK, WARNING ou CRITICAL |
| severity | Nivel de severidade |

---

### 2. Verificar Colunas Obrigatorias

```sql
SELECT * FROM audit_check_required_columns();
```

**Colunas verificadas:**
- id
- empresa_id
- criado_em
- atualizado_em

---

### 3. Verificar Indices

```sql
SELECT * FROM audit_check_indexes();
```

**Verifica:**
- Se tabela tem empresa_id
- Se existe indice em empresa_id
- Nome do indice (se existir)

---

### 4. Verificar Triggers

```sql
SELECT * FROM audit_check_triggers();
```

**Verifica:**
- Se tabela tem atualizado_em
- Se existe trigger de updated_at
- Nome do trigger (se existir)

---

### 5. Verificar Compliance ANVISA

```sql
SELECT * FROM audit_check_anvisa_compliance();
```

**Verifica:**
- Tabela produtos existe
- Campo registro_anvisa
- Tabela lotes
- Rastreabilidade OPME

---

### 6. Verificar Compliance LGPD

```sql
SELECT * FROM audit_check_lgpd_compliance();
```

**Verifica:**
- Tabela audit_log
- Tabela consentimentos
- Soft delete (excluido_em)
- Rastreabilidade de usuario

---

### 7. Verificar Integridade do Audit Log

```sql
SELECT * FROM audit_check_audit_log_integrity();
```

---

### 8. Auditoria Completa

```sql
SELECT audit_full_database_check();
```

**Retorno JSON:**
```json
{
  "timestamp": "2025-11-25T12:00:00Z",
  "summary": {
    "rls_issues": 0,
    "column_issues": 0,
    "index_issues": 2,
    "trigger_issues": 3,
    "total_issues": 5
  },
  "score": 85,
  "status": "OK"
}
```

---

## Funcoes de Correcao

### IMPORTANTE
As funcoes de correcao modificam o banco de dados.
Execute apenas apos revisar os resultados da auditoria.

### 1. Habilitar RLS

```sql
-- Ver tabelas que serao afetadas
SELECT table_name FROM audit_check_rls_status() WHERE rls_enabled = false;

-- Executar correcao
SELECT * FROM audit_fix_enable_rls();
```

---

### 2. Criar Indices

```sql
-- Ver tabelas que serao afetadas
SELECT table_name FROM audit_check_indexes() WHERE status = 'MISSING INDEX on empresa_id';

-- Executar correcao
SELECT * FROM audit_fix_create_empresa_indexes();
```

---

### 3. Criar Triggers

```sql
-- Ver tabelas que serao afetadas
SELECT table_name FROM audit_check_triggers() WHERE status = 'MISSING TRIGGER';

-- Executar correcao
SELECT * FROM audit_fix_create_updated_at_triggers();
```

---

## Script de Auditoria Completa

```sql
-- 1. Executar todas as verificacoes
SELECT '=== RLS STATUS ===' AS section;
SELECT * FROM audit_check_rls_status() WHERE status != 'OK';

SELECT '=== REQUIRED COLUMNS ===' AS section;
SELECT * FROM audit_check_required_columns() WHERE status != 'OK';

SELECT '=== INDEXES ===' AS section;
SELECT * FROM audit_check_indexes() WHERE status != 'OK';

SELECT '=== TRIGGERS ===' AS section;
SELECT * FROM audit_check_triggers() WHERE status != 'OK';

SELECT '=== ANVISA COMPLIANCE ===' AS section;
SELECT * FROM audit_check_anvisa_compliance();

SELECT '=== LGPD COMPLIANCE ===' AS section;
SELECT * FROM audit_check_lgpd_compliance();

SELECT '=== AUDIT LOG INTEGRITY ===' AS section;
SELECT * FROM audit_check_audit_log_integrity();

-- 2. Score final
SELECT '=== FINAL SCORE ===' AS section;
SELECT audit_full_database_check();
```

---

## Execucao via Claude Code

Ao usar `@auditor database`, o Claude Code executara:

1. `SELECT * FROM audit_check_rls_status()`
2. `SELECT * FROM audit_check_required_columns()`
3. `SELECT * FROM audit_check_indexes()`
4. `SELECT * FROM audit_check_triggers()`
5. `SELECT * FROM audit_check_anvisa_compliance()`
6. `SELECT * FROM audit_check_lgpd_compliance()`
7. `SELECT audit_full_database_check()`

E apresentara os resultados de forma estruturada.

---

**Versao:** 2.0.0
