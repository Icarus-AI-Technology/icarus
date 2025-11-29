-- ============================================================================
-- ICARUS v6.0 - BLOCKCHAIN AUDIT LOG + COMPLIANCE
-- ============================================================================

-- AUDIT LOG com BLOCKCHAIN
CREATE TABLE audit_log_blockchain (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Blockchain
  block_index BIGINT NOT NULL,
  previous_hash VARCHAR(64) NOT NULL,
  hash VARCHAR(64) NOT NULL,
  nonce BIGINT NOT NULL,
  difficulty INTEGER DEFAULT 2,
  
  -- Audit data
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  usuario_id UUID REFERENCES usuarios(id),
  tabela VARCHAR(100) NOT NULL,
  registro_id UUID NOT NULL,
  acao VARCHAR(20) NOT NULL CHECK (acao IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT', 'EXPORT')),
  
  -- Dados
  dados_antes JSONB,
  dados_depois JSONB,
  campos_alterados TEXT[],
  
  -- Request info
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(100),
  
  -- Timestamp (parte do hash)
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_hash CHECK (length(hash) = 64),
  CONSTRAINT valid_prev_hash CHECK (length(previous_hash) = 64)
);

-- Índice único para garantir chain
CREATE UNIQUE INDEX idx_audit_block_index ON audit_log_blockchain(empresa_id, block_index);

-- Função para calcular hash SHA-256 do bloco
CREATE OR REPLACE FUNCTION calculate_block_hash(
  p_index BIGINT,
  p_timestamp TIMESTAMPTZ,
  p_previous_hash VARCHAR(64),
  p_data JSONB,
  p_nonce BIGINT
) RETURNS VARCHAR(64)
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  v_content TEXT;
BEGIN
  v_content := p_index::text || 
               extract(epoch from p_timestamp)::text || 
               p_previous_hash || 
               p_data::text || 
               p_nonce::text;
  
  RETURN encode(sha256(v_content::bytea), 'hex');
END;
$$;

-- Função para minerar bloco (Proof of Work)
CREATE OR REPLACE FUNCTION mine_audit_block(
  p_empresa_id UUID,
  p_usuario_id UUID,
  p_tabela VARCHAR(100),
  p_registro_id UUID,
  p_acao VARCHAR(20),
  p_dados_antes JSONB DEFAULT NULL,
  p_dados_depois JSONB DEFAULT NULL,
  p_campos_alterados TEXT[] DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_difficulty INTEGER DEFAULT 2
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_previous_block RECORD;
  v_index BIGINT;
  v_previous_hash VARCHAR(64);
  v_timestamp TIMESTAMPTZ;
  v_data JSONB;
  v_nonce BIGINT := 0;
  v_hash VARCHAR(64);
  v_target TEXT;
  v_block_id UUID;
  v_max_nonce BIGINT := 100000; -- Limite para evitar loop infinito
BEGIN
  -- Get previous block
  SELECT block_index, hash INTO v_previous_block
  FROM audit_log_blockchain
  WHERE empresa_id = p_empresa_id
  ORDER BY block_index DESC
  LIMIT 1
  FOR UPDATE;
  
  IF v_previous_block IS NULL THEN
    v_index := 0;
    v_previous_hash := repeat('0', 64); -- Genesis block
  ELSE
    v_index := v_previous_block.block_index + 1;
    v_previous_hash := v_previous_block.hash;
  END IF;
  
  v_timestamp := NOW();
  v_data := jsonb_build_object(
    'empresa_id', p_empresa_id,
    'usuario_id', p_usuario_id,
    'tabela', p_tabela,
    'registro_id', p_registro_id,
    'acao', p_acao,
    'dados_antes', p_dados_antes,
    'dados_depois', p_dados_depois
  );
  
  -- Target: hash deve começar com 'difficulty' zeros
  v_target := repeat('0', p_difficulty);
  
  -- Mine (encontrar nonce válido)
  LOOP
    v_hash := calculate_block_hash(v_index, v_timestamp, v_previous_hash, v_data, v_nonce);
    
    EXIT WHEN left(v_hash, p_difficulty) = v_target;
    
    v_nonce := v_nonce + 1;
    
    -- Safety limit
    IF v_nonce > v_max_nonce THEN
      RAISE EXCEPTION 'Mining failed: nonce limit exceeded (%)  ', v_max_nonce;
    END IF;
  END LOOP;
  
  -- Insert block
  INSERT INTO audit_log_blockchain (
    block_index, previous_hash, hash, nonce, difficulty,
    empresa_id, usuario_id, tabela, registro_id, acao,
    dados_antes, dados_depois, campos_alterados,
    ip_address, user_agent, criado_em
  ) VALUES (
    v_index, v_previous_hash, v_hash, v_nonce, p_difficulty,
    p_empresa_id, p_usuario_id, p_tabela, p_registro_id, p_acao,
    p_dados_antes, p_dados_depois, p_campos_alterados,
    p_ip_address, p_user_agent, v_timestamp
  ) RETURNING id INTO v_block_id;
  
  RETURN v_block_id;
END;
$$;

-- Função para validar blockchain
CREATE OR REPLACE FUNCTION validate_blockchain(p_empresa_id UUID)
RETURNS TABLE (
  valid BOOLEAN,
  total_blocks BIGINT,
  invalid_block BIGINT,
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_block RECORD;
  v_prev_hash VARCHAR(64) := repeat('0', 64);
  v_calculated_hash VARCHAR(64);
  v_count BIGINT := 0;
BEGIN
  FOR v_block IN 
    SELECT * FROM audit_log_blockchain 
    WHERE empresa_id = p_empresa_id 
    ORDER BY block_index ASC
  LOOP
    v_count := v_count + 1;
    
    -- Verificar hash anterior
    IF v_block.previous_hash != v_prev_hash THEN
      RETURN QUERY SELECT false, v_count, v_block.block_index, 
        'Previous hash mismatch at block ' || v_block.block_index;
      RETURN;
    END IF;
    
    -- Verificar hash atual
    v_calculated_hash := calculate_block_hash(
      v_block.block_index,
      v_block.criado_em,
      v_block.previous_hash,
      jsonb_build_object(
        'empresa_id', v_block.empresa_id,
        'usuario_id', v_block.usuario_id,
        'tabela', v_block.tabela,
        'registro_id', v_block.registro_id,
        'acao', v_block.acao,
        'dados_antes', v_block.dados_antes,
        'dados_depois', v_block.dados_depois
      ),
      v_block.nonce
    );
    
    IF v_calculated_hash != v_block.hash THEN
      RETURN QUERY SELECT false, v_count, v_block.block_index,
        'Hash mismatch at block ' || v_block.block_index || ' (tampering detected)';
      RETURN;
    END IF;
    
    -- Verificar Proof of Work
    IF left(v_block.hash, v_block.difficulty) != repeat('0', v_block.difficulty) THEN
      RETURN QUERY SELECT false, v_count, v_block.block_index,
        'Invalid PoW at block ' || v_block.block_index;
      RETURN;
    END IF;
    
    v_prev_hash := v_block.hash;
  END LOOP;
  
  RETURN QUERY SELECT true, v_count, NULL::BIGINT, 'Blockchain is valid - ' || v_count || ' blocks verified';
END;
$$;

-- ============================================================================
-- LGPD COMPLIANCE
-- ============================================================================

-- LOG de acesso a dados pessoais (LGPD)
CREATE TABLE lgpd_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id),
  
  tipo_dado VARCHAR(50) NOT NULL CHECK (tipo_dado IN (
    'cpf', 'nome', 'email', 'telefone', 'endereco', 
    'dados_saude', 'dados_financeiros', 'biometria'
  )),
  acao VARCHAR(20) NOT NULL CHECK (acao IN ('visualizar', 'exportar', 'editar', 'excluir', 'compartilhar')),
  
  registro_id UUID NOT NULL,
  tabela_origem VARCHAR(100) NOT NULL,
  
  finalidade TEXT NOT NULL,
  base_legal VARCHAR(100) NOT NULL CHECK (base_legal IN (
    'consentimento', 'obrigacao_legal', 'execucao_contrato', 
    'interesse_legitimo', 'protecao_vida', 'tutela_saude'
  )),
  
  ip_address INET,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CONSENTIMENTOS
CREATE TABLE consentimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  tipo_titular VARCHAR(20) NOT NULL CHECK (tipo_titular IN ('paciente', 'cliente', 'fornecedor', 'medico')),
  titular_id UUID NOT NULL,
  titular_documento VARCHAR(20),
  titular_nome VARCHAR(200),
  
  finalidade TEXT NOT NULL,
  descricao_coleta TEXT,
  dados_coletados TEXT[],
  
  aceito BOOLEAN NOT NULL,
  data_consentimento TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  documento_url TEXT,
  
  revogado BOOLEAN DEFAULT false,
  data_revogacao TIMESTAMPTZ,
  motivo_revogacao TEXT,
  
  validade_dias INTEGER,
  expira_em DATE,
  
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SOLICITAÇÕES de titulares (direitos LGPD)
CREATE TABLE lgpd_solicitacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN (
    'acesso', 'correcao', 'exclusao', 'portabilidade', 
    'revogacao_consentimento', 'oposicao', 'informacao'
  )),
  
  solicitante_nome VARCHAR(200) NOT NULL,
  solicitante_documento VARCHAR(20) NOT NULL,
  solicitante_email VARCHAR(200),
  solicitante_telefone VARCHAR(20),
  
  descricao TEXT NOT NULL,
  
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN (
    'pendente', 'em_analise', 'aguardando_documentos', 
    'em_execucao', 'concluida', 'recusada'
  )),
  
  prazo_resposta DATE NOT NULL, -- 15 dias conforme LGPD
  
  responsavel_id UUID REFERENCES usuarios(id),
  resposta TEXT,
  data_resposta TIMESTAMPTZ,
  
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Função para anonimizar dados
CREATE OR REPLACE FUNCTION anonimizar_dados(
  p_tabela VARCHAR(100),
  p_registro_id UUID,
  p_campos TEXT[]
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_sql TEXT;
  v_campo TEXT;
  v_set_clauses TEXT := '';
BEGIN
  FOREACH v_campo IN ARRAY p_campos
  LOOP
    IF v_set_clauses != '' THEN
      v_set_clauses := v_set_clauses || ', ';
    END IF;
    v_set_clauses := v_set_clauses || quote_ident(v_campo) || ' = ''[ANONIMIZADO]''';
  END LOOP;
  
  v_sql := format(
    'UPDATE %I SET %s WHERE id = %L',
    p_tabela,
    v_set_clauses,
    p_registro_id
  );
  
  EXECUTE v_sql;
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;

-- Índices
CREATE INDEX idx_audit_blockchain_empresa ON audit_log_blockchain(empresa_id);
CREATE INDEX idx_audit_blockchain_tabela ON audit_log_blockchain(tabela, registro_id);
CREATE INDEX idx_audit_blockchain_data ON audit_log_blockchain(criado_em);
CREATE INDEX idx_lgpd_audit_empresa ON lgpd_audit_log(empresa_id);
CREATE INDEX idx_lgpd_audit_tipo ON lgpd_audit_log(tipo_dado);
CREATE INDEX idx_consentimentos_titular ON consentimentos(tipo_titular, titular_id);
CREATE INDEX idx_lgpd_solicitacoes_status ON lgpd_solicitacoes(status) WHERE status NOT IN ('concluida', 'recusada');

-- Triggers
CREATE TRIGGER tr_consentimentos_updated BEFORE UPDATE ON consentimentos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_lgpd_solicitacoes_updated BEFORE UPDATE ON lgpd_solicitacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- VIEW: Status LGPD
CREATE OR REPLACE VIEW vw_lgpd_status AS
SELECT 
  e.id AS empresa_id,
  e.razao_social,
  (SELECT COUNT(*) FROM consentimentos c WHERE c.empresa_id = e.id AND c.aceito = true AND c.revogado = false) AS consentimentos_ativos,
  (SELECT COUNT(*) FROM lgpd_solicitacoes s WHERE s.empresa_id = e.id AND s.status = 'pendente') AS solicitacoes_pendentes,
  (SELECT COUNT(*) FROM lgpd_solicitacoes s WHERE s.empresa_id = e.id AND s.prazo_resposta < CURRENT_DATE AND s.status NOT IN ('concluida', 'recusada')) AS solicitacoes_atrasadas,
  (SELECT MAX(criado_em) FROM lgpd_audit_log l WHERE l.empresa_id = e.id) AS ultimo_acesso_dados
FROM empresas e
WHERE e.ativo = true;
