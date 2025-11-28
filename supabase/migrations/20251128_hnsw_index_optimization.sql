-- =====================================================
-- ICARUS v5.0 - Otimização pgvector com HNSW
-- 
-- Migração para melhorar performance de buscas vetoriais
-- em escala (>10k vetores)
-- 
-- HNSW (Hierarchical Navigable Small World) oferece:
-- - Busca aproximada muito mais rápida
-- - Melhor performance para grandes datasets
-- - Trade-off controlado entre precisão e velocidade
-- 
-- @version 1.0.0
-- @date 2025-11-28
-- =====================================================

-- Habilitar extensão pgvector (se não existir)
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- ÍNDICE HNSW PARA PRODUTOS OPME
-- =====================================================

-- Remover índice IVFFlat antigo (se existir)
DROP INDEX IF EXISTS opme_produtos_embedding_idx;

-- Criar índice HNSW para busca aproximada
-- m = 16: número de conexões por nó (default: 16)
-- ef_construction = 64: tamanho da lista de candidatos durante construção (default: 64)
CREATE INDEX IF NOT EXISTS opme_produtos_embedding_hnsw_idx 
ON opme_produtos 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Comentário no índice
COMMENT ON INDEX opme_produtos_embedding_hnsw_idx IS 
'Índice HNSW para busca vetorial aproximada. Otimizado para >10k vetores.';

-- =====================================================
-- FUNÇÃO DE BUSCA SEMÂNTICA OTIMIZADA
-- =====================================================

-- Configurar parâmetro de busca HNSW
-- ef_search controla precisão vs velocidade (maior = mais preciso, mais lento)
-- Recomendado: 40-100 para produção

CREATE OR REPLACE FUNCTION match_documents_hnsw(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  nome text,
  descricao text,
  codigo_anvisa text,
  fabricante text,
  classe_risco text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Configurar ef_search para esta query
  -- Valores mais altos = mais preciso, mais lento
  PERFORM set_config('hnsw.ef_search', '40', true);
  
  RETURN QUERY
  SELECT 
    p.id,
    p.nome,
    p.descricao,
    p.codigo_anvisa,
    p.fabricante,
    p.classe_risco,
    1 - (p.embedding <=> query_embedding) as similarity
  FROM opme_produtos p
  WHERE p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Comentário na função
COMMENT ON FUNCTION match_documents_hnsw IS 
'Busca semântica otimizada com HNSW. Usa cosine similarity para encontrar produtos similares.';

-- =====================================================
-- FUNÇÃO DE BUSCA COM FILTROS ANVISA
-- =====================================================

CREATE OR REPLACE FUNCTION busca_semantica_catalogo(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 10,
  filtro_anvisa_valido boolean DEFAULT NULL,
  filtro_classe_risco text[] DEFAULT NULL,
  filtro_vencimento_apos date DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  nome text,
  descricao text,
  codigo_anvisa text,
  fabricante text,
  classe_risco text,
  anvisa_valido boolean,
  data_vencimento date,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Configurar ef_search
  PERFORM set_config('hnsw.ef_search', '50', true);
  
  RETURN QUERY
  SELECT 
    p.id,
    p.nome,
    p.descricao,
    p.codigo_anvisa,
    p.fabricante,
    p.classe_risco,
    p.anvisa_valido,
    p.data_vencimento,
    1 - (p.embedding <=> query_embedding) as similarity
  FROM opme_produtos p
  WHERE p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
    AND (filtro_anvisa_valido IS NULL OR p.anvisa_valido = filtro_anvisa_valido)
    AND (filtro_classe_risco IS NULL OR p.classe_risco = ANY(filtro_classe_risco))
    AND (filtro_vencimento_apos IS NULL OR p.data_vencimento > filtro_vencimento_apos)
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Comentário na função
COMMENT ON FUNCTION busca_semantica_catalogo IS 
'Busca semântica com filtros regulatórios ANVISA. Suporta filtro por classe de risco, validade ANVISA e vencimento.';

-- =====================================================
-- ÍNDICES AUXILIARES PARA FILTROS
-- =====================================================

-- Índice para filtro de ANVISA válido
CREATE INDEX IF NOT EXISTS idx_opme_produtos_anvisa_valido 
ON opme_produtos (anvisa_valido) 
WHERE anvisa_valido = true;

-- Índice para filtro de classe de risco
CREATE INDEX IF NOT EXISTS idx_opme_produtos_classe_risco 
ON opme_produtos (classe_risco);

-- Índice para filtro de vencimento
CREATE INDEX IF NOT EXISTS idx_opme_produtos_vencimento 
ON opme_produtos (data_vencimento) 
WHERE data_vencimento IS NOT NULL;

-- Índice composto para buscas frequentes
CREATE INDEX IF NOT EXISTS idx_opme_produtos_anvisa_classe_venc 
ON opme_produtos (anvisa_valido, classe_risco, data_vencimento);

-- =====================================================
-- FUNÇÃO DE ESTATÍSTICAS DE PERFORMANCE
-- =====================================================

CREATE OR REPLACE FUNCTION get_vector_search_stats()
RETURNS TABLE (
  total_produtos bigint,
  produtos_com_embedding bigint,
  produtos_sem_embedding bigint,
  avg_embedding_dimension int,
  index_name text,
  index_size text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM opme_produtos)::bigint as total_produtos,
    (SELECT COUNT(*) FROM opme_produtos WHERE embedding IS NOT NULL)::bigint as produtos_com_embedding,
    (SELECT COUNT(*) FROM opme_produtos WHERE embedding IS NULL)::bigint as produtos_sem_embedding,
    1536 as avg_embedding_dimension,
    'opme_produtos_embedding_hnsw_idx'::text as index_name,
    pg_size_pretty(pg_relation_size('opme_produtos_embedding_hnsw_idx'))::text as index_size;
END;
$$;

-- Comentário na função
COMMENT ON FUNCTION get_vector_search_stats IS 
'Retorna estatísticas de performance da busca vetorial.';

-- =====================================================
-- POLÍTICA RLS PARA BUSCA SEMÂNTICA
-- =====================================================

-- Permitir acesso às funções de busca para usuários autenticados
GRANT EXECUTE ON FUNCTION match_documents_hnsw TO authenticated;
GRANT EXECUTE ON FUNCTION busca_semantica_catalogo TO authenticated;
GRANT EXECUTE ON FUNCTION get_vector_search_stats TO authenticated;

-- =====================================================
-- TRIGGER PARA ATUALIZAR EMBEDDING AUTOMATICAMENTE
-- =====================================================

-- Função que será chamada quando um produto for inserido/atualizado
-- (A geração real do embedding deve ser feita via Edge Function)
CREATE OR REPLACE FUNCTION notify_embedding_needed()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Notificar que um embedding precisa ser gerado
  -- Isso pode ser capturado por um listener ou processado em background
  IF NEW.embedding IS NULL AND (NEW.nome IS NOT NULL OR NEW.descricao IS NOT NULL) THEN
    -- Marcar como pendente de embedding
    NEW.embedding_status := 'pending';
    
    -- Enviar notificação (pode ser capturada por Realtime)
    PERFORM pg_notify('embedding_needed', json_build_object(
      'id', NEW.id,
      'nome', NEW.nome,
      'descricao', NEW.descricao
    )::text);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Adicionar coluna de status de embedding (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'opme_produtos' AND column_name = 'embedding_status'
  ) THEN
    ALTER TABLE opme_produtos 
    ADD COLUMN embedding_status text DEFAULT 'pending' 
    CHECK (embedding_status IN ('pending', 'processing', 'completed', 'error'));
  END IF;
END $$;

-- Criar trigger (se não existir)
DROP TRIGGER IF EXISTS trigger_embedding_needed ON opme_produtos;
CREATE TRIGGER trigger_embedding_needed
  BEFORE INSERT OR UPDATE OF nome, descricao ON opme_produtos
  FOR EACH ROW
  EXECUTE FUNCTION notify_embedding_needed();

-- =====================================================
-- VACUUM E ANALYZE PARA OTIMIZAÇÃO
-- =====================================================

-- Atualizar estatísticas da tabela
ANALYZE opme_produtos;

-- =====================================================
-- DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE opme_produtos IS 
'Catálogo de produtos OPME com suporte a busca semântica via pgvector HNSW.
Campos de embedding: embedding (vector 1536), embedding_status.
Índice HNSW otimizado para >10k vetores.
Conformidade: RDC 751/2022, RDC 59/2008.';

