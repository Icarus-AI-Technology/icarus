-- =====================================================
-- ICARUS v5.0 - Refatoração PT-BR
-- Migration 004: Converter schema completo para Português
-- =====================================================
-- ATENÇÃO: Esta migration renomeia TODAS as tabelas e campos para PT-BR
-- Requer drop e recreate devido à complexidade das mudanças
-- =====================================================

-- =====================================================
-- ETAPA 1: Renomear Tabelas
-- =====================================================

ALTER TABLE companies RENAME TO empresas;
ALTER TABLE profiles RENAME TO perfis;
ALTER TABLE product_categories RENAME TO categorias_produtos;
ALTER TABLE manufacturers RENAME TO fabricantes;
ALTER TABLE products RENAME TO produtos;
ALTER TABLE hospitals RENAME TO hospitais;
ALTER TABLE doctors RENAME TO medicos;
ALTER TABLE surgeries RENAME TO cirurgias;
ALTER TABLE surgery_items RENAME TO itens_cirurgia;
ALTER TABLE invoices RENAME TO notas_fiscais;
ALTER TABLE accounts_receivable RENAME TO contas_receber;
ALTER TABLE stock_movements RENAME TO movimentacoes_estoque;

-- =====================================================
-- ETAPA 2: Renomear Colunas - EMPRESAS
-- =====================================================

ALTER TABLE empresas RENAME COLUMN name TO nome;
ALTER TABLE empresas RENAME COLUMN address TO endereco;
ALTER TABLE empresas RENAME COLUMN city TO cidade;
ALTER TABLE empresas RENAME COLUMN state TO estado;
ALTER TABLE empresas RENAME COLUMN phone TO telefone;
ALTER TABLE empresas RENAME COLUMN created_at TO criado_em;
ALTER TABLE empresas RENAME COLUMN updated_at TO atualizado_em;

-- Atualizar CHECK constraint
ALTER TABLE empresas DROP CONSTRAINT IF EXISTS companies_status_check;
ALTER TABLE empresas ADD CONSTRAINT empresas_status_check 
  CHECK (status IN ('ativo', 'inativo', 'suspenso'));

-- =====================================================
-- ETAPA 3: Renomear Colunas - PERFIS
-- =====================================================

ALTER TABLE perfis RENAME COLUMN company_id TO empresa_id;
ALTER TABLE perfis RENAME COLUMN full_name TO nome_completo;
ALTER TABLE perfis RENAME COLUMN role TO papel;
ALTER TABLE perfis RENAME COLUMN avatar_url TO url_avatar;
ALTER TABLE perfis RENAME COLUMN phone TO telefone;
ALTER TABLE perfis RENAME COLUMN is_active TO ativo;
ALTER TABLE perfis RENAME COLUMN created_at TO criado_em;
ALTER TABLE perfis RENAME COLUMN updated_at TO atualizado_em;

-- Atualizar CHECK constraint
ALTER TABLE perfis DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE perfis ADD CONSTRAINT perfis_papel_check 
  CHECK (papel IN ('admin', 'gerente', 'usuario', 'visualizador'));

-- =====================================================
-- ETAPA 4: Renomear Colunas - CATEGORIAS_PRODUTOS
-- =====================================================

ALTER TABLE categorias_produtos RENAME COLUMN company_id TO empresa_id;
ALTER TABLE categorias_produtos RENAME COLUMN name TO nome;
ALTER TABLE categorias_produtos RENAME COLUMN code TO codigo;
ALTER TABLE categorias_produtos RENAME COLUMN specialty TO especialidade;
ALTER TABLE categorias_produtos RENAME COLUMN description TO descricao;
ALTER TABLE categorias_produtos RENAME COLUMN created_at TO criado_em;
ALTER TABLE categorias_produtos RENAME COLUMN updated_at TO atualizado_em;

-- Atualizar CHECK constraint
ALTER TABLE categorias_produtos DROP CONSTRAINT IF EXISTS product_categories_status_check;
ALTER TABLE categorias_produtos ADD CONSTRAINT categorias_produtos_status_check 
  CHECK (status IN ('ativo', 'inativo'));

-- =====================================================
-- ETAPA 5: Renomear Colunas - FABRICANTES
-- =====================================================

ALTER TABLE fabricantes RENAME COLUMN company_id TO empresa_id;
ALTER TABLE fabricantes RENAME COLUMN name TO nome;
ALTER TABLE fabricantes RENAME COLUMN country TO pais;
ALTER TABLE fabricantes RENAME COLUMN phone TO telefone;
ALTER TABLE fabricantes RENAME COLUMN created_at TO criado_em;
ALTER TABLE fabricantes RENAME COLUMN updated_at TO atualizado_em;

-- Atualizar CHECK constraint
ALTER TABLE fabricantes DROP CONSTRAINT IF EXISTS manufacturers_status_check;
ALTER TABLE fabricantes ADD CONSTRAINT fabricantes_status_check 
  CHECK (status IN ('ativo', 'inativo'));

-- Atualizar default
ALTER TABLE fabricantes ALTER COLUMN pais SET DEFAULT 'Brasil';

-- =====================================================
-- ETAPA 6: Renomear Colunas - PRODUTOS
-- =====================================================

ALTER TABLE produtos RENAME COLUMN company_id TO empresa_id;
ALTER TABLE produtos RENAME COLUMN category_id TO categoria_id;
ALTER TABLE produtos RENAME COLUMN manufacturer_id TO fabricante_id;
ALTER TABLE produtos RENAME COLUMN name TO nome;
ALTER TABLE produtos RENAME COLUMN code TO codigo;
ALTER TABLE produtos RENAME COLUMN anvisa_code TO codigo_anvisa;
ALTER TABLE produtos RENAME COLUMN product_type TO tipo_produto;
ALTER TABLE produtos RENAME COLUMN specialty TO especialidade;
ALTER TABLE produtos RENAME COLUMN description TO descricao;
ALTER TABLE produtos RENAME COLUMN cost_price TO preco_custo;
ALTER TABLE produtos RENAME COLUMN sale_price TO preco_venda;
ALTER TABLE produtos RENAME COLUMN stock_quantity TO quantidade_estoque;
ALTER TABLE produtos RENAME COLUMN min_stock TO estoque_minimo;
ALTER TABLE produtos RENAME COLUMN max_stock TO estoque_maximo;
ALTER TABLE produtos RENAME COLUMN unit TO unidade;
ALTER TABLE produtos RENAME COLUMN created_at TO criado_em;
ALTER TABLE produtos RENAME COLUMN updated_at TO atualizado_em;

-- Atualizar CHECK constraints
ALTER TABLE produtos DROP CONSTRAINT IF EXISTS products_product_type_check;
ALTER TABLE produtos ADD CONSTRAINT produtos_tipo_produto_check 
  CHECK (tipo_produto IN ('ortese', 'protese', 'material_especial', 'implante'));

ALTER TABLE produtos DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE produtos ADD CONSTRAINT produtos_status_check 
  CHECK (status IN ('ativo', 'inativo', 'descontinuado'));

-- =====================================================
-- ETAPA 7: Renomear Colunas - HOSPITAIS
-- =====================================================

ALTER TABLE hospitais RENAME COLUMN company_id TO empresa_id;
ALTER TABLE hospitais RENAME COLUMN name TO nome;
ALTER TABLE hospitais RENAME COLUMN address TO endereco;
ALTER TABLE hospitais RENAME COLUMN city TO cidade;
ALTER TABLE hospitais RENAME COLUMN state TO estado;
ALTER TABLE hospitais RENAME COLUMN phone TO telefone;
ALTER TABLE hospitais RENAME COLUMN contract_type TO tipo_contrato;
ALTER TABLE hospitais RENAME COLUMN created_at TO criado_em;
ALTER TABLE hospitais RENAME COLUMN updated_at TO atualizado_em;

-- Atualizar CHECK constraints
ALTER TABLE hospitais DROP CONSTRAINT IF EXISTS hospitals_contract_type_check;
ALTER TABLE hospitais ADD CONSTRAINT hospitais_tipo_contrato_check 
  CHECK (tipo_contrato IN ('consignacao', 'compra_direta', 'ambos'));

ALTER TABLE hospitais DROP CONSTRAINT IF EXISTS hospitals_status_check;
ALTER TABLE hospitais ADD CONSTRAINT hospitais_status_check 
  CHECK (status IN ('ativo', 'inativo', 'suspenso'));

-- =====================================================
-- ETAPA 8: Renomear Colunas - MEDICOS
-- =====================================================

ALTER TABLE medicos RENAME COLUMN company_id TO empresa_id;
ALTER TABLE medicos RENAME COLUMN name TO nome;
ALTER TABLE medicos RENAME COLUMN crm_state TO crm_estado;
ALTER TABLE medicos RENAME COLUMN specialty TO especialidade;
ALTER TABLE medicos RENAME COLUMN phone TO telefone;
ALTER TABLE medicos RENAME COLUMN hospitals TO hospitais_ids;
ALTER TABLE medicos RENAME COLUMN created_at TO criado_em;
ALTER TABLE medicos RENAME COLUMN updated_at TO atualizado_em;

-- Atualizar CHECK constraint
ALTER TABLE medicos DROP CONSTRAINT IF EXISTS doctors_status_check;
ALTER TABLE medicos ADD CONSTRAINT medicos_status_check 
  CHECK (status IN ('ativo', 'inativo'));

-- =====================================================
-- ETAPA 9: Renomear Colunas - CIRURGIAS
-- =====================================================

ALTER TABLE cirurgias RENAME COLUMN company_id TO empresa_id;
ALTER TABLE cirurgias RENAME COLUMN hospital_id TO hospital_id;
ALTER TABLE cirurgias RENAME COLUMN doctor_id TO medico_id;
ALTER TABLE cirurgias RENAME COLUMN protocol_number TO numero_protocolo;
ALTER TABLE cirurgias RENAME COLUMN patient_name TO nome_paciente;
ALTER TABLE cirurgias RENAME COLUMN patient_cpf TO cpf_paciente;
ALTER TABLE cirurgias RENAME COLUMN procedure_name TO nome_procedimento;
ALTER TABLE cirurgias RENAME COLUMN procedure_code TO codigo_procedimento;
ALTER TABLE cirurgias RENAME COLUMN scheduled_date TO data_agendada;
ALTER TABLE cirurgias RENAME COLUMN realized_date TO data_realizada;
ALTER TABLE cirurgias RENAME COLUMN estimated_value TO valor_estimado;
ALTER TABLE cirurgias RENAME COLUMN final_value TO valor_final;
ALTER TABLE cirurgias RENAME COLUMN notes TO observacoes;
ALTER TABLE cirurgias RENAME COLUMN created_at TO criado_em;
ALTER TABLE cirurgias RENAME COLUMN updated_at TO atualizado_em;

-- Atualizar CHECK constraint
ALTER TABLE cirurgias DROP CONSTRAINT IF EXISTS surgeries_status_check;
ALTER TABLE cirurgias ADD CONSTRAINT cirurgias_status_check 
  CHECK (status IN ('agendada', 'confirmada', 'em_andamento', 'concluida', 'cancelada'));

-- =====================================================
-- ETAPA 10: Renomear Colunas - ITENS_CIRURGIA
-- =====================================================

ALTER TABLE itens_cirurgia RENAME COLUMN surgery_id TO cirurgia_id;
ALTER TABLE itens_cirurgia RENAME COLUMN product_id TO produto_id;
ALTER TABLE itens_cirurgia RENAME COLUMN quantity TO quantidade;
ALTER TABLE itens_cirurgia RENAME COLUMN unit_price TO preco_unitario;
ALTER TABLE itens_cirurgia RENAME COLUMN total_price TO preco_total;
ALTER TABLE itens_cirurgia RENAME COLUMN item_type TO tipo_item;
ALTER TABLE itens_cirurgia RENAME COLUMN lot_number TO numero_lote;
ALTER TABLE itens_cirurgia RENAME COLUMN serial_number TO numero_serie;
ALTER TABLE itens_cirurgia RENAME COLUMN notes TO observacoes;
ALTER TABLE itens_cirurgia RENAME COLUMN created_at TO criado_em;

-- Atualizar CHECK constraint
ALTER TABLE itens_cirurgia DROP CONSTRAINT IF EXISTS surgery_items_item_type_check;
ALTER TABLE itens_cirurgia ADD CONSTRAINT itens_cirurgia_tipo_item_check 
  CHECK (tipo_item IN ('usado', 'devolvido', 'consignado'));

-- =====================================================
-- ETAPA 11: Renomear Colunas - NOTAS_FISCAIS
-- =====================================================

ALTER TABLE notas_fiscais RENAME COLUMN company_id TO empresa_id;
ALTER TABLE notas_fiscais RENAME COLUMN surgery_id TO cirurgia_id;
ALTER TABLE notas_fiscais RENAME COLUMN hospital_id TO hospital_id;
ALTER TABLE notas_fiscais RENAME COLUMN invoice_number TO numero_nota;
ALTER TABLE notas_fiscais RENAME COLUMN invoice_type TO tipo_nota;
ALTER TABLE notas_fiscais RENAME COLUMN issue_date TO data_emissao;
ALTER TABLE notas_fiscais RENAME COLUMN due_date TO data_vencimento;
ALTER TABLE notas_fiscais RENAME COLUMN total_value TO valor_total;
ALTER TABLE notas_fiscais RENAME COLUMN tax_value TO valor_impostos;
ALTER TABLE notas_fiscais RENAME COLUMN discount_value TO valor_desconto;
ALTER TABLE notas_fiscais RENAME COLUMN net_value TO valor_liquido;
ALTER TABLE notas_fiscais RENAME COLUMN xml_url TO url_xml;
ALTER TABLE notas_fiscais RENAME COLUMN pdf_url TO url_pdf;
ALTER TABLE notas_fiscais RENAME COLUMN notes TO observacoes;
ALTER TABLE notas_fiscais RENAME COLUMN created_at TO criado_em;
ALTER TABLE notas_fiscais RENAME COLUMN updated_at TO atualizado_em;

-- Atualizar CHECK constraints
ALTER TABLE notas_fiscais DROP CONSTRAINT IF EXISTS invoices_invoice_type_check;
ALTER TABLE notas_fiscais ADD CONSTRAINT notas_fiscais_tipo_nota_check 
  CHECK (tipo_nota IN ('nfe', 'nfse', 'recibo'));

ALTER TABLE notas_fiscais DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE notas_fiscais ADD CONSTRAINT notas_fiscais_status_check 
  CHECK (status IN ('pendente', 'aprovada', 'enviada', 'paga', 'cancelada'));

-- =====================================================
-- ETAPA 12: Renomear Colunas - CONTAS_RECEBER
-- =====================================================

ALTER TABLE contas_receber RENAME COLUMN company_id TO empresa_id;
ALTER TABLE contas_receber RENAME COLUMN invoice_id TO nota_fiscal_id;
ALTER TABLE contas_receber RENAME COLUMN hospital_id TO hospital_id;
ALTER TABLE contas_receber RENAME COLUMN description TO descricao;
ALTER TABLE contas_receber RENAME COLUMN original_value TO valor_original;
ALTER TABLE contas_receber RENAME COLUMN received_value TO valor_recebido;
ALTER TABLE contas_receber RENAME COLUMN balance TO saldo;
ALTER TABLE contas_receber RENAME COLUMN due_date TO data_vencimento;
ALTER TABLE contas_receber RENAME COLUMN payment_date TO data_pagamento;
ALTER TABLE contas_receber RENAME COLUMN payment_method TO metodo_pagamento;
ALTER TABLE contas_receber RENAME COLUMN notes TO observacoes;
ALTER TABLE contas_receber RENAME COLUMN created_at TO criado_em;
ALTER TABLE contas_receber RENAME COLUMN updated_at TO atualizado_em;

-- Atualizar CHECK constraint
ALTER TABLE contas_receber DROP CONSTRAINT IF EXISTS accounts_receivable_status_check;
ALTER TABLE contas_receber ADD CONSTRAINT contas_receber_status_check 
  CHECK (status IN ('pendente', 'parcial', 'paga', 'vencida', 'cancelada'));

-- =====================================================
-- ETAPA 13: Renomear Colunas - MOVIMENTACOES_ESTOQUE
-- =====================================================

ALTER TABLE movimentacoes_estoque RENAME COLUMN company_id TO empresa_id;
ALTER TABLE movimentacoes_estoque RENAME COLUMN product_id TO produto_id;
ALTER TABLE movimentacoes_estoque RENAME COLUMN movement_type TO tipo_movimentacao;
ALTER TABLE movimentacoes_estoque RENAME COLUMN quantity TO quantidade;
ALTER TABLE movimentacoes_estoque RENAME COLUMN unit_price TO preco_unitario;
ALTER TABLE movimentacoes_estoque RENAME COLUMN total_price TO preco_total;
ALTER TABLE movimentacoes_estoque RENAME COLUMN reference_id TO referencia_id;
ALTER TABLE movimentacoes_estoque RENAME COLUMN reference_type TO tipo_referencia;
ALTER TABLE movimentacoes_estoque RENAME COLUMN lot_number TO numero_lote;
ALTER TABLE movimentacoes_estoque RENAME COLUMN serial_number TO numero_serie;
ALTER TABLE movimentacoes_estoque RENAME COLUMN notes TO observacoes;
ALTER TABLE movimentacoes_estoque RENAME COLUMN created_by TO criado_por;
ALTER TABLE movimentacoes_estoque RENAME COLUMN created_at TO criado_em;

-- Atualizar CHECK constraint
ALTER TABLE movimentacoes_estoque DROP CONSTRAINT IF EXISTS stock_movements_movement_type_check;
ALTER TABLE movimentacoes_estoque ADD CONSTRAINT movimentacoes_estoque_tipo_movimentacao_check 
  CHECK (tipo_movimentacao IN ('entrada', 'saida', 'ajuste', 'transferencia', 'devolucao'));

-- =====================================================
-- ETAPA 14: Renomear Índices
-- =====================================================

-- Empresas
ALTER INDEX idx_companies_cnpj RENAME TO idx_empresas_cnpj;
ALTER INDEX idx_companies_status RENAME TO idx_empresas_status;

-- Perfis
ALTER INDEX idx_profiles_company RENAME TO idx_perfis_empresa;
ALTER INDEX idx_profiles_role RENAME TO idx_perfis_papel;

-- Categorias Produtos
ALTER INDEX idx_product_categories_company RENAME TO idx_categorias_produtos_empresa;
ALTER INDEX idx_product_categories_specialty RENAME TO idx_categorias_produtos_especialidade;

-- Fabricantes
ALTER INDEX idx_manufacturers_company RENAME TO idx_fabricantes_empresa;
ALTER INDEX idx_manufacturers_country RENAME TO idx_fabricantes_pais;

-- Produtos
ALTER INDEX idx_products_company RENAME TO idx_produtos_empresa;
ALTER INDEX idx_products_category RENAME TO idx_produtos_categoria;
ALTER INDEX idx_products_manufacturer RENAME TO idx_produtos_fabricante;
ALTER INDEX idx_products_code RENAME TO idx_produtos_codigo;
ALTER INDEX idx_products_anvisa RENAME TO idx_produtos_codigo_anvisa;
ALTER INDEX idx_products_type RENAME TO idx_produtos_tipo_produto;

-- Hospitais
ALTER INDEX idx_hospitals_company RENAME TO idx_hospitais_empresa;
ALTER INDEX idx_hospitals_city RENAME TO idx_hospitais_cidade;
ALTER INDEX idx_hospitals_status RENAME TO idx_hospitais_status;

-- Médicos
ALTER INDEX idx_doctors_company RENAME TO idx_medicos_empresa;
ALTER INDEX idx_doctors_crm RENAME TO idx_medicos_crm;
ALTER INDEX idx_doctors_specialty RENAME TO idx_medicos_especialidade;

-- Cirurgias
ALTER INDEX idx_surgeries_company RENAME TO idx_cirurgias_empresa;
ALTER INDEX idx_surgeries_hospital RENAME TO idx_cirurgias_hospital;
ALTER INDEX idx_surgeries_doctor RENAME TO idx_cirurgias_medico;
ALTER INDEX idx_surgeries_protocol RENAME TO idx_cirurgias_numero_protocolo;
ALTER INDEX idx_surgeries_date RENAME TO idx_cirurgias_data_agendada;
ALTER INDEX idx_surgeries_status RENAME TO idx_cirurgias_status;

-- Itens Cirurgia
ALTER INDEX idx_surgery_items_surgery RENAME TO idx_itens_cirurgia_cirurgia;
ALTER INDEX idx_surgery_items_product RENAME TO idx_itens_cirurgia_produto;

-- Notas Fiscais
ALTER INDEX idx_invoices_company RENAME TO idx_notas_fiscais_empresa;
ALTER INDEX idx_invoices_surgery RENAME TO idx_notas_fiscais_cirurgia;
ALTER INDEX idx_invoices_hospital RENAME TO idx_notas_fiscais_hospital;
ALTER INDEX idx_invoices_number RENAME TO idx_notas_fiscais_numero_nota;
ALTER INDEX idx_invoices_status RENAME TO idx_notas_fiscais_status;
ALTER INDEX idx_invoices_issue_date RENAME TO idx_notas_fiscais_data_emissao;

-- Contas a Receber
ALTER INDEX idx_accounts_receivable_company RENAME TO idx_contas_receber_empresa;
ALTER INDEX idx_accounts_receivable_invoice RENAME TO idx_contas_receber_nota_fiscal;
ALTER INDEX idx_accounts_receivable_hospital RENAME TO idx_contas_receber_hospital;
ALTER INDEX idx_accounts_receivable_status RENAME TO idx_contas_receber_status;
ALTER INDEX idx_accounts_receivable_due_date RENAME TO idx_contas_receber_data_vencimento;

-- Movimentações Estoque
ALTER INDEX idx_stock_movements_company RENAME TO idx_movimentacoes_estoque_empresa;
ALTER INDEX idx_stock_movements_product RENAME TO idx_movimentacoes_estoque_produto;
ALTER INDEX idx_stock_movements_type RENAME TO idx_movimentacoes_estoque_tipo_movimentacao;
ALTER INDEX idx_stock_movements_date RENAME TO idx_movimentacoes_estoque_criado_em;

-- =====================================================
-- ETAPA 15: Renomear Triggers
-- =====================================================

DROP TRIGGER IF EXISTS update_companies_updated_at ON empresas;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON perfis;
DROP TRIGGER IF EXISTS update_product_categories_updated_at ON categorias_produtos;
DROP TRIGGER IF EXISTS update_manufacturers_updated_at ON fabricantes;
DROP TRIGGER IF EXISTS update_products_updated_at ON produtos;
DROP TRIGGER IF EXISTS update_hospitals_updated_at ON hospitais;
DROP TRIGGER IF EXISTS update_doctors_updated_at ON medicos;
DROP TRIGGER IF EXISTS update_surgeries_updated_at ON cirurgias;
DROP TRIGGER IF EXISTS update_invoices_updated_at ON notas_fiscais;
DROP TRIGGER IF EXISTS update_accounts_receivable_updated_at ON contas_receber;

-- Renomear função
ALTER FUNCTION update_updated_at_column() RENAME TO atualizar_data_atualizacao;

-- Recriar triggers com novos nomes
CREATE TRIGGER atualizar_empresas_data_atualizacao BEFORE UPDATE ON empresas
  FOR EACH ROW EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER atualizar_perfis_data_atualizacao BEFORE UPDATE ON perfis
  FOR EACH ROW EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER atualizar_categorias_produtos_data_atualizacao BEFORE UPDATE ON categorias_produtos
  FOR EACH ROW EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER atualizar_fabricantes_data_atualizacao BEFORE UPDATE ON fabricantes
  FOR EACH ROW EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER atualizar_produtos_data_atualizacao BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER atualizar_hospitais_data_atualizacao BEFORE UPDATE ON hospitais
  FOR EACH ROW EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER atualizar_medicos_data_atualizacao BEFORE UPDATE ON medicos
  FOR EACH ROW EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER atualizar_cirurgias_data_atualizacao BEFORE UPDATE ON cirurgias
  FOR EACH ROW EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER atualizar_notas_fiscais_data_atualizacao BEFORE UPDATE ON notas_fiscais
  FOR EACH ROW EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER atualizar_contas_receber_data_atualizacao BEFORE UPDATE ON contas_receber
  FOR EACH ROW EXECUTE FUNCTION atualizar_data_atualizacao();

-- =====================================================
-- FIM DA MIGRATION 004
-- =====================================================

