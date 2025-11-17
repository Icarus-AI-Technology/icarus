-- =====================================================
-- ICARUS v5.0 - Row Level Security (RLS) - PT-BR
-- Migration 005: Atualizar policies para nomes PT-BR
-- =====================================================
-- Executar APÓS a migration 004_refactor_ptbr.sql
-- =====================================================

-- =====================================================
-- ETAPA 1: Remover Policies Antigas
-- =====================================================

-- Companies/Empresas
DROP POLICY IF EXISTS "Users can view own company" ON empresas;
DROP POLICY IF EXISTS "Admins can update own company" ON empresas;

-- Profiles/Perfis
DROP POLICY IF EXISTS "Users can view own profile" ON perfis;
DROP POLICY IF EXISTS "Users can view company profiles" ON perfis;
DROP POLICY IF EXISTS "Users can update own profile" ON perfis;
DROP POLICY IF EXISTS "Admins can manage company profiles" ON perfis;

-- Product Categories/Categorias Produtos
DROP POLICY IF EXISTS "Users can view company categories" ON categorias_produtos;
DROP POLICY IF EXISTS "Managers can manage company categories" ON categorias_produtos;

-- Manufacturers/Fabricantes
DROP POLICY IF EXISTS "Users can view company manufacturers" ON fabricantes;
DROP POLICY IF EXISTS "Managers can manage company manufacturers" ON fabricantes;

-- Products/Produtos
DROP POLICY IF EXISTS "Users can view company products" ON produtos;
DROP POLICY IF EXISTS "Users can create company products" ON produtos;
DROP POLICY IF EXISTS "Users can update company products" ON produtos;
DROP POLICY IF EXISTS "Admins can delete company products" ON produtos;

-- Hospitals/Hospitais
DROP POLICY IF EXISTS "Users can view company hospitals" ON hospitais;
DROP POLICY IF EXISTS "Managers can manage company hospitals" ON hospitais;

-- Doctors/Médicos
DROP POLICY IF EXISTS "Users can view company doctors" ON medicos;
DROP POLICY IF EXISTS "Managers can manage company doctors" ON medicos;

-- Surgeries/Cirurgias
DROP POLICY IF EXISTS "Users can view company surgeries" ON cirurgias;
DROP POLICY IF EXISTS "Users can create company surgeries" ON cirurgias;
DROP POLICY IF EXISTS "Users can update company surgeries" ON cirurgias;
DROP POLICY IF EXISTS "Admins can delete company surgeries" ON cirurgias;

-- Surgery Items/Itens Cirurgia
DROP POLICY IF EXISTS "Users can view surgery items" ON itens_cirurgia;
DROP POLICY IF EXISTS "Users can manage surgery items" ON itens_cirurgia;

-- Invoices/Notas Fiscais
DROP POLICY IF EXISTS "Users can view company invoices" ON notas_fiscais;
DROP POLICY IF EXISTS "Managers can manage company invoices" ON notas_fiscais;

-- Accounts Receivable/Contas Receber
DROP POLICY IF EXISTS "Users can view company receivables" ON contas_receber;
DROP POLICY IF EXISTS "Managers can manage company receivables" ON contas_receber;

-- Stock Movements/Movimentações Estoque
DROP POLICY IF EXISTS "Users can view company stock movements" ON movimentacoes_estoque;
DROP POLICY IF EXISTS "Users can create stock movements" ON movimentacoes_estoque;

-- =====================================================
-- ETAPA 2: Recriar Função Helper
-- =====================================================

DROP FUNCTION IF EXISTS get_user_company_id();

CREATE OR REPLACE FUNCTION obter_empresa_do_usuario()
RETURNS UUID AS $$
  SELECT empresa_id FROM perfis WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- =====================================================
-- ETAPA 3: EMPRESAS - Policies
-- =====================================================

CREATE POLICY "Usuarios podem visualizar propria empresa"
  ON empresas FOR SELECT
  USING (
    id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins podem atualizar propria empresa"
  ON empresas FOR UPDATE
  USING (
    id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND papel = 'admin'
    )
  );

-- =====================================================
-- ETAPA 4: PERFIS - Policies
-- =====================================================

CREATE POLICY "Usuarios podem visualizar proprio perfil"
  ON perfis FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Usuarios podem visualizar perfis da empresa"
  ON perfis FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
  );

CREATE POLICY "Usuarios podem atualizar proprio perfil"
  ON perfis FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins podem gerenciar perfis da empresa"
  ON perfis FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND papel = 'admin'
    )
  );

-- =====================================================
-- ETAPA 5: CATEGORIAS_PRODUTOS - Policies
-- =====================================================

CREATE POLICY "Usuarios podem visualizar categorias da empresa"
  ON categorias_produtos FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
  );

CREATE POLICY "Gerentes podem gerenciar categorias da empresa"
  ON categorias_produtos FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND papel IN ('admin', 'gerente')
    )
  );

-- =====================================================
-- ETAPA 6: FABRICANTES - Policies
-- =====================================================

CREATE POLICY "Usuarios podem visualizar fabricantes da empresa"
  ON fabricantes FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
  );

CREATE POLICY "Gerentes podem gerenciar fabricantes da empresa"
  ON fabricantes FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND papel IN ('admin', 'gerente')
    )
  );

-- =====================================================
-- ETAPA 7: PRODUTOS - Policies
-- =====================================================

CREATE POLICY "Usuarios podem visualizar produtos da empresa"
  ON produtos FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
  );

CREATE POLICY "Usuarios podem criar produtos da empresa"
  ON produtos FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND papel IN ('admin', 'gerente', 'usuario')
    )
  );

CREATE POLICY "Usuarios podem atualizar produtos da empresa"
  ON produtos FOR UPDATE
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND papel IN ('admin', 'gerente', 'usuario')
    )
  );

CREATE POLICY "Admins podem deletar produtos da empresa"
  ON produtos FOR DELETE
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND papel = 'admin'
    )
  );

-- =====================================================
-- ETAPA 8: HOSPITAIS - Policies
-- =====================================================

CREATE POLICY "Usuarios podem visualizar hospitais da empresa"
  ON hospitais FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
  );

CREATE POLICY "Gerentes podem gerenciar hospitais da empresa"
  ON hospitais FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND papel IN ('admin', 'gerente')
    )
  );

-- =====================================================
-- ETAPA 9: MEDICOS - Policies
-- =====================================================

CREATE POLICY "Usuarios podem visualizar medicos da empresa"
  ON medicos FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
  );

CREATE POLICY "Gerentes podem gerenciar medicos da empresa"
  ON medicos FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND papel IN ('admin', 'gerente')
    )
  );

-- =====================================================
-- ETAPA 10: CIRURGIAS - Policies
-- =====================================================

CREATE POLICY "Usuarios podem visualizar cirurgias da empresa"
  ON cirurgias FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
  );

CREATE POLICY "Usuarios podem criar cirurgias da empresa"
  ON cirurgias FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND papel IN ('admin', 'gerente', 'usuario')
    )
  );

CREATE POLICY "Usuarios podem atualizar cirurgias da empresa"
  ON cirurgias FOR UPDATE
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND papel IN ('admin', 'gerente', 'usuario')
    )
  );

CREATE POLICY "Admins podem deletar cirurgias da empresa"
  ON cirurgias FOR DELETE
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND papel = 'admin'
    )
  );

-- =====================================================
-- ETAPA 11: ITENS_CIRURGIA - Policies
-- =====================================================

CREATE POLICY "Usuarios podem visualizar itens de cirurgia"
  ON itens_cirurgia FOR SELECT
  USING (
    cirurgia_id IN (
      SELECT id FROM cirurgias WHERE empresa_id IN (
        SELECT empresa_id FROM perfis WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Usuarios podem gerenciar itens de cirurgia"
  ON itens_cirurgia FOR ALL
  USING (
    cirurgia_id IN (
      SELECT id FROM cirurgias WHERE empresa_id IN (
        SELECT empresa_id FROM perfis
        WHERE id = auth.uid() AND papel IN ('admin', 'gerente', 'usuario')
      )
    )
  );

-- =====================================================
-- ETAPA 12: NOTAS_FISCAIS - Policies
-- =====================================================

CREATE POLICY "Usuarios podem visualizar notas fiscais da empresa"
  ON notas_fiscais FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
  );

CREATE POLICY "Gerentes podem gerenciar notas fiscais da empresa"
  ON notas_fiscais FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND papel IN ('admin', 'gerente')
    )
  );

-- =====================================================
-- ETAPA 13: CONTAS_RECEBER - Policies
-- =====================================================

CREATE POLICY "Usuarios podem visualizar contas a receber da empresa"
  ON contas_receber FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
  );

CREATE POLICY "Gerentes podem gerenciar contas a receber da empresa"
  ON contas_receber FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND papel IN ('admin', 'gerente')
    )
  );

-- =====================================================
-- ETAPA 14: MOVIMENTACOES_ESTOQUE - Policies
-- =====================================================

CREATE POLICY "Usuarios podem visualizar movimentacoes de estoque da empresa"
  ON movimentacoes_estoque FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM perfis WHERE id = auth.uid()
    )
  );

CREATE POLICY "Usuarios podem criar movimentacoes de estoque"
  ON movimentacoes_estoque FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM perfis
      WHERE id = auth.uid() AND papel IN ('admin', 'gerente', 'usuario')
    )
  );

-- =====================================================
-- FIM DA MIGRATION 005
-- =====================================================

