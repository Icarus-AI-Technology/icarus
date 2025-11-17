-- =====================================================
-- ICARUS v5.0 - Leads Table
-- Tabela para captura de leads do site
-- =====================================================

-- Criar tabela de leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome_completo VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  telefone VARCHAR(20),
  empresa VARCHAR(200),
  cargo VARCHAR(100),
  tamanho_empresa VARCHAR(50), -- pequena, média, grande
  segmento VARCHAR(100), -- OPME, hospitalar, clínica, outros
  principal_desafio TEXT,
  interesse_em TEXT[], -- Array de interesses: IA, estoque, financeiro, etc
  como_conheceu VARCHAR(100),
  mensagem TEXT,
  status VARCHAR(50) DEFAULT 'novo', -- novo, contatado, qualificado, convertido, perdido
  origem VARCHAR(50) DEFAULT 'site', -- site, indicação, evento, etc
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_empresa ON leads(empresa);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para inserção (formulário do site)
CREATE POLICY "Anyone can insert leads"
  ON leads FOR INSERT
  WITH CHECK (true);

-- Políticas para leitura e atualização (apenas autenticados)
CREATE POLICY "Authenticated users can view leads"
  ON leads FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update leads"
  ON leads FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete leads"
  ON leads FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- VIEW PARA ANÁLISE DE LEADS
-- =====================================================

CREATE OR REPLACE VIEW vw_leads_summary AS
SELECT
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE status = 'novo') as leads_novos,
  COUNT(*) FILTER (WHERE status = 'contatado') as leads_contatados,
  COUNT(*) FILTER (WHERE status = 'qualificado') as leads_qualificados,
  COUNT(*) FILTER (WHERE status = 'convertido') as leads_convertidos,
  COUNT(*) FILTER (WHERE status = 'perdido') as leads_perdidos,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as leads_ultimos_7_dias,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as leads_ultimos_30_dias
FROM leads;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE leads IS 'Leads capturados pelo site do Icarus v5.0';
COMMENT ON VIEW vw_leads_summary IS 'Resumo e métricas de leads';

