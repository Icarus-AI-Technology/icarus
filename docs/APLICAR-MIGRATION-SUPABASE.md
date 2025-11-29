# 📘 Guia: Aplicar Migration no Supabase

**Migration:** `20251129120000_complete_schema.sql`  
**Data:** 29/11/2025  
**Tabelas:** 30+ novas tabelas

---

## 🎯 Problema

O histórico de migrations local está descompasso com o remoto, impedindo o uso de `supabase db push`. 

**Solução:** Aplicar a migration manualmente via Supabase Dashboard.

---

## 📋 Passo a Passo

### Opção 1: Via Supabase Dashboard (Recomendado)

1. **Acessar Dashboard**
   - Ir para: https://supabase.com/dashboard
   - Login com sua conta
   - Selecionar projeto ICARUS

2. **Abrir SQL Editor**
   - Menu lateral → SQL Editor
   - Clicar em "New Query"

3. **Copiar Migration**
   - Abrir arquivo: `supabase/migrations/20251129120000_complete_schema.sql`
   - Copiar TODO o conteúdo (650 linhas)

4. **Executar SQL**
   - Colar no SQL Editor
   - Clicar em "Run" (ou Ctrl/Cmd + Enter)
   - Aguardar conclusão (~5-10 segundos)

5. **Verificar Sucesso**
   ```sql
   -- Query para verificar tabelas criadas
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN (
     'compras_internacionais',
     'video_calls',
     'lancamentos_contabeis',
     'voice_macros',
     'automacoes_ia',
     'api_tokens',
     'rotas_entrega',
     'compliance_checks'
   );
   ```

   **Resultado esperado:** 8 tabelas listadas

---

### Opção 2: Via psql (Terminal)

```bash
# 1. Obter connection string do Supabase
# Dashboard → Settings → Database → Connection string (Direct connection)

# 2. Conectar via psql
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# 3. Executar migration
\i supabase/migrations/20251129120000_complete_schema.sql

# 4. Verificar
\dt

# 5. Sair
\q
```

---

### Opção 3: Via Supabase CLI (Repair)

Se preferir sincronizar o histórico:

```bash
# 1. Marcar migrations remotas como "reverted"
supabase migration repair --status reverted 0000 0001 0002 0003 0004 0005 0006 0007 0008 0009 0010 0011 0012 0013 20250126 20251018 20251019 20251020 202510201244 202510201245 202510201246 202510201247 202510201300 202510201310 202510201311 202510201312 202510201313 202510201320 202510201321 202510201322 202510201323 202510201330 202510201331 202510201332 202510201333 202510201334 202510201340 202510201341 202510201342 202510201343 202510201344 202510201350 202510201400 202510201410 202510201500 202510201600 20251023140 20251023143707 20251025 20251026 20251027013614 20251117 20251117210505 20251118000229 20251118111811 20251118111835 20251118111850 20251118112321 20251118112423 20251118112544 20251118140056 20251118140121 20251118140136 20251118140155 20251118140231 20251118140254 20251118140325 20251118140348 20251118140401 20251118140420 20251118140441 20251118143433 20251118143500 20251118143528 20251118143548 20251118143613 20251119142200 20251119143639 20251119151439 20251119161325 20251119163208 20251119164534 20251119192114 20251119194316 20251119201235 20251119202109 20251119202411 20251119204727 20251123135336 20251123135530 20251123135630 20251123135709 20251123135803 20251123135909 20251123140318 20251123140440 20251123140511 20251123140551 20251123140629 20251123140720 20251123140832 20251123141004 20251123172243 20251123173634 20251124004909 20251124004920 20251124004930 20251124005030 20251124005222 20251124005234 20251124005342 20251124005612 20251124010254 20251125015642 20251125015745 20251125015950 20251125020115 20251125020134 20251125020926 20251125021148 CREATE_STORAGE_BUCKETS.sql

# 2. Aplicar migration
supabase db push
```

⚠️ **ATENÇÃO:** Este método pode causar perda de dados se houver conflito.

---

## ✅ Verificação Pós-Migration

### 1. Verificar Tabelas

```sql
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Esperado:** 50+ tabelas

### 2. Verificar RLS

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;
```

**Esperado:** Todas as tabelas com RLS habilitado

### 3. Verificar Indexes

```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Esperado:** 30+ indexes

### 4. Verificar Functions

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public';
```

**Esperado:** `calcular_custo_importacao`, `update_updated_at_column`

---

## 🔧 Troubleshooting

### Erro: "relation already exists"

**Causa:** Tabela já foi criada anteriormente

**Solução:**
```sql
-- Verificar tabela
SELECT * FROM compras_internacionais LIMIT 1;

-- Se existe, pular criação ou usar IF NOT EXISTS
```

### Erro: "permission denied"

**Causa:** Usuário não tem permissão

**Solução:** Usar credenciais de admin do projeto Supabase

### Erro: "syntax error"

**Causa:** SQL incompatível

**Solução:** Executar em blocos menores, comentar seções problemáticas

---

## 📊 Tabelas Criadas

### Sprint 4 - Compras (4 tabelas)
- `compras_internacionais`
- `simulacoes_importacao`
- `cenarios_importacao`

### Sprint 5 - Vendas/CRM (2 tabelas)
- `importacoes_tabelas_precos`
- `video_calls`
- `call_participantes`

### Sprint 6 - Financeiro (5 tabelas)
- `plano_contas`
- `lancamentos_contabeis`
- `relatorios_financeiros`
- `relatorios_regulatorios`

### Sprint 7 - Compliance (2 tabelas)
- `compliance_checks`
- `compliance_gaps`

### Sprint 8 - IA (11 tabelas)
- `chatbot_metricas`
- `chatbot_intencoes`
- `voice_analytics`
- `voice_transcricoes`
- `voice_biometrics`
- `voice_macros`
- `tooltip_analytics`
- `automacoes_ia`
- `automacao_execucoes`

### Sprint 9 - Sistema (7 tabelas)
- `configuracoes_sistema`
- `system_health_metrics`
- `integracoes_config`
- `integration_logs`
- `api_tokens`
- `rotas_entrega`
- `entregas`

### Auxiliares (1 tabela)
- `veiculos`

**TOTAL:** 32 tabelas

---

## 🎯 Próximos Passos

Após aplicar a migration:

1. ✅ Verificar que hooks Supabase funcionam
2. ✅ Testar formulários CRUD
3. ✅ Popular tabelas com dados de seed (opcional)
4. ✅ Configurar RLS policies customizadas
5. ✅ Testar queries de performance

---

## 📚 Referências

- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview#the-sql-editor)
- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Status:** ⏳ AGUARDANDO APLICAÇÃO  
**Arquivo:** `supabase/migrations/20251129120000_complete_schema.sql`

🎯 **Aplicar esta migration para habilitar todos os 46 hooks Supabase!**

