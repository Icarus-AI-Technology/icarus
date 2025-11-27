-- ============================================
-- ICARUS v5.0 - ANVISA InfoSimples Integration
-- Cache de validações ANVISA em tempo real
-- 
-- Conformidade: RDC 751/2022, RDC 16/2013, RDC 59/2008
-- ============================================

-- ============================================
-- EXTENSÃO: Cache ANVISA na tabela de produtos
-- ============================================

-- Adiciona colunas de cache ANVISA à tabela existente
ALTER TABLE opme_produtos
ADD COLUMN IF NOT EXISTS anvisa_cache JSONB,
ADD COLUMN IF NOT EXISTS anvisa_valido BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS anvisa_situacao VARCHAR(20),
ADD COLUMN IF NOT EXISTS anvisa_verificado_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS anvisa_valido_ate DATE,
ADD COLUMN IF NOT EXISTS anvisa_classe_risco VARCHAR(5);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_opme_anvisa_valido ON opme_produtos(anvisa_valido);
CREATE INDEX IF NOT EXISTS idx_opme_anvisa_situacao ON opme_produtos(anvisa_situacao);
CREATE INDEX IF NOT EXISTS idx_opme_anvisa_verificado ON opme_produtos(anvisa_verificado_em);
CREATE INDEX IF NOT EXISTS idx_opme_anvisa_classe ON opme_produtos(anvisa_classe_risco);

-- ============================================
-- TABELA: anvisa_validacoes_log
-- Histórico de todas as validações ANVISA
-- ============================================

CREATE TABLE IF NOT EXISTS anvisa_validacoes_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_registro VARCHAR(50) NOT NULL,
    produto_id UUID REFERENCES opme_produtos(id) ON DELETE SET NULL,
    
    -- Resultado da validação
    sucesso BOOLEAN NOT NULL,
    situacao VARCHAR(20),
    valido BOOLEAN,
    valido_ate DATE,
    classe_risco VARCHAR(5),
    titular VARCHAR(255),
    nome_comercial VARCHAR(255),
    
    -- Cache completo da resposta
    resposta_completa JSONB,
    
    -- Metadados
    tempo_resposta_ms INTEGER,
    fonte VARCHAR(50) DEFAULT 'infosimples',
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    modulo_origem VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anvisa_log_registro ON anvisa_validacoes_log(numero_registro);
CREATE INDEX IF NOT EXISTS idx_anvisa_log_produto ON anvisa_validacoes_log(produto_id);
CREATE INDEX IF NOT EXISTS idx_anvisa_log_data ON anvisa_validacoes_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anvisa_log_situacao ON anvisa_validacoes_log(situacao);

-- ============================================
-- TABELA: anvisa_alertas
-- Alertas de registros vencendo ou com problemas
-- ============================================

CREATE TABLE IF NOT EXISTS anvisa_alertas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID REFERENCES opme_produtos(id) ON DELETE CASCADE,
    numero_registro VARCHAR(50) NOT NULL,
    
    -- Tipo de alerta
    tipo VARCHAR(50) NOT NULL, -- 'vencimento_proximo', 'registro_cancelado', 'registro_suspenso', 'verificacao_necessaria'
    severidade VARCHAR(20) NOT NULL, -- 'baixa', 'media', 'alta', 'critica'
    
    -- Detalhes
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_referencia DATE, -- Data de vencimento ou data do evento
    dias_para_vencer INTEGER,
    
    -- Status
    lido BOOLEAN DEFAULT FALSE,
    resolvido BOOLEAN DEFAULT FALSE,
    resolvido_em TIMESTAMPTZ,
    resolvido_por UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anvisa_alertas_produto ON anvisa_alertas(produto_id);
CREATE INDEX IF NOT EXISTS idx_anvisa_alertas_tipo ON anvisa_alertas(tipo);
CREATE INDEX IF NOT EXISTS idx_anvisa_alertas_severidade ON anvisa_alertas(severidade);
CREATE INDEX IF NOT EXISTS idx_anvisa_alertas_nao_lidos ON anvisa_alertas(lido) WHERE lido = FALSE;
CREATE INDEX IF NOT EXISTS idx_anvisa_alertas_nao_resolvidos ON anvisa_alertas(resolvido) WHERE resolvido = FALSE;

-- ============================================
-- FUNÇÃO: atualizar_cache_anvisa
-- Atualiza o cache ANVISA de um produto
-- ============================================

CREATE OR REPLACE FUNCTION atualizar_cache_anvisa(
    p_produto_id UUID,
    p_cache JSONB,
    p_valido BOOLEAN,
    p_situacao VARCHAR(20),
    p_valido_ate DATE,
    p_classe_risco VARCHAR(5)
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE opme_produtos
    SET 
        anvisa_cache = p_cache,
        anvisa_valido = p_valido,
        anvisa_situacao = p_situacao,
        anvisa_valido_ate = p_valido_ate,
        anvisa_classe_risco = p_classe_risco,
        anvisa_verificado_em = NOW()
    WHERE id = p_produto_id;
END;
$$;

-- ============================================
-- FUNÇÃO: verificar_registros_vencendo
-- Retorna produtos com registro ANVISA vencendo em N dias
-- ============================================

CREATE OR REPLACE FUNCTION verificar_registros_vencendo(p_dias INTEGER DEFAULT 90)
RETURNS TABLE (
    produto_id UUID,
    nome VARCHAR(255),
    numero_registro VARCHAR(50),
    valido_ate DATE,
    dias_restantes INTEGER,
    situacao VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as produto_id,
        p.nome,
        p.registro_anvisa as numero_registro,
        p.anvisa_valido_ate as valido_ate,
        (p.anvisa_valido_ate - CURRENT_DATE)::INTEGER as dias_restantes,
        p.anvisa_situacao as situacao
    FROM opme_produtos p
    WHERE 
        p.anvisa_valido_ate IS NOT NULL
        AND p.anvisa_valido_ate <= CURRENT_DATE + (p_dias || ' days')::INTERVAL
        AND p.anvisa_valido_ate >= CURRENT_DATE
        AND p.anvisa_situacao = 'ATIVO'
    ORDER BY p.anvisa_valido_ate ASC;
END;
$$;

-- ============================================
-- FUNÇÃO: gerar_alertas_anvisa
-- Gera alertas automáticos para registros com problemas
-- ============================================

CREATE OR REPLACE FUNCTION gerar_alertas_anvisa()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER := 0;
    v_produto RECORD;
BEGIN
    -- Alertas de vencimento próximo (30 dias)
    FOR v_produto IN 
        SELECT * FROM verificar_registros_vencendo(30)
    LOOP
        INSERT INTO anvisa_alertas (
            produto_id, numero_registro, tipo, severidade,
            titulo, descricao, data_referencia, dias_para_vencer
        )
        SELECT 
            v_produto.produto_id,
            v_produto.numero_registro,
            'vencimento_proximo',
            CASE 
                WHEN v_produto.dias_restantes <= 7 THEN 'critica'
                WHEN v_produto.dias_restantes <= 15 THEN 'alta'
                ELSE 'media'
            END,
            'Registro ANVISA vencendo em ' || v_produto.dias_restantes || ' dias',
            'O registro ' || v_produto.numero_registro || ' do produto ' || v_produto.nome || ' vence em ' || v_produto.valido_ate::TEXT,
            v_produto.valido_ate,
            v_produto.dias_restantes
        WHERE NOT EXISTS (
            SELECT 1 FROM anvisa_alertas a 
            WHERE a.produto_id = v_produto.produto_id 
            AND a.tipo = 'vencimento_proximo'
            AND a.resolvido = FALSE
        );
        
        v_count := v_count + 1;
    END LOOP;

    -- Alertas de registros cancelados/suspensos
    FOR v_produto IN 
        SELECT id, nome, registro_anvisa, anvisa_situacao
        FROM opme_produtos
        WHERE anvisa_situacao IN ('CANCELADO', 'SUSPENSO', 'CASSADO', 'VENCIDO')
    LOOP
        INSERT INTO anvisa_alertas (
            produto_id, numero_registro, tipo, severidade,
            titulo, descricao
        )
        SELECT 
            v_produto.id,
            v_produto.registro_anvisa,
            CASE v_produto.anvisa_situacao
                WHEN 'CANCELADO' THEN 'registro_cancelado'
                WHEN 'SUSPENSO' THEN 'registro_suspenso'
                ELSE 'registro_invalido'
            END,
            'critica',
            'Registro ANVISA ' || v_produto.anvisa_situacao,
            'O registro ' || v_produto.registro_anvisa || ' do produto ' || v_produto.nome || ' está ' || v_produto.anvisa_situacao
        WHERE NOT EXISTS (
            SELECT 1 FROM anvisa_alertas a 
            WHERE a.produto_id = v_produto.id 
            AND a.tipo IN ('registro_cancelado', 'registro_suspenso', 'registro_invalido')
            AND a.resolvido = FALSE
        );
        
        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$;

-- ============================================
-- FUNÇÃO: estatisticas_anvisa
-- Retorna estatísticas de conformidade ANVISA
-- ============================================

CREATE OR REPLACE FUNCTION estatisticas_anvisa()
RETURNS TABLE (
    total_produtos BIGINT,
    verificados BIGINT,
    validos BIGINT,
    invalidos BIGINT,
    pendentes BIGINT,
    vencendo_30_dias BIGINT,
    vencendo_90_dias BIGINT,
    percentual_conformidade NUMERIC(5,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_produtos,
        COUNT(*) FILTER (WHERE anvisa_verificado_em IS NOT NULL)::BIGINT as verificados,
        COUNT(*) FILTER (WHERE anvisa_valido = TRUE)::BIGINT as validos,
        COUNT(*) FILTER (WHERE anvisa_valido = FALSE)::BIGINT as invalidos,
        COUNT(*) FILTER (WHERE anvisa_verificado_em IS NULL)::BIGINT as pendentes,
        COUNT(*) FILTER (WHERE anvisa_valido_ate BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days')::BIGINT as vencendo_30_dias,
        COUNT(*) FILTER (WHERE anvisa_valido_ate BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days')::BIGINT as vencendo_90_dias,
        CASE 
            WHEN COUNT(*) FILTER (WHERE anvisa_verificado_em IS NOT NULL) > 0 
            THEN ROUND(
                (COUNT(*) FILTER (WHERE anvisa_valido = TRUE)::NUMERIC / 
                 COUNT(*) FILTER (WHERE anvisa_verificado_em IS NOT NULL)::NUMERIC) * 100, 2
            )
            ELSE 0
        END as percentual_conformidade
    FROM opme_produtos;
END;
$$;

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE anvisa_validacoes_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE anvisa_alertas ENABLE ROW LEVEL SECURITY;

-- Service role tem acesso total
CREATE POLICY "Service role full access validacoes" ON anvisa_validacoes_log
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access alertas" ON anvisa_alertas
    FOR ALL USING (auth.role() = 'service_role');

-- Usuários autenticados podem ler
CREATE POLICY "Authenticated read validacoes" ON anvisa_validacoes_log
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read alertas" ON anvisa_alertas
    FOR SELECT USING (auth.role() = 'authenticated');

-- Usuários autenticados podem resolver alertas
CREATE POLICY "Authenticated update alertas" ON anvisa_alertas
    FOR UPDATE USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE anvisa_validacoes_log IS 'Histórico de validações ANVISA via InfoSimples API - Conformidade RDC 751/2022';
COMMENT ON TABLE anvisa_alertas IS 'Alertas automáticos de registros ANVISA vencendo ou com problemas';
COMMENT ON FUNCTION atualizar_cache_anvisa IS 'Atualiza cache ANVISA de um produto após validação';
COMMENT ON FUNCTION verificar_registros_vencendo IS 'Lista produtos com registro ANVISA vencendo em N dias';
COMMENT ON FUNCTION gerar_alertas_anvisa IS 'Gera alertas automáticos para registros ANVISA com problemas';
COMMENT ON FUNCTION estatisticas_anvisa IS 'Retorna estatísticas de conformidade ANVISA dos produtos';

