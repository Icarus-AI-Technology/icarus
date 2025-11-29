-- ============================================================================
-- ICARUS v6.0 - EXTENSÕES PostgreSQL 16
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Criptografia/SHA-256
CREATE EXTENSION IF NOT EXISTS "vector";         -- pgvector para embeddings

-- Verificar versão do PostgreSQL
DO $$
BEGIN
  IF current_setting('server_version_num')::int < 160000 THEN
    RAISE EXCEPTION 'PostgreSQL 16+ é necessário. Versão atual: %', current_setting('server_version');
  END IF;
END $$;

-- ============================================================================
-- FUNÇÕES UTILITÁRIAS BASE
-- ============================================================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Obter empresa do usuário atual (multi-tenancy)
CREATE OR REPLACE FUNCTION current_empresa()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_empresa_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

-- Obter usuário atual
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_user_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

-- Calcular hash SHA-256
CREATE OR REPLACE FUNCTION sha256_hash(content TEXT)
RETURNS VARCHAR(64) AS $$
BEGIN
  RETURN encode(sha256(content::bytea), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;
