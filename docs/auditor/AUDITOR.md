# ICARUS Auditor

> **Sistema de Auditoria Automatizada para ICARUS v6.0**

---

## Visao Geral

O **ICARUS Auditor** e um conjunto de ferramentas e scripts para auditoria completa do sistema, verificando:

- **Seguranca** - RLS, secrets, policies
- **Compliance** - ANVISA, LGPD
- **Performance** - Indices, queries
- **Qualidade** - TypeScript, testes
- **Infraestrutura** - Vercel, Supabase

---

## Arquivos do Auditor

```
icarus/
├── docs/auditor/
│   ├── AUDITOR.md              # Este arquivo
│   ├── EXECUTOR.md             # Guia de execucao
│   └── GENERATE-REPORT.md      # Gerador de relatorio
├── supabase/auditor/
│   └── AUDIT-SQL.sql           # Funcoes SQL de auditoria
└── .github/workflows/
    └── audit.yml               # GitHub Actions workflow
```

---

## Comandos Rapidos

```bash
# Executar auditoria completa no Supabase SQL Editor
SELECT audit_full_database_check();

# Verificar RLS
SELECT * FROM audit_check_rls_status();

# Verificar colunas obrigatorias
SELECT * FROM audit_check_required_columns();

# Verificar indices
SELECT * FROM audit_check_indexes();

# Compliance ANVISA
SELECT * FROM audit_check_anvisa_compliance();

# Compliance LGPD
SELECT * FROM audit_check_lgpd_compliance();

# Integridade do audit log
SELECT * FROM audit_check_audit_log_integrity();
```

---

## Correcoes Automaticas

```sql
-- Habilitar RLS em tabelas faltantes
SELECT * FROM audit_fix_enable_rls();

-- Criar indices faltantes em empresa_id
SELECT * FROM audit_fix_create_empresa_indexes();

-- Criar triggers de updated_at
SELECT * FROM audit_fix_create_updated_at_triggers();
```

---

## Score de Auditoria

| Score | Nota | Status |
|-------|------|--------|
| 90-100 | A | PASSED |
| 80-89 | B | PASSED |
| 70-79 | C | WARNING |
| 60-69 | D | FAILED |
| 0-59 | F | CRITICAL |

### Penalidades

- **RLS Issues**: -15 pontos por issue
- **Column Issues**: -5 pontos por issue
- **Index Issues**: -3 pontos por issue
- **ANVISA Issues**: -10 pontos por issue
- **LGPD Issues**: -10 pontos por issue
- **Audit Issues**: -20 pontos por issue

---

## Proximos Passos

1. Execute o script SQL no Supabase SQL Editor
2. Execute `SELECT audit_full_database_check();`
3. Analise o relatorio JSON retornado
4. Execute funcoes de correcao conforme necessario
5. Re-execute a auditoria para verificar correcoes

---

**Ultima atualizacao:** 2025-11-25
