-- =====================================================
-- ICARUS v5.0 - Database Schema
-- Supabase PostgreSQL
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_active ON categories(active);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(10) NOT NULL DEFAULT 'UN',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT price_positive CHECK (price >= 0),
  CONSTRAINT cost_positive CHECK (cost >= 0),
  CONSTRAINT stock_positive CHECK (stock >= 0),
  CONSTRAINT min_stock_positive CHECK (min_stock >= 0)
);

-- Indexes for performance
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Full-text search index
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('portuguese', name || ' ' || COALESCE(description, '')));

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Categories Policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  USING (auth.role() = 'authenticated');

-- Products Policies
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Eletrônicos', 'Produtos eletrônicos e tecnologia'),
  ('Periféricos', 'Teclados, mouses e acessórios'),
  ('Computadores', 'Notebooks, desktops e workstations'),
  ('Acessórios', 'Cabos, adaptadores e diversos')
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (code, name, description, category_id, price, cost, stock, min_stock, unit)
SELECT
  'PRD001',
  'Notebook Dell Inspiron 15',
  'Notebook Dell Inspiron 15 com Intel i7, 16GB RAM, 512GB SSD',
  (SELECT id FROM categories WHERE name = 'Computadores' LIMIT 1),
  3500.00,
  2800.00,
  15,
  5,
  'UN'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE code = 'PRD001');

INSERT INTO products (code, name, description, category_id, price, cost, stock, min_stock, unit)
SELECT
  'PRD002',
  'Mouse Logitech MX Master 3',
  'Mouse sem fio ergonômico de alta precisão',
  (SELECT id FROM categories WHERE name = 'Periféricos' LIMIT 1),
  450.00,
  320.00,
  25,
  10,
  'UN'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE code = 'PRD002');

INSERT INTO products (code, name, description, category_id, price, cost, stock, min_stock, unit)
SELECT
  'PRD003',
  'Teclado Mecânico Keychron K2',
  'Teclado mecânico 75% wireless com switches Gateron',
  (SELECT id FROM categories WHERE name = 'Periféricos' LIMIT 1),
  650.00,
  480.00,
  12,
  5,
  'UN'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE code = 'PRD003');

INSERT INTO products (code, name, description, category_id, price, cost, stock, min_stock, unit)
SELECT
  'PRD004',
  'Monitor LG UltraWide 34"',
  'Monitor curvo 34 polegadas, resolução 3440x1440, 144Hz',
  (SELECT id FROM categories WHERE name = 'Eletrônicos' LIMIT 1),
  2800.00,
  2100.00,
  8,
  3,
  'UN'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE code = 'PRD004');

INSERT INTO products (code, name, description, category_id, price, cost, stock, min_stock, unit)
SELECT
  'PRD005',
  'Webcam Logitech C920',
  'Webcam Full HD 1080p com microfone integrado',
  (SELECT id FROM categories WHERE name = 'Periféricos' LIMIT 1),
  580.00,
  420.00,
  20,
  8,
  'UN'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE code = 'PRD005');

INSERT INTO products (code, name, description, category_id, price, cost, stock, min_stock, unit)
SELECT
  'PRD006',
  'Cabo USB-C 2m',
  'Cabo USB-C para USB-C, 100W, 2 metros',
  (SELECT id FROM categories WHERE name = 'Acessórios' LIMIT 1),
  45.00,
  25.00,
  50,
  20,
  'UN'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE code = 'PRD006');

INSERT INTO products (code, name, description, category_id, price, cost, stock, min_stock, unit)
SELECT
  'PRD007',
  'SSD Samsung 1TB NVMe',
  'SSD NVMe M.2 1TB, leitura 7000MB/s',
  (SELECT id FROM categories WHERE name = 'Eletrônicos' LIMIT 1),
  680.00,
  520.00,
  18,
  8,
  'UN'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE code = 'PRD007');

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- Products with category info
CREATE OR REPLACE VIEW vw_products_with_category AS
SELECT
  p.*,
  c.name as category_name,
  c.description as category_description
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- Low stock products
CREATE OR REPLACE VIEW vw_low_stock_products AS
SELECT * FROM products
WHERE stock <= min_stock
  AND active = true
ORDER BY (stock - min_stock) ASC;

-- Products value summary
CREATE OR REPLACE VIEW vw_products_summary AS
SELECT
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE active = true) as active_products,
  COUNT(*) FILTER (WHERE stock <= min_stock) as low_stock_products,
  SUM(stock * price) as total_inventory_value,
  SUM(stock * cost) as total_inventory_cost,
  SUM((price - cost) * stock) as potential_profit
FROM products;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE categories IS 'Product categories';
COMMENT ON TABLE products IS 'Product catalog with inventory';
COMMENT ON VIEW vw_products_with_category IS 'Products joined with category information';
COMMENT ON VIEW vw_low_stock_products IS 'Products with stock below minimum threshold';
COMMENT ON VIEW vw_products_summary IS 'Summary statistics of product inventory';
