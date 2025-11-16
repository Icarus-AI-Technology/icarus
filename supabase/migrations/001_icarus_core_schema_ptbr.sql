-- =====================================================
-- ICARUS v5.0 - Schema do Banco de Dados (PT-BR)
-- Migration 001: Criar todas as 12 tabelas
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca full-text

-- =====================================================
-- TABELA 1: empresas (Distribuidoras OPME)
-- =====================================================
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  razao_social TEXT,
  cnpj TEXT UNIQUE NOT NULL,
  inscricao_estadual TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  telefone TEXT,
  email TEXT,
  site TEXT,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso')),
  configuracoes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_empresas_cnpj ON empresas(cnpj);
CREATE INDEX idx_empresas_status ON empresas(status);
CREATE INDEX idx_empresas_cidade ON empresas(cidade);

COMMENT ON TABLE empresas IS 'Cadastro de empresas distribuidoras OPME (multi-tenant)';

-- =====================================================
-- TABELA 2: perfis (Perfis de Usuários)
-- =====================================================
CREATE TABLE IF NOT EXISTS perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  email TEXT NOT NULL,
  cargo TEXT DEFAULT 'usuario' CHECK (cargo IN ('admin', 'gerente', 'vendedor', 'usuario', 'visualizador')),
  avatar_url TEXT,
  telefone TEXT,
  celular TEXT,
  departamento TEXT,
  permissoes JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_perfis_empresa ON perfis(empresa_id);
CREATE INDEX idx_perfis_cargo ON perfis(cargo);
CREATE INDEX idx_perfis_email ON perfis(email);
CREATE INDEX idx_perfis_ativo ON perfis(ativo);

COMMENT ON TABLE perfis IS 'Perfis de usuários vinculados a empresas';

-- =====================================================
-- TABELA 3: categorias_produtos (Categorias OPME)
-- =====================================================
CREATE TABLE IF NOT EXISTS categorias_produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  codigo TEXT,
  especialidade TEXT,
  descricao TEXT,
  parent_id UUID REFERENCES categorias_produtos(id),
  ordem INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX idx_categorias_produtos_empresa ON categorias_produtos(empresa_id);
CREATE INDEX idx_categorias_produtos_especialidade ON categorias_produtos(especialidade);
CREATE INDEX idx_categorias_produtos_parent ON categorias_produtos(parent_id);

COMMENT ON TABLE categorias_produtos IS 'Categorias de produtos OPME por especialidade médica';

-- =====================================================
-- TABELA 4: fabricantes (Fabricantes de OPME)
-- =====================================================
CREATE TABLE IF NOT EXISTS fabricantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  razao_social TEXT,
  cnpj TEXT,
  pais TEXT DEFAULT 'Brasil',
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  telefone TEXT,
  email TEXT,
  site TEXT,
  contato_principal TEXT,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fabricantes_empresa ON fabricantes(empresa_id);
CREATE INDEX idx_fabricantes_pais ON fabricantes(pais);
CREATE INDEX idx_fabricantes_status ON fabricantes(status);
CREATE INDEX idx_fabricantes_nome ON fabricantes USING gin(nome gin_trgm_ops);

COMMENT ON TABLE fabricantes IS 'Fabricantes de produtos OPME (nacionais e importados)';

-- =====================================================
-- TABELA 5: produtos (Produtos OPME)
-- =====================================================
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias_produtos(id) ON DELETE SET NULL,
  fabricante_id UUID REFERENCES fabricantes(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  codigo TEXT NOT NULL,
  codigo_barras TEXT,
  registro_anvisa TEXT,
  tipo_produto TEXT CHECK (tipo_produto IN ('ortese', 'protese', 'material_especial', 'implante', 'instrumental')),
  especialidade TEXT,
  descricao TEXT,
  especificacoes JSONB DEFAULT '{}',

  -- Preços
  preco_custo DECIMAL(15,2),
  preco_venda DECIMAL(15,2) NOT NULL,
  margem_lucro DECIMAL(5,2),

  -- Estoque
  estoque_atual INTEGER DEFAULT 0,
  estoque_minimo INTEGER DEFAULT 0,
  estoque_maximo INTEGER,
  ponto_reposicao INTEGER,

  -- Unidade
  unidade_medida TEXT DEFAULT 'UN',

  -- Controle de lote
  controla_lote BOOLEAN DEFAULT false,
  controla_validade BOOLEAN DEFAULT false,
  controla_serie BOOLEAN DEFAULT false,

  -- Metadata
  imagem_url TEXT,
  imagens_adicionais TEXT[],
  tags TEXT[],
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'descontinuado')),
  observacoes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(empresa_id, codigo)
);

CREATE INDEX idx_produtos_empresa ON produtos(empresa_id);
CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX idx_produtos_fabricante ON produtos(fabricante_id);
CREATE INDEX idx_produtos_codigo ON produtos(codigo);
CREATE INDEX idx_produtos_codigo_barras ON produtos(codigo_barras);
CREATE INDEX idx_produtos_anvisa ON produtos(registro_anvisa);
CREATE INDEX idx_produtos_tipo ON produtos(tipo_produto);
CREATE INDEX idx_produtos_especialidade ON produtos(especialidade);
CREATE INDEX idx_produtos_status ON produtos(status);
CREATE INDEX idx_produtos_nome ON produtos USING gin(nome gin_trgm_ops);

COMMENT ON TABLE produtos IS 'Catálogo de produtos OPME (Órteses, Próteses e Materiais Especiais)';

-- =====================================================
-- TABELA 6: hospitais (Hospitais Clientes)
-- =====================================================
CREATE TABLE IF NOT EXISTS hospitais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  razao_social TEXT,
  cnpj TEXT,
  inscricao_estadual TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  telefone TEXT,
  email TEXT,
  site TEXT,
  contato_principal TEXT,
  cargo_contato TEXT,
  tipo_contrato TEXT CHECK (tipo_contrato IN ('consignacao', 'compra_direta', 'ambos')),
  limite_credito DECIMAL(15,2) DEFAULT 0,
  prazo_pagamento INTEGER DEFAULT 30,
  vendedor_responsavel_id UUID REFERENCES perfis(id),
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso', 'inadimplente')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_hospitais_empresa ON hospitais(empresa_id);
CREATE INDEX idx_hospitais_cnpj ON hospitais(cnpj);
CREATE INDEX idx_hospitais_cidade ON hospitais(cidade);
CREATE INDEX idx_hospitais_estado ON hospitais(estado);
CREATE INDEX idx_hospitais_status ON hospitais(status);
CREATE INDEX idx_hospitais_vendedor ON hospitais(vendedor_responsavel_id);
CREATE INDEX idx_hospitais_nome ON hospitais USING gin(nome gin_trgm_ops);

COMMENT ON TABLE hospitais IS 'Cadastro de hospitais e clínicas (clientes OPME)';

-- =====================================================
-- TABELA 7: medicos (Médicos)
-- =====================================================
CREATE TABLE IF NOT EXISTS medicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  crm TEXT NOT NULL,
  uf_crm TEXT NOT NULL,
  cpf TEXT,
  especialidade TEXT,
  subespecialidade TEXT,
  telefone TEXT,
  celular TEXT,
  email TEXT,
  hospitais_atendidos UUID[], -- Array de IDs de hospitais
  preferencias_produtos JSONB DEFAULT '{}',
  observacoes TEXT,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(crm, uf_crm)
);

CREATE INDEX idx_medicos_empresa ON medicos(empresa_id);
CREATE INDEX idx_medicos_crm ON medicos(crm, uf_crm);
CREATE INDEX idx_medicos_especialidade ON medicos(especialidade);
CREATE INDEX idx_medicos_status ON medicos(status);
CREATE INDEX idx_medicos_nome ON medicos USING gin(nome gin_trgm_ops);

COMMENT ON TABLE medicos IS 'Cadastro de médicos e cirurgiões';

-- =====================================================
-- TABELA 8: cirurgias (Cirurgias/Procedimentos)
-- =====================================================
CREATE TABLE IF NOT EXISTS cirurgias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES hospitais(id) ON DELETE SET NULL,
  medico_id UUID REFERENCES medicos(id) ON DELETE SET NULL,
  numero_protocolo TEXT UNIQUE NOT NULL,

  -- Dados do paciente
  nome_paciente TEXT NOT NULL,
  cpf_paciente TEXT,
  data_nascimento_paciente DATE,
  convenio TEXT,
  numero_carteirinha TEXT,

  -- Procedimento
  nome_procedimento TEXT NOT NULL,
  codigo_procedimento TEXT,
  codigo_tuss TEXT,
  lateralidade TEXT CHECK (lateralidade IN ('direita', 'esquerda', 'bilateral', 'nao_aplicavel')),

  -- Datas
  data_agendamento DATE NOT NULL,
  hora_agendamento TIME,
  data_realizacao DATE,
  hora_realizacao TIME,

  -- Status e valores
  status TEXT DEFAULT 'agendada' CHECK (status IN ('agendada', 'confirmada', 'em_andamento', 'realizada', 'cancelada', 'adiada')),
  valor_estimado DECIMAL(15,2),
  valor_final DECIMAL(15,2),
  valor_glosa DECIMAL(15,2) DEFAULT 0,

  -- Metadata
  sala_cirurgica TEXT,
  equipe_cirurgica JSONB DEFAULT '[]',
  observacoes TEXT,
  observacoes_internas TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cirurgias_empresa ON cirurgias(empresa_id);
CREATE INDEX idx_cirurgias_hospital ON cirurgias(hospital_id);
CREATE INDEX idx_cirurgias_medico ON cirurgias(medico_id);
CREATE INDEX idx_cirurgias_protocolo ON cirurgias(numero_protocolo);
CREATE INDEX idx_cirurgias_agendamento ON cirurgias(data_agendamento);
CREATE INDEX idx_cirurgias_realizacao ON cirurgias(data_realizacao);
CREATE INDEX idx_cirurgias_status ON cirurgias(status);
CREATE INDEX idx_cirurgias_paciente ON cirurgias(cpf_paciente);

COMMENT ON TABLE cirurgias IS 'Registro de cirurgias e procedimentos médicos';

-- =====================================================
-- TABELA 9: itens_cirurgia (Itens/Materiais usados)
-- =====================================================
CREATE TABLE IF NOT EXISTS itens_cirurgia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cirurgia_id UUID REFERENCES cirurgias(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,

  -- Snapshot do produto (caso seja deletado)
  codigo_produto TEXT NOT NULL,
  nome_produto TEXT NOT NULL,

  -- Quantidades
  quantidade INTEGER NOT NULL DEFAULT 1,
  quantidade_devolvida INTEGER DEFAULT 0,
  quantidade_utilizada INTEGER GENERATED ALWAYS AS (quantidade - quantidade_devolvida) STORED,

  -- Preços
  preco_unitario DECIMAL(15,2) NOT NULL,
  preco_total DECIMAL(15,2) NOT NULL,

  -- Tipo e controle
  tipo_item TEXT CHECK (tipo_item IN ('utilizado', 'devolvido', 'consignado', 'emprestimo')),
  numero_lote TEXT,
  numero_serie TEXT,
  data_validade DATE,

  -- Metadata
  observacoes TEXT,
  criado_por UUID REFERENCES perfis(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_itens_cirurgia_cirurgia ON itens_cirurgia(cirurgia_id);
CREATE INDEX idx_itens_cirurgia_produto ON itens_cirurgia(produto_id);
CREATE INDEX idx_itens_cirurgia_tipo ON itens_cirurgia(tipo_item);
CREATE INDEX idx_itens_cirurgia_lote ON itens_cirurgia(numero_lote);

COMMENT ON TABLE itens_cirurgia IS 'Itens e materiais OPME utilizados em cada cirurgia';

-- =====================================================
-- TABELA 10: notas_fiscais (Notas Fiscais)
-- =====================================================
CREATE TABLE IF NOT EXISTS notas_fiscais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  cirurgia_id UUID REFERENCES cirurgias(id) ON DELETE SET NULL,
  hospital_id UUID REFERENCES hospitais(id) ON DELETE SET NULL,

  -- Identificação
  numero_nota TEXT UNIQUE NOT NULL,
  serie TEXT,
  tipo_nota TEXT CHECK (tipo_nota IN ('nfe', 'nfse', 'recibo', 'cupom')),
  modelo TEXT,
  chave_acesso TEXT UNIQUE,

  -- Datas
  data_emissao DATE NOT NULL,
  data_saida DATE,
  data_vencimento DATE,
  data_pagamento DATE,

  -- Valores
  valor_produtos DECIMAL(15,2) NOT NULL,
  valor_desconto DECIMAL(15,2) DEFAULT 0,
  valor_frete DECIMAL(15,2) DEFAULT 0,
  valor_seguro DECIMAL(15,2) DEFAULT 0,
  valor_outras_despesas DECIMAL(15,2) DEFAULT 0,
  valor_icms DECIMAL(15,2) DEFAULT 0,
  valor_ipi DECIMAL(15,2) DEFAULT 0,
  valor_pis DECIMAL(15,2) DEFAULT 0,
  valor_cofins DECIMAL(15,2) DEFAULT 0,
  valor_iss DECIMAL(15,2) DEFAULT 0,
  valor_total DECIMAL(15,2) NOT NULL,

  -- Status
  status TEXT DEFAULT 'pendente' CHECK (status IN ('rascunho', 'pendente', 'autorizada', 'enviada', 'paga', 'cancelada', 'denegada')),
  status_sefaz TEXT,
  protocolo_autorizacao TEXT,

  -- Arquivos
  xml_url TEXT,
  pdf_url TEXT,
  danfe_url TEXT,

  -- Metadata
  forma_pagamento TEXT,
  condicao_pagamento TEXT,
  observacoes TEXT,
  observacoes_internas TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notas_fiscais_empresa ON notas_fiscais(empresa_id);
CREATE INDEX idx_notas_fiscais_cirurgia ON notas_fiscais(cirurgia_id);
CREATE INDEX idx_notas_fiscais_hospital ON notas_fiscais(hospital_id);
CREATE INDEX idx_notas_fiscais_numero ON notas_fiscais(numero_nota);
CREATE INDEX idx_notas_fiscais_chave ON notas_fiscais(chave_acesso);
CREATE INDEX idx_notas_fiscais_status ON notas_fiscais(status);
CREATE INDEX idx_notas_fiscais_emissao ON notas_fiscais(data_emissao);
CREATE INDEX idx_notas_fiscais_vencimento ON notas_fiscais(data_vencimento);

COMMENT ON TABLE notas_fiscais IS 'Notas fiscais eletrônicas (NFe/NFSe)';

-- =====================================================
-- TABELA 11: contas_receber (Contas a Receber)
-- =====================================================
CREATE TABLE IF NOT EXISTS contas_receber (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nota_fiscal_id UUID REFERENCES notas_fiscais(id) ON DELETE SET NULL,
  hospital_id UUID REFERENCES hospitais(id) ON DELETE SET NULL,
  cirurgia_id UUID REFERENCES cirurgias(id) ON DELETE SET NULL,

  -- Identificação
  numero_documento TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo_documento TEXT CHECK (tipo_documento IN ('nota_fiscal', 'boleto', 'duplicata', 'recibo', 'outros')),

  -- Valores
  valor_original DECIMAL(15,2) NOT NULL,
  valor_desconto DECIMAL(15,2) DEFAULT 0,
  valor_juros DECIMAL(15,2) DEFAULT 0,
  valor_multa DECIMAL(15,2) DEFAULT 0,
  valor_recebido DECIMAL(15,2) DEFAULT 0,
  valor_saldo DECIMAL(15,2) NOT NULL,

  -- Datas
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_recebimento DATE,

  -- Status
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'parcial', 'pago', 'vencido', 'cancelado', 'protestado')),
  dias_atraso INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN data_recebimento IS NOT NULL THEN 0
      WHEN data_vencimento < CURRENT_DATE THEN CURRENT_DATE - data_vencimento
      ELSE 0
    END
  ) STORED,

  -- Pagamento
  forma_recebimento TEXT,
  banco TEXT,
  agencia TEXT,
  conta TEXT,

  -- Metadata
  observacoes TEXT,
  responsavel_cobranca_id UUID REFERENCES perfis(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contas_receber_empresa ON contas_receber(empresa_id);
CREATE INDEX idx_contas_receber_nota ON contas_receber(nota_fiscal_id);
CREATE INDEX idx_contas_receber_hospital ON contas_receber(hospital_id);
CREATE INDEX idx_contas_receber_cirurgia ON contas_receber(cirurgia_id);
CREATE INDEX idx_contas_receber_status ON contas_receber(status);
CREATE INDEX idx_contas_receber_vencimento ON contas_receber(data_vencimento);
CREATE INDEX idx_contas_receber_documento ON contas_receber(numero_documento);

COMMENT ON TABLE contas_receber IS 'Contas a receber e controle financeiro';

-- =====================================================
-- TABELA 12: movimentacoes_estoque (Movimentações)
-- =====================================================
CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,

  -- Tipo de movimentação
  tipo_movimentacao TEXT NOT NULL CHECK (tipo_movimentacao IN ('entrada', 'saida', 'ajuste', 'transferencia', 'devolucao', 'inventario')),
  origem TEXT, -- 'compra', 'cirurgia', 'devolucao', 'ajuste', etc

  -- Referências
  referencia_id UUID, -- ID da cirurgia, compra, etc
  referencia_tipo TEXT, -- 'cirurgia', 'compra', 'ajuste', etc
  referencia_numero TEXT, -- Número do documento

  -- Quantidade
  quantidade INTEGER NOT NULL,
  quantidade_anterior INTEGER NOT NULL,
  quantidade_nova INTEGER NOT NULL,

  -- Valores
  custo_unitario DECIMAL(15,2),
  valor_total DECIMAL(15,2),

  -- Controle de lote
  numero_lote TEXT,
  numero_serie TEXT,
  data_validade DATE,
  data_fabricacao DATE,

  -- Localização
  deposito_origem TEXT,
  deposito_destino TEXT,

  -- Metadata
  motivo TEXT,
  observacoes TEXT,
  usuario_id UUID REFERENCES perfis(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_movimentacoes_estoque_empresa ON movimentacoes_estoque(empresa_id);
CREATE INDEX idx_movimentacoes_estoque_produto ON movimentacoes_estoque(produto_id);
CREATE INDEX idx_movimentacoes_estoque_tipo ON movimentacoes_estoque(tipo_movimentacao);
CREATE INDEX idx_movimentacoes_estoque_data ON movimentacoes_estoque(created_at);
CREATE INDEX idx_movimentacoes_estoque_referencia ON movimentacoes_estoque(referencia_tipo, referencia_id);
CREATE INDEX idx_movimentacoes_estoque_lote ON movimentacoes_estoque(numero_lote);

COMMENT ON TABLE movimentacoes_estoque IS 'Histórico de movimentações de estoque';

-- =====================================================
-- FUNCTIONS: Triggers de atualização automática
-- =====================================================
CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers em todas as tabelas com updated_at
CREATE TRIGGER trigger_empresas_updated_at BEFORE UPDATE ON empresas
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trigger_perfis_updated_at BEFORE UPDATE ON perfis
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trigger_categorias_produtos_updated_at BEFORE UPDATE ON categorias_produtos
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trigger_fabricantes_updated_at BEFORE UPDATE ON fabricantes
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trigger_produtos_updated_at BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trigger_hospitais_updated_at BEFORE UPDATE ON hospitais
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trigger_medicos_updated_at BEFORE UPDATE ON medicos
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trigger_cirurgias_updated_at BEFORE UPDATE ON cirurgias
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trigger_notas_fiscais_updated_at BEFORE UPDATE ON notas_fiscais
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trigger_contas_receber_updated_at BEFORE UPDATE ON contas_receber
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

-- =====================================================
-- FUNCTION: Atualizar estoque após movimentação
-- =====================================================
CREATE OR REPLACE FUNCTION atualizar_estoque_produto()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE produtos
  SET estoque_atual = NEW.quantidade_nova
  WHERE id = NEW.produto_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_estoque AFTER INSERT ON movimentacoes_estoque
  FOR EACH ROW EXECUTE FUNCTION atualizar_estoque_produto();

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View: Produtos com estoque baixo
CREATE OR REPLACE VIEW vw_produtos_estoque_baixo AS
SELECT
  p.*,
  c.nome AS categoria_nome,
  f.nome AS fabricante_nome,
  (p.estoque_minimo - p.estoque_atual) AS quantidade_repor
FROM produtos p
LEFT JOIN categorias_produtos c ON p.categoria_id = c.id
LEFT JOIN fabricantes f ON p.fabricante_id = f.id
WHERE p.estoque_atual <= p.estoque_minimo
  AND p.status = 'ativo'
ORDER BY (p.estoque_minimo - p.estoque_atual) DESC;

-- View: Contas a receber vencidas
CREATE OR REPLACE VIEW vw_contas_vencidas AS
SELECT
  cr.*,
  h.nome AS hospital_nome,
  cr.dias_atraso,
  CASE
    WHEN cr.dias_atraso <= 30 THEN 'ate_30_dias'
    WHEN cr.dias_atraso <= 60 THEN 'ate_60_dias'
    WHEN cr.dias_atraso <= 90 THEN 'ate_90_dias'
    ELSE 'acima_90_dias'
  END AS faixa_atraso
FROM contas_receber cr
LEFT JOIN hospitais h ON cr.hospital_id = h.id
WHERE cr.status = 'vencido'
ORDER BY cr.dias_atraso DESC;

-- View: Resumo de cirurgias
CREATE OR REPLACE VIEW vw_resumo_cirurgias AS
SELECT
  c.id,
  c.empresa_id,
  c.numero_protocolo,
  c.data_agendamento,
  c.data_realizacao,
  c.status,
  c.valor_final,
  h.nome AS hospital_nome,
  m.nome AS medico_nome,
  m.especialidade AS medico_especialidade,
  COUNT(ic.id) AS total_itens,
  SUM(ic.quantidade_utilizada) AS total_quantidade_utilizada,
  SUM(ic.preco_total) AS valor_total_itens
FROM cirurgias c
LEFT JOIN hospitais h ON c.hospital_id = h.id
LEFT JOIN medicos m ON c.medico_id = m.id
LEFT JOIN itens_cirurgia ic ON c.id = ic.cirurgia_id
GROUP BY c.id, h.nome, m.nome, m.especialidade;

-- =====================================================
-- FIM DA MIGRATION 001 (PT-BR)
-- =====================================================
