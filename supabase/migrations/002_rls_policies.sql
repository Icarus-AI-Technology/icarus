-- =====================================================
-- ICARUS v5.0 - Row Level Security (RLS)
-- Migration 002: Enable RLS and create policies
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE surgeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE surgery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- COMPANIES POLICIES
-- =====================================================

-- Users can view their own company
CREATE POLICY "Users can view own company"
  ON companies FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Admins can update their company
CREATE POLICY "Admins can update own company"
  ON companies FOR UPDATE
  USING (
    id IN (
      SELECT company_id FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Users can view profiles from same company
CREATE POLICY "Users can view company profiles"
  ON profiles FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Admins can manage company profiles
CREATE POLICY "Admins can manage company profiles"
  ON profiles FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- PRODUCT CATEGORIES POLICIES
-- =====================================================

CREATE POLICY "Users can view company categories"
  ON product_categories FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Managers can manage company categories"
  ON product_categories FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- =====================================================
-- MANUFACTURERS POLICIES
-- =====================================================

CREATE POLICY "Users can view company manufacturers"
  ON manufacturers FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Managers can manage company manufacturers"
  ON manufacturers FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- =====================================================
-- PRODUCTS POLICIES
-- =====================================================

CREATE POLICY "Users can view company products"
  ON products FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create company products"
  ON products FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'user')
    )
  );

CREATE POLICY "Users can update company products"
  ON products FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'user')
    )
  );

CREATE POLICY "Admins can delete company products"
  ON products FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- HOSPITALS POLICIES
-- =====================================================

CREATE POLICY "Users can view company hospitals"
  ON hospitals FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Managers can manage company hospitals"
  ON hospitals FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- =====================================================
-- DOCTORS POLICIES
-- =====================================================

CREATE POLICY "Users can view company doctors"
  ON doctors FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Managers can manage company doctors"
  ON doctors FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- =====================================================
-- SURGERIES POLICIES
-- =====================================================

CREATE POLICY "Users can view company surgeries"
  ON surgeries FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create company surgeries"
  ON surgeries FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'user')
    )
  );

CREATE POLICY "Users can update company surgeries"
  ON surgeries FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'user')
    )
  );

CREATE POLICY "Admins can delete company surgeries"
  ON surgeries FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- SURGERY ITEMS POLICIES
-- =====================================================

CREATE POLICY "Users can view surgery items"
  ON surgery_items FOR SELECT
  USING (
    surgery_id IN (
      SELECT id FROM surgeries WHERE company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage surgery items"
  ON surgery_items FOR ALL
  USING (
    surgery_id IN (
      SELECT id FROM surgeries WHERE company_id IN (
        SELECT company_id FROM profiles
        WHERE id = auth.uid() AND role IN ('admin', 'manager', 'user')
      )
    )
  );

-- =====================================================
-- INVOICES POLICIES
-- =====================================================

CREATE POLICY "Users can view company invoices"
  ON invoices FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Managers can manage company invoices"
  ON invoices FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- =====================================================
-- ACCOUNTS RECEIVABLE POLICIES
-- =====================================================

CREATE POLICY "Users can view company receivables"
  ON accounts_receivable FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Managers can manage company receivables"
  ON accounts_receivable FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- =====================================================
-- STOCK MOVEMENTS POLICIES
-- =====================================================

CREATE POLICY "Users can view company stock movements"
  ON stock_movements FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create stock movements"
  ON stock_movements FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager', 'user')
    )
  );

-- =====================================================
-- HELPER FUNCTION: Get user's company ID
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- =====================================================
-- END OF MIGRATION 002
-- =====================================================
