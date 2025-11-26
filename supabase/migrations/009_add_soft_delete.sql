-- =====================================================
-- ICARUS v5.0 - Add Soft Delete to All Tables
-- Migration 009: Add excluido_em column for soft delete
-- =====================================================
-- Soft delete pattern: instead of DELETE, set excluido_em = NOW()
-- All SELECT queries should filter: WHERE excluido_em IS NULL
-- =====================================================

-- =====================================================
-- ETAPA 1: Adicionar coluna excluido_em
-- =====================================================

-- empresas
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS excluido_em TIMESTAMPTZ DEFAULT NULL;

-- perfis
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS excluido_em TIMESTAMPTZ DEFAULT NULL;

-- categorias_produtos
ALTER TABLE categorias_produtos ADD COLUMN IF NOT EXISTS excluido_em TIMESTAMPTZ DEFAULT NULL;

-- fabricantes
ALTER TABLE fabricantes ADD COLUMN IF NOT EXISTS excluido_em TIMESTAMPTZ DEFAULT NULL;

-- produtos
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS excluido_em TIMESTAMPTZ DEFAULT NULL;

-- hospitais
ALTER TABLE hospitais ADD COLUMN IF NOT EXISTS excluido_em TIMESTAMPTZ DEFAULT NULL;

-- medicos
ALTER TABLE medicos ADD COLUMN IF NOT EXISTS excluido_em TIMESTAMPTZ DEFAULT NULL;

-- cirurgias
ALTER TABLE cirurgias ADD COLUMN IF NOT EXISTS excluido_em TIMESTAMPTZ DEFAULT NULL;

-- notas_fiscais
ALTER TABLE notas_fiscais ADD COLUMN IF NOT EXISTS excluido_em TIMESTAMPTZ DEFAULT NULL;

-- contas_receber
ALTER TABLE contas_receber ADD COLUMN IF NOT EXISTS excluido_em TIMESTAMPTZ DEFAULT NULL;

-- =====================================================
-- ETAPA 2: Adicionar indices para exclusao logica
-- =====================================================
-- Indices parciais para otimizar queries de registros ativos

CREATE INDEX IF NOT EXISTS idx_empresas_ativo ON empresas(id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_perfis_ativo ON perfis(id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_categorias_produtos_ativo ON categorias_produtos(id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_fabricantes_ativo ON fabricantes(id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_hospitais_ativo ON hospitais(id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_medicos_ativo ON medicos(id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_cirurgias_ativo ON cirurgias(id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_ativo ON notas_fiscais(id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_contas_receber_ativo ON contas_receber(id) WHERE excluido_em IS NULL;

-- =====================================================
-- ETAPA 3: Funcao auxiliar para soft delete
-- =====================================================

CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Instead of deleting, set excluido_em timestamp
  NEW.excluido_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ETAPA 4: Atualizar RLS Policies para excluir registros deletados
-- =====================================================

-- Atualizar policies de empresas
DROP POLICY IF EXISTS "Usuarios podem visualizar propria empresa" ON empresas;
CREATE POLICY "Usuarios podem visualizar propria empresa"
  ON empresas FOR SELECT
  USING (
    id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
    AND excluido_em IS NULL
  );

-- Atualizar policies de perfis
DROP POLICY IF EXISTS "Usuarios podem visualizar perfis da empresa" ON perfis;
CREATE POLICY "Usuarios podem visualizar perfis da empresa"
  ON perfis FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
    AND excluido_em IS NULL
  );

-- Atualizar policies de categorias_produtos
DROP POLICY IF EXISTS "Usuarios podem visualizar categorias da empresa" ON categorias_produtos;
CREATE POLICY "Usuarios podem visualizar categorias da empresa"
  ON categorias_produtos FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
    AND excluido_em IS NULL
  );

-- Atualizar policies de fabricantes
DROP POLICY IF EXISTS "Usuarios podem visualizar fabricantes da empresa" ON fabricantes;
CREATE POLICY "Usuarios podem visualizar fabricantes da empresa"
  ON fabricantes FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
    AND excluido_em IS NULL
  );

-- Atualizar policies de produtos
DROP POLICY IF EXISTS "Usuarios podem visualizar produtos da empresa" ON produtos;
CREATE POLICY "Usuarios podem visualizar produtos da empresa"
  ON produtos FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
    AND excluido_em IS NULL
  );

-- Atualizar policies de hospitais
DROP POLICY IF EXISTS "Usuarios podem visualizar hospitais da empresa" ON hospitais;
CREATE POLICY "Usuarios podem visualizar hospitais da empresa"
  ON hospitais FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
    AND excluido_em IS NULL
  );

-- Atualizar policies de medicos
DROP POLICY IF EXISTS "Usuarios podem visualizar medicos da empresa" ON medicos;
CREATE POLICY "Usuarios podem visualizar medicos da empresa"
  ON medicos FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
    AND excluido_em IS NULL
  );

-- Atualizar policies de cirurgias
DROP POLICY IF EXISTS "Usuarios podem visualizar cirurgias da empresa" ON cirurgias;
CREATE POLICY "Usuarios podem visualizar cirurgias da empresa"
  ON cirurgias FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
    AND excluido_em IS NULL
  );

-- Atualizar policies de notas_fiscais
DROP POLICY IF EXISTS "Usuarios podem visualizar notas fiscais da empresa" ON notas_fiscais;
CREATE POLICY "Usuarios podem visualizar notas fiscais da empresa"
  ON notas_fiscais FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
    AND excluido_em IS NULL
  );

-- Atualizar policies de contas_receber
DROP POLICY IF EXISTS "Usuarios podem visualizar contas a receber da empresa" ON contas_receber;
CREATE POLICY "Usuarios podem visualizar contas a receber da empresa"
  ON contas_receber FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
    AND excluido_em IS NULL
  );

-- =====================================================
-- ETAPA 5: Comentarios
-- =====================================================

COMMENT ON COLUMN empresas.excluido_em IS 'Data de exclusao logica (soft delete)';
COMMENT ON COLUMN perfis.excluido_em IS 'Data de exclusao logica (soft delete)';
COMMENT ON COLUMN categorias_produtos.excluido_em IS 'Data de exclusao logica (soft delete)';
COMMENT ON COLUMN fabricantes.excluido_em IS 'Data de exclusao logica (soft delete)';
COMMENT ON COLUMN produtos.excluido_em IS 'Data de exclusao logica (soft delete)';
COMMENT ON COLUMN hospitais.excluido_em IS 'Data de exclusao logica (soft delete)';
COMMENT ON COLUMN medicos.excluido_em IS 'Data de exclusao logica (soft delete)';
COMMENT ON COLUMN cirurgias.excluido_em IS 'Data de exclusao logica (soft delete)';
COMMENT ON COLUMN notas_fiscais.excluido_em IS 'Data de exclusao logica (soft delete)';
COMMENT ON COLUMN contas_receber.excluido_em IS 'Data de exclusao logica (soft delete)';

-- =====================================================
-- FIM DA MIGRATION 009
-- =====================================================
