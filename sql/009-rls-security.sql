-- ============================================================================
-- ICARUS v6.0 - ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS em todas as tabelas com empresa_id
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'empresa_id' 
    AND table_schema = 'public'
    AND table_name NOT LIKE 'vw_%'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', r.table_name);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', r.table_name);
    
    -- Drop existing policies
    EXECUTE format('DROP POLICY IF EXISTS rls_%I_select ON %I', r.table_name, r.table_name);
    EXECUTE format('DROP POLICY IF EXISTS rls_%I_insert ON %I', r.table_name, r.table_name);
    EXECUTE format('DROP POLICY IF EXISTS rls_%I_update ON %I', r.table_name, r.table_name);
    
    -- Create SELECT policy
    EXECUTE format(
      'CREATE POLICY rls_%I_select ON %I FOR SELECT USING (empresa_id = current_empresa())',
      r.table_name, r.table_name
    );
    
    -- Create INSERT policy
    EXECUTE format(
      'CREATE POLICY rls_%I_insert ON %I FOR INSERT WITH CHECK (empresa_id = current_empresa())',
      r.table_name, r.table_name
    );
    
    -- Create UPDATE policy
    EXECUTE format(
      'CREATE POLICY rls_%I_update ON %I FOR UPDATE USING (empresa_id = current_empresa())',
      r.table_name, r.table_name
    );
    
    RAISE NOTICE 'RLS enabled for table: %', r.table_name;
  END LOOP;
END $$;

-- Políticas especiais para tabelas sem soft delete (permitir delete físico)
CREATE POLICY rls_movimentacoes_estoque_delete ON movimentacoes_estoque 
  FOR DELETE USING (empresa_id = current_empresa());

CREATE POLICY rls_chatbot_mensagens_delete ON chatbot_mensagens 
  FOR DELETE USING (empresa_id = current_empresa());

-- Service role bypass (para Edge Functions)
-- Usar supabase.auth.admin ou service_role key

-- ============================================================================
-- POLÍTICAS ADICIONAIS DE SEGURANÇA
-- ============================================================================

-- Impedir acesso a dados de outras empresas mesmo com SQL injection
CREATE OR REPLACE FUNCTION check_empresa_access()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.empresa_id IS DISTINCT FROM current_empresa() THEN
    RAISE EXCEPTION 'Access denied: cannot access data from another company';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rate limiting para consultas InfoSimples
CREATE OR REPLACE FUNCTION check_infosimples_rate_limit(p_empresa_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_limit INTEGER := 100; -- requests por hora
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM infosimples_log
  WHERE empresa_id = p_empresa_id
    AND criado_em > NOW() - INTERVAL '1 hour';
  
  RETURN v_count < v_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNÇÃO DE SETUP INICIAL
-- ============================================================================

CREATE OR REPLACE FUNCTION setup_empresa(
  p_cnpj VARCHAR(18),
  p_razao_social VARCHAR(200),
  p_nome_fantasia VARCHAR(200) DEFAULT NULL,
  p_email VARCHAR(200) DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_empresa_id UUID;
  v_perfil_admin_id UUID;
BEGIN
  -- Criar empresa
  INSERT INTO empresas (cnpj, razao_social, nome_fantasia, email)
  VALUES (p_cnpj, p_razao_social, p_nome_fantasia, p_email)
  RETURNING id INTO v_empresa_id;
  
  -- Criar perfil admin
  INSERT INTO perfis (empresa_id, nome, descricao, is_admin, permissoes)
  VALUES (
    v_empresa_id, 
    'Administrador', 
    'Acesso total ao sistema',
    true,
    '{"all": true}'::jsonb
  )
  RETURNING id INTO v_perfil_admin_id;
  
  -- Criar perfis padrão
  INSERT INTO perfis (empresa_id, nome, descricao, permissoes) VALUES
    (v_empresa_id, 'Gerente', 'Gerenciamento geral', '{"read": true, "write": true, "delete": false}'::jsonb),
    (v_empresa_id, 'Comercial', 'Vendas e clientes', '{"modulos": ["clientes", "cirurgias", "faturamento"]}'::jsonb),
    (v_empresa_id, 'Estoque', 'Controle de estoque', '{"modulos": ["produtos", "lotes", "movimentacoes"]}'::jsonb),
    (v_empresa_id, 'Financeiro', 'Área financeira', '{"modulos": ["faturas", "pagamentos", "contas_bancarias"]}'::jsonb),
    (v_empresa_id, 'Visualizador', 'Apenas leitura', '{"read": true, "write": false}'::jsonb);
  
  -- Criar localização padrão
  INSERT INTO localizacoes (empresa_id, nome, tipo)
  VALUES (v_empresa_id, 'Depósito Principal', 'deposito');
  
  -- Criar configurações padrão
  INSERT INTO configuracoes (empresa_id, chave, valor) VALUES
    (v_empresa_id, 'moeda', '"BRL"'::jsonb),
    (v_empresa_id, 'timezone', '"America/Sao_Paulo"'::jsonb),
    (v_empresa_id, 'idioma', '"pt-BR"'::jsonb),
    (v_empresa_id, 'notificacoes', '{"email": true, "push": true}'::jsonb),
    (v_empresa_id, 'auditoria', '{"enabled": true, "difficulty": 2}'::jsonb);
  
  -- Minerar bloco genesis da blockchain
  PERFORM mine_audit_block(
    v_empresa_id,
    NULL,
    'empresas',
    v_empresa_id,
    'INSERT',
    NULL,
    jsonb_build_object('cnpj', p_cnpj, 'razao_social', p_razao_social),
    NULL,
    NULL,
    NULL,
    2
  );
  
  RETURN v_empresa_id;
END;
$$;

-- ============================================================================
-- GRANTS E PERMISSÕES
-- ============================================================================

-- Revogar acesso público
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- Permitir acesso autenticado
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Service role tem acesso total
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
