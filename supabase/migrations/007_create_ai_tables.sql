-- =====================================================
-- ICARUS v5.0 - AI Tables for Edge Functions
-- Migration 007: Create chatbot and AI agent tables
-- =====================================================
-- IMPORTANT: These tables are required by Edge Functions:
--   - chat/index.ts
--   - gpt-researcher/index.ts
--   - agent-compliance/index.ts
-- =====================================================

-- =====================================================
-- TABELA 1: chatbot_sessoes (Chat Sessions)
-- =====================================================
CREATE TABLE IF NOT EXISTS chatbot_sessoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES perfis(id) ON DELETE SET NULL,

  -- Session metadata
  titulo TEXT,
  contexto JSONB DEFAULT '{}',
  total_mensagens INTEGER DEFAULT 0,

  -- Timestamps
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  excluido_em TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX idx_chatbot_sessoes_empresa ON chatbot_sessoes(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX idx_chatbot_sessoes_usuario ON chatbot_sessoes(usuario_id) WHERE excluido_em IS NULL;
CREATE INDEX idx_chatbot_sessoes_atualizado ON chatbot_sessoes(atualizado_em DESC);

COMMENT ON TABLE chatbot_sessoes IS 'Sessoes de chat do assistente virtual ICARUS';

-- =====================================================
-- TABELA 2: chatbot_mensagens (Chat Messages)
-- =====================================================
CREATE TABLE IF NOT EXISTS chatbot_mensagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sessao_id UUID NOT NULL REFERENCES chatbot_sessoes(id) ON DELETE CASCADE,

  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- AI metadata
  intent TEXT,
  tokens_input INTEGER,
  tokens_output INTEGER,
  modelo TEXT,
  tempo_resposta_ms INTEGER,

  -- Actions suggested by AI
  acoes JSONB DEFAULT '[]',

  -- Feedback
  util BOOLEAN,
  feedback TEXT,

  -- Timestamps
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chatbot_mensagens_sessao ON chatbot_mensagens(sessao_id);
CREATE INDEX idx_chatbot_mensagens_criado ON chatbot_mensagens(criado_em DESC);
CREATE INDEX idx_chatbot_mensagens_role ON chatbot_mensagens(role);
CREATE INDEX idx_chatbot_mensagens_intent ON chatbot_mensagens(intent);

COMMENT ON TABLE chatbot_mensagens IS 'Mensagens trocadas nas sessoes de chat';

-- =====================================================
-- TABELA 3: chatbot_pesquisas_gpt (GPT Research Results)
-- =====================================================
CREATE TABLE IF NOT EXISTS chatbot_pesquisas_gpt (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,

  -- Research data
  query TEXT NOT NULL,
  resultados JSONB DEFAULT '[]',
  sintese TEXT,

  -- Metadata
  idioma TEXT DEFAULT 'pt-BR',
  num_fontes INTEGER DEFAULT 0,
  tokens_usados INTEGER,
  tempo_pesquisa_ms INTEGER,

  -- Timestamps
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chatbot_pesquisas_empresa ON chatbot_pesquisas_gpt(empresa_id);
CREATE INDEX idx_chatbot_pesquisas_criado ON chatbot_pesquisas_gpt(criado_em DESC);

COMMENT ON TABLE chatbot_pesquisas_gpt IS 'Resultados de pesquisas do GPT Researcher';

-- =====================================================
-- TABELA 4: agentes_ia_compliance (Compliance Check Logs)
-- =====================================================
CREATE TABLE IF NOT EXISTS agentes_ia_compliance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,

  -- Check data
  tipo_verificacao TEXT NOT NULL CHECK (tipo_verificacao IN ('produto', 'cirurgia', 'lote', 'processo')),
  dados_entrada JSONB NOT NULL,
  resultado JSONB NOT NULL,

  -- Results
  score INTEGER CHECK (score >= 0 AND score <= 100),
  conforme BOOLEAN NOT NULL,
  aprovado BOOLEAN NOT NULL,

  -- References
  referencia_id UUID,
  referencia_tipo TEXT,

  -- Metadata
  versao_regras TEXT,
  tempo_analise_ms INTEGER,

  -- Timestamps
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agentes_compliance_empresa ON agentes_ia_compliance(empresa_id);
CREATE INDEX idx_agentes_compliance_tipo ON agentes_ia_compliance(tipo_verificacao);
CREATE INDEX idx_agentes_compliance_conforme ON agentes_ia_compliance(conforme);
CREATE INDEX idx_agentes_compliance_criado ON agentes_ia_compliance(criado_em DESC);
CREATE INDEX idx_agentes_compliance_referencia ON agentes_ia_compliance(referencia_tipo, referencia_id);

COMMENT ON TABLE agentes_ia_compliance IS 'Logs de verificacoes de compliance por IA';

-- =====================================================
-- TABELA 5: chatbot_metricas (AI Metrics - Daily Aggregation)
-- =====================================================
CREATE TABLE IF NOT EXISTS chatbot_metricas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Counters
  total_sessoes INTEGER DEFAULT 0,
  total_mensagens INTEGER DEFAULT 0,
  total_tokens_input INTEGER DEFAULT 0,
  total_tokens_output INTEGER DEFAULT 0,

  -- Timing (in milliseconds)
  tempo_resposta_p50 INTEGER,
  tempo_resposta_p95 INTEGER,
  tempo_resposta_p99 INTEGER,

  -- Quality metrics
  taxa_sucesso DECIMAL(5,2),
  taxa_fallback DECIMAL(5,2),
  satisfacao_media DECIMAL(3,2),

  -- Cost (in USD cents)
  custo_estimado INTEGER,

  criado_em TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(empresa_id, data)
);

CREATE INDEX idx_chatbot_metricas_empresa_data ON chatbot_metricas(empresa_id, data DESC);

COMMENT ON TABLE chatbot_metricas IS 'Metricas diarias de uso do chatbot';

-- =====================================================
-- TRIGGERS: Auto-update timestamps
-- =====================================================
CREATE TRIGGER trigger_chatbot_sessoes_updated_at
  BEFORE UPDATE ON chatbot_sessoes
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

-- =====================================================
-- TRIGGER: Update session message count
-- =====================================================
CREATE OR REPLACE FUNCTION atualizar_contagem_mensagens()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chatbot_sessoes
  SET
    total_mensagens = total_mensagens + 1,
    atualizado_em = NOW()
  WHERE id = NEW.sessao_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_chatbot_mensagens_count
  AFTER INSERT ON chatbot_mensagens
  FOR EACH ROW EXECUTE FUNCTION atualizar_contagem_mensagens();

-- =====================================================
-- RLS: Enable Row Level Security
-- =====================================================
ALTER TABLE chatbot_sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_pesquisas_gpt ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentes_ia_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_metricas ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: chatbot_sessoes
-- =====================================================
CREATE POLICY "Usuarios podem visualizar sessoes da empresa"
  ON chatbot_sessoes FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
    AND excluido_em IS NULL
  );

CREATE POLICY "Usuarios podem criar sessoes"
  ON chatbot_sessoes FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
  );

CREATE POLICY "Usuarios podem atualizar proprias sessoes"
  ON chatbot_sessoes FOR UPDATE
  USING (
    usuario_id = auth.uid()
    OR empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid() AND cargo IN ('admin', 'gerente')
    )
  );

-- =====================================================
-- RLS POLICIES: chatbot_mensagens
-- =====================================================
CREATE POLICY "Usuarios podem visualizar mensagens das sessoes da empresa"
  ON chatbot_mensagens FOR SELECT
  USING (
    sessao_id IN (
      SELECT id FROM chatbot_sessoes WHERE empresa_id IN (
        SELECT empresa_id FROM perfis WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Usuarios podem criar mensagens"
  ON chatbot_mensagens FOR INSERT
  WITH CHECK (
    sessao_id IN (
      SELECT id FROM chatbot_sessoes WHERE empresa_id IN (
        SELECT empresa_id FROM perfis WHERE id = auth.uid()
      )
    )
  );

-- =====================================================
-- RLS POLICIES: chatbot_pesquisas_gpt
-- =====================================================
CREATE POLICY "Usuarios podem visualizar pesquisas da empresa"
  ON chatbot_pesquisas_gpt FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
  );

CREATE POLICY "Usuarios podem criar pesquisas"
  ON chatbot_pesquisas_gpt FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
  );

-- =====================================================
-- RLS POLICIES: agentes_ia_compliance
-- =====================================================
CREATE POLICY "Usuarios podem visualizar compliance da empresa"
  ON agentes_ia_compliance FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
  );

CREATE POLICY "Usuarios podem criar verificacoes de compliance"
  ON agentes_ia_compliance FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
  );

-- =====================================================
-- RLS POLICIES: chatbot_metricas
-- =====================================================
CREATE POLICY "Gerentes podem visualizar metricas da empresa"
  ON chatbot_metricas FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid() AND cargo IN ('admin', 'gerente')
    )
  );

-- =====================================================
-- FUNCTION: Increment chat metrics (for Edge Functions)
-- =====================================================
CREATE OR REPLACE FUNCTION increment_chat_metrics(
  p_empresa_id UUID,
  p_tokens_input INTEGER DEFAULT 0,
  p_tokens_output INTEGER DEFAULT 0,
  p_tempo_resposta INTEGER DEFAULT 0,
  p_sucesso BOOLEAN DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO chatbot_metricas (
    empresa_id,
    data,
    total_sessoes,
    total_mensagens,
    total_tokens_input,
    total_tokens_output
  ) VALUES (
    p_empresa_id,
    CURRENT_DATE,
    0,
    1,
    p_tokens_input,
    p_tokens_output
  )
  ON CONFLICT (empresa_id, data) DO UPDATE SET
    total_mensagens = chatbot_metricas.total_mensagens + 1,
    total_tokens_input = chatbot_metricas.total_tokens_input + p_tokens_input,
    total_tokens_output = chatbot_metricas.total_tokens_output + p_tokens_output;
END;
$$;

-- =====================================================
-- FIM DA MIGRATION 007
-- =====================================================
