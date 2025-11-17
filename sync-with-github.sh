#!/bin/bash

# ==========================================
# ICARUS v5.0 - Script de Sincronização
# Alinha código local com repositório GitHub
# ==========================================

set -e  # Exit on error

echo "🔄 ICARUS v5.0 - Sincronização com GitHub"
echo "========================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretórios
LOCAL_DIR="$(pwd)"
TEMP_DIR="/tmp/icarus-sync"
BACKUP_DIR="$HOME/.icarus-backup-$(date +%Y%m%d-%H%M%S)"

echo "📁 Diretório local: $LOCAL_DIR"
echo "📁 Backup será salvo em: $BACKUP_DIR"
echo ""

# Função para confirmar ação
confirm() {
    read -p "$1 (y/n): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

# 1. Backup do .env
echo "💾 Passo 1: Backup do arquivo .env..."
if [ -f ".env" ]; then
    mkdir -p "$BACKUP_DIR"
    cp .env "$BACKUP_DIR/.env"
    echo -e "${GREEN}✅ Backup do .env criado${NC}"
else
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
fi
echo ""

# 2. Backup de arquivos modificados
echo "💾 Passo 2: Backup de arquivos locais modificados..."
mkdir -p "$BACKUP_DIR/src"
if [ -d "src/components/modules" ]; then
    cp -r src/components/modules "$BACKUP_DIR/src/" 2>/dev/null || true
    echo -e "${GREEN}✅ Módulos salvos${NC}"
fi
echo ""

# 3. Verificar status Git
echo "📊 Passo 3: Verificando status Git..."
git status --short
echo ""

if ! confirm "Deseja continuar com a sincronização?"; then
    echo -e "${RED}❌ Sincronização cancelada${NC}"
    exit 0
fi

# 4. Stash de mudanças locais
echo "📦 Passo 4: Salvando mudanças locais (stash)..."
git stash push -m "Backup antes de sincronização - $(date +%Y-%m-%d-%H:%M:%S)"
echo -e "${GREEN}✅ Mudanças salvas no stash${NC}"
echo ""

# 5. Fetch do repositório remoto
echo "📥 Passo 5: Buscando atualizações do GitHub..."
git fetch origin main
echo -e "${GREEN}✅ Atualizações baixadas${NC}"
echo ""

# 6. Merge com main
echo "🔀 Passo 6: Fazendo merge com origin/main..."
if git merge origin/main --no-edit; then
    echo -e "${GREEN}✅ Merge concluído com sucesso${NC}"
else
    echo -e "${RED}❌ Conflitos detectados!${NC}"
    echo ""
    echo "Resolva os conflitos manualmente e execute:"
    echo "  git merge --continue"
    exit 1
fi
echo ""

# 7. Restaurar .env
echo "🔧 Passo 7: Restaurando arquivo .env..."
if [ -f "$BACKUP_DIR/.env" ]; then
    cp "$BACKUP_DIR/.env" .env
    echo -e "${GREEN}✅ Arquivo .env restaurado${NC}"
fi
echo ""

# 8. Instalar/atualizar dependências
echo "📦 Passo 8: Instalando/atualizando dependências..."
if confirm "Deseja rodar pnpm install?"; then
    pnpm install
    echo -e "${GREEN}✅ Dependências atualizadas${NC}"
fi
echo ""

# 9. Verificar mudanças importantes
echo "📋 Passo 9: Verificando arquivos importantes..."
echo ""
echo "Novos arquivos do repositório oficial:"
git log origin/main --name-only --oneline -10 | grep -E "\.(md|tsx|ts)$" | sort | uniq | head -20
echo ""

# 10. Resumo
echo "========================================="
echo "✅ SINCRONIZAÇÃO CONCLUÍDA!"
echo "========================================="
echo ""
echo "📊 Resumo:"
echo "  ✅ Backup salvo em: $BACKUP_DIR"
echo "  ✅ Código atualizado com origin/main"
echo "  ✅ Arquivo .env preservado"
echo ""
echo "📝 Próximos passos:"
echo "  1. Revisar mudanças: git diff HEAD@{1}"
echo "  2. Testar aplicação: pnpm dev"
echo "  3. Ver stash: git stash list"
echo "  4. Recuperar stash se necessário: git stash pop"
echo ""
echo "🔗 Repositório: https://github.com/Icarus-AI-Technology/icarus"
echo ""

# Oferecer para iniciar aplicação
if confirm "Deseja iniciar a aplicação agora (pnpm dev)?"; then
    echo ""
    echo "🚀 Iniciando ICARUS v5.0..."
    pnpm dev
fi

