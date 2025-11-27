-- ============================================
-- ICARUS v5.0 - CFM + Audit Logs Complete
-- Validação de médicos + Auditoria completa
-- 
-- Conformidade: CFM/CRM, 21 CFR Part 11, RDC 751/2022
-- ============================================

-- ============================================
-- TABELA: audit_logs (Auditoria Completa)
-- Conformidade 21 CFR Part 11
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Ação realizada
    action VARCHAR(100) NOT NULL,
    modulo VARCHAR(50),
    
    -- Usuário que realizou
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    
    -- Detalhes da ação
    details JSONB DEFAULT '{}',
    
    -- Dados antes/depois (para UPDATE/DELETE)
    data_before JSONB,
    data_after JSONB,
    
    -- Metadados
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Origem da ação
    origem VARCHAR(50) DEFAULT 'sistema', -- 'sistema', 'api', 'edge_function', 'manual'
    
    -- Resultado
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_modulo ON audit_logs(modulo);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success);

-- ============================================
-- EXTENSÃO: Cache CFM na tabela de médicos
-- ============================================

-- Adiciona colunas de cache CFM à tabela médicos (se existir)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'medicos') THEN
        ALTER TABLE medicos
        ADD COLUMN IF NOT EXISTS cfm_cache JSONB,
        ADD COLUMN IF NOT EXISTS cfm_valido BOOLEAN DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS cfm_situacao VARCHAR(20),
        ADD COLUMN IF NOT EXISTS cfm_verificado_em TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS especialidades TEXT[] DEFAULT '{}';
        
        CREATE INDEX IF NOT EXISTS idx_medicos_cfm_valido ON medicos(cfm_valido);
        CREATE INDEX IF NOT EXISTS idx_medicos_cfm_situacao ON medicos(cfm_situacao);
    END IF;
END $$;

-- ============================================
-- TABELA: cfm_validacoes_log
-- Histórico de todas as validações CFM
-- ============================================

CREATE TABLE IF NOT EXISTS cfm_validacoes_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crm VARCHAR(20) NOT NULL,
    uf CHAR(2) NOT NULL,
    medico_id UUID,
    
    -- Resultado da validação
    sucesso BOOLEAN NOT NULL,
    situacao VARCHAR(20),
    valido BOOLEAN,
    nome_medico VARCHAR(255),
    especialidades JSONB,
    
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

CREATE INDEX IF NOT EXISTS idx_cfm_log_crm ON cfm_validacoes_log(crm, uf);
CREATE INDEX IF NOT EXISTS idx_cfm_log_medico ON cfm_validacoes_log(medico_id);
CREATE INDEX IF NOT EXISTS idx_cfm_log_data ON cfm_validacoes_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cfm_log_situacao ON cfm_validacoes_log(situacao);

-- ============================================
-- TABELA: medicos (se não existir)
-- ============================================

CREATE TABLE IF NOT EXISTS medicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Dados básicos
    nome VARCHAR(255) NOT NULL,
    crm VARCHAR(20) NOT NULL,
    uf CHAR(2) NOT NULL,
    cpf VARCHAR(14),
    email VARCHAR(255),
    telefone VARCHAR(20),
    
    -- Cache CFM
    cfm_cache JSONB,
    cfm_valido BOOLEAN,
    cfm_situacao VARCHAR(20),
    cfm_verificado_em TIMESTAMPTZ,
    
    -- Especialidades
    especialidades TEXT[] DEFAULT '{}',
    
    -- Status
    ativo BOOLEAN DEFAULT TRUE,
    
    -- Multi-tenant
    empresa_id UUID,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint única
    UNIQUE(crm, uf)
);

CREATE INDEX IF NOT EXISTS idx_medicos_crm ON medicos(crm, uf);
CREATE INDEX IF NOT EXISTS idx_medicos_nome ON medicos(nome);
CREATE INDEX IF NOT EXISTS idx_medicos_empresa ON medicos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_medicos_ativo ON medicos(ativo) WHERE ativo = TRUE;

-- ============================================
-- FUNÇÃO: log_audit
-- Helper para criar logs de auditoria
-- ============================================

CREATE OR REPLACE FUNCTION log_audit(
    p_action VARCHAR(100),
    p_modulo VARCHAR(50),
    p_user_id UUID,
    p_details JSONB DEFAULT '{}',
    p_data_before JSONB DEFAULT NULL,
    p_data_after JSONB DEFAULT NULL,
    p_origem VARCHAR(50) DEFAULT 'sistema',
    p_success BOOLEAN DEFAULT TRUE,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO audit_logs (
        action, modulo, user_id, details, 
        data_before, data_after, origem,
        success, error_message
    )
    VALUES (
        p_action, p_modulo, p_user_id, p_details,
        p_data_before, p_data_after, p_origem,
        p_success, p_error_message
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;

-- ============================================
-- FUNÇÃO: estatisticas_cfm
-- Retorna estatísticas de validação CFM
-- ============================================

CREATE OR REPLACE FUNCTION estatisticas_cfm()
RETURNS TABLE (
    total_medicos BIGINT,
    verificados BIGINT,
    validos BIGINT,
    invalidos BIGINT,
    pendentes BIGINT,
    percentual_conformidade NUMERIC(5,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_medicos,
        COUNT(*) FILTER (WHERE cfm_verificado_em IS NOT NULL)::BIGINT as verificados,
        COUNT(*) FILTER (WHERE cfm_valido = TRUE)::BIGINT as validos,
        COUNT(*) FILTER (WHERE cfm_valido = FALSE)::BIGINT as invalidos,
        COUNT(*) FILTER (WHERE cfm_verificado_em IS NULL)::BIGINT as pendentes,
        CASE 
            WHEN COUNT(*) FILTER (WHERE cfm_verificado_em IS NOT NULL) > 0 
            THEN ROUND(
                (COUNT(*) FILTER (WHERE cfm_valido = TRUE)::NUMERIC / 
                 COUNT(*) FILTER (WHERE cfm_verificado_em IS NOT NULL)::NUMERIC) * 100, 2
            )
            ELSE 0
        END as percentual_conformidade
    FROM medicos
    WHERE ativo = TRUE;
END;
$$;

-- ============================================
-- FUNÇÃO: dashboard_conformidade
-- Dashboard completo de conformidade regulatória
-- ============================================

CREATE OR REPLACE FUNCTION dashboard_conformidade()
RETURNS TABLE (
    -- ANVISA
    anvisa_total BIGINT,
    anvisa_validos BIGINT,
    anvisa_invalidos BIGINT,
    anvisa_vencendo_30d BIGINT,
    anvisa_percentual NUMERIC(5,2),
    -- CFM
    cfm_total BIGINT,
    cfm_validos BIGINT,
    cfm_invalidos BIGINT,
    cfm_percentual NUMERIC(5,2),
    -- Geral
    conformidade_geral NUMERIC(5,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_anvisa_total BIGINT;
    v_anvisa_validos BIGINT;
    v_anvisa_invalidos BIGINT;
    v_anvisa_vencendo BIGINT;
    v_cfm_total BIGINT;
    v_cfm_validos BIGINT;
    v_cfm_invalidos BIGINT;
BEGIN
    -- Estatísticas ANVISA
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE anvisa_valido = TRUE),
        COUNT(*) FILTER (WHERE anvisa_valido = FALSE),
        COUNT(*) FILTER (WHERE anvisa_valido_ate BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days')
    INTO v_anvisa_total, v_anvisa_validos, v_anvisa_invalidos, v_anvisa_vencendo
    FROM opme_produtos
    WHERE anvisa_verificado_em IS NOT NULL;

    -- Estatísticas CFM
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE cfm_valido = TRUE),
        COUNT(*) FILTER (WHERE cfm_valido = FALSE)
    INTO v_cfm_total, v_cfm_validos, v_cfm_invalidos
    FROM medicos
    WHERE ativo = TRUE AND cfm_verificado_em IS NOT NULL;

    RETURN QUERY
    SELECT 
        v_anvisa_total,
        v_anvisa_validos,
        v_anvisa_invalidos,
        v_anvisa_vencendo,
        CASE WHEN v_anvisa_total > 0 
             THEN ROUND((v_anvisa_validos::NUMERIC / v_anvisa_total) * 100, 2) 
             ELSE 0 END,
        v_cfm_total,
        v_cfm_validos,
        v_cfm_invalidos,
        CASE WHEN v_cfm_total > 0 
             THEN ROUND((v_cfm_validos::NUMERIC / v_cfm_total) * 100, 2) 
             ELSE 0 END,
        -- Conformidade geral (média ponderada)
        CASE WHEN (v_anvisa_total + v_cfm_total) > 0 
             THEN ROUND(
                ((v_anvisa_validos + v_cfm_validos)::NUMERIC / 
                 (v_anvisa_total + v_cfm_total)) * 100, 2
             )
             ELSE 0 END;
END;
$$;

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cfm_validacoes_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicos ENABLE ROW LEVEL SECURITY;

-- Service role tem acesso total
CREATE POLICY "Service role full access audit" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access cfm_log" ON cfm_validacoes_log
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access medicos" ON medicos
    FOR ALL USING (auth.role() = 'service_role');

-- Usuários autenticados podem ler
CREATE POLICY "Authenticated read audit" ON audit_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated read cfm_log" ON cfm_validacoes_log
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access medicos" ON medicos
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- TRIGGER: Auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_medicos_updated ON medicos;
CREATE TRIGGER trigger_medicos_updated
    BEFORE UPDATE ON medicos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE audit_logs IS 'Logs de auditoria - Conformidade 21 CFR Part 11';
COMMENT ON TABLE cfm_validacoes_log IS 'Histórico de validações de CRM no CFM';
COMMENT ON TABLE medicos IS 'Cadastro de médicos com cache CFM';
COMMENT ON FUNCTION log_audit IS 'Helper para criar registros de auditoria';
COMMENT ON FUNCTION estatisticas_cfm IS 'Retorna estatísticas de conformidade CFM';
COMMENT ON FUNCTION dashboard_conformidade IS 'Dashboard completo de conformidade regulatória';

