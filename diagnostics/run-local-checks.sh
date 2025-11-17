#!/bin/bash
# run-local-checks.sh - Script para executar verificações locais do projeto ICARUS
# Este script detecta o tipo de projeto e executa os comandos apropriados
# Uso: ./run-local-checks.sh

set -e  # Sair em caso de erro

echo "======================================"
echo "🔍 ICARUS - Verificações Locais"
echo "======================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log de sucesso
log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Função para log de erro
log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Função para log de aviso
log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Função para log de info
log_info() {
    echo "ℹ $1"
}

# Detectar diretório raiz do projeto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

log_info "Diretório do projeto: $PROJECT_ROOT"
echo ""

# ====================================
# 1. DETECTAR TIPO DE PROJETO
# ====================================
echo "1️⃣  Detectando tipo de projeto..."

PROJECT_TYPE="unknown"

if [ -f "package.json" ]; then
    PROJECT_TYPE="nodejs"
    log_success "Projeto Node.js detectado"
elif [ -f "requirements.txt" ] || [ -f "setup.py" ] || [ -f "pyproject.toml" ]; then
    PROJECT_TYPE="python"
    log_success "Projeto Python detectado"
else
    log_warning "Tipo de projeto não detectado automaticamente"
fi

echo ""

# ====================================
# 2. VERIFICAR DEPENDÊNCIAS
# ====================================
echo "2️⃣  Verificando dependências..."

if [ "$PROJECT_TYPE" = "nodejs" ]; then
    if [ -f "package-lock.json" ]; then
        log_info "Instalando dependências com npm..."
        npm ci --quiet || npm install
        log_success "Dependências instaladas"
    elif [ -f "pnpm-lock.yaml" ]; then
        log_info "Instalando dependências com pnpm..."
        pnpm install --frozen-lockfile || pnpm install
        log_success "Dependências instaladas"
    elif [ -f "yarn.lock" ]; then
        log_info "Instalando dependências com yarn..."
        yarn install --frozen-lockfile || yarn install
        log_success "Dependências instaladas"
    else
        log_info "Instalando dependências com npm..."
        npm install
        log_success "Dependências instaladas"
    fi
elif [ "$PROJECT_TYPE" = "python" ]; then
    if [ -f "requirements.txt" ]; then
        log_info "Instalando dependências Python..."
        pip install -r requirements.txt --quiet
        log_success "Dependências instaladas"
    fi
fi

echo ""

# ====================================
# 3. LINTING
# ====================================
echo "3️⃣  Executando linting..."

if [ "$PROJECT_TYPE" = "nodejs" ]; then
    if grep -q '"lint"' package.json 2>/dev/null; then
        log_info "Executando ESLint..."
        npm run lint || log_error "Linting falhou (pode haver warnings)"
        log_success "Linting concluído"
    else
        log_warning "Script de lint não encontrado em package.json"
    fi
elif [ "$PROJECT_TYPE" = "python" ]; then
    if command -v flake8 &> /dev/null; then
        log_info "Executando flake8..."
        flake8 . || log_error "Linting falhou"
        log_success "Linting concluído"
    elif command -v pylint &> /dev/null; then
        log_info "Executando pylint..."
        pylint **/*.py || log_error "Linting falhou"
        log_success "Linting concluído"
    else
        log_warning "Nenhuma ferramenta de linting Python encontrada"
    fi
fi

echo ""

# ====================================
# 4. TYPE CHECKING (se disponível)
# ====================================
echo "4️⃣  Verificando tipos..."

if [ "$PROJECT_TYPE" = "nodejs" ]; then
    if [ -f "tsconfig.json" ]; then
        log_info "Executando TypeScript type check..."
        npx tsc --noEmit || log_error "Type checking falhou"
        log_success "Type checking concluído"
    else
        log_warning "tsconfig.json não encontrado, pulando type check"
    fi
elif [ "$PROJECT_TYPE" = "python" ]; then
    if command -v mypy &> /dev/null; then
        log_info "Executando mypy..."
        mypy . || log_error "Type checking falhou"
        log_success "Type checking concluído"
    else
        log_warning "mypy não encontrado, pulando type check"
    fi
fi

echo ""

# ====================================
# 5. TESTES
# ====================================
echo "5️⃣  Executando testes..."

if [ "$PROJECT_TYPE" = "nodejs" ]; then
    if grep -q '"test"' package.json 2>/dev/null; then
        log_info "Executando testes unitários..."
        npm test -- --run || log_error "Testes falharam"
        log_success "Testes concluídos"
    else
        log_warning "Script de test não encontrado em package.json"
    fi
elif [ "$PROJECT_TYPE" = "python" ]; then
    if command -v pytest &> /dev/null; then
        log_info "Executando pytest..."
        pytest || log_error "Testes falharam"
        log_success "Testes concluídos"
    elif [ -f "manage.py" ]; then
        log_info "Executando testes Django..."
        python manage.py test || log_error "Testes falharam"
        log_success "Testes concluídos"
    else
        log_warning "Framework de testes não encontrado"
    fi
fi

echo ""

# ====================================
# 6. BUILD
# ====================================
echo "6️⃣  Executando build..."

if [ "$PROJECT_TYPE" = "nodejs" ]; then
    if grep -q '"build"' package.json 2>/dev/null; then
        log_info "Executando build de produção..."
        npm run build || log_error "Build falhou"
        log_success "Build concluído"
        
        # Verificar tamanho do bundle
        if [ -d "dist" ]; then
            BUNDLE_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
            log_info "Tamanho do bundle: $BUNDLE_SIZE"
        fi
    else
        log_warning "Script de build não encontrado em package.json"
    fi
elif [ "$PROJECT_TYPE" = "python" ]; then
    if [ -f "setup.py" ]; then
        log_info "Executando build Python..."
        python setup.py build || log_error "Build falhou"
        log_success "Build concluído"
    else
        log_warning "setup.py não encontrado, pulando build"
    fi
fi

echo ""

# ====================================
# 7. VERIFICAÇÕES ADICIONAIS
# ====================================
echo "7️⃣  Verificações adicionais..."

# Verificar variáveis de ambiente
if [ -f ".env.example" ] && [ ! -f ".env" ]; then
    log_warning "Arquivo .env não encontrado. Copie .env.example para .env"
fi

# Verificar Git status
if command -v git &> /dev/null; then
    UNTRACKED=$(git ls-files --others --exclude-standard | wc -l)
    if [ "$UNTRACKED" -gt 0 ]; then
        log_warning "Existem $UNTRACKED arquivo(s) não rastreado(s)"
    fi
fi

echo ""

# ====================================
# RESUMO FINAL
# ====================================
echo "======================================"
echo "✅ Verificações concluídas!"
echo "======================================"
echo ""
echo "Próximos passos:"
echo "1. Revisar logs acima para identificar problemas"
echo "2. Corrigir quaisquer falhas encontradas"
echo "3. Executar testes E2E se disponíveis (npm run test:e2e)"
echo "4. Revisar documentação em diagnostics/commit-75-investigation.md"
echo ""
