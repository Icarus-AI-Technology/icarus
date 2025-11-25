# Database Audit Checklist

> **Area:** Database (PostgreSQL, Supabase)
> **Peso:** 18%
> **Itens:** ~60

---

## 1. Schema Structure

### 1.1 Required Columns
Todas as tabelas devem ter:
- [ ] `id` (UUID, primary key)
- [ ] `empresa_id` (UUID, foreign key)
- [ ] `criado_em` (TIMESTAMPTZ, default now())
- [ ] `atualizado_em` (TIMESTAMPTZ)
- [ ] `criado_por` (UUID, nullable)
- [ ] `atualizado_por` (UUID, nullable)
- [ ] `excluido_em` (TIMESTAMPTZ, nullable - soft delete)

**Verificacao SQL:**
```sql
SELECT * FROM audit_check_required_columns();
```

**Severidade:** HIGH (coluna faltando = -5 pontos por tabela)

### 1.2 Naming Conventions
- [ ] Tabelas em snake_case (portugues)
- [ ] Colunas em snake_case (portugues)
- [ ] Primary key como `id`
- [ ] Foreign keys como `[tabela]_id`

### 1.3 Data Types
- [ ] IDs como UUID
- [ ] Datas como TIMESTAMPTZ
- [ ] Moedas como DECIMAL(15,2)
- [ ] Textos com limite quando aplicavel

---

## 2. Row Level Security (RLS)

### 2.1 Activation
- [ ] RLS habilitado em TODAS as tabelas
- [ ] Nenhuma tabela com RLS disabled

**Verificacao SQL:**
```sql
SELECT * FROM audit_check_rls_status();
```

**Severidade:** CRITICAL (tabela sem RLS = -30 pontos)

### 2.2 Policies
- [ ] Policy SELECT por empresa_id
- [ ] Policy INSERT por empresa_id
- [ ] Policy UPDATE por empresa_id
- [ ] Policy DELETE por empresa_id (soft delete)

**Verificacao SQL:**
```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public';
```

### 2.3 Policy Pattern
```sql
-- Padrao esperado
CREATE POLICY "empresa_select" ON tabela
  FOR SELECT
  USING (empresa_id = auth.jwt()->>'empresa_id');

CREATE POLICY "empresa_insert" ON tabela
  FOR INSERT
  WITH CHECK (empresa_id = auth.jwt()->>'empresa_id');

CREATE POLICY "empresa_update" ON tabela
  FOR UPDATE
  USING (empresa_id = auth.jwt()->>'empresa_id');
```

---

## 3. Indexes

### 3.1 Required Indexes
- [ ] Indice em empresa_id (TODAS as tabelas)
- [ ] Indice em foreign keys
- [ ] Indice em colunas de busca frequente
- [ ] Indice composto quando necessario

**Verificacao SQL:**
```sql
SELECT * FROM audit_check_indexes();
```

**Severidade:** MEDIUM (indice faltando = -5 pontos)

### 3.2 Partial Indexes
```sql
-- Padrao recomendado
CREATE INDEX idx_[tabela]_empresa_id
  ON [tabela] (empresa_id)
  WHERE excluido_em IS NULL;
```

### 3.3 Index Analysis
```sql
-- Indices nao utilizados
SELECT
  schemaname,
  relname,
  indexrelname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND schemaname = 'public';
```

---

## 4. Foreign Keys

### 4.1 Relationships
- [ ] Todas as FK definidas
- [ ] ON DELETE CASCADE/SET NULL apropriado
- [ ] Referential integrity mantida

**Verificacao SQL:**
```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

### 4.2 Orphan Records
```sql
-- Verificar registros orfaos
SELECT * FROM audit_check_orphan_records();
```

---

## 5. Triggers

### 5.1 updated_at Trigger
- [ ] Trigger de updated_at em TODAS as tabelas
- [ ] Funcao `update_updated_at()` existe

**Verificacao SQL:**
```sql
SELECT
  tgrelid::regclass AS table_name,
  tgname AS trigger_name
FROM pg_trigger
WHERE tgname LIKE 'trg_%_updated_at';
```

**Severidade:** MEDIUM (trigger faltando = -3 pontos)

### 5.2 Trigger Function
```sql
-- Funcao padrao
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 6. Audit Log

### 6.1 Structure
- [ ] Tabela audit_log existe
- [ ] Triggers de auditoria em tabelas criticas
- [ ] Log imutavel (sem UPDATE/DELETE)

### 6.2 Required Fields
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  tabela TEXT NOT NULL,
  operacao TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  registro_id UUID NOT NULL,
  dados_antigos JSONB,
  dados_novos JSONB,
  usuario_id UUID,
  ip_address INET,
  user_agent TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
```

**Verificacao SQL:**
```sql
SELECT * FROM audit_check_audit_log_integrity();
```

**Severidade:** HIGH (audit log ausente = -15 pontos)

---

## 7. Performance

### 7.1 Query Analysis
```sql
-- Queries lentas
SELECT
  query,
  calls,
  mean_time,
  total_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 10;
```

### 7.2 Table Bloat
```sql
-- Verificar bloat
SELECT
  relname,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

### 7.3 Connection Pooling
- [ ] Pooler configurado
- [ ] Max connections adequado
- [ ] Timeout definido

---

## 8. Backup e Recovery

### 8.1 Backup
- [ ] Backup automatico configurado
- [ ] Point-in-time recovery habilitado
- [ ] Backup testado

### 8.2 Retention
- [ ] Retencao minima de 30 dias
- [ ] Retencao de 5 anos para dados ANVISA

---

## 9. Extensions

### 9.1 Required Extensions
- [ ] `uuid-ossp` para UUIDs
- [ ] `pgcrypto` para criptografia
- [ ] `pg_stat_statements` para metricas

### 9.2 Optional Extensions
- [ ] `pg_trgm` para busca fuzzy
- [ ] `pgvector` para embeddings AI
- [ ] `postgis` para geolocation

**Verificacao SQL:**
```sql
SELECT * FROM pg_extension;
```

---

## 10. Data Integrity

### 10.1 Constraints
- [ ] NOT NULL onde necessario
- [ ] CHECK constraints para validacao
- [ ] UNIQUE constraints onde aplicavel
- [ ] DEFAULT values definidos

### 10.2 Soft Delete
- [ ] excluido_em para soft delete
- [ ] Queries filtram excluido_em IS NULL
- [ ] Politicas RLS consideram soft delete

---

## SQL Functions de Auditoria

### audit_check_rls_status()
```sql
CREATE OR REPLACE FUNCTION audit_check_rls_status()
RETURNS TABLE (
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count INTEGER,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.relname::TEXT,
    c.relrowsecurity,
    (SELECT COUNT(*)::INTEGER FROM pg_policies p WHERE p.tablename = c.relname),
    CASE
      WHEN NOT c.relrowsecurity THEN 'CRITICAL: RLS disabled'
      WHEN (SELECT COUNT(*) FROM pg_policies p WHERE p.tablename = c.relname) = 0 THEN 'WARNING: No policies'
      ELSE 'OK'
    END
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
  AND c.relkind = 'r';
END;
$$ LANGUAGE plpgsql;
```

### audit_check_required_columns()
```sql
CREATE OR REPLACE FUNCTION audit_check_required_columns()
RETURNS TABLE (
  table_name TEXT,
  missing_columns TEXT[],
  status TEXT
) AS $$
DECLARE
  required TEXT[] := ARRAY['id', 'empresa_id', 'criado_em', 'atualizado_em'];
BEGIN
  RETURN QUERY
  SELECT
    t.table_name::TEXT,
    ARRAY(
      SELECT unnest(required)
      EXCEPT
      SELECT column_name FROM information_schema.columns c
      WHERE c.table_name = t.table_name AND c.table_schema = 'public'
    ),
    CASE
      WHEN ARRAY_LENGTH(ARRAY(
        SELECT unnest(required)
        EXCEPT
        SELECT column_name FROM information_schema.columns c
        WHERE c.table_name = t.table_name AND c.table_schema = 'public'
      ), 1) > 0 THEN 'MISSING COLUMNS'
      ELSE 'OK'
    END
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE';
END;
$$ LANGUAGE plpgsql;
```

---

## Calculo de Score

```typescript
const databaseChecks = {
  schema: { weight: 15, checks: ['columns', 'naming', 'types'] },
  rls: { weight: 30, checks: ['enabled', 'policies'] },
  indexes: { weight: 15, checks: ['empresaId', 'fk', 'search'] },
  fk: { weight: 10, checks: ['defined', 'cascade', 'integrity'] },
  triggers: { weight: 10, checks: ['updatedAt', 'audit'] },
  audit: { weight: 10, checks: ['log', 'integrity'] },
  performance: { weight: 5, checks: ['queries', 'bloat', 'pooling'] },
  backup: { weight: 5, checks: ['configured', 'tested', 'retention'] },
};

// Score = 100 - penalties
```

---

## Comandos de Auditoria

```bash
# Executar auditoria de database
@auditor database

# Via SQL
SELECT audit_full_database_check();
```

---

**Versao:** 2.0.0
**Ultima Atualizacao:** 2025-11-25
