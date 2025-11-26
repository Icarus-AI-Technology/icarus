-- =====================================================
-- ICARUS v5.0 - LGPD Compliance Migration
-- Migration 007: Update cirurgias table for patient data protection
-- =====================================================
--
-- This migration ensures compliance with LGPD (Lei Geral de Proteção de Dados)
-- by replacing patient PII (Personally Identifiable Information) with
-- anonymized data.
--
-- Changes:
-- 1. Add paciente_iniciais column (patient initials only, e.g., "J.S.")
-- 2. Add paciente_ref_hospital column (hospital's internal patient reference)
-- 3. Migrate existing data to use initials
-- 4. Remove cpf_paciente column (PII violation)
-- 5. Deprecate nome_paciente column
-- =====================================================

-- Start transaction
BEGIN;

-- =====================================================
-- STEP 1: Add new LGPD-compliant columns
-- =====================================================

-- Add column for patient initials (required)
ALTER TABLE cirurgias
ADD COLUMN IF NOT EXISTS paciente_iniciais VARCHAR(10);

-- Add column for hospital's internal patient reference (optional)
ALTER TABLE cirurgias
ADD COLUMN IF NOT EXISTS paciente_ref_hospital VARCHAR(50);

-- Add comment explaining LGPD compliance
COMMENT ON COLUMN cirurgias.paciente_iniciais IS
  'LGPD Compliant: Only patient initials stored (e.g., "J.S." for João Silva)';

COMMENT ON COLUMN cirurgias.paciente_ref_hospital IS
  'Hospital internal patient reference ID - no PII stored here';

-- =====================================================
-- STEP 2: Create helper function for name to initials
-- =====================================================

CREATE OR REPLACE FUNCTION nome_para_iniciais(nome_completo TEXT)
RETURNS TEXT AS $$
DECLARE
  partes TEXT[];
  iniciais TEXT := '';
  parte TEXT;
BEGIN
  IF nome_completo IS NULL OR nome_completo = '' THEN
    RETURN '';
  END IF;

  -- Split name by spaces
  partes := string_to_array(trim(nome_completo), ' ');

  -- Build initials
  FOREACH parte IN ARRAY partes
  LOOP
    IF parte <> '' THEN
      iniciais := iniciais || upper(left(parte, 1)) || '.';
    END IF;
  END LOOP;

  RETURN iniciais;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION nome_para_iniciais(TEXT) IS
  'LGPD Helper: Converts full name to initials (e.g., "João Silva" -> "J.S.")';

-- =====================================================
-- STEP 3: Migrate existing data
-- =====================================================

-- Update existing records to populate iniciais from nome_paciente
UPDATE cirurgias
SET paciente_iniciais = nome_para_iniciais(nome_paciente)
WHERE paciente_iniciais IS NULL
  AND nome_paciente IS NOT NULL;

-- Set default for records without any patient info
UPDATE cirurgias
SET paciente_iniciais = 'N.I.'  -- "Não Identificado"
WHERE paciente_iniciais IS NULL OR paciente_iniciais = '';

-- =====================================================
-- STEP 4: Make paciente_iniciais required
-- =====================================================

ALTER TABLE cirurgias
ALTER COLUMN paciente_iniciais SET NOT NULL;

ALTER TABLE cirurgias
ALTER COLUMN paciente_iniciais SET DEFAULT 'N.I.';

-- Add constraint for format validation (letters and dots only)
ALTER TABLE cirurgias
ADD CONSTRAINT chk_paciente_iniciais_formato
CHECK (paciente_iniciais ~ '^[A-Z]\.([A-Z]\.)*$' OR paciente_iniciais = 'N.I.');

-- =====================================================
-- STEP 5: Remove CPF column (LGPD critical)
-- =====================================================

-- First, log what we're removing for audit purposes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cirurgias' AND column_name = 'cpf_paciente'
  ) THEN
    -- Create audit log entry
    INSERT INTO audit_log (
      tabela,
      acao,
      dados_anteriores,
      dados_novos,
      motivo,
      criado_em
    )
    SELECT
      'cirurgias',
      'LGPD_DATA_REMOVAL',
      jsonb_build_object('cpf_count', COUNT(*) FILTER (WHERE cpf_paciente IS NOT NULL)),
      jsonb_build_object('action', 'CPF column removed for LGPD compliance'),
      'LGPD Compliance - Removal of unnecessary patient PII',
      NOW()
    FROM cirurgias;
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    -- audit_log table doesn't exist, skip
    NULL;
END $$;

-- Drop the CPF column
ALTER TABLE cirurgias
DROP COLUMN IF EXISTS cpf_paciente;

-- =====================================================
-- STEP 6: Deprecate nome_paciente (keep for transition)
-- =====================================================

-- Add deprecation notice
COMMENT ON COLUMN cirurgias.nome_paciente IS
  'DEPRECATED: Use paciente_iniciais instead. This column will be removed in future migration.';

-- Create view that excludes deprecated column
CREATE OR REPLACE VIEW vw_cirurgias_lgpd AS
SELECT
  id,
  empresa_id,
  hospital_id,
  medico_id,
  numero_protocolo,
  paciente_iniciais,
  paciente_ref_hospital,
  nome_procedimento,
  codigo_procedimento,
  data_agendada,
  data_realizada,
  status,
  valor_estimado,
  valor_final,
  observacoes,
  criado_em,
  atualizado_em
FROM cirurgias;

COMMENT ON VIEW vw_cirurgias_lgpd IS
  'LGPD-compliant view of cirurgias table - excludes deprecated nome_paciente column';

-- =====================================================
-- STEP 7: Create indexes for new columns
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_cirurgias_paciente_iniciais
ON cirurgias(paciente_iniciais);

CREATE INDEX IF NOT EXISTS idx_cirurgias_paciente_ref_hospital
ON cirurgias(paciente_ref_hospital)
WHERE paciente_ref_hospital IS NOT NULL;

-- =====================================================
-- STEP 8: Update RLS policies if needed
-- =====================================================

-- The existing RLS policies filter by empresa_id, which remains unchanged.
-- No RLS policy changes needed for this migration.

-- =====================================================
-- END OF MIGRATION
-- =====================================================

COMMIT;

-- Verification queries (run manually after migration)
-- SELECT COUNT(*) as total,
--        COUNT(paciente_iniciais) as com_iniciais,
--        COUNT(paciente_ref_hospital) as com_ref_hospital
-- FROM cirurgias;
