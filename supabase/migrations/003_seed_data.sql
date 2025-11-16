-- =====================================================
-- ICARUS v5.0 - Seed Data
-- Migration 003: Insert demo data
-- =====================================================

-- =====================================================
-- COMPANY (1 registro demo)
-- =====================================================
INSERT INTO companies (id, name, cnpj, address, city, state, phone, email, status) VALUES
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'MED OPME Distribuidora LTDA',
    '12.345.678/0001-90',
    'Av. Paulista, 1000 - Bela Vista',
    'São Paulo',
    'SP',
    '(11) 3000-0000',
    'contato@medopme.com.br',
    'active'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PRODUCT CATEGORIES (5 categorias)
-- =====================================================
INSERT INTO product_categories (id, company_id, name, code, specialty, description) VALUES
  (
    '10000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Cardiologia',
    'CARD',
    'Cardiologia',
    'Produtos para procedimentos cardiológicos'
  ),
  (
    '10000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Ortopedia',
    'ORTO',
    'Ortopedia',
    'Produtos para procedimentos ortopédicos'
  ),
  (
    '10000000-0000-0000-0000-000000000003'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Neurocirurgia',
    'NEURO',
    'Neurocirurgia',
    'Produtos para procedimentos neurocirúrgicos'
  ),
  (
    '10000000-0000-0000-0000-000000000004'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Oftalmologia',
    'OFTAL',
    'Oftalmologia',
    'Produtos para procedimentos oftalmológicos'
  ),
  (
    '10000000-0000-0000-0000-000000000005'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Cirurgia Vascular',
    'VASC',
    'Cirurgia Vascular',
    'Produtos para procedimentos vasculares'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- MANUFACTURERS (5 fabricantes)
-- =====================================================
INSERT INTO manufacturers (id, company_id, name, cnpj, country, phone, email, website) VALUES
  (
    '20000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Medtronic Brasil',
    '01.234.567/0001-00',
    'Brasil',
    '(11) 4000-0000',
    'contato@medtronic.com.br',
    'www.medtronic.com.br'
  ),
  (
    '20000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Johnson & Johnson Medical',
    '02.345.678/0001-00',
    'Brasil',
    '(11) 4001-0000',
    'contato@jnjmedical.com.br',
    'www.jnjmedical.com.br'
  ),
  (
    '20000000-0000-0000-0000-000000000003'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Stryker Corporation',
    '03.456.789/0001-00',
    'Brasil',
    '(11) 4002-0000',
    'contato@stryker.com.br',
    'www.stryker.com.br'
  ),
  (
    '20000000-0000-0000-0000-000000000004'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Abbott Laboratories',
    '04.567.890/0001-00',
    'Brasil',
    '(11) 4003-0000',
    'contato@abbott.com.br',
    'www.abbott.com.br'
  ),
  (
    '20000000-0000-0000-0000-000000000005'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Boston Scientific',
    '05.678.901/0001-00',
    'Brasil',
    '(11) 4004-0000',
    'contato@bostonscientific.com.br',
    'www.bostonscientific.com.br'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- PRODUCTS (5 produtos OPME)
-- =====================================================
INSERT INTO products (
  id, company_id, category_id, manufacturer_id,
  name, code, anvisa_code, product_type, specialty,
  description, cost_price, sale_price,
  stock_quantity, min_stock, max_stock, unit
) VALUES
  (
    '30000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    '20000000-0000-0000-0000-000000000001'::uuid,
    'Stent Coronário Farmacológico',
    'STN-CARD-001',
    '80123456789012',
    'implante',
    'Cardiologia',
    'Stent coronário com liberação de fármaco antiproliferativo',
    10000.00,
    12000.00,
    15,
    5,
    50,
    'UN'
  ),
  (
    '30000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '10000000-0000-0000-0000-000000000002'::uuid,
    '20000000-0000-0000-0000-000000000003'::uuid,
    'Prótese de Quadril Cerâmica',
    'PRT-ORTO-001',
    '80234567890123',
    'protese',
    'Ortopedia',
    'Prótese total de quadril em cerâmica de alta resistência',
    18000.00,
    22000.00,
    8,
    3,
    20,
    'UN'
  ),
  (
    '30000000-0000-0000-0000-000000000003'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    '20000000-0000-0000-0000-000000000001'::uuid,
    'Marcapasso Definitivo Dupla Câmara',
    'MCP-CARD-001',
    '80345678901234',
    'implante',
    'Cardiologia',
    'Marcapasso cardíaco definitivo de dupla câmara com telemetria',
    20000.00,
    25000.00,
    5,
    2,
    15,
    'UN'
  ),
  (
    '30000000-0000-0000-0000-000000000004'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '10000000-0000-0000-0000-000000000002'::uuid,
    '20000000-0000-0000-0000-000000000002'::uuid,
    'Placa de Fixação Ortopédica Titânio',
    'PLC-ORTO-001',
    '80456789012345',
    'material_especial',
    'Ortopedia',
    'Placa de fixação em titânio para fraturas ósseas',
    4200.00,
    5200.00,
    25,
    10,
    80,
    'UN'
  ),
  (
    '30000000-0000-0000-0000-000000000005'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '10000000-0000-0000-0000-000000000004'::uuid,
    '20000000-0000-0000-0000-000000000004'::uuid,
    'Lente Intraocular Monofocal',
    'LIO-OFTAL-001',
    '80567890123456',
    'implante',
    'Oftalmologia',
    'Lente intraocular monofocal para cirurgia de catarata',
    1200.00,
    1400.00,
    50,
    20,
    150,
    'UN'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- HOSPITALS (3 hospitais)
-- =====================================================
INSERT INTO hospitals (
  id, company_id, name, cnpj, address, city, state,
  phone, email, contract_type, status
) VALUES
  (
    '40000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Hospital São Lucas',
    '10.111.222/0001-33',
    'Rua dos Hospitais, 100',
    'São Paulo',
    'SP',
    '(11) 5000-0000',
    'compras@saolucas.com.br',
    'consignacao',
    'active'
  ),
  (
    '40000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Hospital Santa Casa',
    '10.222.333/0001-44',
    'Av. Central, 500',
    'São Paulo',
    'SP',
    '(11) 5001-0000',
    'compras@santacasa.com.br',
    'ambos',
    'active'
  ),
  (
    '40000000-0000-0000-0000-000000000003'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Hospital Albert Einstein',
    '10.333.444/0001-55',
    'Av. Albert Einstein, 627',
    'São Paulo',
    'SP',
    '(11) 5002-0000',
    'compras@einstein.br',
    'compra_direta',
    'active'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- DOCTORS (4 médicos)
-- =====================================================
INSERT INTO doctors (
  id, company_id, name, crm, crm_state, specialty,
  phone, email, hospitals
) VALUES
  (
    '50000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Dr. Carlos Alberto Silva',
    '123456',
    'SP',
    'Cardiologia',
    '(11) 99000-0001',
    'dr.carlos@cardio.med.br',
    ARRAY['40000000-0000-0000-0000-000000000001'::uuid, '40000000-0000-0000-0000-000000000002'::uuid]
  ),
  (
    '50000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Dra. Ana Paula Santos',
    '234567',
    'SP',
    'Ortopedia',
    '(11) 99000-0002',
    'dra.ana@ortopedia.med.br',
    ARRAY['40000000-0000-0000-0000-000000000001'::uuid, '40000000-0000-0000-0000-000000000003'::uuid]
  ),
  (
    '50000000-0000-0000-0000-000000000003'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Dr. Ricardo Mendes',
    '345678',
    'SP',
    'Neurocirurgia',
    '(11) 99000-0003',
    'dr.ricardo@neuro.med.br',
    ARRAY['40000000-0000-0000-0000-000000000002'::uuid, '40000000-0000-0000-0000-000000000003'::uuid]
  ),
  (
    '50000000-0000-0000-0000-000000000004'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Dr. Paulo Henrique Costa',
    '456789',
    'SP',
    'Cirurgia Vascular',
    '(11) 99000-0004',
    'dr.paulo@vascular.med.br',
    ARRAY['40000000-0000-0000-0000-000000000001'::uuid]
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- SURGERIES (10 cirurgias de exemplo)
-- =====================================================
INSERT INTO surgeries (
  id, company_id, hospital_id, doctor_id,
  protocol_number, patient_name, procedure_name,
  scheduled_date, status, estimated_value
) VALUES
  (
    '60000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '40000000-0000-0000-0000-000000000001'::uuid,
    '50000000-0000-0000-0000-000000000001'::uuid,
    'SL-2025-001',
    'João da Silva',
    'Angioplastia Coronária com Stent',
    CURRENT_DATE + INTERVAL '2 days',
    'scheduled',
    15000.00
  ),
  (
    '60000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '40000000-0000-0000-0000-000000000001'::uuid,
    '50000000-0000-0000-0000-000000000002'::uuid,
    'SL-2025-002',
    'Maria Santos',
    'Artroplastia Total de Quadril',
    CURRENT_DATE + INTERVAL '3 days',
    'confirmed',
    28000.00
  ),
  (
    '60000000-0000-0000-0000-000000000003'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '40000000-0000-0000-0000-000000000002'::uuid,
    '50000000-0000-0000-0000-000000000001'::uuid,
    'SC-2025-001',
    'Pedro Oliveira',
    'Implante de Marcapasso',
    CURRENT_DATE + INTERVAL '5 days',
    'scheduled',
    32000.00
  ),
  (
    '60000000-0000-0000-0000-000000000004'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '40000000-0000-0000-0000-000000000003'::uuid,
    '50000000-0000-0000-0000-000000000002'::uuid,
    'AE-2025-001',
    'Ana Costa',
    'Fixação de Fratura de Fêmur',
    CURRENT_DATE + INTERVAL '1 day',
    'confirmed',
    8500.00
  ),
  (
    '60000000-0000-0000-0000-000000000005'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '40000000-0000-0000-0000-000000000001'::uuid,
    '50000000-0000-0000-0000-000000000003'::uuid,
    'SL-2025-003',
    'Carlos Eduardo',
    'Craniotomia para Ressecção Tumoral',
    CURRENT_DATE + INTERVAL '7 days',
    'scheduled',
    45000.00
  ),
  (
    '60000000-0000-0000-0000-000000000006'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '40000000-0000-0000-0000-000000000002'::uuid,
    '50000000-0000-0000-0000-000000000004'::uuid,
    'SC-2025-002',
    'Fernanda Lima',
    'Bypass Femoro-Poplíteo',
    CURRENT_DATE + INTERVAL '4 days',
    'scheduled',
    22000.00
  ),
  (
    '60000000-0000-0000-0000-000000000007'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '40000000-0000-0000-0000-000000000001'::uuid,
    '50000000-0000-0000-0000-000000000001'::uuid,
    'SL-2025-004',
    'Roberto Alves',
    'Angioplastia Coronária com Stent',
    CURRENT_DATE - INTERVAL '2 days',
    'completed',
    15000.00
  ),
  (
    '60000000-0000-0000-0000-000000000008'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '40000000-0000-0000-0000-000000000003'::uuid,
    '50000000-0000-0000-0000-000000000002'::uuid,
    'AE-2025-002',
    'Juliana Souza',
    'Artroplastia Total de Quadril',
    CURRENT_DATE - INTERVAL '5 days',
    'completed',
    28000.00
  ),
  (
    '60000000-0000-0000-0000-000000000009'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '40000000-0000-0000-0000-000000000002'::uuid,
    '50000000-0000-0000-0000-000000000001'::uuid,
    'SC-2025-003',
    'Marcos Silva',
    'Implante de Marcapasso',
    CURRENT_DATE - INTERVAL '10 days',
    'completed',
    32000.00
  ),
  (
    '60000000-0000-0000-0000-000000000010'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '40000000-0000-0000-0000-000000000001'::uuid,
    '50000000-0000-0000-0000-000000000002'::uuid,
    'SL-2025-005',
    'Patricia Mendes',
    'Fixação de Fratura de Fêmur',
    CURRENT_DATE - INTERVAL '3 days',
    'completed',
    8500.00
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- END OF MIGRATION 003
-- =====================================================
