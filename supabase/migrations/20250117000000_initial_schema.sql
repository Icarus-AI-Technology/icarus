-- ICARUS v5.0 - Initial Database Schema
-- Migration: 20250117000000_initial_schema.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============ ENUMS ============
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'user', 'viewer');
CREATE TYPE tenant_plan AS ENUM ('starter', 'professional', 'enterprise');
CREATE TYPE produto_tipo AS ENUM ('OPME', 'Consignado', 'Compra');
CREATE TYPE cliente_tipo AS ENUM ('hospital', 'clinica', 'medico');
CREATE TYPE cirurgia_status AS ENUM ('agendada', 'confirmada', 'realizada', 'cancelada');
CREATE TYPE financeiro_status AS ENUM ('pendente', 'pago', 'vencido', 'cancelado');
CREATE TYPE estoque_tipo AS ENUM ('entrada', 'saida', 'ajuste', 'transferencia');

-- ============ CORE TABLES ============

-- Tenants (Multi-tenancy)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  plan tenant_plan DEFAULT 'starter',
  active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ PRODUTOS ============

-- Categorias
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  parent_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fornecedores
CREATE TABLE fornecedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  cnpj TEXT NOT NULL,
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  contato TEXT,
  email TEXT,
  telefone TEXT,
  endereco JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, cnpj)
);

-- Produtos
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  tipo produto_tipo NOT NULL,
  anvisa_registro TEXT,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, codigo)
);

-- ============ CLIENTES ============

-- Clientes (Hospitais, Clínicas, Médicos)
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tipo cliente_tipo NOT NULL,
  cnpj_cpf TEXT NOT NULL,
  nome TEXT NOT NULL,
  razao_social TEXT,
  contato TEXT,
  email TEXT,
  telefone TEXT,
  endereco JSONB DEFAULT '{}',
  credito_limite DECIMAL(15,2) DEFAULT 0,
  credito_disponivel DECIMAL(15,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, cnpj_cpf)
);

-- ============ CIRURGIAS ============

-- Cirurgias
CREATE TABLE cirurgias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  paciente_nome TEXT NOT NULL,
  paciente_cpf TEXT,
  hospital_id UUID NOT NULL REFERENCES clientes(id),
  medico_id UUID NOT NULL REFERENCES clientes(id),
  tipo_cirurgia TEXT NOT NULL,
  data_cirurgia DATE NOT NULL,
  status cirurgia_status DEFAULT 'agendada',
  valor_total DECIMAL(15,2) DEFAULT 0,
  observacoes TEXT,
  metadados JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, numero)
);

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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ FINANCEIRO ============

-- Contas a Receber
CREATE TABLE contas_receber (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  cirurgia_id UUID REFERENCES cirurgias(id) ON DELETE SET NULL,
  valor DECIMAL(15,2) NOT NULL,
  valor_pago DECIMAL(15,2) DEFAULT 0,
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status financeiro_status DEFAULT 'pendente',
  forma_pagamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, numero)
);

-- Contas a Pagar
CREATE TABLE contas_pagar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  fornecedor_id UUID NOT NULL REFERENCES fornecedores(id),
  valor DECIMAL(15,2) NOT NULL,
  valor_pago DECIMAL(15,2) DEFAULT 0,
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status financeiro_status DEFAULT 'pendente',
  forma_pagamento TEXT,
  categoria TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, numero)
);

-- ============ ESTOQUE ============

-- Movimentações de Estoque
CREATE TABLE movimentacoes_estoque (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id),
  tipo estoque_tipo NOT NULL,
  quantidade INTEGER NOT NULL,
  valor_unitario DECIMAL(15,2) NOT NULL,
  valor_total DECIMAL(15,2) NOT NULL,
  lote TEXT,
  validade DATE,
  origem TEXT,
  destino TEXT,
  referencia_id UUID,
  observacoes TEXT,
  usuario_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ ANALYTICS / IA ============

-- Previsões e Análises do IcarusBrain
CREATE TABLE icarus_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- demanda, inadimplencia, produtos, etc.
  entidade_id UUID, -- ID relacionado (produto, cliente, etc.)
  input_data JSONB NOT NULL,
  prediction_data JSONB NOT NULL,
  confidence DECIMAL(5,4) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs de Auditoria
CREATE TABLE icarus_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ INDEXES ============

-- Users
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);

-- Produtos
CREATE INDEX idx_produtos_tenant ON produtos(tenant_id);
CREATE INDEX idx_produtos_codigo ON produtos(codigo);
CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);

-- Clientes
CREATE INDEX idx_clientes_tenant ON clientes(tenant_id);
CREATE INDEX idx_clientes_cnpj_cpf ON clientes(cnpj_cpf);

-- Cirurgias
CREATE INDEX idx_cirurgias_tenant ON cirurgias(tenant_id);
CREATE INDEX idx_cirurgias_data ON cirurgias(data_cirurgia);
CREATE INDEX idx_cirurgias_status ON cirurgias(status);
CREATE INDEX idx_cirurgias_hospital ON cirurgias(hospital_id);
CREATE INDEX idx_cirurgias_medico ON cirurgias(medico_id);

-- Financeiro
CREATE INDEX idx_contas_receber_tenant ON contas_receber(tenant_id);
CREATE INDEX idx_contas_receber_status ON contas_receber(status);
CREATE INDEX idx_contas_receber_vencimento ON contas_receber(data_vencimento);
CREATE INDEX idx_contas_pagar_tenant ON contas_pagar(tenant_id);
CREATE INDEX idx_contas_pagar_status ON contas_pagar(status);
CREATE INDEX idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);

-- Estoque
CREATE INDEX idx_movimentacoes_tenant ON movimentacoes_estoque(tenant_id);
CREATE INDEX idx_movimentacoes_produto ON movimentacoes_estoque(produto_id);
CREATE INDEX idx_movimentacoes_tipo ON movimentacoes_estoque(tipo);

-- Analytics
CREATE INDEX idx_predictions_tenant ON icarus_predictions(tenant_id);
CREATE INDEX idx_predictions_tipo ON icarus_predictions(tipo);
CREATE INDEX idx_logs_tenant ON icarus_logs(tenant_id);
CREATE INDEX idx_logs_action ON icarus_logs(action);

-- ============ FUNCTIONS ============

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cirurgias_updated_at BEFORE UPDATE ON cirurgias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON fornecedores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contas_receber_updated_at BEFORE UPDATE ON contas_receber
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contas_pagar_updated_at BEFORE UPDATE ON contas_pagar
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Dashboard Stats Function
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_tenant_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'cirurgias_mes', (
      SELECT COUNT(*) FROM cirurgias
      WHERE tenant_id = p_tenant_id
      AND data_cirurgia >= DATE_TRUNC('month', CURRENT_DATE)
    ),
    'receita_mes', (
      SELECT COALESCE(SUM(valor_pago), 0) FROM contas_receber
      WHERE tenant_id = p_tenant_id
      AND status = 'pago'
      AND data_pagamento >= DATE_TRUNC('month', CURRENT_DATE)
    ),
    'valor_receber', (
      SELECT COALESCE(SUM(valor - valor_pago), 0) FROM contas_receber
      WHERE tenant_id = p_tenant_id
      AND status = 'pendente'
    ),
    'produtos_estoque_baixo', (
      SELECT COUNT(*) FROM produtos
      WHERE tenant_id = p_tenant_id
      AND estoque_atual <= estoque_minimo
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Calculate Inventory Value
CREATE OR REPLACE FUNCTION calculate_inventory_value(p_tenant_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total DECIMAL;
BEGIN
  SELECT COALESCE(SUM(estoque_atual * preco_custo), 0)
  INTO total
  FROM produtos
  WHERE tenant_id = p_tenant_id AND ativo = true;

  RETURN total;
END;
$$ LANGUAGE plpgsql;
