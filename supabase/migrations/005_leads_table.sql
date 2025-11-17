-- ============================================================================
-- Migration: 005_leads_table
-- Description: Create table to store leads from landing page contact form
-- Author: IcarusAI Technology
-- Date: 2025-11-16
-- ============================================================================

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contact Information
  nome VARCHAR(255) NOT NULL,
  empresa VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(50) NOT NULL,
  cargo VARCHAR(100) NOT NULL,
  
  -- Company Information
  numero_colaboradores VARCHAR(20) NOT NULL,
  
  -- Qualification Information
  principal_desafio VARCHAR(100) NOT NULL,
  interesse_ia VARCHAR(100) NOT NULL,
  mensagem TEXT,
  
  -- Lead Status & Tracking
  status VARCHAR(50) DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'qualificado', 'convertido', 'perdido')),
  origem VARCHAR(50) DEFAULT 'landing_page',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contatado_em TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  user_agent TEXT,
  ip_address INET,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for performance
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_leads_empresa ON public.leads(empresa);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow anonymous inserts (for form submissions)
CREATE POLICY "Allow anonymous insert leads"
  ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- RLS Policy: Allow authenticated users to view all leads
CREATE POLICY "Allow authenticated users to view leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Allow authenticated users to update leads
CREATE POLICY "Allow authenticated users to update leads"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policy: Allow authenticated users to delete leads (admin only)
CREATE POLICY "Allow authenticated users to delete leads"
  ON public.leads
  FOR DELETE
  TO authenticated
  USING (true);

-- Comments for documentation
COMMENT ON TABLE public.leads IS 'Stores leads captured from landing page contact form';
COMMENT ON COLUMN public.leads.id IS 'Unique identifier for the lead';
COMMENT ON COLUMN public.leads.nome IS 'Full name of the lead contact';
COMMENT ON COLUMN public.leads.empresa IS 'Company name';
COMMENT ON COLUMN public.leads.email IS 'Email address (validated)';
COMMENT ON COLUMN public.leads.telefone IS 'Phone number';
COMMENT ON COLUMN public.leads.cargo IS 'Job position/role';
COMMENT ON COLUMN public.leads.numero_colaboradores IS 'Number of employees in company';
COMMENT ON COLUMN public.leads.principal_desafio IS 'Main business challenge';
COMMENT ON COLUMN public.leads.interesse_ia IS 'AI feature of interest';
COMMENT ON COLUMN public.leads.mensagem IS 'Additional message from lead';
COMMENT ON COLUMN public.leads.status IS 'Current status of the lead in sales pipeline';
COMMENT ON COLUMN public.leads.origem IS 'Source/origin of the lead';

-- Grant permissions
GRANT SELECT, INSERT ON public.leads TO anon;
GRANT ALL ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

-- ============================================================================
-- END Migration: 005_leads_table
-- ============================================================================

