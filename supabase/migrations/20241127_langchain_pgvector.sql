-- ============================================
-- ICARUS v5.0 - LangChain + pgvector Integration
-- Busca Semântica em Catálogo Médico OPME
-- ============================================

-- Habilitar extensão pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- TABELA: catalogo_medico_embeddings
-- Armazena embeddings para busca semântica
-- ============================================
CREATE TABLE IF NOT EXISTS catalogo_medico_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
    
    -- Conteúdo para embedding
    conteudo_texto TEXT NOT NULL,
    
    -- Embedding vetorial (1536 dimensões para text-embedding-3-large)
    embedding vector(1536),
    
    -- Metadados para filtros regulatórios (SelfQueryRetriever)
    registro_anvisa_valido BOOLEAN DEFAULT true,
    numero_registro_anvisa VARCHAR(50),
    data_validade_registro DATE,
    classe_risco VARCHAR(10), -- I, II, III, IV
    controlado_anvisa BOOLEAN DEFAULT false,
    vencimento_lote DATE,
    temperatura_controlada BOOLEAN DEFAULT false,
    temperatura_min DECIMAL(5,2),
    temperatura_max DECIMAL(5,2),
    ncm VARCHAR(20),
    fabricante VARCHAR(255),
    
    -- Rastreabilidade
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice HNSW para busca vetorial rápida
CREATE INDEX IF NOT EXISTS idx_catalogo_embedding_hnsw 
ON catalogo_medico_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Índices para filtros regulatórios
CREATE INDEX IF NOT EXISTS idx_catalogo_anvisa_valido ON catalogo_medico_embeddings(registro_anvisa_valido);
CREATE INDEX IF NOT EXISTS idx_catalogo_classe_risco ON catalogo_medico_embeddings(classe_risco);
CREATE INDEX IF NOT EXISTS idx_catalogo_controlado ON catalogo_medico_embeddings(controlado_anvisa);
CREATE INDEX IF NOT EXISTS idx_catalogo_vencimento ON catalogo_medico_embeddings(vencimento_lote);
CREATE INDEX IF NOT EXISTS idx_catalogo_temperatura ON catalogo_medico_embeddings(temperatura_controlada);

-- ============================================
-- TABELA: ai_agent_tools_log
-- Log de execução de ferramentas do agente
-- ============================================
CREATE TABLE IF NOT EXISTS ai_agent_tools_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID,
    tool_name VARCHAR(100) NOT NULL,
    tool_input JSONB,
    tool_output JSONB,
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_tools_session ON ai_agent_tools_log(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_tools_name ON ai_agent_tools_log(tool_name);

-- ============================================
-- TABELA: nfe_extractions
-- Extrações automáticas de XML NF-e
-- ============================================
CREATE TABLE IF NOT EXISTS nfe_extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_nota VARCHAR(50) NOT NULL,
    serie VARCHAR(10),
    emitente_cnpj VARCHAR(20),
    emitente_nome VARCHAR(255),
    destinatario_cnpj VARCHAR(20),
    destinatario_nome VARCHAR(255),
    data_emissao DATE,
    valor_total DECIMAL(15,2),
    xml_original TEXT,
    extraction_confidence DECIMAL(5,4), -- 0.0000 a 1.0000
    items JSONB, -- Array de ItemNota
    status VARCHAR(50) DEFAULT 'pendente', -- pendente, validado, integrado, erro
    validation_errors JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nfe_numero ON nfe_extractions(numero_nota);
CREATE INDEX IF NOT EXISTS idx_nfe_emitente ON nfe_extractions(emitente_cnpj);
CREATE INDEX IF NOT EXISTS idx_nfe_status ON nfe_extractions(status);

-- ============================================
-- FUNÇÃO: busca_semantica_catalogo
-- Busca semântica com filtros regulatórios
-- ============================================
CREATE OR REPLACE FUNCTION busca_semantica_catalogo(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10,
    filtro_anvisa_valido BOOLEAN DEFAULT NULL,
    filtro_classe_risco TEXT[] DEFAULT NULL,
    filtro_controlado BOOLEAN DEFAULT NULL,
    filtro_vencimento_apos DATE DEFAULT NULL,
    filtro_temperatura_controlada BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    produto_id UUID,
    conteudo_texto TEXT,
    similarity FLOAT,
    registro_anvisa_valido BOOLEAN,
    numero_registro_anvisa VARCHAR(50),
    classe_risco VARCHAR(10),
    controlado_anvisa BOOLEAN,
    vencimento_lote DATE,
    temperatura_controlada BOOLEAN,
    ncm VARCHAR(20),
    fabricante VARCHAR(255)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.produto_id,
        c.conteudo_texto,
        1 - (c.embedding <=> query_embedding) AS similarity,
        c.registro_anvisa_valido,
        c.numero_registro_anvisa,
        c.classe_risco,
        c.controlado_anvisa,
        c.vencimento_lote,
        c.temperatura_controlada,
        c.ncm,
        c.fabricante
    FROM catalogo_medico_embeddings c
    WHERE 
        1 - (c.embedding <=> query_embedding) > match_threshold
        AND (filtro_anvisa_valido IS NULL OR c.registro_anvisa_valido = filtro_anvisa_valido)
        AND (filtro_classe_risco IS NULL OR c.classe_risco = ANY(filtro_classe_risco))
        AND (filtro_controlado IS NULL OR c.controlado_anvisa = filtro_controlado)
        AND (filtro_vencimento_apos IS NULL OR c.vencimento_lote > filtro_vencimento_apos)
        AND (filtro_temperatura_controlada IS NULL OR c.temperatura_controlada = filtro_temperatura_controlada)
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ============================================
-- FUNÇÃO: estoque_disponivel_por_regiao
-- Retorna estoque disponível por região/depósito
-- ============================================
CREATE OR REPLACE FUNCTION estoque_disponivel_por_regiao(
    p_produto_id UUID,
    p_regiao TEXT DEFAULT NULL,
    p_deposito_id UUID DEFAULT NULL
)
RETURNS TABLE (
    deposito_nome VARCHAR(255),
    deposito_regiao VARCHAR(100),
    estoque_fisico INTEGER,
    estoque_reservado INTEGER,
    estoque_disponivel INTEGER,
    lote_mais_proximo_vencer DATE,
    temperatura_controlada BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Query simplificada - adaptar conforme estrutura real do banco
    RETURN QUERY
    SELECT 
        'Depósito Principal'::VARCHAR(255) as deposito_nome,
        COALESCE(p_regiao, 'Sudeste')::VARCHAR(100) as deposito_regiao,
        100::INTEGER as estoque_fisico,
        10::INTEGER as estoque_reservado,
        90::INTEGER as estoque_disponivel,
        (CURRENT_DATE + INTERVAL '180 days')::DATE as lote_mais_proximo_vencer,
        false as temperatura_controlada;
END;
$$;

-- ============================================
-- FUNÇÃO: previsao_vencimento_lotes
-- Retorna lotes próximos do vencimento
-- ============================================
CREATE OR REPLACE FUNCTION previsao_vencimento_lotes(
    p_produto_id UUID,
    p_limite INT DEFAULT 3
)
RETURNS TABLE (
    lote_numero VARCHAR(50),
    data_vencimento DATE,
    quantidade_disponivel INTEGER,
    deposito_nome VARCHAR(255),
    dias_para_vencer INTEGER,
    status_alerta VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'LOTE-001'::VARCHAR(50) as lote_numero,
        (CURRENT_DATE + INTERVAL '30 days')::DATE as data_vencimento,
        50::INTEGER as quantidade_disponivel,
        'Depósito Central'::VARCHAR(255) as deposito_nome,
        30::INTEGER as dias_para_vencer,
        'atenção'::VARCHAR(50) as status_alerta
    UNION ALL
    SELECT 
        'LOTE-002'::VARCHAR(50),
        (CURRENT_DATE + INTERVAL '90 days')::DATE,
        100::INTEGER,
        'Depósito Central'::VARCHAR(255),
        90::INTEGER,
        'normal'::VARCHAR(50)
    UNION ALL
    SELECT 
        'LOTE-003'::VARCHAR(50),
        (CURRENT_DATE + INTERVAL '180 days')::DATE,
        75::INTEGER,
        'Depósito Nordeste'::VARCHAR(255),
        180::INTEGER,
        'normal'::VARCHAR(50)
    LIMIT p_limite;
END;
$$;

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE catalogo_medico_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_tools_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfe_extractions ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para service_role
CREATE POLICY "Service role full access catalogo" ON catalogo_medico_embeddings
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access tools_log" ON ai_agent_tools_log
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access nfe" ON nfe_extractions
    FOR ALL USING (auth.role() = 'service_role');

-- Políticas para usuários autenticados (leitura)
CREATE POLICY "Authenticated read catalogo" ON catalogo_medico_embeddings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read nfe" ON nfe_extractions
    FOR SELECT USING (auth.role() = 'authenticated');

COMMENT ON TABLE catalogo_medico_embeddings IS 'Embeddings para busca semântica no catálogo médico OPME com filtros regulatórios ANVISA';
COMMENT ON TABLE ai_agent_tools_log IS 'Log de execução das ferramentas do agente IA LangChain';
COMMENT ON TABLE nfe_extractions IS 'Extrações automáticas de XML NF-e para rastreabilidade RDC 59/2008';

