-- ============================================================================
-- ICARUS v6.0 - CADASTROS
-- ============================================================================

-- CLIENTES
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('hospital', 'clinica', 'operadora', 'distribuidor', 'pessoa_fisica')),
  cpf_cnpj VARCHAR(18) NOT NULL,
  razao_social VARCHAR(200),
  nome_fantasia VARCHAR(200),
  nome VARCHAR(200),
  inscricao_estadual VARCHAR(20),
  endereco_logradouro VARCHAR(200),
  endereco_numero VARCHAR(20),
  endereco_complemento VARCHAR(100),
  endereco_bairro VARCHAR(100),
  endereco_cidade VARCHAR(100),
  endereco_uf CHAR(2),
  endereco_cep VARCHAR(10),
  telefone VARCHAR(20),
  email VARCHAR(200),
  contato_nome VARCHAR(200),
  contato_telefone VARCHAR(20),
  contato_email VARCHAR(200),
  prazo_pagamento INTEGER DEFAULT 30,
  limite_credito DECIMAL(15,2),
  score_inadimplencia DECIMAL(5,2) DEFAULT 0,
  observacoes TEXT,
  dados_receita JSONB,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  UNIQUE(empresa_id, cpf_cnpj)
);

-- HOSPITAIS (extensão de clientes)
CREATE TABLE hospitais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  cnes VARCHAR(20),
  tipo_hospital VARCHAR(50),
  leitos INTEGER,
  centro_cirurgico_nome VARCHAR(200),
  centro_cirurgico_telefone VARCHAR(20),
  almoxarifado_nome VARCHAR(200),
  almoxarifado_telefone VARCHAR(20),
  horario_funcionamento TEXT,
  requisitos_entrada TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MÉDICOS
CREATE TABLE medicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(200) NOT NULL,
  crm VARCHAR(20) NOT NULL,
  crm_uf CHAR(2) NOT NULL,
  especialidades TEXT[],
  email VARCHAR(200),
  telefone VARCHAR(20),
  hospital_principal_id UUID REFERENCES hospitais(id),
  verificado_cfm BOOLEAN DEFAULT false,
  data_verificacao_cfm TIMESTAMPTZ,
  dados_cfm JSONB,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  UNIQUE(empresa_id, crm, crm_uf)
);

-- FORNECEDORES
CREATE TABLE fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cnpj VARCHAR(18) NOT NULL,
  razao_social VARCHAR(200) NOT NULL,
  nome_fantasia VARCHAR(200),
  inscricao_estadual VARCHAR(20),
  endereco_logradouro VARCHAR(200),
  endereco_numero VARCHAR(20),
  endereco_complemento VARCHAR(100),
  endereco_bairro VARCHAR(100),
  endereco_cidade VARCHAR(100),
  endereco_uf CHAR(2),
  endereco_cep VARCHAR(10),
  telefone VARCHAR(20),
  email VARCHAR(200),
  contato_nome VARCHAR(200),
  contato_telefone VARCHAR(20),
  prazo_entrega INTEGER,
  condicoes_pagamento TEXT,
  dados_receita JSONB,
  avaliacao DECIMAL(3,2),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  UNIQUE(empresa_id, cnpj)
);

-- FABRICANTES
CREATE TABLE fabricantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(200) NOT NULL,
  cnpj VARCHAR(18),
  pais VARCHAR(100) DEFAULT 'Brasil',
  website VARCHAR(200),
  contato_nome VARCHAR(200),
  contato_email VARCHAR(200),
  contato_telefone VARCHAR(20),
  autorizacao_anvisa VARCHAR(50),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CATEGORIAS (hierárquica)
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  categoria_pai_id UUID REFERENCES categorias(id),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  codigo VARCHAR(20),
  nivel INTEGER DEFAULT 1,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers
CREATE TRIGGER tr_clientes_updated BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_hospitais_updated BEFORE UPDATE ON hospitais FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_medicos_updated BEFORE UPDATE ON medicos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_fornecedores_updated BEFORE UPDATE ON fornecedores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_fabricantes_updated BEFORE UPDATE ON fabricantes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_categorias_updated BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Índices
CREATE INDEX idx_clientes_empresa ON clientes(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX idx_medicos_empresa ON medicos(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX idx_medicos_crm ON medicos(crm, crm_uf);
CREATE INDEX idx_fornecedores_empresa ON fornecedores(empresa_id) WHERE excluido_em IS NULL;
