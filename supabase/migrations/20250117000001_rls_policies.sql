-- ICARUS v5.0 - Row Level Security (RLS) Policies
-- Migration: 20250117000001_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cirurgias ENABLE ROW LEVEL SECURITY;
ALTER TABLE cirurgias_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_receber ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE icarus_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE icarus_logs ENABLE ROW LEVEL SECURITY;

-- ============ HELPER FUNCTIONS ============

-- Get current user's tenant_id
CREATE OR REPLACE FUNCTION auth.user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- Check if user has role
CREATE OR REPLACE FUNCTION auth.user_has_role(required_role user_role)
RETURNS BOOLEAN AS $$
  SELECT role = required_role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- Check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- ============ TENANTS POLICIES ============

-- Tenants: Users can only see their own tenant
CREATE POLICY "Users can view their own tenant"
  ON tenants FOR SELECT
  USING (id = auth.user_tenant_id());

-- Tenants: Only admins can update
CREATE POLICY "Admins can update tenant"
  ON tenants FOR UPDATE
  USING (id = auth.user_tenant_id() AND auth.is_admin());

-- ============ USERS POLICIES ============

-- Users: Can view users from same tenant
CREATE POLICY "Users can view same tenant users"
  ON users FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

-- Users: Admins and managers can insert users
CREATE POLICY "Admins and managers can insert users"
  ON users FOR INSERT
  WITH CHECK (
    tenant_id = auth.user_tenant_id() AND
    (auth.user_has_role('admin') OR auth.user_has_role('manager'))
  );

-- Users: Admins can update users
CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  USING (tenant_id = auth.user_tenant_id() AND auth.is_admin());

-- Users: Admins can delete users
CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  USING (tenant_id = auth.user_tenant_id() AND auth.is_admin());

-- ============ PRODUTOS POLICIES ============

-- Produtos: All users can view
CREATE POLICY "Users can view produtos"
  ON produtos FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

-- Produtos: Admins and managers can insert
CREATE POLICY "Admins and managers can insert produtos"
  ON produtos FOR INSERT
  WITH CHECK (
    tenant_id = auth.user_tenant_id() AND
    (auth.user_has_role('admin') OR auth.user_has_role('manager'))
  );

-- Produtos: Admins and managers can update
CREATE POLICY "Admins and managers can update produtos"
  ON produtos FOR UPDATE
  USING (
    tenant_id = auth.user_tenant_id() AND
    (auth.user_has_role('admin') OR auth.user_has_role('manager'))
  );

-- Produtos: Admins can delete
CREATE POLICY "Admins can delete produtos"
  ON produtos FOR DELETE
  USING (tenant_id = auth.user_tenant_id() AND auth.is_admin());

-- ============ CATEGORIAS POLICIES ============

CREATE POLICY "Users can view categorias"
  ON categorias FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "Admins and managers can manage categorias"
  ON categorias FOR ALL
  USING (
    tenant_id = auth.user_tenant_id() AND
    (auth.user_has_role('admin') OR auth.user_has_role('manager'))
  );

-- ============ FORNECEDORES POLICIES ============

CREATE POLICY "Users can view fornecedores"
  ON fornecedores FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "Admins and managers can manage fornecedores"
  ON fornecedores FOR ALL
  USING (
    tenant_id = auth.user_tenant_id() AND
    (auth.user_has_role('admin') OR auth.user_has_role('manager'))
  );

-- ============ CLIENTES POLICIES ============

CREATE POLICY "Users can view clientes"
  ON clientes FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "Users can insert clientes"
  ON clientes FOR INSERT
  WITH CHECK (tenant_id = auth.user_tenant_id());

CREATE POLICY "Users can update clientes"
  ON clientes FOR UPDATE
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "Admins can delete clientes"
  ON clientes FOR DELETE
  USING (tenant_id = auth.user_tenant_id() AND auth.is_admin());

-- ============ CIRURGIAS POLICIES ============

CREATE POLICY "Users can view cirurgias"
  ON cirurgias FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "Users can insert cirurgias"
  ON cirurgias FOR INSERT
  WITH CHECK (tenant_id = auth.user_tenant_id());

CREATE POLICY "Users can update cirurgias"
  ON cirurgias FOR UPDATE
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "Admins can delete cirurgias"
  ON cirurgias FOR DELETE
  USING (tenant_id = auth.user_tenant_id() AND auth.is_admin());

-- ============ CIRURGIAS_PRODUTOS POLICIES ============

CREATE POLICY "Users can view cirurgias_produtos"
  ON cirurgias_produtos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM cirurgias
    WHERE cirurgias.id = cirurgias_produtos.cirurgia_id
    AND cirurgias.tenant_id = auth.user_tenant_id()
  ));

CREATE POLICY "Users can manage cirurgias_produtos"
  ON cirurgias_produtos FOR ALL
  USING (EXISTS (
    SELECT 1 FROM cirurgias
    WHERE cirurgias.id = cirurgias_produtos.cirurgia_id
    AND cirurgias.tenant_id = auth.user_tenant_id()
  ));

-- ============ CONTAS_RECEBER POLICIES ============

CREATE POLICY "Users can view contas_receber"
  ON contas_receber FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "Users can insert contas_receber"
  ON contas_receber FOR INSERT
  WITH CHECK (tenant_id = auth.user_tenant_id());

CREATE POLICY "Users can update contas_receber"
  ON contas_receber FOR UPDATE
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "Admins can delete contas_receber"
  ON contas_receber FOR DELETE
  USING (tenant_id = auth.user_tenant_id() AND auth.is_admin());

-- ============ CONTAS_PAGAR POLICIES ============

CREATE POLICY "Users can view contas_pagar"
  ON contas_pagar FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "Admins and managers can manage contas_pagar"
  ON contas_pagar FOR ALL
  USING (
    tenant_id = auth.user_tenant_id() AND
    (auth.user_has_role('admin') OR auth.user_has_role('manager'))
  );

-- ============ MOVIMENTACOES_ESTOQUE POLICIES ============

CREATE POLICY "Users can view movimentacoes_estoque"
  ON movimentacoes_estoque FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "Users can insert movimentacoes_estoque"
  ON movimentacoes_estoque FOR INSERT
  WITH CHECK (tenant_id = auth.user_tenant_id());

-- Prevent updates and deletes on stock movements (audit trail)
CREATE POLICY "No one can update movimentacoes_estoque"
  ON movimentacoes_estoque FOR UPDATE
  USING (false);

CREATE POLICY "No one can delete movimentacoes_estoque"
  ON movimentacoes_estoque FOR DELETE
  USING (false);

-- ============ ICARUS_PREDICTIONS POLICIES ============

CREATE POLICY "Users can view icarus_predictions"
  ON icarus_predictions FOR SELECT
  USING (tenant_id = auth.user_tenant_id());

CREATE POLICY "System can insert icarus_predictions"
  ON icarus_predictions FOR INSERT
  WITH CHECK (tenant_id = auth.user_tenant_id());

-- ============ ICARUS_LOGS POLICIES ============

CREATE POLICY "Admins can view icarus_logs"
  ON icarus_logs FOR SELECT
  USING (tenant_id = auth.user_tenant_id() AND auth.is_admin());

CREATE POLICY "System can insert icarus_logs"
  ON icarus_logs FOR INSERT
  WITH CHECK (tenant_id = auth.user_tenant_id());

-- Prevent updates and deletes on logs (audit trail)
CREATE POLICY "No one can update icarus_logs"
  ON icarus_logs FOR UPDATE
  USING (false);

CREATE POLICY "No one can delete icarus_logs"
  ON icarus_logs FOR DELETE
  USING (false);
