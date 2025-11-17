-- ICARUS v5.0 - Schema Inicial do Banco de Dados
-- Migration: 20250117000000_schema_inicial.sql
-- Idioma: PT-BR

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============ ENUMS ============
CREATE TYPE papel_usuario AS ENUM ('admin', 'gerente', 'usuario', 'visualizador');
CREATE TYPE plano_empresa AS ENUM ('inicial', 'profissional', 'empresarial');
CREATE TYPE tipo_produto AS ENUM ('OPME', 'Consignado', 'Compra');
CREATE TYPE tipo_cliente AS ENUM ('hospital', 'clinica', 'medico');
CREATE TYPE status_cirurgia AS ENUM ('agendada', 'confirmada', 'realizada', 'cancelada');
CREATE TYPE status_financeiro AS ENUM ('pendente', 'pago', 'vencido', 'cancelado');
CREATE TYPE tipo_movimentacao AS ENUM ('entrada', 'saida', 'ajuste', 'transferencia');

-- ============ TABELAS PRINCIPAIS ============

-- Empresas (Multi-tenancy)
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  plano plano_empresa DEFAULT 'inicial',
  ativo BOOLEAN DEFAULT true,
  configuracoes JSONB DEFAULT '{}',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE empresas IS 'Empresas cadastradas no sistema (multi-tenancy)';
COMMENT ON COLUMN empresas.plano IS 'Plano contratado: inicial, profissional ou empresarial';

-- Usuários
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  nome_completo TEXT NOT NULL,
  avatar_url TEXT,
  papel papel_usuario DEFAULT 'usuario',
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE usuarios IS 'Usuários do sistema com controle de acesso por papel';
COMMENT ON COLUMN usuarios.papel IS 'Nível de acesso: admin, gerente, usuario ou visualizador';

-- ============ PRODUTOS ============

-- Categorias
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria_pai_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE categorias IS 'Categorias de produtos (hierárquica)';

-- Fornecedores
CREATE TABLE fornecedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cnpj TEXT NOT NULL,
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  contato TEXT,
  email TEXT,
  telefone TEXT,
  endereco JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, cnpj)
);

COMMENT ON TABLE fornecedores IS 'Fornecedores de produtos OPME';

-- Produtos
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  tipo tipo_produto NOT NULL,
  registro_anvisa TEXT,
  fabricante_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
  unidade_medida TEXT NOT NULL,
  preco_custo DECIMAL(15,2) DEFAULT 0,
  preco_venda DECIMAL(15,2) DEFAULT 0,
  margem_lucro DECIMAL(5,2) DEFAULT 0,
  estoque_minimo INTEGER DEFAULT 0,
  estoque_atual INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  foto_url TEXT,
  metadados JSONB DEFAULT '{}',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

COMMENT ON TABLE produtos IS 'Catálogo de produtos OPME, consignados e compra direta';
COMMENT ON COLUMN produtos.registro_anvisa IS 'Número do registro ANVISA do produto';

-- ============ CLIENTES ============

-- Clientes (Hospitais, Clínicas, Médicos)
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo tipo_cliente NOT NULL,
  cnpj_cpf TEXT NOT NULL,
  nome TEXT NOT NULL,
  razao_social TEXT,
  contato TEXT,
  email TEXT,
  telefone TEXT,
  endereco JSONB DEFAULT '{}',
  limite_credito DECIMAL(15,2) DEFAULT 0,
  credito_disponivel DECIMAL(15,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, cnpj_cpf)
);

COMMENT ON TABLE clientes IS 'Clientes: hospitais, clínicas e médicos';
COMMENT ON COLUMN clientes.tipo IS 'Tipo de cliente: hospital, clinica ou medico';

-- ============ CIRURGIAS ============

-- Cirurgias
CREATE TABLE cirurgias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  paciente_nome TEXT NOT NULL,
  paciente_cpf TEXT,
  hospital_id UUID NOT NULL REFERENCES clientes(id),
  medico_id UUID NOT NULL REFERENCES clientes(id),
  tipo_cirurgia TEXT NOT NULL,
  data_cirurgia DATE NOT NULL,
  status status_cirurgia DEFAULT 'agendada',
  valor_total DECIMAL(15,2) DEFAULT 0,
  observacoes TEXT,
  metadados JSONB DEFAULT '{}',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, numero)
);

COMMENT ON TABLE cirurgias IS 'Cirurgias agendadas e realizadas';
COMMENT ON COLUMN cirurgias.status IS 'Status: agendada, confirmada, realizada ou cancelada';

-- Produtos utilizados em cirurgias
CREATE TABLE cirurgias_produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cirurgia_id UUID NOT NULL REFERENCES cirurgias(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id),
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(15,2) NOT NULL,
  preco_total DECIMAL(15,2) NOT NULL,
  lote TEXT,
  validade DATE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE cirurgias_produtos IS 'Produtos OPME utilizados em cada cirurgia';

-- ============ FINANCEIRO ============

-- Contas a Receber
CREATE TABLE contas_receber (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  cirurgia_id UUID REFERENCES cirurgias(id) ON DELETE SET NULL,
  valor DECIMAL(15,2) NOT NULL,
  valor_pago DECIMAL(15,2) DEFAULT 0,
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status status_financeiro DEFAULT 'pendente',
  forma_pagamento TEXT,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, numero)
);

COMMENT ON TABLE contas_receber IS 'Contas a receber de clientes';
COMMENT ON COLUMN contas_receber.status IS 'Status: pendente, pago, vencido ou cancelado';

-- Contas a Pagar
CREATE TABLE contas_pagar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  fornecedor_id UUID NOT NULL REFERENCES fornecedores(id),
  valor DECIMAL(15,2) NOT NULL,
  valor_pago DECIMAL(15,2) DEFAULT 0,
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status status_financeiro DEFAULT 'pendente',
  forma_pagamento TEXT,
  categoria TEXT,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, numero)
);

COMMENT ON TABLE contas_pagar IS 'Contas a pagar para fornecedores';

-- ============ ESTOQUE ============

-- Movimentações de Estoque
CREATE TABLE movimentacoes_estoque (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id),
  tipo tipo_movimentacao NOT NULL,
  quantidade INTEGER NOT NULL,
  valor_unitario DECIMAL(15,2) NOT NULL,
  valor_total DECIMAL(15,2) NOT NULL,
  lote TEXT,
  validade DATE,
  origem TEXT,
  destino TEXT,
  referencia_id UUID,
  observacoes TEXT,
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE movimentacoes_estoque IS 'Histórico de movimentações de estoque (entrada, saída, ajuste, transferência)';
COMMENT ON COLUMN movimentacoes_estoque.tipo IS 'Tipo: entrada, saida, ajuste ou transferencia';

-- ============ ANALYTICS / IA ============

-- Previsões do IcarusBrain
CREATE TABLE icarus_previsoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  entidade_id UUID,
  dados_entrada JSONB NOT NULL,
  dados_previsao JSONB NOT NULL,
  confianca DECIMAL(5,4) NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE icarus_previsoes IS 'Previsões e análises geradas pelo IcarusBrain (IA)';
COMMENT ON COLUMN icarus_previsoes.tipo IS 'Tipo de previsão: demanda, inadimplencia, produtos, estoque, etc.';
COMMENT ON COLUMN icarus_previsoes.confianca IS 'Nível de confiança da previsão (0 a 1)';

-- Logs de Auditoria
CREATE TABLE icarus_registros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  acao TEXT NOT NULL,
  tipo_entidade TEXT,
  entidade_id UUID,
  detalhes JSONB DEFAULT '{}',
  endereco_ip TEXT,
  navegador TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE icarus_registros IS 'Logs de auditoria de todas as ações do sistema';
COMMENT ON COLUMN icarus_registros.acao IS 'Ação realizada (criar, atualizar, deletar, etc.)';

-- ============ ÍNDICES ============

-- Usuários
CREATE INDEX idx_usuarios_empresa ON usuarios(empresa_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_ativo ON usuarios(ativo);

-- Produtos
CREATE INDEX idx_produtos_empresa ON produtos(empresa_id);
CREATE INDEX idx_produtos_codigo ON produtos(codigo);
CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX idx_produtos_ativo ON produtos(ativo);

-- Clientes
CREATE INDEX idx_clientes_empresa ON clientes(empresa_id);
CREATE INDEX idx_clientes_cnpj_cpf ON clientes(cnpj_cpf);
CREATE INDEX idx_clientes_tipo ON clientes(tipo);
CREATE INDEX idx_clientes_ativo ON clientes(ativo);

-- Cirurgias
CREATE INDEX idx_cirurgias_empresa ON cirurgias(empresa_id);
CREATE INDEX idx_cirurgias_data ON cirurgias(data_cirurgia);
CREATE INDEX idx_cirurgias_status ON cirurgias(status);
CREATE INDEX idx_cirurgias_hospital ON cirurgias(hospital_id);
CREATE INDEX idx_cirurgias_medico ON cirurgias(medico_id);

-- Financeiro
CREATE INDEX idx_contas_receber_empresa ON contas_receber(empresa_id);
CREATE INDEX idx_contas_receber_status ON contas_receber(status);
CREATE INDEX idx_contas_receber_vencimento ON contas_receber(data_vencimento);
CREATE INDEX idx_contas_receber_cliente ON contas_receber(cliente_id);

CREATE INDEX idx_contas_pagar_empresa ON contas_pagar(empresa_id);
CREATE INDEX idx_contas_pagar_status ON contas_pagar(status);
CREATE INDEX idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX idx_contas_pagar_fornecedor ON contas_pagar(fornecedor_id);

-- Estoque
CREATE INDEX idx_movimentacoes_empresa ON movimentacoes_estoque(empresa_id);
CREATE INDEX idx_movimentacoes_produto ON movimentacoes_estoque(produto_id);
CREATE INDEX idx_movimentacoes_tipo ON movimentacoes_estoque(tipo);
CREATE INDEX idx_movimentacoes_data ON movimentacoes_estoque(criado_em);

-- Analytics
CREATE INDEX idx_previsoes_empresa ON icarus_previsoes(empresa_id);
CREATE INDEX idx_previsoes_tipo ON icarus_previsoes(tipo);
CREATE INDEX idx_previsoes_entidade ON icarus_previsoes(entidade_id);

CREATE INDEX idx_registros_empresa ON icarus_registros(empresa_id);
CREATE INDEX idx_registros_acao ON icarus_registros(acao);
CREATE INDEX idx_registros_usuario ON icarus_registros(usuario_id);
CREATE INDEX idx_registros_data ON icarus_registros(criado_em);

-- ============ FUNÇÕES ============

-- Atualizar timestamp de atualização
CREATE OR REPLACE FUNCTION atualizar_timestamp_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION atualizar_timestamp_atualizacao() IS 'Atualiza automaticamente o campo atualizado_em';

-- Criar triggers para atualizado_em
CREATE TRIGGER trigger_empresas_atualizacao BEFORE UPDATE ON empresas
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp_atualizacao();

CREATE TRIGGER trigger_usuarios_atualizacao BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp_atualizacao();

CREATE TRIGGER trigger_produtos_atualizacao BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp_atualizacao();

CREATE TRIGGER trigger_clientes_atualizacao BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp_atualizacao();

CREATE TRIGGER trigger_cirurgias_atualizacao BEFORE UPDATE ON cirurgias
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp_atualizacao();

CREATE TRIGGER trigger_fornecedores_atualizacao BEFORE UPDATE ON fornecedores
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp_atualizacao();

CREATE TRIGGER trigger_contas_receber_atualizacao BEFORE UPDATE ON contas_receber
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp_atualizacao();

CREATE TRIGGER trigger_contas_pagar_atualizacao BEFORE UPDATE ON contas_pagar
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp_atualizacao();

-- Estatísticas do Dashboard
CREATE OR REPLACE FUNCTION obter_estatisticas_dashboard(id_empresa UUID)
RETURNS JSONB AS $$
DECLARE
  resultado JSONB;
BEGIN
  SELECT jsonb_build_object(
    'cirurgias_mes', (
      SELECT COUNT(*) FROM cirurgias
      WHERE empresa_id = id_empresa
      AND data_cirurgia >= DATE_TRUNC('month', CURRENT_DATE)
    ),
    'receita_mes', (
      SELECT COALESCE(SUM(valor_pago), 0) FROM contas_receber
      WHERE empresa_id = id_empresa
      AND status = 'pago'
      AND data_pagamento >= DATE_TRUNC('month', CURRENT_DATE)
    ),
    'valor_receber', (
      SELECT COALESCE(SUM(valor - valor_pago), 0) FROM contas_receber
      WHERE empresa_id = id_empresa
      AND status = 'pendente'
    ),
    'produtos_estoque_baixo', (
      SELECT COUNT(*) FROM produtos
      WHERE empresa_id = id_empresa
      AND estoque_atual <= estoque_minimo
      AND ativo = true
    ),
    'contas_vencidas', (
      SELECT COUNT(*) FROM contas_receber
      WHERE empresa_id = id_empresa
      AND status = 'vencido'
    ),
    'cirurgias_agendadas', (
      SELECT COUNT(*) FROM cirurgias
      WHERE empresa_id = id_empresa
      AND status = 'agendada'
      AND data_cirurgia >= CURRENT_DATE
    )
  ) INTO resultado;

  RETURN resultado;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION obter_estatisticas_dashboard(UUID) IS 'Retorna estatísticas consolidadas para o dashboard';

-- Calcular Valor Total do Estoque
CREATE OR REPLACE FUNCTION calcular_valor_estoque(id_empresa UUID)
RETURNS DECIMAL AS $$
DECLARE
  total DECIMAL;
BEGIN
  SELECT COALESCE(SUM(estoque_atual * preco_custo), 0)
  INTO total
  FROM produtos
  WHERE empresa_id = id_empresa AND ativo = true;

  RETURN total;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calcular_valor_estoque(UUID) IS 'Calcula o valor total do estoque baseado no preço de custo';

-- Atualizar Estoque após Movimentação
CREATE OR REPLACE FUNCTION atualizar_estoque_produto()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo = 'entrada' THEN
    UPDATE produtos
    SET estoque_atual = estoque_atual + NEW.quantidade
    WHERE id = NEW.produto_id;
  ELSIF NEW.tipo IN ('saida', 'transferencia') THEN
    UPDATE produtos
    SET estoque_atual = estoque_atual - NEW.quantidade
    WHERE id = NEW.produto_id;
  ELSIF NEW.tipo = 'ajuste' THEN
    -- Para ajustes, a quantidade pode ser positiva ou negativa
    UPDATE produtos
    SET estoque_atual = estoque_atual + NEW.quantidade
    WHERE id = NEW.produto_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION atualizar_estoque_produto() IS 'Atualiza automaticamente o estoque do produto após movimentação';

-- Trigger para atualizar estoque automaticamente
CREATE TRIGGER trigger_atualizar_estoque
  AFTER INSERT ON movimentacoes_estoque
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_estoque_produto();

-- Calcular Margem de Lucro
CREATE OR REPLACE FUNCTION calcular_margem_lucro()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.preco_custo > 0 AND NEW.preco_venda > 0 THEN
    NEW.margem_lucro = ((NEW.preco_venda - NEW.preco_custo) / NEW.preco_custo) * 100;
  ELSE
    NEW.margem_lucro = 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calcular_margem_lucro() IS 'Calcula automaticamente a margem de lucro do produto';

-- Trigger para calcular margem de lucro
CREATE TRIGGER trigger_calcular_margem
  BEFORE INSERT OR UPDATE ON produtos
  FOR EACH ROW
  EXECUTE FUNCTION calcular_margem_lucro();
