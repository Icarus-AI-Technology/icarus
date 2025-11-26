-- Migration: IcarusBrain Results Table
-- Tabela para armazenar resultados de análises do IcarusBrain
-- Data: 2025-11-26

-- Criar tabela de resultados
CREATE TABLE IF NOT EXISTS public.icarus_brain_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL UNIQUE,
    analysis_type TEXT NOT NULL,
    input_data JSONB NOT NULL DEFAULT '{}',
    result JSONB,
    error TEXT,
    user_id UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'error')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_icarus_brain_results_job_id ON public.icarus_brain_results(job_id);
CREATE INDEX IF NOT EXISTS idx_icarus_brain_results_user_id ON public.icarus_brain_results(user_id);
CREATE INDEX IF NOT EXISTS idx_icarus_brain_results_analysis_type ON public.icarus_brain_results(analysis_type);
CREATE INDEX IF NOT EXISTS idx_icarus_brain_results_status ON public.icarus_brain_results(status);
CREATE INDEX IF NOT EXISTS idx_icarus_brain_results_created_at ON public.icarus_brain_results(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE public.icarus_brain_results ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver seus próprios resultados
CREATE POLICY "Users can view own results" ON public.icarus_brain_results
    FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Service role pode inserir/atualizar qualquer resultado
CREATE POLICY "Service role can manage all results" ON public.icarus_brain_results
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_icarus_brain_results_updated_at ON public.icarus_brain_results;
CREATE TRIGGER update_icarus_brain_results_updated_at
    BEFORE UPDATE ON public.icarus_brain_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.icarus_brain_results IS 'Armazena resultados de análises do IcarusBrain AI';
COMMENT ON COLUMN public.icarus_brain_results.job_id IS 'ID único do job para rastreamento';
COMMENT ON COLUMN public.icarus_brain_results.analysis_type IS 'Tipo de análise: demanda, inadimplencia, churn, etc.';
COMMENT ON COLUMN public.icarus_brain_results.input_data IS 'Dados de entrada da análise';
COMMENT ON COLUMN public.icarus_brain_results.result IS 'Resultado da análise em JSON';
COMMENT ON COLUMN public.icarus_brain_results.status IS 'Status: processing, completed, error';

-- Grant permissions
GRANT SELECT ON public.icarus_brain_results TO authenticated;
GRANT ALL ON public.icarus_brain_results TO service_role;

