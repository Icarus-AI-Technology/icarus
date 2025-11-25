-- =====================================================
-- ICARUS AUDITOR - SCRIPT DE AUDITORIA COMPLETA
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- ===================================================
-- 1. FUNCOES AUXILIARES DE AUDITORIA
-- ===================================================

-- Funcao para verificar status do RLS
CREATE OR REPLACE FUNCTION audit_check_rls_status()
RETURNS TABLE (
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count INTEGER,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.tablename::TEXT,
    t.rowsecurity AS rls_enabled,
    COALESCE(p.policy_count, 0)::INTEGER,
    CASE
      WHEN NOT t.rowsecurity THEN 'CRITICAL: RLS disabled'
      WHEN COALESCE(p.policy_count, 0) = 0 THEN 'WARNING: No policies'
      ELSE 'OK'
    END AS status
  FROM pg_tables t
  LEFT JOIN (
    SELECT tablename, COUNT(*) AS policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY tablename
  ) p ON t.tablename = p.tablename
  WHERE t.schemaname = 'public'
    AND t.tablename NOT IN ('schema_migrations', 'migrations', 'spatial_ref_sys')
  ORDER BY
    CASE WHEN NOT t.rowsecurity THEN 0 ELSE 1 END,
    t.tablename;
END;
$$;

-- Funcao para verificar colunas obrigatorias
CREATE OR REPLACE FUNCTION audit_check_required_columns()
RETURNS TABLE (
  table_name TEXT,
  has_id BOOLEAN,
  has_empresa_id BOOLEAN,
  has_criado_em BOOLEAN,
  has_atualizado_em BOOLEAN,
  has_excluido_em BOOLEAN,
  missing_columns TEXT[],
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH table_columns AS (
    SELECT
      t.table_name,
      bool_or(c.column_name = 'id') AS has_id,
      bool_or(c.column_name = 'empresa_id') AS has_empresa_id,
      bool_or(c.column_name = 'criado_em') AS has_criado_em,
      bool_or(c.column_name = 'atualizado_em') AS has_atualizado_em,
      bool_or(c.column_name = 'excluido_em') AS has_excluido_em
    FROM information_schema.tables t
    LEFT JOIN information_schema.columns c ON c.table_name = t.table_name AND c.table_schema = t.table_schema
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND t.table_name NOT IN ('schema_migrations', 'migrations', 'audit_log', 'lgpd_audit_log', 'system_logs')
    GROUP BY t.table_name
  )
  SELECT
    tc.table_name::TEXT,
    tc.has_id,
    tc.has_empresa_id,
    tc.has_criado_em,
    tc.has_atualizado_em,
    tc.has_excluido_em,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN NOT tc.has_id THEN 'id' END,
      CASE WHEN NOT tc.has_empresa_id THEN 'empresa_id' END,
      CASE WHEN NOT tc.has_criado_em THEN 'criado_em' END,
      CASE WHEN NOT tc.has_atualizado_em THEN 'atualizado_em' END,
      CASE WHEN NOT tc.has_excluido_em THEN 'excluido_em' END
    ], NULL)::TEXT[] AS missing_columns,
    CASE
      WHEN NOT tc.has_empresa_id THEN 'CRITICAL: Missing empresa_id'
      WHEN NOT tc.has_excluido_em THEN 'WARNING: Missing soft delete'
      WHEN NOT tc.has_criado_em OR NOT tc.has_atualizado_em THEN 'WARNING: Missing timestamps'
      ELSE 'OK'
    END AS status
  FROM table_columns tc
  ORDER BY
    CASE WHEN NOT tc.has_empresa_id THEN 0 ELSE 1 END,
    CASE WHEN NOT tc.has_excluido_em THEN 0 ELSE 1 END,
    tc.table_name;
END;
$$;

-- Funcao para verificar indices
CREATE OR REPLACE FUNCTION audit_check_indexes()
RETURNS TABLE (
  table_name TEXT,
  has_empresa_idx BOOLEAN,
  has_pk BOOLEAN,
  total_indexes INTEGER,
  missing_indexes TEXT[],
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH table_indexes AS (
    SELECT
      t.tablename AS table_name,
      bool_or(i.indexdef LIKE '%empresa_id%') AS has_empresa_idx,
      bool_or(i.indexdef LIKE '%PRIMARY%' OR i.indexname LIKE '%pkey%') AS has_pk,
      COUNT(DISTINCT i.indexname) AS total_indexes
    FROM pg_tables t
    LEFT JOIN pg_indexes i ON i.tablename = t.tablename AND i.schemaname = t.schemaname
    WHERE t.schemaname = 'public'
      AND t.tablename NOT IN ('schema_migrations', 'migrations')
    GROUP BY t.tablename
  ),
  columns_needing_idx AS (
    SELECT
      c.table_name,
      c.column_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.column_name = 'empresa_id'
      AND NOT EXISTS (
        SELECT 1 FROM pg_indexes i
        WHERE i.tablename = c.table_name
          AND i.indexdef LIKE '%empresa_id%'
      )
  )
  SELECT
    ti.table_name::TEXT,
    ti.has_empresa_idx,
    ti.has_pk,
    ti.total_indexes::INTEGER,
    COALESCE(
      ARRAY_AGG(DISTINCT cni.column_name) FILTER (WHERE cni.column_name IS NOT NULL),
      ARRAY[]::TEXT[]
    ) AS missing_indexes,
    CASE
      WHEN NOT ti.has_empresa_idx AND EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_name = ti.table_name AND c.column_name = 'empresa_id'
      ) THEN 'WARNING: Missing empresa_id index'
      ELSE 'OK'
    END AS status
  FROM table_indexes ti
  LEFT JOIN columns_needing_idx cni ON cni.table_name = ti.table_name
  GROUP BY ti.table_name, ti.has_empresa_idx, ti.has_pk, ti.total_indexes
  ORDER BY
    CASE WHEN NOT ti.has_empresa_idx THEN 0 ELSE 1 END,
    ti.table_name;
END;
$$;

-- Funcao para verificar compliance ANVISA
CREATE OR REPLACE FUNCTION audit_check_anvisa_compliance()
RETURNS TABLE (
  check_name TEXT,
  check_result TEXT,
  affected_count INTEGER,
  severity TEXT,
  recommendation TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Check 1: Produtos sem registro ANVISA
  SELECT COUNT(*) INTO v_count
  FROM produtos
  WHERE (registro_anvisa IS NULL OR registro_anvisa = '')
    AND status = 'ativo'
    AND excluido_em IS NULL;

  RETURN QUERY SELECT
    'Produtos sem registro ANVISA'::TEXT,
    CASE WHEN v_count = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
    v_count,
    'CRITICAL'::TEXT,
    'Todos os produtos ativos devem ter registro ANVISA valido'::TEXT;

  -- Check 2: Lotes sem numero de lote
  SELECT COUNT(*) INTO v_count
  FROM lotes l
  WHERE (l.numero_lote IS NULL OR l.numero_lote = '')
    AND l.status != 'consumido'
    AND l.excluido_em IS NULL;

  RETURN QUERY SELECT
    'Lotes sem numero de lote'::TEXT,
    CASE WHEN v_count = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
    v_count,
    'CRITICAL'::TEXT,
    'Todos os lotes devem ter identificacao unica'::TEXT;

  -- Check 3: Lotes vencendo em 90 dias
  SELECT COUNT(*) INTO v_count
  FROM lotes l
  WHERE l.data_validade <= CURRENT_DATE + INTERVAL '90 days'
    AND l.data_validade > CURRENT_DATE
    AND l.status = 'disponivel'
    AND l.excluido_em IS NULL;

  RETURN QUERY SELECT
    'Lotes vencendo em 90 dias'::TEXT,
    CASE WHEN v_count = 0 THEN 'PASS' ELSE 'WARNING' END::TEXT,
    v_count,
    'HIGH'::TEXT,
    'Verificar e tomar acao sobre lotes proximos do vencimento'::TEXT;

  -- Check 4: Lotes vencidos
  SELECT COUNT(*) INTO v_count
  FROM lotes l
  WHERE l.data_validade < CURRENT_DATE
    AND l.status = 'disponivel'
    AND l.excluido_em IS NULL;

  RETURN QUERY SELECT
    'Lotes vencidos ainda disponiveis'::TEXT,
    CASE WHEN v_count = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
    v_count,
    'CRITICAL'::TEXT,
    'Bloquear imediatamente lotes vencidos'::TEXT;

  -- Check 5: Implantes sem numero de serie
  SELECT COUNT(*) INTO v_count
  FROM lotes l
  JOIN produtos p ON l.produto_id = p.id
  WHERE p.classe_risco IN ('III', 'IV')
    AND (l.numero_serie IS NULL OR l.numero_serie = '')
    AND l.status != 'consumido'
    AND l.excluido_em IS NULL;

  RETURN QUERY SELECT
    'Implantes (Classe III/IV) sem numero de serie'::TEXT,
    CASE WHEN v_count = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
    v_count,
    'CRITICAL'::TEXT,
    'RDC 665/2022 exige numero de serie para implantes'::TEXT;

END;
$$;

-- Funcao para verificar compliance LGPD
CREATE OR REPLACE FUNCTION audit_check_lgpd_compliance()
RETURNS TABLE (
  check_name TEXT,
  check_result TEXT,
  affected_count INTEGER,
  severity TEXT,
  recommendation TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Check 1: Dados de paciente nao minimizados
  SELECT COUNT(*) INTO v_count
  FROM cirurgias
  WHERE LENGTH(paciente_iniciais) > 5
    AND excluido_em IS NULL;

  RETURN QUERY SELECT
    'Dados de paciente nao minimizados (>5 chars)'::TEXT,
    CASE WHEN v_count = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
    v_count,
    'CRITICAL'::TEXT,
    'LGPD Art. 6 III - Dados devem ser limitados ao minimo necessario'::TEXT;

  -- Check 2: Verificar se existe tabela de consentimento
  SELECT COUNT(*) INTO v_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('lgpd_consentimentos', 'consentimentos');

  RETURN QUERY SELECT
    'Tabela de consentimentos existe'::TEXT,
    CASE WHEN v_count > 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
    v_count,
    'HIGH'::TEXT,
    'LGPD Art. 7 - Consentimento deve ser documentado'::TEXT;

  -- Check 3: Verificar audit log
  SELECT COUNT(*) INTO v_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('audit_log', 'lgpd_audit_log');

  RETURN QUERY SELECT
    'Audit log implementado'::TEXT,
    CASE WHEN v_count > 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
    v_count,
    'CRITICAL'::TEXT,
    'LGPD Art. 37 - Manter registro das operacoes de tratamento'::TEXT;

  -- Check 4: Verificar funcoes LGPD
  SELECT COUNT(*) INTO v_count
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_name IN ('lgpd_exportar_dados_titular', 'lgpd_anonimizar_titular');

  RETURN QUERY SELECT
    'Funcoes de direitos do titular implementadas'::TEXT,
    CASE WHEN v_count >= 2 THEN 'PASS' ELSE 'FAIL' END::TEXT,
    v_count,
    'HIGH'::TEXT,
    'LGPD Art. 18 - Direitos de acesso e eliminacao'::TEXT;

END;
$$;

-- Funcao para verificar integridade do audit log
CREATE OR REPLACE FUNCTION audit_check_audit_log_integrity()
RETURNS TABLE (
  check_name TEXT,
  check_result TEXT,
  details TEXT,
  severity TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_broken_chains INTEGER;
  v_total_records INTEGER;
  v_has_hash_columns BOOLEAN;
BEGIN
  -- Verificar se tabela tem colunas de hash
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'audit_log'
      AND column_name IN ('hash_atual', 'hash_anterior')
  ) INTO v_has_hash_columns;

  IF NOT v_has_hash_columns THEN
    RETURN QUERY SELECT
      'Hash chain implementation'::TEXT,
      'FAIL'::TEXT,
      'Colunas hash_atual/hash_anterior nao encontradas'::TEXT,
      'CRITICAL'::TEXT;
    RETURN;
  END IF;

  -- Contar registros totais
  SELECT COUNT(*) INTO v_total_records FROM audit_log;

  -- Verificar chains quebradas
  WITH ordered_logs AS (
    SELECT
      id,
      hash_anterior,
      hash_atual,
      LAG(hash_atual) OVER (ORDER BY criado_em) AS expected_hash
    FROM audit_log
  )
  SELECT COUNT(*) INTO v_broken_chains
  FROM ordered_logs
  WHERE hash_anterior IS NOT NULL
    AND hash_anterior != expected_hash;

  RETURN QUERY SELECT
    'Hash chain integrity'::TEXT,
    CASE WHEN v_broken_chains = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
    format('%s/%s records valid', v_total_records - v_broken_chains, v_total_records)::TEXT,
    CASE WHEN v_broken_chains = 0 THEN 'OK' ELSE 'CRITICAL' END::TEXT;

  -- Verificar se ha policies de UPDATE/DELETE (nao deveria haver)
  RETURN QUERY SELECT
    'Audit log immutability'::TEXT,
    CASE WHEN NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'audit_log' AND cmd IN ('UPDATE', 'DELETE')
    ) THEN 'PASS' ELSE 'FAIL' END::TEXT,
    'Audit log should be append-only'::TEXT,
    'CRITICAL'::TEXT;

END;
$$;

-- ===================================================
-- 2. FUNCAO PRINCIPAL DE AUDITORIA COMPLETA
-- ===================================================

CREATE OR REPLACE FUNCTION audit_full_database_check()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_rls_issues INTEGER;
  v_column_issues INTEGER;
  v_index_issues INTEGER;
  v_anvisa_issues INTEGER;
  v_lgpd_issues INTEGER;
  v_audit_issues INTEGER;
  v_score INTEGER;
BEGIN
  -- Contar issues de RLS
  SELECT COUNT(*) INTO v_rls_issues
  FROM audit_check_rls_status()
  WHERE status != 'OK';

  -- Contar issues de colunas
  SELECT COUNT(*) INTO v_column_issues
  FROM audit_check_required_columns()
  WHERE status != 'OK';

  -- Contar issues de indices
  SELECT COUNT(*) INTO v_index_issues
  FROM audit_check_indexes()
  WHERE status != 'OK';

  -- Contar issues ANVISA
  SELECT COUNT(*) INTO v_anvisa_issues
  FROM audit_check_anvisa_compliance()
  WHERE check_result = 'FAIL';

  -- Contar issues LGPD
  SELECT COUNT(*) INTO v_lgpd_issues
  FROM audit_check_lgpd_compliance()
  WHERE check_result = 'FAIL';

  -- Contar issues de audit log
  SELECT COUNT(*) INTO v_audit_issues
  FROM audit_check_audit_log_integrity()
  WHERE check_result = 'FAIL';

  -- Calcular score
  v_score := GREATEST(0, 100 - (
    v_rls_issues * 15 +
    v_column_issues * 5 +
    v_index_issues * 3 +
    v_anvisa_issues * 10 +
    v_lgpd_issues * 10 +
    v_audit_issues * 20
  ));

  -- Construir resultado
  v_result := jsonb_build_object(
    'timestamp', NOW(),
    'version', '1.0',
    'score', v_score,
    'grade', CASE
      WHEN v_score >= 90 THEN 'A'
      WHEN v_score >= 80 THEN 'B'
      WHEN v_score >= 70 THEN 'C'
      WHEN v_score >= 60 THEN 'D'
      ELSE 'F'
    END,
    'status', CASE
      WHEN v_rls_issues > 0 OR v_audit_issues > 0 THEN 'CRITICAL'
      WHEN v_anvisa_issues > 0 OR v_lgpd_issues > 0 THEN 'FAILED'
      WHEN v_column_issues > 0 OR v_index_issues > 0 THEN 'WARNING'
      ELSE 'PASSED'
    END,
    'summary', jsonb_build_object(
      'rls_issues', v_rls_issues,
      'column_issues', v_column_issues,
      'index_issues', v_index_issues,
      'anvisa_issues', v_anvisa_issues,
      'lgpd_issues', v_lgpd_issues,
      'audit_issues', v_audit_issues,
      'total_issues', v_rls_issues + v_column_issues + v_index_issues + v_anvisa_issues + v_lgpd_issues + v_audit_issues
    ),
    'details', jsonb_build_object(
      'rls', (SELECT jsonb_agg(row_to_json(r)) FROM audit_check_rls_status() r WHERE status != 'OK'),
      'columns', (SELECT jsonb_agg(row_to_json(r)) FROM audit_check_required_columns() r WHERE status != 'OK'),
      'indexes', (SELECT jsonb_agg(row_to_json(r)) FROM audit_check_indexes() r WHERE status != 'OK'),
      'anvisa', (SELECT jsonb_agg(row_to_json(r)) FROM audit_check_anvisa_compliance() r WHERE check_result = 'FAIL'),
      'lgpd', (SELECT jsonb_agg(row_to_json(r)) FROM audit_check_lgpd_compliance() r WHERE check_result = 'FAIL'),
      'audit_log', (SELECT jsonb_agg(row_to_json(r)) FROM audit_check_audit_log_integrity() r WHERE check_result = 'FAIL')
    )
  );

  RETURN v_result;
END;
$$;

-- ===================================================
-- 3. FUNCOES DE CORRECAO AUTOMATICA
-- ===================================================

-- Habilitar RLS em tabelas faltantes
CREATE OR REPLACE FUNCTION audit_fix_enable_rls()
RETURNS TABLE (
  table_name TEXT,
  action_taken TEXT,
  success BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND rowsecurity = false
      AND tablename NOT IN ('schema_migrations', 'migrations')
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', r.tablename);
      RETURN QUERY SELECT r.tablename::TEXT, 'RLS enabled'::TEXT, true;
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT r.tablename::TEXT, SQLERRM::TEXT, false;
    END;
  END LOOP;
END;
$$;

-- Criar indices faltantes em empresa_id
CREATE OR REPLACE FUNCTION audit_fix_create_empresa_indexes()
RETURNS TABLE (
  table_name TEXT,
  index_name TEXT,
  action_taken TEXT,
  success BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r RECORD;
  v_index_name TEXT;
BEGIN
  FOR r IN
    SELECT c.table_name
    FROM information_schema.columns c
    JOIN information_schema.tables t ON t.table_name = c.table_name AND t.table_schema = c.table_schema
    WHERE c.table_schema = 'public'
      AND c.column_name = 'empresa_id'
      AND t.table_type = 'BASE TABLE'
      AND NOT EXISTS (
        SELECT 1 FROM pg_indexes i
        WHERE i.tablename = c.table_name
          AND i.indexdef LIKE '%empresa_id%'
      )
  LOOP
    v_index_name := 'idx_' || r.table_name || '_empresa';
    BEGIN
      -- Verifica se tem coluna excluido_em para criar partial index
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = r.table_name AND column_name = 'excluido_em'
      ) THEN
        EXECUTE format(
          'CREATE INDEX %I ON %I (empresa_id) WHERE excluido_em IS NULL',
          v_index_name,
          r.table_name
        );
      ELSE
        EXECUTE format(
          'CREATE INDEX %I ON %I (empresa_id)',
          v_index_name,
          r.table_name
        );
      END IF;
      RETURN QUERY SELECT r.table_name::TEXT, v_index_name, 'Index created'::TEXT, true;
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT r.table_name::TEXT, v_index_name, SQLERRM::TEXT, false;
    END;
  END LOOP;
END;
$$;

-- Criar trigger de updated_at faltante
CREATE OR REPLACE FUNCTION audit_fix_create_updated_at_triggers()
RETURNS TABLE (
  table_name TEXT,
  trigger_name TEXT,
  action_taken TEXT,
  success BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r RECORD;
  v_trigger_name TEXT;
BEGIN
  -- Primeiro criar a funcao de trigger se nao existir
  EXECUTE $func$
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $t$
    BEGIN
      NEW.atualizado_em = NOW();
      RETURN NEW;
    END;
    $t$ LANGUAGE plpgsql;
  $func$;

  FOR r IN
    SELECT c.table_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.column_name = 'atualizado_em'
      AND NOT EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class cl ON t.tgrelid = cl.oid
        WHERE cl.relname = c.table_name
          AND t.tgname LIKE '%updated_at%'
      )
  LOOP
    v_trigger_name := 'trg_' || r.table_name || '_updated_at';
    BEGIN
      EXECUTE format(
        'CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
        v_trigger_name,
        r.table_name
      );
      RETURN QUERY SELECT r.table_name::TEXT, v_trigger_name, 'Trigger created'::TEXT, true;
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT r.table_name::TEXT, v_trigger_name, SQLERRM::TEXT, false;
    END;
  END LOOP;
END;
$$;

-- ===================================================
-- 4. EXECUTAR AUDITORIA
-- ===================================================

-- Para executar a auditoria completa:
-- SELECT audit_full_database_check();

-- Para ver detalhes de RLS:
-- SELECT * FROM audit_check_rls_status();

-- Para ver colunas faltantes:
-- SELECT * FROM audit_check_required_columns();

-- Para ver indices:
-- SELECT * FROM audit_check_indexes();

-- Para compliance ANVISA:
-- SELECT * FROM audit_check_anvisa_compliance();

-- Para compliance LGPD:
-- SELECT * FROM audit_check_lgpd_compliance();

-- Para integridade do audit log:
-- SELECT * FROM audit_check_audit_log_integrity();

-- Para corrigir problemas:
-- SELECT * FROM audit_fix_enable_rls();
-- SELECT * FROM audit_fix_create_empresa_indexes();
-- SELECT * FROM audit_fix_create_updated_at_triggers();

-- ===================================================
-- 5. VIEW DE RESUMO
-- ===================================================

CREATE OR REPLACE VIEW vw_audit_summary AS
SELECT
  NOW() AS audit_time,
  (SELECT COUNT(*) FROM audit_check_rls_status() WHERE status != 'OK') AS rls_issues,
  (SELECT COUNT(*) FROM audit_check_required_columns() WHERE status != 'OK') AS column_issues,
  (SELECT COUNT(*) FROM audit_check_indexes() WHERE status != 'OK') AS index_issues,
  (SELECT COUNT(*) FROM audit_check_anvisa_compliance() WHERE check_result = 'FAIL') AS anvisa_issues,
  (SELECT COUNT(*) FROM audit_check_lgpd_compliance() WHERE check_result = 'FAIL') AS lgpd_issues;

COMMENT ON VIEW vw_audit_summary IS 'Resumo rapido do status de auditoria do banco de dados';

-- ===================================================
-- FIM DO SCRIPT DE AUDITORIA
-- ===================================================
