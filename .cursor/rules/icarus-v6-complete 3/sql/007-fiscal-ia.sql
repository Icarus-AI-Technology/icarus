-- ============================================================================
-- ICARUS v6.0 - FISCAL / NF-e
-- ============================================================================

-- CERTIFICADOS DIGITAIS
CREATE TABLE certificados_digitais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo VARCHAR(5) NOT NULL CHECK (tipo IN ('A1', 'A3')),
  nome VARCHAR(200) NOT NULL,
  cnpj VARCHAR(18) NOT NULL,
  pfx_encrypted BYTEA, -- Para A1
  senha_encrypted BYTEA,
  data_validade DATE NOT NULL,
  serial_number VARCHAR(100),
  thumbprint VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NF-e
CREATE TABLE nfes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  fatura_id UUID REFERENCES faturas(id),
  cliente_id UUID REFERENCES clientes(id),
  
  -- Identificação
  numero INTEGER NOT NULL,
  serie INTEGER DEFAULT 1,
  chave_acesso VARCHAR(44) UNIQUE,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  natureza_operacao VARCHAR(100) DEFAULT 'Venda de mercadoria',
  
  -- Status
  status VARCHAR(20) DEFAULT 'rascunho' CHECK (status IN (
    'rascunho', 'validando', 'autorizada', 'rejeitada', 
    'cancelada', 'denegada', 'inutilizada', 'contingencia'
  )),
  
  -- Valores
  valor_produtos DECIMAL(15,2) NOT NULL DEFAULT 0,
  valor_frete DECIMAL(15,2) DEFAULT 0,
  valor_seguro DECIMAL(15,2) DEFAULT 0,
  valor_desconto DECIMAL(15,2) DEFAULT 0,
  valor_outras DECIMAL(15,2) DEFAULT 0,
  valor_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- ICMS
  base_calculo_icms DECIMAL(15,2) DEFAULT 0,
  valor_icms DECIMAL(15,2) DEFAULT 0,
  
  -- Autorização
  protocolo_autorizacao VARCHAR(20),
  data_autorizacao TIMESTAMPTZ,
  motivo_rejeicao TEXT,
  
  -- Arquivos
  xml_url TEXT,
  danfe_url TEXT,
  
  -- InfoSimples
  infosimples_request_id VARCHAR(100),
  infosimples_response JSONB,
  
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(empresa_id, numero, serie)
);

-- ITENS NF-e
CREATE TABLE nfe_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nfe_id UUID NOT NULL REFERENCES nfes(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  
  numero_item INTEGER NOT NULL,
  codigo VARCHAR(50) NOT NULL,
  descricao VARCHAR(500) NOT NULL,
  ncm VARCHAR(10),
  cfop VARCHAR(10) NOT NULL,
  unidade VARCHAR(10) DEFAULT 'UN',
  quantidade DECIMAL(15,4) NOT NULL,
  valor_unitario DECIMAL(15,4) NOT NULL,
  valor_total DECIMAL(15,2) NOT NULL,
  
  -- Impostos
  origem VARCHAR(1) DEFAULT '0',
  cst_icms VARCHAR(3),
  aliquota_icms DECIMAL(5,2) DEFAULT 0,
  valor_icms DECIMAL(15,2) DEFAULT 0,
  
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INTEGRAÇÕES INFOSIMPLES
-- ============================================================================

-- CACHE de consultas
CREATE TABLE infosimples_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  
  tipo_consulta VARCHAR(50) NOT NULL CHECK (tipo_consulta IN (
    'cpf', 'cnpj', 'crm', 'anvisa_produto', 'anvisa_empresa', 
    'cep', 'nfe', 'simples_nacional', 'certidao'
  )),
  identificador VARCHAR(100) NOT NULL,
  
  dados JSONB NOT NULL,
  sucesso BOOLEAN NOT NULL DEFAULT true,
  erro TEXT,
  
  consultado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expira_em TIMESTAMPTZ NOT NULL,
  
  UNIQUE(tipo_consulta, identificador)
);

-- LOG de requisições
CREATE TABLE infosimples_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id),
  usuario_id UUID REFERENCES usuarios(id),
  
  endpoint VARCHAR(200) NOT NULL,
  metodo VARCHAR(10) DEFAULT 'GET',
  parametros JSONB,
  
  status_code INTEGER,
  resposta JSONB,
  erro TEXT,
  
  tempo_ms INTEGER,
  creditos_consumidos DECIMAL(5,2) DEFAULT 0,
  
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- IA / MACHINE LEARNING - pgvector com HNSW
-- ============================================================================

-- VETORES (Embeddings)
CREATE TABLE ml_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  content_hash VARCHAR(64) NOT NULL, -- Para evitar duplicatas
  
  -- Embedding 1536 dimensões (OpenAI text-embedding-3-small)
  embedding vector(1536) NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  source_type VARCHAR(50) NOT NULL CHECK (source_type IN (
    'documento', 'faq', 'procedimento', 'produto', 
    'cirurgia', 'legislacao', 'manual', 'conversa'
  )),
  source_id UUID,
  source_url TEXT,
  
  -- Tokens
  tokens_count INTEGER,
  
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(empresa_id, content_hash)
);

-- Índice HNSW (Hierarchical Navigable Small World)
-- Mais rápido para busca que IVFFlat
CREATE INDEX idx_ml_vectors_hnsw ON ml_vectors 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Função de busca semântica otimizada para HNSW
CREATE OR REPLACE FUNCTION search_vectors(
  query_embedding vector(1536),
  p_empresa_id UUID,
  p_source_type TEXT DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  source_type TEXT,
  source_id UUID,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Ajustar ef_search para balancear velocidade/precisão
  PERFORM set_config('hnsw.ef_search', '100', true);
  
  RETURN QUERY
  SELECT 
    v.id,
    v.content,
    v.metadata,
    v.source_type,
    v.source_id,
    1 - (v.embedding <=> query_embedding) AS similarity
  FROM ml_vectors v
  WHERE 
    v.empresa_id = p_empresa_id
    AND (p_source_type IS NULL OR v.source_type = p_source_type)
    AND 1 - (v.embedding <=> query_embedding) > match_threshold
  ORDER BY v.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- SESSÕES do chatbot
CREATE TABLE chatbot_sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id),
  
  titulo VARCHAR(200),
  contexto VARCHAR(50) DEFAULT 'geral' CHECK (contexto IN (
    'geral', 'financeiro', 'estoque', 'cirurgias', 'compliance', 'relatorios'
  )),
  
  status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'arquivada', 'excluida')),
  
  -- LangGraph state
  langgraph_state JSONB DEFAULT '{}',
  
  ultimo_acesso TIMESTAMPTZ DEFAULT NOW(),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MENSAGENS do chatbot
CREATE TABLE chatbot_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sessao_id UUID NOT NULL REFERENCES chatbot_sessoes(id) ON DELETE CASCADE,
  
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  
  -- Tokens e custos
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  modelo VARCHAR(50),
  
  -- Tool calls (LangChain)
  tool_calls JSONB,
  tool_results JSONB,
  
  -- Feedback
  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  feedback_texto TEXT,
  
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MÉTRICAS do chatbot
CREATE TABLE chatbot_metricas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sessao_id UUID REFERENCES chatbot_sessoes(id),
  
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  
  mensagens_enviadas INTEGER DEFAULT 0,
  mensagens_recebidas INTEGER DEFAULT 0,
  tokens_prompt INTEGER DEFAULT 0,
  tokens_completion INTEGER DEFAULT 0,
  custo_estimado DECIMAL(10,6) DEFAULT 0,
  
  tempo_resposta_medio_ms INTEGER,
  feedback_rating_medio DECIMAL(3,2),
  modelo_usado VARCHAR(50),
  
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(empresa_id, sessao_id, data)
);

-- Triggers
CREATE TRIGGER tr_certificados_updated BEFORE UPDATE ON certificados_digitais FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_nfes_updated BEFORE UPDATE ON nfes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_ml_vectors_updated BEFORE UPDATE ON ml_vectors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_chatbot_sessoes_updated BEFORE UPDATE ON chatbot_sessoes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Índices
CREATE INDEX idx_nfes_empresa ON nfes(empresa_id);
CREATE INDEX idx_nfes_status ON nfes(status);
CREATE INDEX idx_nfes_chave ON nfes(chave_acesso) WHERE chave_acesso IS NOT NULL;
CREATE INDEX idx_infosimples_cache_tipo ON infosimples_cache(tipo_consulta, identificador);
CREATE INDEX idx_infosimples_cache_expira ON infosimples_cache(expira_em);
CREATE INDEX idx_infosimples_log_data ON infosimples_log(criado_em);
CREATE INDEX idx_ml_vectors_empresa ON ml_vectors(empresa_id);
CREATE INDEX idx_ml_vectors_source ON ml_vectors(source_type, source_id);
CREATE INDEX idx_chatbot_sessoes_empresa ON chatbot_sessoes(empresa_id) WHERE status = 'ativa';
CREATE INDEX idx_chatbot_mensagens_sessao ON chatbot_mensagens(sessao_id);
