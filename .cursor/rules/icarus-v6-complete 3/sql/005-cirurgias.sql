-- ============================================================================
-- ICARUS v6.0 - CIRURGIAS E RASTREABILIDADE OPME
-- ============================================================================

-- CIRURGIAS
CREATE TABLE cirurgias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero VARCHAR(20) NOT NULL,
  hospital_id UUID NOT NULL REFERENCES hospitais(id),
  medico_id UUID NOT NULL REFERENCES medicos(id),
  cliente_id UUID REFERENCES clientes(id),
  paciente_iniciais VARCHAR(5), -- LGPD: apenas iniciais
  paciente_idade INTEGER,
  paciente_sexo CHAR(1) CHECK (paciente_sexo IN ('M', 'F')),
  procedimento VARCHAR(500) NOT NULL,
  cid VARCHAR(10),
  tipo_anestesia VARCHAR(50),
  lado VARCHAR(20) CHECK (lado IN ('direito', 'esquerdo', 'bilateral', 'nao_aplicavel')),
  data_agendamento DATE NOT NULL,
  hora_prevista TIME,
  sala_cirurgica VARCHAR(50),
  convenio VARCHAR(100),
  autorizacao_convenio VARCHAR(50),
  status VARCHAR(20) DEFAULT 'agendada' CHECK (status IN (
    'agendada', 'confirmada', 'em_preparacao', 'em_andamento', 
    'concluida', 'cancelada', 'adiada', 'material_pendente'
  )),
  data_realizacao DATE,
  hora_inicio TIME,
  hora_fim TIME,
  observacoes TEXT,
  observacoes_pos_op TEXT,
  criado_por UUID REFERENCES usuarios(id),
  atualizado_por UUID REFERENCES usuarios(id),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  UNIQUE(empresa_id, numero)
);

-- MATERIAIS da cirurgia
CREATE TABLE cirurgia_materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cirurgia_id UUID NOT NULL REFERENCES cirurgias(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id),
  lote_id UUID REFERENCES lotes(id),
  quantidade_solicitada INTEGER NOT NULL DEFAULT 1,
  quantidade_utilizada INTEGER DEFAULT 0,
  quantidade_devolvida INTEGER DEFAULT 0,
  preco_unitario DECIMAL(15,4),
  preco_total DECIMAL(15,4),
  desconto_percentual DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'solicitado' CHECK (status IN (
    'solicitado', 'separado', 'enviado', 'recebido', 
    'utilizado', 'devolvido', 'faturado', 'cancelado'
  )),
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RASTREABILIDADE OPME (CRÍTICO ANVISA - RDC 665/2022)
CREATE TABLE rastreabilidade_opme (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cirurgia_id UUID NOT NULL REFERENCES cirurgias(id),
  cirurgia_material_id UUID REFERENCES cirurgia_materiais(id),
  produto_id UUID NOT NULL REFERENCES produtos(id),
  lote_id UUID NOT NULL REFERENCES lotes(id),
  
  -- Identificação do produto (obrigatório)
  numero_lote VARCHAR(50) NOT NULL,
  numero_serie VARCHAR(50),
  registro_anvisa VARCHAR(20) NOT NULL,
  nome_produto VARCHAR(200) NOT NULL,
  fabricante VARCHAR(200) NOT NULL,
  
  -- Dados do implante (obrigatório)
  data_implante DATE NOT NULL,
  hora_implante TIME,
  local_implante VARCHAR(200),
  lado_implante VARCHAR(20),
  
  -- Paciente (mínimo necessário - LGPD)
  paciente_iniciais VARCHAR(5) NOT NULL,
  paciente_prontuario_hash VARCHAR(64), -- Hash do prontuário
  
  -- Profissional responsável
  medico_nome VARCHAR(200) NOT NULL,
  medico_crm VARCHAR(20) NOT NULL,
  medico_crm_uf CHAR(2) NOT NULL,
  
  -- Hospital
  hospital_nome VARCHAR(200) NOT NULL,
  hospital_cnes VARCHAR(20),
  
  -- Documentação (URLs no storage)
  termo_consentimento_url TEXT,
  laudo_url TEXT,
  imagem_produto_url TEXT,
  protocolo_cirurgico_url TEXT,
  
  -- Metadados
  dados_adicionais JSONB DEFAULT '{}',
  hash_registro VARCHAR(64) NOT NULL, -- SHA-256 para imutabilidade
  
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint: não permitir alteração após criação
  CONSTRAINT rastreabilidade_imutavel CHECK (true)
);

-- Função para gerar hash do registro de rastreabilidade
CREATE OR REPLACE FUNCTION generate_rastreabilidade_hash()
RETURNS TRIGGER AS $$
BEGIN
  NEW.hash_registro := sha256_hash(
    NEW.numero_lote || '|' ||
    COALESCE(NEW.numero_serie, '') || '|' ||
    NEW.registro_anvisa || '|' ||
    NEW.data_implante::text || '|' ||
    NEW.paciente_iniciais || '|' ||
    NEW.medico_crm || NEW.medico_crm_uf || '|' ||
    COALESCE(NEW.hospital_cnes, '') || '|' ||
    NEW.criado_em::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para hash automático
CREATE TRIGGER tr_rastreabilidade_hash
  BEFORE INSERT ON rastreabilidade_opme
  FOR EACH ROW EXECUTE FUNCTION generate_rastreabilidade_hash();

-- Impedir UPDATE/DELETE em rastreabilidade (compliance ANVISA)
CREATE OR REPLACE FUNCTION prevent_rastreabilidade_change()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Registros de rastreabilidade OPME são imutáveis por compliance ANVISA';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_rastreabilidade_no_update
  BEFORE UPDATE ON rastreabilidade_opme
  FOR EACH ROW EXECUTE FUNCTION prevent_rastreabilidade_change();

CREATE TRIGGER tr_rastreabilidade_no_delete
  BEFORE DELETE ON rastreabilidade_opme
  FOR EACH ROW EXECUTE FUNCTION prevent_rastreabilidade_change();

-- CONSUMO de materiais (log detalhado)
CREATE TABLE consumo_materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cirurgia_id UUID NOT NULL REFERENCES cirurgias(id),
  lote_id UUID NOT NULL REFERENCES lotes(id),
  quantidade INTEGER NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('consumo', 'devolucao', 'perda', 'contaminacao')),
  motivo TEXT,
  usuario_id UUID REFERENCES usuarios(id),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers de updated_at
CREATE TRIGGER tr_cirurgias_updated BEFORE UPDATE ON cirurgias FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_cirurgia_materiais_updated BEFORE UPDATE ON cirurgia_materiais FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Índices
CREATE INDEX idx_cirurgias_empresa ON cirurgias(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX idx_cirurgias_data ON cirurgias(data_agendamento);
CREATE INDEX idx_cirurgias_status ON cirurgias(status) WHERE status NOT IN ('concluida', 'cancelada');
CREATE INDEX idx_cirurgias_hospital ON cirurgias(hospital_id);
CREATE INDEX idx_cirurgias_medico ON cirurgias(medico_id);
CREATE INDEX idx_cirurgia_materiais_cirurgia ON cirurgia_materiais(cirurgia_id);
CREATE INDEX idx_rastreabilidade_empresa ON rastreabilidade_opme(empresa_id);
CREATE INDEX idx_rastreabilidade_lote ON rastreabilidade_opme(numero_lote);
CREATE INDEX idx_rastreabilidade_anvisa ON rastreabilidade_opme(registro_anvisa);
CREATE INDEX idx_rastreabilidade_data ON rastreabilidade_opme(data_implante);

-- VIEW: Dashboard cirurgias
CREATE OR REPLACE VIEW vw_cirurgias_dashboard AS
SELECT 
  c.empresa_id,
  c.status,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE c.data_agendamento = CURRENT_DATE) AS hoje,
  COUNT(*) FILTER (WHERE c.data_agendamento = CURRENT_DATE + 1) AS amanha,
  COUNT(*) FILTER (WHERE c.data_agendamento BETWEEN CURRENT_DATE AND CURRENT_DATE + 7) AS proximos_7_dias
FROM cirurgias c
WHERE c.excluido_em IS NULL
GROUP BY c.empresa_id, c.status;
