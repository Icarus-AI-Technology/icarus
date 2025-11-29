-- =============================================
-- ICARUS v5.0 - Complete Database Schema
-- Migration: Suporte para todos os 46 módulos
-- Data: 29/11/2025
-- =============================================

-- =============================================
-- SPRINT 4: COMPRAS INTERNACIONAIS
-- =============================================

CREATE TABLE IF NOT EXISTS compras_internacionais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fornecedor_id UUID REFERENCES fornecedores(id),
  numero_proforma VARCHAR,
  data_proforma DATE,
  valor_usd DECIMAL(15,2),
  valor_frete_usd DECIMAL(15,2),
  valor_seguro_usd DECIMAL(15,2),
  status_li VARCHAR, -- 'pendente', 'emitida', 'aprovada', 'rejeitada'
  numero_li VARCHAR,
  data_li DATE,
  status_di VARCHAR, -- 'pendente', 'desembaraçada', 'retida'
  numero_di VARCHAR,
  data_di DATE,
  incoterm VARCHAR, -- 'FOB', 'CIF', 'EXW', etc
  documentacao JSONB, -- Armazena URLs de documentos
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_compras_inter_data ON compras_internacionais(data_proforma DESC);
CREATE INDEX idx_compras_inter_status ON compras_internacionais(status_li, status_di);

CREATE TABLE IF NOT EXISTS simulacoes_importacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  produto_id UUID REFERENCES produtos(id),
  nome_simulacao VARCHAR NOT NULL,
  valor_produto_usd DECIMAL(15,2),
  quantidade INTEGER,
  frete_usd DECIMAL(15,2),
  seguro_usd DECIMAL(15,2),
  taxa_cambio DECIMAL(10,4),
  ii_percent DECIMAL(5,2), -- Imposto de Importação
  ipi_percent DECIMAL(5,2),
  pis_percent DECIMAL(5,2),
  cofins_percent DECIMAL(5,2),
  icms_percent DECIMAL(5,2),
  custo_total_brl DECIMAL(15,2),
  break_even_analysis JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cenarios_importacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  simulacao_id UUID REFERENCES simulacoes_importacao(id),
  nome_cenario VARCHAR,
  taxa_cambio DECIMAL(10,4),
  custo_total_brl DECIMAL(15,2),
  viabilidade BOOLEAN,
  observacoes TEXT
);

-- =============================================
-- SPRINT 5: VENDAS/CRM AVANÇADO
-- =============================================

CREATE TABLE IF NOT EXISTS importacoes_tabelas_precos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  arquivo_nome VARCHAR NOT NULL,
  arquivo_url VARCHAR,
  tipo VARCHAR, -- 'convenio', 'sus', 'cbhpm', 'particular'
  convenio_id UUID REFERENCES convenios(id),
  data_importacao TIMESTAMP DEFAULT NOW(),
  usuario_id UUID REFERENCES usuarios(id),
  status VARCHAR, -- 'processando', 'concluida', 'erro'
  items_processados INTEGER DEFAULT 0,
  items_total INTEGER DEFAULT 0,
  items_erro INTEGER DEFAULT 0,
  log_erros JSONB,
  vigencia_inicio DATE,
  vigencia_fim DATE
);

CREATE INDEX idx_import_tabelas_data ON importacoes_tabelas_precos(data_importacao DESC);
CREATE INDEX idx_import_tabelas_status ON importacoes_tabelas_precos(status);

CREATE TABLE IF NOT EXISTS video_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR NOT NULL,
  descricao TEXT,
  agendado_para TIMESTAMP NOT NULL,
  duracao_minutos INTEGER DEFAULT 60,
  plataforma VARCHAR, -- 'meet', 'teams', 'zoom'
  link_reuniao VARCHAR,
  senha VARCHAR,
  status VARCHAR, -- 'agendada', 'em_andamento', 'concluida', 'cancelada'
  gravacao_url VARCHAR,
  transcricao_url VARCHAR,
  criado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_participantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID REFERENCES video_calls(id),
  usuario_id UUID REFERENCES usuarios(id),
  email VARCHAR,
  nome VARCHAR,
  status_presenca VARCHAR, -- 'confirmado', 'ausente', 'presente'
  tempo_conexao INTEGER -- minutos
);

-- =============================================
-- SPRINT 6: FINANCEIRO CONTÁBIL
-- =============================================

CREATE TABLE IF NOT EXISTS plano_contas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR UNIQUE NOT NULL,
  nome VARCHAR NOT NULL,
  tipo VARCHAR, -- 'ativo', 'passivo', 'receita', 'despesa', 'patrimonio'
  nivel INTEGER,
  pai_id UUID REFERENCES plano_contas(id),
  aceita_lancamento BOOLEAN DEFAULT TRUE,
  ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS lancamentos_contabeis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_lancamento DATE NOT NULL,
  historico TEXT NOT NULL,
  tipo VARCHAR, -- 'debito', 'credito'
  conta_id UUID REFERENCES plano_contas(id),
  valor DECIMAL(15,2) NOT NULL,
  documento VARCHAR,
  lote_id VARCHAR,
  usuario_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lanc_data ON lancamentos_contabeis(data_lancamento DESC);
CREATE INDEX idx_lanc_conta ON lancamentos_contabeis(conta_id);

CREATE TABLE IF NOT EXISTS relatorios_financeiros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR NOT NULL, -- 'dre', 'balanco', 'fluxo_caixa', 'dfc', 'aging'
  competencia VARCHAR, -- 'YYYY-MM'
  formato VARCHAR, -- 'pdf', 'excel', 'json'
  arquivo_url VARCHAR,
  dados JSONB, -- Dados do relatório em JSON
  gerado_em TIMESTAMP DEFAULT NOW(),
  gerado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS relatorios_regulatorios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR NOT NULL, -- 'sped_fiscal', 'sped_contrib', 'dirf', 'dctf'
  competencia VARCHAR NOT NULL, -- 'YYYY-MM'
  arquivo_url VARCHAR,
  hash_arquivo VARCHAR,
  status_envio VARCHAR, -- 'pendente', 'enviado', 'processado', 'rejeitado'
  protocolo_rfb VARCHAR,
  data_envio TIMESTAMP,
  recibo_url VARCHAR,
  validado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rel_reg_comp ON relatorios_regulatorios(competencia DESC);

-- =============================================
-- SPRINT 7: COMPLIANCE AVANÇADO
-- =============================================

CREATE TABLE IF NOT EXISTS compliance_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR NOT NULL, -- 'lgpd', 'iso42001', 'anvisa', 'sox'
  nome VARCHAR NOT NULL,
  descricao TEXT,
  status VARCHAR, -- 'conforme', 'nao_conforme', 'em_analise'
  score DECIMAL(5,2), -- 0-100
  ultima_verificacao TIMESTAMP,
  proxima_verificacao TIMESTAMP,
  responsavel_id UUID REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS compliance_gaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  check_id UUID REFERENCES compliance_checks(id),
  titulo VARCHAR NOT NULL,
  descricao TEXT,
  severidade VARCHAR, -- 'critica', 'alta', 'media', 'baixa'
  status VARCHAR, -- 'aberto', 'em_resolucao', 'resolvido'
  prazo_resolucao DATE,
  plano_acao TEXT,
  evidencias JSONB
);

-- =============================================
-- SPRINT 8: IA E AUTOMAÇÃO
-- =============================================

CREATE TABLE IF NOT EXISTS chatbot_metricas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data DATE NOT NULL,
  conversas_total INTEGER DEFAULT 0,
  conversas_resolvidas INTEGER DEFAULT 0,
  conversas_escaladas INTEGER DEFAULT 0,
  satisfacao_media DECIMAL(3,2), -- 0-10
  tempo_resposta_medio INTEGER, -- segundos
  tokens_usados INTEGER,
  custo_estimado DECIMAL(10,4)
);

CREATE TABLE IF NOT EXISTS chatbot_intencoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metrica_id UUID REFERENCES chatbot_metricas(id),
  intencao VARCHAR,
  quantidade INTEGER,
  taxa_sucesso DECIMAL(5,2)
);

CREATE TABLE IF NOT EXISTS voice_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_analise DATE NOT NULL,
  total_chamadas INTEGER DEFAULT 0,
  duracao_media INTEGER, -- segundos
  sentimento_medio VARCHAR, -- 'positivo', 'neutro', 'negativo'
  palavras_chave JSONB,
  compliance_score DECIMAL(5,2)
);

CREATE TABLE IF NOT EXISTS voice_transcricoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analytics_id UUID REFERENCES voice_analytics(id),
  audio_url VARCHAR,
  transcricao TEXT,
  sentimento VARCHAR,
  duracao INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voice_biometrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id),
  voice_print BYTEA, -- Impressão vocal (hash)
  ultima_verificacao TIMESTAMP,
  tentativas_sucesso INTEGER DEFAULT 0,
  tentativas_falha INTEGER DEFAULT 0,
  taxa_acerto DECIMAL(5,2),
  ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS voice_macros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id),
  comando VARCHAR NOT NULL,
  acao VARCHAR NOT NULL, -- 'navegar', 'criar', 'buscar', etc
  parametros JSONB,
  vezes_usado INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS tooltip_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tooltip_id VARCHAR NOT NULL,
  pagina VARCHAR,
  visualizacoes INTEGER DEFAULT 0,
  cliques INTEGER DEFAULT 0,
  tempo_medio INTEGER, -- segundos
  taxa_conversao DECIMAL(5,2),
  data_inicio DATE,
  data_fim DATE
);

CREATE TABLE IF NOT EXISTS automacoes_ia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR NOT NULL,
  descricao TEXT,
  tipo VARCHAR, -- 'workflow', 'trigger', 'scheduled'
  config JSONB NOT NULL, -- Configuração do workflow
  ativo BOOLEAN DEFAULT TRUE,
  criado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS automacao_execucoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automacao_id UUID REFERENCES automacoes_ia(id),
  status VARCHAR, -- 'sucesso', 'erro', 'parcial'
  inicio TIMESTAMP,
  fim TIMESTAMP,
  duracao INTEGER, -- segundos
  log JSONB,
  erro TEXT
);

-- =============================================
-- SPRINT 9: SISTEMA E INTEGRAÇÕES
-- =============================================

CREATE TABLE IF NOT EXISTS configuracoes_sistema (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria VARCHAR NOT NULL,
  chave VARCHAR NOT NULL,
  valor TEXT,
  tipo VARCHAR, -- 'string', 'number', 'boolean', 'json'
  descricao TEXT,
  editavel BOOLEAN DEFAULT TRUE,
  UNIQUE(categoria, chave)
);

CREATE TABLE IF NOT EXISTS system_health_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  servico VARCHAR NOT NULL, -- 'api', 'database', 'cache', 'storage'
  status VARCHAR, -- 'online', 'offline', 'degradado'
  uptime DECIMAL(5,2), -- percentual
  latencia_media INTEGER, -- ms
  erros_hora INTEGER,
  ultima_verificacao TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_health_servico ON system_health_metrics(servico, ultima_verificacao DESC);

CREATE TABLE IF NOT EXISTS integracoes_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR NOT NULL,
  tipo VARCHAR, -- 'rest', 'soap', 'graphql', 'webhook'
  url_base VARCHAR,
  auth_tipo VARCHAR, -- 'bearer', 'api_key', 'oauth', 'basic'
  credenciais BYTEA, -- Encrypted
  ativa BOOLEAN DEFAULT TRUE,
  ultima_sync TIMESTAMP,
  proxima_sync TIMESTAMP
);

CREATE TABLE IF NOT EXISTS integration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integracao_id UUID REFERENCES integracoes_config(id),
  tipo_operacao VARCHAR, -- 'fetch', 'push', 'sync'
  status VARCHAR, -- 'sucesso', 'erro'
  request JSONB,
  response JSONB,
  erro TEXT,
  duracao INTEGER, -- ms
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR NOT NULL,
  token_hash VARCHAR NOT NULL,
  tipo VARCHAR, -- 'read', 'write', 'admin'
  rate_limit INTEGER DEFAULT 1000, -- requests/hora
  requests_hoje INTEGER DEFAULT 0,
  ultimo_uso TIMESTAMP,
  expira_em TIMESTAMP,
  ativo BOOLEAN DEFAULT TRUE,
  criado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tokens_hash ON api_tokens(token_hash);

CREATE TABLE IF NOT EXISTS rotas_entrega (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR NOT NULL,
  data DATE NOT NULL,
  motorista_id UUID REFERENCES usuarios(id),
  veiculo_id UUID REFERENCES veiculos(id),
  status VARCHAR, -- 'planejada', 'em_andamento', 'concluida'
  distancia_km DECIMAL(10,2),
  tempo_estimado INTEGER, -- minutos
  tempo_real INTEGER,
  custos JSONB,
  rota_otimizada JSONB, -- Coordenadas GPS
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS entregas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rota_id UUID REFERENCES rotas_entrega(id),
  pedido_id UUID REFERENCES pedidos(id),
  endereco TEXT,
  coordenadas POINT,
  ordem_entrega INTEGER,
  status VARCHAR, -- 'pendente', 'a_caminho', 'entregue', 'falhou'
  hora_chegada TIMESTAMP,
  hora_saida TIMESTAMP,
  assinatura_url VARCHAR,
  foto_comprovante_url VARCHAR
);

-- =============================================
-- TABELAS AUXILIARES
-- =============================================

CREATE TABLE IF NOT EXISTS veiculos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  placa VARCHAR UNIQUE NOT NULL,
  modelo VARCHAR,
  ano INTEGER,
  capacidade_kg DECIMAL(10,2),
  tipo VARCHAR, -- 'van', 'caminhao', 'moto'
  ativo BOOLEAN DEFAULT TRUE
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE compras_internacionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulacoes_importacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE importacoes_tabelas_precos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos_contabeis ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios_financeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios_regulatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_metricas ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_biometrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_macros ENABLE ROW LEVEL SECURITY;
ALTER TABLE tooltip_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE automacoes_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE integracoes_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotas_entrega ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (exemplo - ajustar conforme necessário)
CREATE POLICY "Users can view their company data"
  ON compras_internacionais
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM fornecedores f
      WHERE f.id = fornecedor_id
      AND f.empresa_id = (auth.jwt() ->> 'empresa_id')::UUID
    )
  );

-- Repetir políticas similares para outras tabelas...

-- =============================================
-- FUNCTIONS E TRIGGERS
-- =============================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_compras_inter_updated_at
  BEFORE UPDATE ON compras_internacionais
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function para calcular custo total de importação
CREATE OR REPLACE FUNCTION calcular_custo_importacao(
  p_simulacao_id UUID
) RETURNS DECIMAL AS $$
DECLARE
  v_custo DECIMAL;
BEGIN
  SELECT 
    (valor_produto_usd + frete_usd + seguro_usd) * taxa_cambio *
    (1 + ii_percent/100) *
    (1 + ipi_percent/100) *
    (1 + pis_percent/100) *
    (1 + cofins_percent/100) *
    (1 + icms_percent/100)
  INTO v_custo
  FROM simulacoes_importacao
  WHERE id = p_simulacao_id;
  
  RETURN v_custo;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SEED DATA (OPCIONAL - para testes)
-- =============================================

-- Inserir configurações padrão
INSERT INTO configuracoes_sistema (categoria, chave, valor, tipo, descricao) VALUES
  ('sistema', 'max_upload_size', '10485760', 'number', 'Tamanho máximo de upload em bytes (10MB)'),
  ('sistema', 'session_timeout', '3600', 'number', 'Timeout de sessão em segundos (1 hora)'),
  ('email', 'smtp_host', 'smtp.gmail.com', 'string', 'Servidor SMTP'),
  ('email', 'smtp_port', '587', 'number', 'Porta SMTP'),
  ('cache', 'ttl_default', '300', 'number', 'TTL padrão do cache em segundos (5 min)')
ON CONFLICT DO NOTHING;

-- =============================================
-- COMENTÁRIOS
-- =============================================

COMMENT ON TABLE compras_internacionais IS 'Gestão de compras internacionais com LI e DI';
COMMENT ON TABLE simulacoes_importacao IS 'Simulações de viabilidade de importação';
COMMENT ON TABLE video_calls IS 'Agendamento e gestão de videoconferências';
COMMENT ON TABLE lancamentos_contabeis IS 'Lançamentos contábeis seguindo plano de contas';
COMMENT ON TABLE relatorios_regulatorios IS 'Relatórios fiscais obrigatórios (SPED, DIRF, etc)';
COMMENT ON TABLE compliance_checks IS 'Verificações de conformidade (LGPD, ISO, ANVISA, SOX)';
COMMENT ON TABLE chatbot_metricas IS 'Métricas de desempenho do chatbot IcarusBrain';
COMMENT ON TABLE voice_biometrics IS 'Biometria vocal para autenticação de usuários';
COMMENT ON TABLE automacoes_ia IS 'Automações inteligentes com LangGraph';
COMMENT ON TABLE system_health_metrics IS 'Monitoramento de saúde do sistema em tempo real';
COMMENT ON TABLE api_tokens IS 'Tokens de API com rate limiting';
COMMENT ON TABLE rotas_entrega IS 'Rotas otimizadas para entregas';

-- =============================================
-- FIM DA MIGRATION
-- =============================================

