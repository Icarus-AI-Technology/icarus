-- ============================================================================
-- ICARUS v6.0 - PRODUTOS E ESTOQUE
-- ============================================================================

-- PRODUTOS
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias(id),
  fabricante_id UUID REFERENCES fabricantes(id),
  fornecedor_id UUID REFERENCES fornecedores(id),
  codigo VARCHAR(50) NOT NULL,
  codigo_barras VARCHAR(50),
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  registro_anvisa VARCHAR(20),
  classe_risco VARCHAR(10) CHECK (classe_risco IN ('I', 'II', 'III', 'IV')),
  tipo_produto VARCHAR(50) DEFAULT 'opme',
  ncm VARCHAR(10),
  unidade_medida VARCHAR(10) DEFAULT 'UN',
  preco_custo DECIMAL(15,4),
  preco_venda DECIMAL(15,4),
  margem_lucro DECIMAL(5,2),
  estoque_minimo INTEGER DEFAULT 0,
  estoque_maximo INTEGER,
  prazo_validade_dias INTEGER,
  requer_lote BOOLEAN DEFAULT true,
  requer_serie BOOLEAN DEFAULT false,
  dados_anvisa JSONB,
  especificacoes JSONB DEFAULT '{}',
  imagem_url TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  UNIQUE(empresa_id, codigo)
);

-- LOCALIZAÇÕES de estoque
CREATE TABLE localizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'deposito',
  endereco TEXT,
  responsavel VARCHAR(200),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- LOTES
CREATE TABLE lotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  localizacao_id UUID REFERENCES localizacoes(id),
  numero_lote VARCHAR(50) NOT NULL,
  numero_serie VARCHAR(50),
  codigo_datamatrix TEXT,
  data_fabricacao DATE,
  data_validade DATE NOT NULL,
  quantidade_inicial INTEGER NOT NULL,
  quantidade_atual INTEGER NOT NULL,
  quantidade_reservada INTEGER DEFAULT 0,
  preco_custo DECIMAL(15,4),
  nota_fiscal_entrada VARCHAR(50),
  fornecedor_id UUID REFERENCES fornecedores(id),
  status VARCHAR(20) DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'reservado', 'consumido', 'bloqueado', 'vencido', 'quarentena')),
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(empresa_id, produto_id, numero_lote, COALESCE(numero_serie, ''))
);

-- MOVIMENTAÇÕES de estoque
CREATE TABLE movimentacoes_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  lote_id UUID NOT NULL REFERENCES lotes(id),
  usuario_id UUID REFERENCES usuarios(id),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'saida', 'transferencia', 'ajuste', 'consumo', 'devolucao', 'perda', 'vencimento')),
  quantidade INTEGER NOT NULL,
  quantidade_anterior INTEGER NOT NULL,
  quantidade_posterior INTEGER NOT NULL,
  localizacao_origem_id UUID REFERENCES localizacoes(id),
  localizacao_destino_id UUID REFERENCES localizacoes(id),
  documento_tipo VARCHAR(50),
  documento_numero VARCHAR(50),
  documento_id UUID,
  motivo TEXT,
  custo_unitario DECIMAL(15,4),
  custo_total DECIMAL(15,4),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RESERVAS de material
CREATE TABLE reservas_material (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  lote_id UUID NOT NULL REFERENCES lotes(id),
  cirurgia_id UUID,
  quantidade INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'consumida', 'cancelada', 'expirada')),
  data_reserva TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_expiracao TIMESTAMPTZ,
  usuario_id UUID REFERENCES usuarios(id),
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- VIEW: Estoque consolidado
CREATE OR REPLACE VIEW vw_estoque AS
SELECT 
  p.id AS produto_id,
  p.empresa_id,
  p.codigo,
  p.nome,
  p.registro_anvisa,
  p.classe_risco,
  p.estoque_minimo,
  COALESCE(SUM(l.quantidade_atual), 0) AS quantidade_total,
  COALESCE(SUM(l.quantidade_reservada), 0) AS quantidade_reservada,
  COALESCE(SUM(l.quantidade_atual) - SUM(l.quantidade_reservada), 0) AS quantidade_disponivel,
  MIN(l.data_validade) FILTER (WHERE l.quantidade_atual > 0) AS proxima_validade,
  COUNT(DISTINCT l.id) FILTER (WHERE l.quantidade_atual > 0) AS total_lotes,
  CASE 
    WHEN COALESCE(SUM(l.quantidade_atual), 0) = 0 THEN 'sem_estoque'
    WHEN COALESCE(SUM(l.quantidade_atual), 0) <= p.estoque_minimo THEN 'estoque_baixo'
    WHEN MIN(l.data_validade) FILTER (WHERE l.quantidade_atual > 0) <= CURRENT_DATE + INTERVAL '30 days' THEN 'proximo_vencimento'
    ELSE 'normal'
  END AS status_estoque
FROM produtos p
LEFT JOIN lotes l ON l.produto_id = p.id AND l.status NOT IN ('consumido', 'vencido')
WHERE p.excluido_em IS NULL AND p.ativo = true
GROUP BY p.id, p.empresa_id, p.codigo, p.nome, p.registro_anvisa, p.classe_risco, p.estoque_minimo;

-- Triggers
CREATE TRIGGER tr_produtos_updated BEFORE UPDATE ON produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_lotes_updated BEFORE UPDATE ON lotes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_localizacoes_updated BEFORE UPDATE ON localizacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_reservas_updated BEFORE UPDATE ON reservas_material FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Índices
CREATE INDEX idx_produtos_empresa ON produtos(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX idx_produtos_anvisa ON produtos(registro_anvisa) WHERE registro_anvisa IS NOT NULL;
CREATE INDEX idx_lotes_empresa ON lotes(empresa_id);
CREATE INDEX idx_lotes_produto ON lotes(produto_id);
CREATE INDEX idx_lotes_validade ON lotes(data_validade) WHERE status = 'disponivel';
CREATE INDEX idx_movimentacoes_lote ON movimentacoes_estoque(lote_id);
CREATE INDEX idx_movimentacoes_data ON movimentacoes_estoque(criado_em);
