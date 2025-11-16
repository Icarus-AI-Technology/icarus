-- =====================================================
-- ICARUS v5.0 - Financial Module Tables
-- Migration: 004_financial_tables
-- Description: Tables for Financial Management Module
-- =====================================================

-- =====================================================
-- 1. FINANCIAL ACCOUNTS (Contas a Pagar/Receber)
-- =====================================================

CREATE TABLE IF NOT EXISTS financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

  -- Type & Category
  type TEXT NOT NULL CHECK (type IN ('receivable', 'payable')),
  category TEXT NOT NULL, -- 'sale', 'purchase', 'expense', 'other'
  description TEXT NOT NULL,

  -- Financial Data
  amount DECIMAL(12, 2) NOT NULL,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  discount DECIMAL(12, 2) DEFAULT 0,
  interest DECIMAL(12, 2) DEFAULT 0,
  final_amount DECIMAL(12, 2) GENERATED ALWAYS AS (amount - discount + interest) STORED,

  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  payment_date DATE,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'partial')),

  -- Relations
  related_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  related_surgery_id UUID REFERENCES surgeries(id) ON DELETE SET NULL,

  -- Payment Info
  payment_method TEXT, -- 'cash', 'bank_transfer', 'credit_card', 'debit_card', 'pix', 'boleto'
  bank_account_id UUID, -- Will reference bank_accounts table

  -- Additional Info
  notes TEXT,
  attachments JSONB DEFAULT '[]',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT positive_amount CHECK (amount > 0),
  CONSTRAINT valid_paid_amount CHECK (paid_amount >= 0 AND paid_amount <= amount)
);

-- Indexes for financial_accounts
CREATE INDEX idx_financial_accounts_company ON financial_accounts(company_id);
CREATE INDEX idx_financial_accounts_type ON financial_accounts(type);
CREATE INDEX idx_financial_accounts_status ON financial_accounts(status);
CREATE INDEX idx_financial_accounts_due_date ON financial_accounts(due_date);
CREATE INDEX idx_financial_accounts_payment_date ON financial_accounts(payment_date);
CREATE INDEX idx_financial_accounts_category ON financial_accounts(category);

-- =====================================================
-- 2. BANK ACCOUNTS (Contas Bancárias)
-- =====================================================

CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

  -- Bank Info
  bank_name TEXT NOT NULL,
  bank_code TEXT,
  agency TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_type TEXT CHECK (account_type IN ('checking', 'savings', 'investment')),

  -- Balance
  initial_balance DECIMAL(12, 2) DEFAULT 0,
  current_balance DECIMAL(12, 2) DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
  is_main BOOLEAN DEFAULT false,

  -- Additional Info
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(company_id, bank_code, agency, account_number)
);

-- Indexes for bank_accounts
CREATE INDEX idx_bank_accounts_company ON bank_accounts(company_id);
CREATE INDEX idx_bank_accounts_status ON bank_accounts(status);

-- Add foreign key to financial_accounts now that bank_accounts exists
ALTER TABLE financial_accounts
  ADD CONSTRAINT fk_bank_account
  FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL;

-- =====================================================
-- 3. CASH FLOW ENTRIES (Fluxo de Caixa)
-- =====================================================

CREATE TABLE IF NOT EXISTS cash_flow_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,

  -- Type & Category
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL, -- 'sale', 'purchase', 'salary', 'rent', 'tax', etc.
  description TEXT NOT NULL,

  -- Financial Data
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),

  -- Date
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Relations
  financial_account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL,

  -- Payment Info
  payment_method TEXT,

  -- Additional Info
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for cash_flow_entries
CREATE INDEX idx_cash_flow_company ON cash_flow_entries(company_id);
CREATE INDEX idx_cash_flow_type ON cash_flow_entries(type);
CREATE INDEX idx_cash_flow_date ON cash_flow_entries(entry_date);
CREATE INDEX idx_cash_flow_category ON cash_flow_entries(category);
CREATE INDEX idx_cash_flow_bank_account ON cash_flow_entries(bank_account_id);

-- =====================================================
-- 4. TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_financial_accounts_updated_at
  BEFORE UPDATE ON financial_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cash_flow_entries_updated_at
  BEFORE UPDATE ON cash_flow_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. AUTOMATIC STATUS UPDATE (Overdue)
-- =====================================================

-- Function to update overdue accounts
CREATE OR REPLACE FUNCTION update_overdue_accounts()
RETURNS void AS $$
BEGIN
  UPDATE financial_accounts
  SET status = 'overdue'
  WHERE status = 'pending'
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. VIEWS
-- =====================================================

-- View: Accounts Receivable Summary
CREATE OR REPLACE VIEW v_accounts_receivable_summary AS
SELECT
  company_id,
  COUNT(*) as total_accounts,
  SUM(final_amount) as total_amount,
  SUM(CASE WHEN status = 'pending' THEN final_amount ELSE 0 END) as pending_amount,
  SUM(CASE WHEN status = 'overdue' THEN final_amount ELSE 0 END) as overdue_amount,
  SUM(CASE WHEN status = 'paid' THEN final_amount ELSE 0 END) as paid_amount
FROM financial_accounts
WHERE type = 'receivable'
GROUP BY company_id;

-- View: Accounts Payable Summary
CREATE OR REPLACE VIEW v_accounts_payable_summary AS
SELECT
  company_id,
  COUNT(*) as total_accounts,
  SUM(final_amount) as total_amount,
  SUM(CASE WHEN status = 'pending' THEN final_amount ELSE 0 END) as pending_amount,
  SUM(CASE WHEN status = 'overdue' THEN final_amount ELSE 0 END) as overdue_amount,
  SUM(CASE WHEN status = 'paid' THEN final_amount ELSE 0 END) as paid_amount
FROM financial_accounts
WHERE type = 'payable'
GROUP BY company_id;

-- View: Cash Flow Summary
CREATE OR REPLACE VIEW v_cash_flow_summary AS
SELECT
  company_id,
  entry_date,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
  SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_flow
FROM cash_flow_entries
GROUP BY company_id, entry_date
ORDER BY entry_date;

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_entries ENABLE ROW LEVEL SECURITY;

-- Policies for financial_accounts
CREATE POLICY "Users can view own company financial accounts"
  ON financial_accounts FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own company financial accounts"
  ON financial_accounts FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own company financial accounts"
  ON financial_accounts FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own company financial accounts"
  ON financial_accounts FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policies for bank_accounts (same pattern)
CREATE POLICY "Users can view own company bank accounts"
  ON bank_accounts FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own company bank accounts"
  ON bank_accounts FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own company bank accounts"
  ON bank_accounts FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policies for cash_flow_entries (same pattern)
CREATE POLICY "Users can view own company cash flow"
  ON cash_flow_entries FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own company cash flow"
  ON cash_flow_entries FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own company cash flow"
  ON cash_flow_entries FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- =====================================================
-- 8. SEED DATA (Demo)
-- =====================================================

-- Insert demo bank account
INSERT INTO bank_accounts (company_id, bank_name, bank_code, agency, account_number, account_type, initial_balance, current_balance, is_main)
SELECT
  id,
  'Banco do Brasil',
  '001',
  '1234-5',
  '12345678-9',
  'checking',
  50000.00,
  50000.00,
  true
FROM companies
WHERE cnpj = '12.345.678/0001-90'
ON CONFLICT DO NOTHING;

-- Insert demo financial accounts (receivables)
INSERT INTO financial_accounts (company_id, type, category, description, amount, due_date, status)
SELECT
  id,
  'receivable',
  'sale',
  'Faturamento Cirurgia #' || generate_series,
  15000.00 + (random() * 10000)::decimal(12,2),
  CURRENT_DATE + (generate_series || ' days')::interval,
  CASE
    WHEN generate_series <= 30 THEN 'pending'
    WHEN generate_series <= 60 THEN 'paid'
    ELSE 'pending'
  END
FROM companies, generate_series(1, 10)
WHERE cnpj = '12.345.678/0001-90';

-- Insert demo financial accounts (payables)
INSERT INTO financial_accounts (company_id, type, category, description, amount, due_date, status)
SELECT
  id,
  'payable',
  'purchase',
  'Compra de Material OPME #' || generate_series,
  8000.00 + (random() * 5000)::decimal(12,2),
  CURRENT_DATE + (generate_series || ' days')::interval,
  CASE
    WHEN generate_series <= 15 THEN 'pending'
    WHEN generate_series <= 30 THEN 'paid'
    ELSE 'pending'
  END
FROM companies, generate_series(1, 8)
WHERE cnpj = '12.345.678/0001-90';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
