-- =====================================================
-- ICARUS v5.0 - Fix RLS Policies Column Reference
-- Migration 008: Change 'papel' to 'cargo'
-- =====================================================
-- FIX: The schema uses 'cargo' column in perfis table,
-- but migration 005 incorrectly used 'papel'
-- =====================================================

-- =====================================================
-- ETAPA 1: Remover Policies com coluna errada
-- =====================================================

-- EMPRESAS
DROP POLICY IF EXISTS "Admins podem atualizar propria empresa" ON empresas;

-- PERFIS
DROP POLICY IF EXISTS "Admins podem gerenciar perfis da empresa" ON perfis;

-- CATEGORIAS_PRODUTOS
DROP POLICY IF EXISTS "Gerentes podem gerenciar categorias da empresa" ON categorias_produtos;

-- FABRICANTES
DROP POLICY IF EXISTS "Gerentes podem gerenciar fabricantes da empresa" ON fabricantes;

-- PRODUTOS
DROP POLICY IF EXISTS "Usuarios podem criar produtos da empresa" ON produtos;
DROP POLICY IF EXISTS "Usuarios podem atualizar produtos da empresa" ON produtos;
DROP POLICY IF EXISTS "Admins podem deletar produtos da empresa" ON produtos;

-- HOSPITAIS
DROP POLICY IF EXISTS "Gerentes podem gerenciar hospitais da empresa" ON hospitais;

-- MEDICOS
DROP POLICY IF EXISTS "Gerentes podem gerenciar medicos da empresa" ON medicos;

-- CIRURGIAS
DROP POLICY IF EXISTS "Usuarios podem criar cirurgias da empresa" ON cirurgias;
DROP POLICY IF EXISTS "Usuarios podem atualizar cirurgias da empresa" ON cirurgias;
DROP POLICY IF EXISTS "Admins podem deletar cirurgias da empresa" ON cirurgias;

-- ITENS_CIRURGIA
DROP POLICY IF EXISTS "Usuarios podem gerenciar itens de cirurgia" ON itens_cirurgia;

-- NOTAS_FISCAIS
DROP POLICY IF EXISTS "Gerentes podem gerenciar notas fiscais da empresa" ON notas_fiscais;

-- CONTAS_RECEBER
DROP POLICY IF EXISTS "Gerentes podem gerenciar contas a receber da empresa" ON contas_receber;

-- MOVIMENTACOES_ESTOQUE
DROP POLICY IF EXISTS "Usuarios podem criar movimentacoes de estoque" ON movimentacoes_estoque;

-- =====================================================
-- ETAPA 2: Recriar Policies com coluna correta (cargo)
-- =====================================================

-- EMPRESAS
CREATE POLICY "Admins podem atualizar propria empresa"
  ON empresas FOR UPDATE
  USING (
    id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND cargo = 'admin'
    )
  );

-- PERFIS
CREATE POLICY "Admins podem gerenciar perfis da empresa"
  ON perfis FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND cargo = 'admin'
    )
  );

-- CATEGORIAS_PRODUTOS
CREATE POLICY "Gerentes podem gerenciar categorias da empresa"
  ON categorias_produtos FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND cargo IN ('admin', 'gerente')
    )
  );

-- FABRICANTES
CREATE POLICY "Gerentes podem gerenciar fabricantes da empresa"
  ON fabricantes FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND cargo IN ('admin', 'gerente')
    )
  );

-- PRODUTOS
CREATE POLICY "Usuarios podem criar produtos da empresa"
  ON produtos FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND cargo IN ('admin', 'gerente', 'vendedor', 'usuario')
    )
  );

CREATE POLICY "Usuarios podem atualizar produtos da empresa"
  ON produtos FOR UPDATE
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND cargo IN ('admin', 'gerente', 'vendedor', 'usuario')
    )
  );

CREATE POLICY "Admins podem deletar produtos da empresa"
  ON produtos FOR DELETE
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND cargo = 'admin'
    )
  );

-- HOSPITAIS
CREATE POLICY "Gerentes podem gerenciar hospitais da empresa"
  ON hospitais FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND cargo IN ('admin', 'gerente')
    )
  );

-- MEDICOS
CREATE POLICY "Gerentes podem gerenciar medicos da empresa"
  ON medicos FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND cargo IN ('admin', 'gerente')
    )
  );

-- CIRURGIAS
CREATE POLICY "Usuarios podem criar cirurgias da empresa"
  ON cirurgias FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND cargo IN ('admin', 'gerente', 'vendedor', 'usuario')
    )
  );

CREATE POLICY "Usuarios podem atualizar cirurgias da empresa"
  ON cirurgias FOR UPDATE
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND cargo IN ('admin', 'gerente', 'vendedor', 'usuario')
    )
  );

CREATE POLICY "Admins podem deletar cirurgias da empresa"
  ON cirurgias FOR DELETE
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND cargo = 'admin'
    )
  );

-- ITENS_CIRURGIA
CREATE POLICY "Usuarios podem gerenciar itens de cirurgia"
  ON itens_cirurgia FOR ALL
  USING (
    cirurgia_id IN (
      SELECT id FROM cirurgias WHERE empresa_id IN (
        SELECT empresa_id FROM perfis
        WHERE id = auth.uid() AND cargo IN ('admin', 'gerente', 'vendedor', 'usuario')
      )
    )
  );

-- NOTAS_FISCAIS
CREATE POLICY "Gerentes podem gerenciar notas fiscais da empresa"
  ON notas_fiscais FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND cargo IN ('admin', 'gerente')
    )
  );

-- CONTAS_RECEBER
CREATE POLICY "Gerentes podem gerenciar contas a receber da empresa"
  ON contas_receber FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND cargo IN ('admin', 'gerente')
    )
  );

-- MOVIMENTACOES_ESTOQUE
CREATE POLICY "Usuarios podem criar movimentacoes de estoque"
  ON movimentacoes_estoque FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND cargo IN ('admin', 'gerente', 'vendedor', 'usuario')
    )
  );

-- =====================================================
-- FIM DA MIGRATION 008
-- =====================================================
