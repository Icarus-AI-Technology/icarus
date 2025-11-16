#!/bin/bash

# =====================================================
# ICARUS v5.0 - Setup Automático
# =====================================================

set -e  # Parar em caso de erro

echo "🚀 ICARUS v5.0 - Setup Inicial"
echo "================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função de log
log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# =====================================================
# 1. Verificar Requisitos
# =====================================================
echo "📋 Verificando requisitos..."

# Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js não encontrado. Instale Node.js 18+"
    exit 1
else
    NODE_VERSION=$(node -v)
    log_info "Node.js $NODE_VERSION"
fi

# npm
if ! command -v npm &> /dev/null; then
    log_error "npm não encontrado"
    exit 1
else
    NPM_VERSION=$(npm -v)
    log_info "npm $NPM_VERSION"
fi

# Git
if ! command -v git &> /dev/null; then
    log_error "Git não encontrado"
    exit 1
else
    GIT_VERSION=$(git --version)
    log_info "$GIT_VERSION"
fi

echo ""

# =====================================================
# 2. Verificar Arquivo .env.local
# =====================================================
echo "🔐 Verificando configuração..."

if [ ! -f .env.local ]; then
    log_warn ".env.local não encontrado"
    echo "Criando a partir de .env.example..."
    cp .env.example .env.local
    log_info ".env.local criado"
    echo ""
    log_warn "IMPORTANTE: Edite .env.local com suas credenciais:"
    echo "  - VITE_SUPABASE_URL"
    echo "  - VITE_SUPABASE_ANON_KEY"
    echo "  - VITE_ANTHROPIC_API_KEY"
    echo ""
    read -p "Pressione ENTER depois de configurar .env.local..."
else
    log_info ".env.local encontrado"
fi

# Verificar se as variáveis estão configuradas
source .env.local 2>/dev/null || true

if [ -z "$VITE_SUPABASE_URL" ]; then
    log_warn "VITE_SUPABASE_URL não configurado"
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    log_warn "VITE_SUPABASE_ANON_KEY não configurado"
fi

if [ -z "$VITE_ANTHROPIC_API_KEY" ]; then
    log_warn "VITE_ANTHROPIC_API_KEY não configurado"
fi

echo ""

# =====================================================
# 3. Instalar Dependências
# =====================================================
echo "📦 Instalando dependências..."

if [ -d "node_modules" ]; then
    log_info "node_modules já existe"
    read -p "Reinstalar dependências? (s/N): " REINSTALL
    if [[ $REINSTALL =~ ^[Ss]$ ]]; then
        rm -rf node_modules package-lock.json
        npm install
    fi
else
    npm install
fi

log_info "Dependências instaladas"
echo ""

# =====================================================
# 4. Verificar TypeScript
# =====================================================
echo "🔍 Verificando TypeScript..."

if npm run type-check 2>&1 | grep -q "error"; then
    log_warn "Erros de TypeScript encontrados"
    log_warn "Execute 'npm run type-check' para detalhes"
else
    log_info "TypeScript OK"
fi

echo ""

# =====================================================
# 5. Verificar ESLint
# =====================================================
echo "🔍 Verificando ESLint..."

if npm run lint 2>&1 | grep -q "error"; then
    log_warn "Erros de linting encontrados"
    log_warn "Execute 'npm run lint' para detalhes"
else
    log_info "ESLint OK"
fi

echo ""

# =====================================================
# 6. Informações do Banco de Dados
# =====================================================
echo "🗄️  Configuração do Banco de Dados"

if [ ! -z "$VITE_SUPABASE_URL" ]; then
    PROJECT_ID=$(echo $VITE_SUPABASE_URL | sed -E 's|https://([^.]+)\.supabase\.co|\1|')
    echo "  Project ID: $PROJECT_ID"
    echo "  Dashboard: https://app.supabase.com/project/$PROJECT_ID"
    echo ""
    echo "  Para configurar o banco:"
    echo "  1. Acesse o dashboard acima"
    echo "  2. Vá em SQL Editor"
    echo "  3. Execute o arquivo setup-db.sql"
    echo ""
    log_info "Script SQL disponível em: setup-db.sql"
else
    log_warn "Supabase URL não configurado"
fi

echo ""

# =====================================================
# 7. Resumo
# =====================================================
echo "✨ Setup Completo!"
echo "================================"
echo ""
echo "Próximos passos:"
echo ""
echo "  1. Configurar banco de dados:"
echo "     → Acesse Supabase Dashboard"
echo "     → Execute setup-db.sql no SQL Editor"
echo ""
echo "  2. Iniciar desenvolvimento:"
echo "     → npm run dev"
echo "     → Abra http://localhost:5173"
echo ""
echo "  3. Executar testes:"
echo "     → npm test"
echo "     → npm run test:coverage"
echo ""
echo "  4. Consultar documentação:"
echo "     → PROXIMOS_PASSOS.md - Roadmap completo"
echo "     → CLAUDE.md - Contexto de desenvolvimento"
echo "     → .clinerules - Padrões de código"
echo ""
echo "================================"
echo ""

# Perguntar se quer iniciar o dev server
read -p "Iniciar servidor de desenvolvimento agora? (s/N): " START_DEV

if [[ $START_DEV =~ ^[Ss]$ ]]; then
    echo ""
    log_info "Iniciando servidor de desenvolvimento..."
    npm run dev
else
    echo ""
    log_info "Para iniciar manualmente: npm run dev"
fi
