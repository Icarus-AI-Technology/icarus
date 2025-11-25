-- ============================================================================
-- ICARUS AUDITOR - SQL Functions
-- Funcoes SQL para auditoria automatizada do banco de dados
-- Versao: 2.0.0
-- ============================================================================

-- ============================================================================
-- 1. FUNCOES DE VERIFICACAO (AUDIT)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- audit_check_rls_status()
-- Verifica status de RLS em todas as tabelas
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit_check_rls_status()
RETURNS TABLE (
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count INTEGER,
  status TEXT,
  severity TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.relname::TEXT AS table_name,
    c.relrowsecurity AS rls_enabled,
    (
      SELECT COUNT(*)::INTEGER
      FROM pg_policies p
      WHERE p.tablename = c.relname
    ) AS policy_count,
    CASE
      WHEN NOT c.relrowsecurity THEN 'CRITICAL: RLS disabled'
      WHEN (SELECT COUNT(*) FROM pg_policies p WHERE p.tablename = c.relname) = 0 THEN 'WARNING: No policies'
      ELSE 'OK'
    END AS status,
    CASE
      WHEN NOT c.relrowsecurity THEN 'CRITICAL'
      WHEN (SELECT COUNT(*) FROM pg_policies p WHERE p.tablename = c.relname) = 0 THEN 'HIGH'
      ELSE 'OK'
    END AS severity
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname NOT LIKE 'pg_%'
  AND c.relname NOT LIKE '_prisma%'
  ORDER BY
    CASE WHEN NOT c.relrowsecurity THEN 0 ELSE 1 END,
    c.relname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- audit_check_required_columns()
-- Verifica se tabelas possuem colunas obrigatorias
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit_check_required_columns()
RETURNS TABLE (
  table_name TEXT,
  missing_columns TEXT[],
  status TEXT,
  severity TEXT
) AS $$
DECLARE
  required_cols TEXT[] := ARRAY['id', 'empresa_id', 'criado_em', 'atualizado_em'];
BEGIN
  RETURN QUERY
  SELECT
    t.table_name::TEXT,
    ARRAY(
      SELECT unnest(required_cols)
      EXCEPT
      SELECT column_name::TEXT
      FROM information_schema.columns c
      WHERE c.table_name = t.table_name
      AND c.table_schema = 'public'
    ) AS missing_cols,
    CASE
      WHEN ARRAY_LENGTH(ARRAY(
        SELECT unnest(required_cols)
        EXCEPT
        SELECT column_name::TEXT
        FROM information_schema.columns c
        WHERE c.table_name = t.table_name
        AND c.table_schema = 'public'
      ), 1) > 0 THEN 'MISSING COLUMNS'
      ELSE 'OK'
    END AS status,
    CASE
      WHEN 'empresa_id' = ANY(ARRAY(
        SELECT unnest(required_cols)
        EXCEPT
        SELECT column_name::TEXT
        FROM information_schema.columns c
        WHERE c.table_name = t.table_name
        AND c.table_schema = 'public'
      )) THEN 'CRITICAL'
      WHEN ARRAY_LENGTH(ARRAY(
        SELECT unnest(required_cols)
        EXCEPT
        SELECT column_name::TEXT
        FROM information_schema.columns c
        WHERE c.table_name = t.table_name
        AND c.table_schema = 'public'
      ), 1) > 0 THEN 'MEDIUM'
      ELSE 'OK'
    END AS severity
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name NOT LIKE 'pg_%'
  AND t.table_name NOT LIKE '_prisma%'
  ORDER BY severity, t.table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- audit_check_indexes()
-- Verifica indices em colunas empresa_id
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit_check_indexes()
RETURNS TABLE (
  table_name TEXT,
  has_empresa_id BOOLEAN,
  has_empresa_id_index BOOLEAN,
  index_name TEXT,
  status TEXT,
  severity TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.table_name::TEXT,
    EXISTS (
      SELECT 1 FROM information_schema.columns c
      WHERE c.table_name = t.table_name
      AND c.table_schema = 'public'
      AND c.column_name = 'empresa_id'
    ) AS has_empresa_id,
    EXISTS (
      SELECT 1 FROM pg_indexes i
      WHERE i.tablename = t.table_name
      AND i.indexdef LIKE '%empresa_id%'
    ) AS has_empresa_id_index,
    (
      SELECT i.indexname
      FROM pg_indexes i
      WHERE i.tablename = t.table_name
      AND i.indexdef LIKE '%empresa_id%'
      LIMIT 1
    )::TEXT AS index_name,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_name = t.table_name
        AND c.table_schema = 'public'
        AND c.column_name = 'empresa_id'
      ) AND NOT EXISTS (
        SELECT 1 FROM pg_indexes i
        WHERE i.tablename = t.table_name
        AND i.indexdef LIKE '%empresa_id%'
      ) THEN 'MISSING INDEX on empresa_id'
      ELSE 'OK'
    END AS status,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_name = t.table_name
        AND c.table_schema = 'public'
        AND c.column_name = 'empresa_id'
      ) AND NOT EXISTS (
        SELECT 1 FROM pg_indexes i
        WHERE i.tablename = t.table_name
        AND i.indexdef LIKE '%empresa_id%'
      ) THEN 'MEDIUM'
      ELSE 'OK'
    END AS severity
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name NOT LIKE 'pg_%'
  ORDER BY severity DESC, t.table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- audit_check_triggers()
-- Verifica triggers de updated_at
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit_check_triggers()
RETURNS TABLE (
  table_name TEXT,
  has_updated_at BOOLEAN,
  has_trigger BOOLEAN,
  trigger_name TEXT,
  status TEXT,
  severity TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.table_name::TEXT,
    EXISTS (
      SELECT 1 FROM information_schema.columns c
      WHERE c.table_name = t.table_name
      AND c.table_schema = 'public'
      AND c.column_name = 'atualizado_em'
    ) AS has_updated_at,
    EXISTS (
      SELECT 1 FROM pg_trigger tr
      JOIN pg_class c ON tr.tgrelid = c.oid
      WHERE c.relname = t.table_name
      AND tr.tgname LIKE '%updated_at%'
    ) AS has_trigger,
    (
      SELECT tr.tgname
      FROM pg_trigger tr
      JOIN pg_class c ON tr.tgrelid = c.oid
      WHERE c.relname = t.table_name
      AND tr.tgname LIKE '%updated_at%'
      LIMIT 1
    )::TEXT AS trigger_name,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_name = t.table_name
        AND c.table_schema = 'public'
        AND c.column_name = 'atualizado_em'
      ) AND NOT EXISTS (
        SELECT 1 FROM pg_trigger tr
        JOIN pg_class c ON tr.tgrelid = c.oid
        WHERE c.relname = t.table_name
        AND tr.tgname LIKE '%updated_at%'
      ) THEN 'MISSING TRIGGER'
      ELSE 'OK'
    END AS status,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_name = t.table_name
        AND c.table_schema = 'public'
        AND c.column_name = 'atualizado_em'
      ) AND NOT EXISTS (
        SELECT 1 FROM pg_trigger tr
        JOIN pg_class c ON tr.tgrelid = c.oid
        WHERE c.relname = t.table_name
        AND tr.tgname LIKE '%updated_at%'
      ) THEN 'LOW'
      ELSE 'OK'
    END AS severity
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name NOT LIKE 'pg_%'
  ORDER BY severity DESC, t.table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- audit_check_anvisa_compliance()
-- Verifica compliance ANVISA
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit_check_anvisa_compliance()
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  details TEXT,
  severity TEXT
) AS $$
BEGIN
  -- Verificar tabela produtos existe
  RETURN QUERY
  SELECT
    'Tabela produtos existe'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'produtos' AND table_schema = 'public'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'Tabela produtos'::TEXT,
    CASE WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'produtos' AND table_schema = 'public'
    ) THEN 'CRITICAL' ELSE 'OK' END;

  -- Verificar campo registro_anvisa
  RETURN QUERY
  SELECT
    'Campo registro_anvisa em produtos'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'produtos' AND column_name = 'registro_anvisa'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'Coluna registro_anvisa'::TEXT,
    CASE WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'produtos' AND column_name = 'registro_anvisa'
    ) THEN 'HIGH' ELSE 'OK' END;

  -- Verificar tabela lotes existe
  RETURN QUERY
  SELECT
    'Tabela lotes existe'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'lotes' AND table_schema = 'public'
    ) THEN 'PASS' ELSE 'WARN' END,
    'Tabela lotes para controle de validade'::TEXT,
    CASE WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'lotes' AND table_schema = 'public'
    ) THEN 'MEDIUM' ELSE 'OK' END;

  -- Verificar rastreabilidade OPME
  RETURN QUERY
  SELECT
    'Tabela rastreabilidade_opme existe'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name IN ('rastreabilidade_opme', 'implantes', 'rastreabilidade')
      AND table_schema = 'public'
    ) THEN 'PASS' ELSE 'WARN' END,
    'Rastreabilidade de implantes'::TEXT,
    CASE WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name IN ('rastreabilidade_opme', 'implantes', 'rastreabilidade')
      AND table_schema = 'public'
    ) THEN 'MEDIUM' ELSE 'OK' END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- audit_check_lgpd_compliance()
-- Verifica compliance LGPD
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit_check_lgpd_compliance()
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  details TEXT,
  severity TEXT
) AS $$
BEGIN
  -- Verificar tabela audit_log
  RETURN QUERY
  SELECT
    'Tabela audit_log existe'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'audit_log' AND table_schema = 'public'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'Audit log para rastreabilidade LGPD'::TEXT,
    CASE WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'audit_log' AND table_schema = 'public'
    ) THEN 'HIGH' ELSE 'OK' END;

  -- Verificar tabela consentimentos
  RETURN QUERY
  SELECT
    'Tabela consentimentos existe'::TEXT,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'consentimentos' AND table_schema = 'public'
    ) THEN 'PASS' ELSE 'WARN' END,
    'Registro de consentimentos LGPD'::TEXT,
    CASE WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'consentimentos' AND table_schema = 'public'
    ) THEN 'MEDIUM' ELSE 'OK' END;

  -- Verificar soft delete (excluido_em)
  RETURN QUERY
  SELECT
    'Soft delete implementado'::TEXT,
    CASE WHEN (
      SELECT COUNT(*) FROM information_schema.columns
      WHERE column_name = 'excluido_em' AND table_schema = 'public'
    ) > 5 THEN 'PASS' ELSE 'WARN' END,
    (SELECT COUNT(*)::TEXT || ' tabelas com excluido_em' FROM information_schema.columns
     WHERE column_name = 'excluido_em' AND table_schema = 'public'),
    CASE WHEN (
      SELECT COUNT(*) FROM information_schema.columns
      WHERE column_name = 'excluido_em' AND table_schema = 'public'
    ) <= 5 THEN 'LOW' ELSE 'OK' END;

  -- Verificar criado_por e atualizado_por
  RETURN QUERY
  SELECT
    'Rastreabilidade de usuario'::TEXT,
    CASE WHEN (
      SELECT COUNT(*) FROM information_schema.columns
      WHERE column_name IN ('criado_por', 'atualizado_por') AND table_schema = 'public'
    ) > 10 THEN 'PASS' ELSE 'WARN' END,
    'Colunas criado_por/atualizado_por'::TEXT,
    CASE WHEN (
      SELECT COUNT(*) FROM information_schema.columns
      WHERE column_name IN ('criado_por', 'atualizado_por') AND table_schema = 'public'
    ) <= 10 THEN 'LOW' ELSE 'OK' END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- audit_check_audit_log_integrity()
-- Verifica integridade do audit log
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit_check_audit_log_integrity()
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  details TEXT,
  severity TEXT
) AS $$
BEGIN
  -- Verificar se audit_log existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'audit_log' AND table_schema = 'public'
  ) THEN
    RETURN QUERY SELECT
      'Audit log'::TEXT,
      'FAIL'::TEXT,
      'Tabela audit_log nao existe'::TEXT,
      'CRITICAL'::TEXT;
    RETURN;
  END IF;

  -- Verificar estrutura
  RETURN QUERY
  SELECT
    'Estrutura audit_log'::TEXT,
    CASE WHEN (
      SELECT COUNT(*) FROM information_schema.columns
      WHERE table_name = 'audit_log'
      AND column_name IN ('id', 'empresa_id', 'tabela', 'operacao', 'registro_id', 'criado_em')
    ) >= 5 THEN 'PASS' ELSE 'WARN' END,
    'Colunas obrigatorias'::TEXT,
    CASE WHEN (
      SELECT COUNT(*) FROM information_schema.columns
      WHERE table_name = 'audit_log'
      AND column_name IN ('id', 'empresa_id', 'tabela', 'operacao', 'registro_id', 'criado_em')
    ) < 5 THEN 'MEDIUM' ELSE 'OK' END;

  -- Verificar RLS em audit_log
  RETURN QUERY
  SELECT
    'RLS em audit_log'::TEXT,
    CASE WHEN (
      SELECT relrowsecurity FROM pg_class WHERE relname = 'audit_log'
    ) THEN 'PASS' ELSE 'FAIL' END,
    'Row Level Security'::TEXT,
    CASE WHEN NOT (
      SELECT relrowsecurity FROM pg_class WHERE relname = 'audit_log'
    ) THEN 'CRITICAL' ELSE 'OK' END;

  -- Contar registros
  RETURN QUERY
  SELECT
    'Registros audit_log'::TEXT,
    'INFO'::TEXT,
    (SELECT COUNT(*)::TEXT || ' registros' FROM audit_log),
    'INFO'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- audit_full_database_check()
-- Executa verificacao completa do banco
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit_full_database_check()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  rls_issues INTEGER;
  column_issues INTEGER;
  index_issues INTEGER;
  trigger_issues INTEGER;
BEGIN
  -- Contar issues de cada tipo
  SELECT COUNT(*) INTO rls_issues
  FROM audit_check_rls_status()
  WHERE severity IN ('CRITICAL', 'HIGH');

  SELECT COUNT(*) INTO column_issues
  FROM audit_check_required_columns()
  WHERE severity IN ('CRITICAL', 'MEDIUM');

  SELECT COUNT(*) INTO index_issues
  FROM audit_check_indexes()
  WHERE severity = 'MEDIUM';

  SELECT COUNT(*) INTO trigger_issues
  FROM audit_check_triggers()
  WHERE severity IN ('LOW', 'MEDIUM');

  -- Montar resultado
  result := jsonb_build_object(
    'timestamp', NOW(),
    'summary', jsonb_build_object(
      'rls_issues', rls_issues,
      'column_issues', column_issues,
      'index_issues', index_issues,
      'trigger_issues', trigger_issues,
      'total_issues', rls_issues + column_issues + index_issues + trigger_issues
    ),
    'score', GREATEST(0, 100 - (rls_issues * 30) - (column_issues * 5) - (index_issues * 5) - (trigger_issues * 2)),
    'status', CASE
      WHEN rls_issues > 0 THEN 'CRITICAL'
      WHEN column_issues > 0 OR index_issues > 3 THEN 'WARNING'
      ELSE 'OK'
    END
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 2. FUNCOES DE CORRECAO (FIX)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- audit_fix_enable_rls()
-- Habilita RLS em tabelas sem RLS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit_fix_enable_rls()
RETURNS TABLE (
  table_name TEXT,
  action TEXT,
  status TEXT
) AS $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND NOT c.relrowsecurity
    AND c.relname NOT LIKE 'pg_%'
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', rec.relname);
      RETURN QUERY SELECT rec.relname::TEXT, 'ENABLE RLS'::TEXT, 'SUCCESS'::TEXT;
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT rec.relname::TEXT, 'ENABLE RLS'::TEXT, ('ERROR: ' || SQLERRM)::TEXT;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- audit_fix_create_empresa_indexes()
-- Cria indices em colunas empresa_id
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit_fix_create_empresa_indexes()
RETURNS TABLE (
  table_name TEXT,
  action TEXT,
  status TEXT
) AS $$
DECLARE
  rec RECORD;
  idx_name TEXT;
BEGIN
  FOR rec IN
    SELECT t.table_name
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND EXISTS (
      SELECT 1 FROM information_schema.columns c
      WHERE c.table_name = t.table_name
      AND c.table_schema = 'public'
      AND c.column_name = 'empresa_id'
    )
    AND NOT EXISTS (
      SELECT 1 FROM pg_indexes i
      WHERE i.tablename = t.table_name
      AND i.indexdef LIKE '%empresa_id%'
    )
  LOOP
    BEGIN
      idx_name := 'idx_' || rec.table_name || '_empresa_id';

      -- Verificar se tem coluna excluido_em para partial index
      IF EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_name = rec.table_name
        AND c.column_name = 'excluido_em'
      ) THEN
        EXECUTE format(
          'CREATE INDEX %I ON %I (empresa_id) WHERE excluido_em IS NULL',
          idx_name, rec.table_name
        );
      ELSE
        EXECUTE format(
          'CREATE INDEX %I ON %I (empresa_id)',
          idx_name, rec.table_name
        );
      END IF;

      RETURN QUERY SELECT rec.table_name::TEXT, ('CREATE INDEX ' || idx_name)::TEXT, 'SUCCESS'::TEXT;
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT rec.table_name::TEXT, 'CREATE INDEX'::TEXT, ('ERROR: ' || SQLERRM)::TEXT;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- audit_fix_create_updated_at_triggers()
-- Cria triggers de updated_at
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit_fix_create_updated_at_triggers()
RETURNS TABLE (
  table_name TEXT,
  action TEXT,
  status TEXT
) AS $$
DECLARE
  rec RECORD;
  trigger_name TEXT;
BEGIN
  -- Primeiro criar a funcao se nao existir
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
  ) THEN
    EXECUTE $func$
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $trigger$
      BEGIN
        NEW.atualizado_em = NOW();
        RETURN NEW;
      END;
      $trigger$ LANGUAGE plpgsql;
    $func$;
  END IF;

  -- Criar triggers nas tabelas que precisam
  FOR rec IN
    SELECT t.table_name
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND EXISTS (
      SELECT 1 FROM information_schema.columns c
      WHERE c.table_name = t.table_name
      AND c.column_name = 'atualizado_em'
    )
    AND NOT EXISTS (
      SELECT 1 FROM pg_trigger tr
      JOIN pg_class c ON tr.tgrelid = c.oid
      WHERE c.relname = t.table_name
      AND tr.tgname LIKE '%updated_at%'
    )
  LOOP
    BEGIN
      trigger_name := 'trg_' || rec.table_name || '_updated_at';

      EXECUTE format(
        'CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
        trigger_name, rec.table_name
      );

      RETURN QUERY SELECT rec.table_name::TEXT, ('CREATE TRIGGER ' || trigger_name)::TEXT, 'SUCCESS'::TEXT;
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT rec.table_name::TEXT, 'CREATE TRIGGER'::TEXT, ('ERROR: ' || SQLERRM)::TEXT;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 3. GRANTS (Permissoes)
-- ============================================================================

-- Garantir que funcoes de auditoria possam ser executadas
GRANT EXECUTE ON FUNCTION audit_check_rls_status() TO authenticated;
GRANT EXECUTE ON FUNCTION audit_check_required_columns() TO authenticated;
GRANT EXECUTE ON FUNCTION audit_check_indexes() TO authenticated;
GRANT EXECUTE ON FUNCTION audit_check_triggers() TO authenticated;
GRANT EXECUTE ON FUNCTION audit_check_anvisa_compliance() TO authenticated;
GRANT EXECUTE ON FUNCTION audit_check_lgpd_compliance() TO authenticated;
GRANT EXECUTE ON FUNCTION audit_check_audit_log_integrity() TO authenticated;
GRANT EXECUTE ON FUNCTION audit_full_database_check() TO authenticated;

-- Funcoes de fix apenas para service_role
GRANT EXECUTE ON FUNCTION audit_fix_enable_rls() TO service_role;
GRANT EXECUTE ON FUNCTION audit_fix_create_empresa_indexes() TO service_role;
GRANT EXECUTE ON FUNCTION audit_fix_create_updated_at_triggers() TO service_role;


-- ============================================================================
-- 4. COMENTARIOS
-- ============================================================================

COMMENT ON FUNCTION audit_check_rls_status() IS 'Verifica status de RLS em todas as tabelas publicas';
COMMENT ON FUNCTION audit_check_required_columns() IS 'Verifica colunas obrigatorias (id, empresa_id, criado_em, atualizado_em)';
COMMENT ON FUNCTION audit_check_indexes() IS 'Verifica indices em empresa_id';
COMMENT ON FUNCTION audit_check_triggers() IS 'Verifica triggers de updated_at';
COMMENT ON FUNCTION audit_check_anvisa_compliance() IS 'Verifica compliance com requisitos ANVISA';
COMMENT ON FUNCTION audit_check_lgpd_compliance() IS 'Verifica compliance com LGPD';
COMMENT ON FUNCTION audit_check_audit_log_integrity() IS 'Verifica integridade da tabela audit_log';
COMMENT ON FUNCTION audit_full_database_check() IS 'Executa verificacao completa e retorna score';
COMMENT ON FUNCTION audit_fix_enable_rls() IS 'Habilita RLS em tabelas sem RLS';
COMMENT ON FUNCTION audit_fix_create_empresa_indexes() IS 'Cria indices em empresa_id';
COMMENT ON FUNCTION audit_fix_create_updated_at_triggers() IS 'Cria triggers de updated_at';
