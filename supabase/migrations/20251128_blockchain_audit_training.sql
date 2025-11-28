-- ============================================================
-- ICARUS v5.0 - Blockchain Audit Trail & Training Certification
-- Migration: 20251128_blockchain_audit_training.sql
-- ============================================================

-- ============================================================
-- 1. BLOCKCHAIN AUDIT TRAIL
-- ============================================================

-- Tabela principal da blockchain de auditoria
CREATE TABLE IF NOT EXISTS audit_blockchain (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  index INTEGER NOT NULL UNIQUE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data JSONB NOT NULL,
  previous_hash VARCHAR(64) NOT NULL,
  hash VARCHAR(64) NOT NULL UNIQUE,
  nonce INTEGER NOT NULL DEFAULT 0,
  signature VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_hash CHECK (LENGTH(hash) = 64),
  CONSTRAINT valid_previous_hash CHECK (LENGTH(previous_hash) = 64)
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_audit_blockchain_timestamp ON audit_blockchain(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_blockchain_data_action ON audit_blockchain((data->>'action'));
CREATE INDEX IF NOT EXISTS idx_audit_blockchain_data_entity ON audit_blockchain((data->>'entityType'));
CREATE INDEX IF NOT EXISTS idx_audit_blockchain_data_user ON audit_blockchain((data->>'userId'));

-- Função para verificar integridade da cadeia
CREATE OR REPLACE FUNCTION verify_blockchain_integrity()
RETURNS TABLE(
  is_valid BOOLEAN,
  total_blocks INTEGER,
  invalid_blocks INTEGER,
  first_invalid_index INTEGER
) AS $$
DECLARE
  prev_hash VARCHAR(64);
  current_block RECORD;
  invalid_count INTEGER := 0;
  first_invalid INTEGER := NULL;
BEGIN
  prev_hash := REPEAT('0', 64);
  
  FOR current_block IN 
    SELECT * FROM audit_blockchain ORDER BY index
  LOOP
    IF current_block.previous_hash != prev_hash THEN
      invalid_count := invalid_count + 1;
      IF first_invalid IS NULL THEN
        first_invalid := current_block.index;
      END IF;
    END IF;
    prev_hash := current_block.hash;
  END LOOP;
  
  RETURN QUERY SELECT 
    (invalid_count = 0) AS is_valid,
    (SELECT COUNT(*)::INTEGER FROM audit_blockchain) AS total_blocks,
    invalid_count AS invalid_blocks,
    first_invalid AS first_invalid_index;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. API GATEWAY INTEGRATIONS
-- ============================================================

-- Credenciais de integração (criptografadas)
CREATE TABLE IF NOT EXISTS integration_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  auth_type VARCHAR(50) NOT NULL,
  credentials_encrypted TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT valid_auth_type CHECK (auth_type IN ('none', 'api_key', 'basic', 'oauth2', 'jwt', 'certificate'))
);

-- Logs de integração
CREATE TABLE IF NOT EXISTS integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id VARCHAR(100) NOT NULL,
  credentials_id UUID REFERENCES integration_credentials(id),
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  request_body JSONB,
  response_status INTEGER,
  response_body JSONB,
  duration INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  error TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para logs
CREATE INDEX IF NOT EXISTS idx_integration_logs_timestamp ON integration_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_integration_logs_template ON integration_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_success ON integration_logs(success);

-- Jobs de exportação agendados
CREATE TABLE IF NOT EXISTS export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id VARCHAR(100),
  config JSONB NOT NULL,
  schedule JSONB,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- ============================================================
-- 3. COMPLIANCE TRAINING & CERTIFICATION
-- ============================================================

-- Progresso de treinamento
CREATE TABLE IF NOT EXISTS training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES usuarios(id),
  module_id VARCHAR(100) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  content_progress JSONB DEFAULT '{}'::jsonb,
  quiz_attempts JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'in_progress',
  score INTEGER,
  
  CONSTRAINT valid_training_status CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
  CONSTRAINT unique_user_module UNIQUE (user_id, module_id)
);

-- Índices para progresso
CREATE INDEX IF NOT EXISTS idx_training_progress_user ON training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_module ON training_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_status ON training_progress(status);

-- Certificados emitidos
CREATE TABLE IF NOT EXISTS training_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES usuarios(id),
  module_id VARCHAR(100) NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  score INTEGER NOT NULL,
  certificate_number VARCHAR(100) NOT NULL UNIQUE,
  qr_code VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'valid',
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  
  CONSTRAINT valid_cert_status CHECK (status IN ('valid', 'expired', 'revoked')),
  CONSTRAINT valid_score CHECK (score >= 0 AND score <= 100)
);

-- Índices para certificados
CREATE INDEX IF NOT EXISTS idx_training_certificates_user ON training_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_training_certificates_number ON training_certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_training_certificates_status ON training_certificates(status);
CREATE INDEX IF NOT EXISTS idx_training_certificates_expires ON training_certificates(expires_at);

-- Função para verificar certificado
CREATE OR REPLACE FUNCTION verify_certificate(p_certificate_number VARCHAR)
RETURNS TABLE(
  is_valid BOOLEAN,
  certificate_id UUID,
  user_name VARCHAR,
  module_id VARCHAR,
  issued_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  score INTEGER,
  status VARCHAR,
  message VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN tc.status = 'valid' AND tc.expires_at > NOW() THEN TRUE
      ELSE FALSE
    END AS is_valid,
    tc.id AS certificate_id,
    u.nome AS user_name,
    tc.module_id,
    tc.issued_at,
    tc.expires_at,
    tc.score,
    tc.status,
    CASE
      WHEN tc.id IS NULL THEN 'Certificado não encontrado'
      WHEN tc.status = 'revoked' THEN 'Certificado revogado'
      WHEN tc.expires_at <= NOW() THEN 'Certificado expirado'
      ELSE 'Certificado válido'
    END::VARCHAR AS message
  FROM training_certificates tc
  LEFT JOIN usuarios u ON tc.user_id = u.id
  WHERE tc.certificate_number = p_certificate_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar status de certificados expirados
CREATE OR REPLACE FUNCTION update_expired_certificates()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE training_certificates
  SET status = 'expired'
  WHERE status = 'valid' AND expires_at <= NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Agendar verificação de certificados expirados (executar diariamente via cron)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('update-expired-certs', '0 1 * * *', 'SELECT update_expired_certificates()');

-- ============================================================
-- 4. CRM CARDÍACO - DISPOSITIVOS IMPLANTÁVEIS
-- ============================================================

-- Tabela de dispositivos cardíacos
CREATE TABLE IF NOT EXISTS dispositivos_cardiacos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_serie VARCHAR(100) NOT NULL UNIQUE,
  modelo VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  fabricante VARCHAR(255) NOT NULL,
  registro_anvisa VARCHAR(50),
  lote VARCHAR(100),
  data_fabricacao DATE,
  data_validade DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'disponivel',
  localizacao VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_device_type CHECK (tipo IN (
    'marcapasso', 'cdi', 'crt_d', 'crt_p', 'icm', 'eletrodo', 'gerador'
  )),
  CONSTRAINT valid_device_status CHECK (status IN (
    'disponivel', 'consignado', 'implantado', 'devolvido', 'vencido', 'defeito'
  ))
);

-- Registro de implantes
CREATE TABLE IF NOT EXISTS implantes_cardiacos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispositivo_id UUID NOT NULL REFERENCES dispositivos_cardiacos(id),
  paciente_id UUID NOT NULL REFERENCES pacientes(id),
  medico_id UUID NOT NULL REFERENCES medicos(id),
  hospital_id UUID NOT NULL REFERENCES hospitais(id),
  cirurgia_id UUID REFERENCES cirurgias(id),
  data_implante DATE NOT NULL,
  tipo_procedimento VARCHAR(100),
  indicacao_clinica TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_device_implant UNIQUE (dispositivo_id)
);

-- Relatórios de Sell Out para fabricantes
CREATE TABLE IF NOT EXISTS sellout_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo VARCHAR(7) NOT NULL, -- YYYY-MM
  fabricante VARCHAR(255) NOT NULL,
  template_id VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  data_envio TIMESTAMPTZ,
  data_confirmacao TIMESTAMPTZ,
  items JSONB NOT NULL,
  total_quantidade INTEGER NOT NULL,
  total_valor DECIMAL(15, 2) NOT NULL,
  response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT valid_sellout_status CHECK (status IN ('pending', 'sent', 'confirmed', 'error')),
  CONSTRAINT unique_period_manufacturer UNIQUE (periodo, fabricante)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_dispositivos_serie ON dispositivos_cardiacos(numero_serie);
CREATE INDEX IF NOT EXISTS idx_dispositivos_status ON dispositivos_cardiacos(status);
CREATE INDEX IF NOT EXISTS idx_implantes_paciente ON implantes_cardiacos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_implantes_data ON implantes_cardiacos(data_implante);
CREATE INDEX IF NOT EXISTS idx_sellout_periodo ON sellout_reports(periodo);

-- ============================================================
-- 5. RLS POLICIES
-- ============================================================

-- Habilitar RLS
ALTER TABLE audit_blockchain ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispositivos_cardiacos ENABLE ROW LEVEL SECURITY;
ALTER TABLE implantes_cardiacos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellout_reports ENABLE ROW LEVEL SECURITY;

-- Políticas para audit_blockchain (somente leitura para usuários autenticados)
CREATE POLICY "Audit blockchain read access" ON audit_blockchain
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Audit blockchain insert for system" ON audit_blockchain
  FOR INSERT WITH CHECK (TRUE);

-- Políticas para training_progress
CREATE POLICY "Users can view own training progress" ON training_progress
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' IN ('admin', 'compliance'));

CREATE POLICY "Users can update own training progress" ON training_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training progress" ON training_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para training_certificates
CREATE POLICY "Anyone can verify certificates" ON training_certificates
  FOR SELECT USING (TRUE);

CREATE POLICY "System can issue certificates" ON training_certificates
  FOR INSERT WITH CHECK (TRUE);

-- Políticas para dispositivos_cardiacos
CREATE POLICY "Authenticated users can view devices" ON dispositivos_cardiacos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Stock managers can manage devices" ON dispositivos_cardiacos
  FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'estoque', 'comercial'));

-- ============================================================
-- 6. VIEWS ÚTEIS
-- ============================================================

-- View de certificados válidos
CREATE OR REPLACE VIEW vw_valid_certificates AS
SELECT 
  tc.*,
  u.nome AS user_name,
  u.email AS user_email
FROM training_certificates tc
JOIN usuarios u ON tc.user_id = u.id
WHERE tc.status = 'valid' AND tc.expires_at > NOW();

-- View de dispositivos disponíveis
CREATE OR REPLACE VIEW vw_available_devices AS
SELECT 
  dc.*,
  CASE 
    WHEN dc.data_validade <= CURRENT_DATE THEN 'vencido'
    WHEN dc.data_validade <= CURRENT_DATE + INTERVAL '90 days' THEN 'proximo_vencimento'
    ELSE 'ok'
  END AS status_validade
FROM dispositivos_cardiacos dc
WHERE dc.status = 'disponivel';

-- View de Sell Out pendente
CREATE OR REPLACE VIEW vw_pending_sellout AS
SELECT 
  fabricante,
  periodo,
  COUNT(*) AS total_itens,
  SUM(total_quantidade) AS total_quantidade,
  SUM(total_valor) AS total_valor
FROM sellout_reports
WHERE status = 'pending'
GROUP BY fabricante, periodo
ORDER BY periodo DESC, fabricante;

-- ============================================================
-- 7. COMENTÁRIOS
-- ============================================================

COMMENT ON TABLE audit_blockchain IS 'Blockchain imutável para audit trail de compliance';
COMMENT ON TABLE integration_credentials IS 'Credenciais criptografadas para integrações externas';
COMMENT ON TABLE integration_logs IS 'Logs de todas as chamadas de API externas';
COMMENT ON TABLE training_progress IS 'Progresso de treinamento de compliance por usuário';
COMMENT ON TABLE training_certificates IS 'Certificados de compliance emitidos';
COMMENT ON TABLE dispositivos_cardiacos IS 'Inventário de dispositivos cardíacos implantáveis (CRM)';
COMMENT ON TABLE implantes_cardiacos IS 'Registro de implantes para rastreabilidade';
COMMENT ON TABLE sellout_reports IS 'Relatórios de Sell Out para fabricantes';

