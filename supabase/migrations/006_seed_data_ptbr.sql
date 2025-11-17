-- =====================================================
-- ICARUS v5.0 - Dados de Demonstração PT-BR
-- Migration 006: Atualizar seed data para PT-BR
-- =====================================================
-- Executar APÓS migrations 004 e 005
-- =====================================================

-- =====================================================
-- ATUALIZAR EMPRESA DEMO
-- =====================================================
UPDATE empresas SET
  nome = 'MED OPME Distribuidora LTDA',
  endereco = 'Av. Paulista, 1000 - Bela Vista',
  cidade = 'São Paulo',
  estado = 'SP',
  telefone = '(11) 3000-0000',
  status = 'ativo'
WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;

-- Se não existir, inserir
INSERT INTO empresas (id, nome, cnpj, endereco, cidade, estado, telefone, email, status)
SELECT
  '00000000-0000-0000-0000-000000000001'::uuid,
  'MED OPME Distribuidora LTDA',
  '12.345.678/0001-90',
  'Av. Paulista, 1000 - Bela Vista',
  'São Paulo',
  'SP',
  '(11) 3000-0000',
  'contato@medopme.com.br',
  'ativo'
WHERE NOT EXISTS (
  SELECT 1 FROM empresas WHERE id = '00000000-0000-0000-0000-000000000001'::uuid
);

-- =====================================================
-- CATEGORIAS DE PRODUTOS (5 categorias)
-- =====================================================
INSERT INTO categorias_produtos (id, empresa_id, nome, codigo, especialidade, descricao)
VALUES
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
-- FABRICANTES (5 fabricantes)
-- =====================================================
INSERT INTO fabricantes (id, empresa_id, nome, cnpj, pais, telefone, email, website)
VALUES
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
-- PRODUTOS OPME (5 produtos)
-- =====================================================
INSERT INTO produtos (
  id, empresa_id, categoria_id, fabricante_id,
  nome, codigo, codigo_anvisa, tipo_produto, especialidade,
  descricao, preco_custo, preco_venda,
  quantidade_estoque, estoque_minimo, estoque_maximo, unidade, status
)
VALUES
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
    'UN',
    'ativo'
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
    'UN',
    'ativo'
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
    'UN',
    'ativo'
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
    'UN',
    'ativo'
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
    'UN',
    'ativo'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- HOSPITAIS (3 hospitais)
-- =====================================================
INSERT INTO hospitais (
  id, empresa_id, nome, cnpj, endereco, cidade, estado,
  telefone, email, tipo_contrato, status
)
VALUES
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
    'ativo'
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
    'ativo'
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
    'ativo'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- MÉDICOS (4 médicos)
-- =====================================================
INSERT INTO medicos (
  id, empresa_id, nome, crm, crm_estado, especialidade,
  telefone, email, hospitais_ids, status
)
VALUES
  (
    '50000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Dr. Carlos Alberto Silva',
    '123456',
    'SP',
    'Cardiologia',
    '(11) 99000-0001',
    'dr.carlos@cardio.med.br',
    ARRAY['40000000-0000-0000-0000-000000000001'::uuid, '40000000-0000-0000-0000-000000000002'::uuid],
    'ativo'
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
    ARRAY['40000000-0000-0000-0000-000000000001'::uuid, '40000000-0000-0000-0000-000000000003'::uuid],
    'ativo'
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
    ARRAY['40000000-0000-0000-0000-000000000002'::uuid, '40000000-0000-0000-0000-000000000003'::uuid],
    'ativo'
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
    ARRAY['40000000-0000-0000-0000-000000000001'::uuid],
    'ativo'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- CIRURGIAS (10 cirurgias de exemplo)
-- =====================================================
INSERT INTO cirurgias (
  id, empresa_id, hospital_id, medico_id,
  numero_protocolo, nome_paciente, nome_procedimento,
  data_agendada, status, valor_estimado
)
VALUES
  (
    '60000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '40000000-0000-0000-0000-000000000001'::uuid,
    '50000000-0000-0000-0000-000000000001'::uuid,
    'SL-2025-001',
    'João da Silva',
    'Angioplastia Coronária com Stent',
    CURRENT_DATE + INTERVAL '2 days',
    'agendada',
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
    'confirmada',
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
    'agendada',
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
    'confirmada',
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
    'agendada',
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
    'agendada',
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
    'concluida',
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
    'concluida',
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
    'concluida',
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
    'concluida',
    8500.00
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- FIM DA MIGRATION 006
-- =====================================================

