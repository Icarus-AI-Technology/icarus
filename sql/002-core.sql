-- ============================================================================
-- ICARUS v6.0 - TABELAS CORE
-- ============================================================================

-- EMPRESAS (Multi-tenancy root)
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj VARCHAR(18) NOT NULL UNIQUE,
  razao_social VARCHAR(200) NOT NULL,
  nome_fantasia VARCHAR(200),
  inscricao_estadual VARCHAR(20),
  autorizacao_anvisa VARCHAR(50),
  regime_tributario VARCHAR(20) DEFAULT 'simples_nacional',
  endereco_logradouro VARCHAR(200),
  endereco_numero VARCHAR(20),
  endereco_complemento VARCHAR(100),
  endereco_bairro VARCHAR(100),
  endereco_cidade VARCHAR(100),
  endereco_uf CHAR(2),
  endereco_cep VARCHAR(10),
  telefone VARCHAR(20),
  email VARCHAR(200),
  website VARCHAR(200),
  logo_url TEXT,
  configuracoes JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

-- PERFIS de acesso
CREATE TABLE perfis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  permissoes JSONB NOT NULL DEFAULT '{}',
  is_admin BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(empresa_id, nome)
);

-- USUÁRIOS
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  perfil_id UUID REFERENCES perfis(id),
  nome VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  telefone VARCHAR(20),
  cargo VARCHAR(100),
  avatar_url TEXT,
  preferencias JSONB DEFAULT '{}',
  ultimo_acesso TIMESTAMPTZ,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  UNIQUE(empresa_id, email)
);

-- CONFIGURAÇÕES do sistema
CREATE TABLE configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  chave VARCHAR(100) NOT NULL,
  valor JSONB NOT NULL,
  descricao TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(empresa_id, chave)
);

-- WEBHOOKS configurados
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  eventos TEXT[] NOT NULL,
  headers JSONB DEFAULT '{}',
  secret_key VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers de updated_at
CREATE TRIGGER tr_empresas_updated BEFORE UPDATE ON empresas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_perfis_updated BEFORE UPDATE ON perfis FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_usuarios_updated BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_configuracoes_updated BEFORE UPDATE ON configuracoes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_webhooks_updated BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Índices
CREATE INDEX idx_usuarios_empresa ON usuarios(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX idx_usuarios_auth ON usuarios(auth_id);
CREATE INDEX idx_perfis_empresa ON perfis(empresa_id) WHERE ativo = true;
