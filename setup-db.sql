-- =====================================================
-- ICARUS v5.0 - Database Schema Setup
-- Supabase PostgreSQL
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca full-text

-- =====================================================
-- TABELA: empresas (Multi-tenant)
-- =====================================================
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  razao_social VARCHAR(255),
  cnpj VARCHAR(14) UNIQUE NOT NULL,
  inscricao_estadual VARCHAR(20),
  telefone VARCHAR(20),
  email VARCHAR(255),
  endereco JSONB,
  configuracoes JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas(cnpj);
CREATE INDEX IF NOT EXISTS idx_empresas_ativo ON empresas(ativo);

-- =====================================================
-- TABELA: usuarios
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  auth_user_id UUID UNIQUE, -- Link com Supabase Auth
  email VARCHAR(255) UNIQUE NOT NULL,
  nome_completo VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'usuario' CHECK (role IN ('admin', 'gerente', 'vendedor', 'usuario')),
  permissoes JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  ultimo_acesso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa ON usuarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_auth ON usuarios(auth_user_id);

-- =====================================================
-- TABELA: categorias_produtos
-- =====================================================
CREATE TABLE IF NOT EXISTS categorias_produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  parent_id UUID REFERENCES categorias_produtos(id),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, nome)
);

CREATE INDEX IF NOT EXISTS idx_categorias_empresa ON categorias_produtos(empresa_id);

-- =====================================================
-- TABELA: produtos
-- =====================================================
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias_produtos(id),
  codigo VARCHAR(50) NOT NULL,
  codigo_barras VARCHAR(50),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  especificacoes JSONB,

  -- Preços
  preco_custo DECIMAL(15,2),
  preco_venda DECIMAL(15,2) NOT NULL,
  margem_lucro DECIMAL(5,2),

  -- Estoque
  estoque_atual INTEGER DEFAULT 0,
  estoque_minimo INTEGER DEFAULT 0,
  estoque_maximo INTEGER DEFAULT 0,

  -- Unidade
  unidade_medida VARCHAR(10) DEFAULT 'UN',

  -- OPME Específico
  registro_anvisa VARCHAR(50),
  fabricante VARCHAR(255),
  fornecedor_principal UUID,

  -- Metadata
  imagem_url TEXT,
  tags TEXT[],
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(empresa_id, codigo)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_produtos_empresa ON produtos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_produtos_codigo ON produtos(codigo);
CREATE INDEX IF NOT EXISTS idx_produtos_nome ON produtos USING gin(nome gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo);

-- =====================================================
-- TABELA: clientes
-- =====================================================
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,

  -- Identificação
  tipo VARCHAR(10) CHECK (tipo IN ('PF', 'PJ')),
  cpf_cnpj VARCHAR(14) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  razao_social VARCHAR(255),
  inscricao_estadual VARCHAR(20),

  -- Contato
  email VARCHAR(255),
  telefone VARCHAR(20),
  celular VARCHAR(20),

  -- Endereço
  endereco JSONB,

  -- Comercial
  limite_credito DECIMAL(15,2) DEFAULT 0,
  vendedor_responsavel UUID REFERENCES usuarios(id),

  -- Metadata
  observacoes TEXT,
  tags TEXT[],
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(empresa_id, cpf_cnpj)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_clientes_empresa ON clientes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes USING gin(nome gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clientes_ativo ON clientes(ativo);

-- =====================================================
-- TABELA: pedidos
-- =====================================================
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,

  -- Identificação
  numero VARCHAR(50) NOT NULL,
  tipo VARCHAR(20) DEFAULT 'venda' CHECK (tipo IN ('venda', 'orcamento', 'devolucao')),

  -- Relacionamentos
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  vendedor_id UUID REFERENCES usuarios(id),

  -- Datas
  data_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
  data_entrega DATE,
  data_faturamento DATE,

  -- Status
  status VARCHAR(20) DEFAULT 'rascunho' CHECK (
    status IN ('rascunho', 'pendente', 'aprovado', 'faturado', 'entregue', 'cancelado')
  ),

  -- Valores
  valor_produtos DECIMAL(15,2) NOT NULL DEFAULT 0,
  valor_desconto DECIMAL(15,2) DEFAULT 0,
  valor_frete DECIMAL(15,2) DEFAULT 0,
  valor_total DECIMAL(15,2) NOT NULL DEFAULT 0,

  -- Pagamento
  forma_pagamento VARCHAR(50),
  condicao_pagamento VARCHAR(100),

  -- Metadata
  observacoes TEXT,
  observacoes_internas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(empresa_id, numero)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pedidos_empresa ON pedidos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_vendedor ON pedidos(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_data ON pedidos(data_pedido DESC);

-- =====================================================
-- TABELA: pedido_items
-- =====================================================
CREATE TABLE IF NOT EXISTS pedido_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),

  -- Produto Info (snapshot)
  codigo_produto VARCHAR(50) NOT NULL,
  nome_produto VARCHAR(255) NOT NULL,

  -- Quantidades
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),

  -- Preços
  preco_unitario DECIMAL(15,2) NOT NULL,
  desconto_percentual DECIMAL(5,2) DEFAULT 0,
  desconto_valor DECIMAL(15,2) DEFAULT 0,
  valor_total DECIMAL(15,2) NOT NULL,

  -- Metadata
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido ON pedido_items(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_items_produto ON pedido_items(produto_id);

-- =====================================================
-- TABELA: movimentacoes_estoque
-- =====================================================
CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id) NOT NULL,

  -- Tipo de movimentação
  tipo VARCHAR(20) CHECK (tipo IN ('entrada', 'saida', 'ajuste', 'transferencia')),
  origem VARCHAR(50), -- pedido, compra, inventario, etc
  origem_id UUID, -- ID do documento origem

  -- Quantidade
  quantidade INTEGER NOT NULL,
  quantidade_anterior INTEGER NOT NULL,
  quantidade_nova INTEGER NOT NULL,

  -- Valores
  custo_unitario DECIMAL(15,2),
  valor_total DECIMAL(15,2),

  -- Metadata
  usuario_id UUID REFERENCES usuarios(id),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_movimentacoes_empresa ON movimentacoes_estoque(empresa_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto ON movimentacoes_estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON movimentacoes_estoque(tipo);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON movimentacoes_estoque(created_at DESC);

-- =====================================================
-- TABELA: ai_predictions (Cache de previsões IA)
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,

  tipo VARCHAR(50) NOT NULL, -- demanda, inadimplencia, etc
  entidade_tipo VARCHAR(50), -- produto, cliente, etc
  entidade_id UUID,

  parametros JSONB NOT NULL,
  resultado JSONB NOT NULL,

  confidence DECIMAL(5,4),
  valido_ate TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ai_predictions_empresa ON ai_predictions(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_tipo ON ai_predictions(tipo);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_entidade ON ai_predictions(entidade_tipo, entidade_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_validade ON ai_predictions(valido_ate);

-- =====================================================
-- FUNCTIONS: Updated At Trigger
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias_produtos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;

-- Policies para produtos (exemplo - replicar para outras tabelas)
CREATE POLICY "Usuários veem produtos da sua empresa"
  ON produtos FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários inserem produtos na sua empresa"
  ON produtos FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários atualizam produtos da sua empresa"
  ON produtos FOR UPDATE
  USING (
    empresa_id IN (
      SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins deletam produtos"
  ON produtos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE auth_user_id = auth.uid()
      AND role = 'admin'
      AND empresa_id = produtos.empresa_id
    )
  );

-- =====================================================
-- DADOS INICIAIS (Seed)
-- =====================================================

-- Inserir empresa demo (apenas para desenvolvimento)
INSERT INTO empresas (nome, razao_social, cnpj, email)
VALUES (
  'Hospital Demo ICARUS',
  'Hospital Demo ICARUS LTDA',
  '12345678000199',
  'contato@icarus-demo.com.br'
) ON CONFLICT (cnpj) DO NOTHING;

-- Inserir categorias padrão
WITH empresa_demo AS (
  SELECT id FROM empresas WHERE cnpj = '12345678000199'
)
INSERT INTO categorias_produtos (empresa_id, nome, descricao)
SELECT
  empresa_demo.id,
  categoria.nome,
  categoria.descricao
FROM empresa_demo,
  (VALUES
    ('Órteses', 'Dispositivos ortopédicos'),
    ('Próteses', 'Implantes e próteses'),
    ('Materiais Especiais', 'Materiais hospitalares especiais'),
    ('Instrumentais', 'Instrumentos cirúrgicos'),
    ('Descartáveis', 'Materiais descartáveis')
  ) AS categoria(nome, descricao)
ON CONFLICT (empresa_id, nome) DO NOTHING;

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View: Produtos com estoque baixo
CREATE OR REPLACE VIEW produtos_estoque_baixo AS
SELECT
  p.*,
  c.nome AS categoria_nome
FROM produtos p
LEFT JOIN categorias_produtos c ON p.categoria_id = c.id
WHERE p.estoque_atual <= p.estoque_minimo
  AND p.ativo = true;

-- View: Resumo de pedidos
CREATE OR REPLACE VIEW pedidos_resumo AS
SELECT
  p.id,
  p.empresa_id,
  p.numero,
  p.data_pedido,
  p.status,
  p.valor_total,
  c.nome AS cliente_nome,
  u.nome_completo AS vendedor_nome,
  COUNT(pi.id) AS total_items
FROM pedidos p
LEFT JOIN clientes c ON p.cliente_id = c.id
LEFT JOIN usuarios u ON p.vendedor_id = u.id
LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
GROUP BY p.id, c.nome, u.nome_completo;

-- =====================================================
-- COMENTÁRIOS (Documentação no banco)
-- =====================================================

COMMENT ON TABLE empresas IS 'Cadastro de empresas para multi-tenancy';
COMMENT ON TABLE usuarios IS 'Usuários do sistema vinculados a empresas';
COMMENT ON TABLE produtos IS 'Catálogo de produtos OPME';
COMMENT ON TABLE clientes IS 'Cadastro de clientes/hospitais';
COMMENT ON TABLE pedidos IS 'Pedidos de venda e orçamentos';
COMMENT ON TABLE pedido_items IS 'Itens dos pedidos';
COMMENT ON TABLE movimentacoes_estoque IS 'Histórico de movimentações de estoque';
COMMENT ON TABLE ai_predictions IS 'Cache de previsões e análises de IA';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Verificar criação
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
