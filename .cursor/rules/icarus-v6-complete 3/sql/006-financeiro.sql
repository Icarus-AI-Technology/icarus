-- ============================================================================
-- ICARUS v6.0 - FINANCEIRO + OPEN FINANCE + VIGILÂNCIA
-- ============================================================================

-- FATURAS
CREATE TABLE faturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  numero VARCHAR(20) NOT NULL,
  tipo VARCHAR(20) DEFAULT 'venda' CHECK (tipo IN ('venda', 'consignacao', 'comodato', 'devolucao')),
  valor_bruto DECIMAL(15,2) NOT NULL,
  valor_desconto DECIMAL(15,2) DEFAULT 0,
  valor_acrescimo DECIMAL(15,2) DEFAULT 0,
  valor_liquido DECIMAL(15,2) NOT NULL,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN (
    'rascunho', 'pendente', 'parcial', 'paga', 'vencida', 'cancelada', 'protestada'
  )),
  nfe_id UUID,
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(empresa_id, numero)
);

-- ITENS da fatura
CREATE TABLE fatura_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  fatura_id UUID NOT NULL REFERENCES faturas(id) ON DELETE CASCADE,
  cirurgia_id UUID REFERENCES cirurgias(id),
  produto_id UUID NOT NULL REFERENCES produtos(id),
  lote_id UUID REFERENCES lotes(id),
  descricao VARCHAR(500),
  quantidade DECIMAL(15,4) NOT NULL,
  unidade VARCHAR(10) DEFAULT 'UN',
  preco_unitario DECIMAL(15,4) NOT NULL,
  desconto_percentual DECIMAL(5,2) DEFAULT 0,
  desconto_valor DECIMAL(15,2) DEFAULT 0,
  preco_total DECIMAL(15,2) NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PARCELAS
CREATE TABLE parcelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  fatura_id UUID NOT NULL REFERENCES faturas(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  valor DECIMAL(15,2) NOT NULL,
  valor_pago DECIMAL(15,2) DEFAULT 0,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  forma_pagamento VARCHAR(50),
  nosso_numero VARCHAR(50),
  codigo_barras VARCHAR(50),
  linha_digitavel VARCHAR(60),
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN (
    'pendente', 'parcial', 'paga', 'vencida', 'cancelada', 'protestada'
  )),
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PAGAMENTOS
CREATE TABLE pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  parcela_id UUID REFERENCES parcelas(id),
  fatura_id UUID REFERENCES faturas(id),
  valor DECIMAL(15,2) NOT NULL,
  data_pagamento DATE NOT NULL DEFAULT CURRENT_DATE,
  forma_pagamento VARCHAR(50) NOT NULL,
  comprovante_url TEXT,
  transacao_bancaria_id UUID,
  conciliado BOOLEAN DEFAULT false,
  data_conciliacao TIMESTAMPTZ,
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- OPEN FINANCE / PLUGGY
-- ============================================================================

-- CONTAS BANCÁRIAS
CREATE TABLE contas_bancarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  banco_codigo VARCHAR(10),
  banco_nome VARCHAR(100),
  agencia VARCHAR(10),
  conta VARCHAR(20),
  tipo VARCHAR(20) DEFAULT 'corrente' CHECK (tipo IN ('corrente', 'poupanca', 'investimento', 'cartao')),
  
  -- Pluggy integration
  pluggy_item_id VARCHAR(100),
  pluggy_account_id VARCHAR(100),
  pluggy_connector_id VARCHAR(100),
  pluggy_connector_name VARCHAR(100),
  pluggy_status VARCHAR(20) DEFAULT 'pending' CHECK (pluggy_status IN ('pending', 'connected', 'updating', 'error', 'disconnected')),
  pluggy_last_sync TIMESTAMPTZ,
  pluggy_error TEXT,
  
  -- Saldos
  saldo_disponivel DECIMAL(15,2) DEFAULT 0,
  saldo_atual DECIMAL(15,2) DEFAULT 0,
  limite_credito DECIMAL(15,2) DEFAULT 0,
  
  -- Config
  sincronizacao_automatica BOOLEAN DEFAULT true,
  principal BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TRANSAÇÕES BANCÁRIAS
CREATE TABLE transacoes_bancarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  conta_bancaria_id UUID NOT NULL REFERENCES contas_bancarias(id),
  
  -- Pluggy data
  pluggy_transaction_id VARCHAR(100) UNIQUE,
  
  -- Dados da transação
  data_transacao DATE NOT NULL,
  data_competencia DATE,
  descricao TEXT NOT NULL,
  descricao_original TEXT,
  valor DECIMAL(15,2) NOT NULL,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('credito', 'debito')),
  
  -- Categorização
  categoria VARCHAR(100),
  categoria_sugerida_ia VARCHAR(100),
  subcategoria VARCHAR(100),
  
  -- Tarifas
  is_tarifa BOOLEAN DEFAULT false,
  tipo_tarifa VARCHAR(50) CHECK (tipo_tarifa IN ('ted', 'doc', 'pix', 'manutencao', 'saque', 'pacote', 'cartao', 'cheque', 'outros')),
  tarifa_justificada BOOLEAN,
  tarifa_analise_ia TEXT,
  
  -- Conciliação
  conciliado BOOLEAN DEFAULT false,
  pagamento_id UUID REFERENCES pagamentos(id),
  fatura_id UUID REFERENCES faturas(id),
  
  -- Auditoria IA
  auditoria_status VARCHAR(20) DEFAULT 'pendente' CHECK (auditoria_status IN ('pendente', 'aprovado', 'alerta', 'irregularidade', 'investigar')),
  auditoria_score INTEGER CHECK (auditoria_score BETWEEN 0 AND 100),
  auditoria_flags TEXT[],
  auditoria_notas TEXT,
  auditoria_processado_em TIMESTAMPTZ,
  
  -- Metadata
  pluggy_metadata JSONB DEFAULT '{}',
  
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DDA - Débito Direto Autorizado
CREATE TABLE dda_boletos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  conta_bancaria_id UUID REFERENCES contas_bancarias(id),
  
  -- Dados do boleto
  codigo_barras VARCHAR(50) NOT NULL,
  linha_digitavel VARCHAR(60),
  valor DECIMAL(15,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  
  -- Beneficiário
  beneficiario_nome VARCHAR(200),
  beneficiario_cnpj VARCHAR(18),
  beneficiario_cpf VARCHAR(14),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado', 'agendado')),
  
  -- Análise IA
  analise_ia JSONB DEFAULT '{}',
  risco_score INTEGER CHECK (risco_score BETWEEN 0 AND 100),
  recomendacao TEXT,
  
  -- Pluggy
  pluggy_bill_id VARCHAR(100),
  
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ANÁLISE DE TARIFAS (mensal)
CREATE TABLE analise_tarifas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  conta_bancaria_id UUID REFERENCES contas_bancarias(id),
  
  mes_referencia DATE NOT NULL,
  
  -- Totais
  total_tarifas DECIMAL(15,2) NOT NULL DEFAULT 0,
  quantidade_tarifas INTEGER DEFAULT 0,
  
  -- Por tipo
  tarifas_ted DECIMAL(15,2) DEFAULT 0,
  tarifas_doc DECIMAL(15,2) DEFAULT 0,
  tarifas_pix DECIMAL(15,2) DEFAULT 0,
  tarifas_manutencao DECIMAL(15,2) DEFAULT 0,
  tarifas_saque DECIMAL(15,2) DEFAULT 0,
  tarifas_pacote DECIMAL(15,2) DEFAULT 0,
  tarifas_outras DECIMAL(15,2) DEFAULT 0,
  
  -- Análise
  variacao_mes_anterior DECIMAL(5,2), -- %
  media_mercado DECIMAL(15,2),
  economia_potencial DECIMAL(15,2),
  
  -- IA
  analise_ia JSONB DEFAULT '{}',
  recomendacoes TEXT[],
  score_eficiencia INTEGER CHECK (score_eficiencia BETWEEN 0 AND 100),
  
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(empresa_id, conta_bancaria_id, mes_referencia)
);

-- SUGESTÕES FINANCEIRAS (IA)
CREATE TABLE sugestoes_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN (
    'emprestimo', 'quitacao_antecipada', 'renegociacao', 'troca_banco', 
    'investimento', 'reducao_custos', 'capital_giro', 'antecipacao_recebiveis'
  )),
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT NOT NULL,
  
  -- Valores
  valor_atual DECIMAL(15,2),
  valor_proposto DECIMAL(15,2),
  economia_estimada DECIMAL(15,2),
  roi_estimado DECIMAL(5,2), -- %
  
  -- Prioridade e status
  prioridade VARCHAR(10) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
  data_limite DATE,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_analise', 'aprovada', 'rejeitada', 'implementada', 'expirada')),
  
  -- IA
  confianca_ia INTEGER CHECK (confianca_ia BETWEEN 0 AND 100),
  justificativa_ia TEXT,
  dados_suporte JSONB DEFAULT '{}',
  modelo_ia VARCHAR(50),
  
  -- Feedback
  feedback_usuario TEXT,
  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ALERTAS FINANCEIROS
CREATE TABLE alertas_financeiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  transacao_id UUID REFERENCES transacoes_bancarias(id),
  conta_bancaria_id UUID REFERENCES contas_bancarias(id),
  
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN (
    'duplicidade', 'valor_anomalo', 'fornecedor_desconhecido', 'tarifa_indevida',
    'horario_suspeito', 'padrao_irregular', 'saldo_negativo', 'limite_excedido',
    'fraude_potencial', 'pagamento_duplicado', 'cobranca_indevida', 'vencimento_proximo'
  )),
  
  severidade VARCHAR(10) NOT NULL CHECK (severidade IN ('info', 'baixa', 'media', 'alta', 'critica')),
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  valor_envolvido DECIMAL(15,2),
  
  status VARCHAR(20) DEFAULT 'novo' CHECK (status IN ('novo', 'em_analise', 'confirmado', 'falso_positivo', 'resolvido', 'ignorado')),
  
  -- IA
  confianca_ia INTEGER CHECK (confianca_ia BETWEEN 0 AND 100),
  evidencias JSONB DEFAULT '{}',
  acao_recomendada TEXT,
  
  -- Resolução
  resolvido_por UUID REFERENCES usuarios(id),
  resolvido_em TIMESTAMPTZ,
  resolucao_notas TEXT,
  
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CONCILIAÇÕES BANCÁRIAS
CREATE TABLE conciliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  conta_bancaria_id UUID NOT NULL REFERENCES contas_bancarias(id),
  
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  
  -- Sistema
  total_entradas_sistema DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_saidas_sistema DECIMAL(15,2) NOT NULL DEFAULT 0,
  saldo_sistema DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- Banco
  total_entradas_banco DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_saidas_banco DECIMAL(15,2) NOT NULL DEFAULT 0,
  saldo_banco DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- Diferenças
  diferenca_entradas DECIMAL(15,2) DEFAULT 0,
  diferenca_saidas DECIMAL(15,2) DEFAULT 0,
  diferenca_saldo DECIMAL(15,2) DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'conciliado', 'divergente', 'ajustado')),
  itens_pendentes INTEGER DEFAULT 0,
  itens_conciliados INTEGER DEFAULT 0,
  
  -- IA
  analise_ia JSONB DEFAULT '{}',
  
  usuario_id UUID REFERENCES usuarios(id),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers
CREATE TRIGGER tr_faturas_updated BEFORE UPDATE ON faturas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_parcelas_updated BEFORE UPDATE ON parcelas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_contas_bancarias_updated BEFORE UPDATE ON contas_bancarias FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_transacoes_updated BEFORE UPDATE ON transacoes_bancarias FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_dda_updated BEFORE UPDATE ON dda_boletos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_sugestoes_updated BEFORE UPDATE ON sugestoes_financeiras FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_alertas_updated BEFORE UPDATE ON alertas_financeiros FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_conciliacoes_updated BEFORE UPDATE ON conciliacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Índices
CREATE INDEX idx_faturas_empresa ON faturas(empresa_id);
CREATE INDEX idx_faturas_cliente ON faturas(cliente_id);
CREATE INDEX idx_faturas_status ON faturas(status);
CREATE INDEX idx_parcelas_fatura ON parcelas(fatura_id);
CREATE INDEX idx_parcelas_vencimento ON parcelas(data_vencimento) WHERE status IN ('pendente', 'parcial');
CREATE INDEX idx_transacoes_conta ON transacoes_bancarias(conta_bancaria_id);
CREATE INDEX idx_transacoes_data ON transacoes_bancarias(data_transacao);
CREATE INDEX idx_transacoes_auditoria ON transacoes_bancarias(auditoria_status) WHERE auditoria_status != 'aprovado';
CREATE INDEX idx_alertas_empresa ON alertas_financeiros(empresa_id);
CREATE INDEX idx_alertas_status ON alertas_financeiros(status) WHERE status IN ('novo', 'em_analise');
CREATE INDEX idx_sugestoes_empresa ON sugestoes_financeiras(empresa_id);
CREATE INDEX idx_sugestoes_status ON sugestoes_financeiras(status) WHERE status = 'pendente';
