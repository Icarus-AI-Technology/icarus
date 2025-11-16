#!/bin/bash

# =====================================================
# ICARUS v5.0 - Database Setup Helper
# =====================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║   ICARUS v5.0 - Setup do Banco de Dados Supabase      ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Ler credenciais do .env.local
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Erro: Arquivo .env.local não encontrado!${NC}"
    exit 1
fi

SUPABASE_URL=$(grep VITE_SUPABASE_URL .env.local | cut -d '=' -f2)
PROJECT_REF=$(echo $SUPABASE_URL | sed 's/https:\/\/\(.*\)\.supabase\.co/\1/')

echo -e "${GREEN}✅ Projeto Supabase identificado: ${BLUE}${PROJECT_REF}${NC}\n"

# Verificar se setup-db.sql existe
if [ ! -f setup-db.sql ]; then
    echo -e "${RED}❌ Erro: Arquivo setup-db.sql não encontrado!${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Instruções para executar o setup:${NC}\n"
echo "1️⃣  Acesse o Supabase Dashboard:"
echo -e "   ${BLUE}https://app.supabase.com/project/${PROJECT_REF}${NC}\n"

echo "2️⃣  Navegue até o SQL Editor:"
echo "   Database > SQL Editor\n"

echo "3️⃣  Execute uma das opções abaixo:\n"

# Opção 1: Copiar para clipboard (se xclip estiver disponível)
if command -v xclip &> /dev/null; then
    echo -e "${GREEN}   OPÇÃO A: Copiar SQL automaticamente${NC}"
    echo "   Pressione ENTER para copiar o SQL para a área de transferência..."
    read
    cat setup-db.sql | xclip -selection clipboard
    echo -e "${GREEN}   ✅ SQL copiado! Cole no SQL Editor do Supabase (Ctrl+V)${NC}\n"
elif command -v pbcopy &> /dev/null; then
    echo -e "${GREEN}   OPÇÃO A: Copiar SQL automaticamente${NC}"
    echo "   Pressione ENTER para copiar o SQL para a área de transferência..."
    read
    cat setup-db.sql | pbcopy
    echo -e "${GREEN}   ✅ SQL copiado! Cole no SQL Editor do Supabase (Cmd+V)${NC}\n"
else
    echo -e "${YELLOW}   OPÇÃO A: Copiar manualmente${NC}"
    echo "   Execute: cat setup-db.sql"
    echo "   Copie TODO o conteúdo e cole no SQL Editor\n"
fi

echo -e "${GREEN}   OPÇÃO B: Ver o SQL aqui${NC}"
echo "   Quer ver o conteúdo do SQL? (s/N)"
read -r resposta
if [[ "$resposta" =~ ^[Ss]$ ]]; then
    echo -e "\n${BLUE}=== Conteúdo do setup-db.sql ===${NC}\n"
    cat setup-db.sql
    echo -e "\n${BLUE}=== Fim do SQL ===${NC}\n"
fi

echo -e "\n4️⃣  No SQL Editor do Supabase:"
echo "   - Cole o SQL completo"
echo "   - Clique no botão 'Run' (ou Ctrl+Enter)"
echo "   - Aguarde a execução (30-60 segundos)\n"

echo -e "5️⃣  Validar a criação das tabelas:"
echo "   - Vá em Database > Tables"
echo "   - Confirme que existem 12 tabelas:"
echo "     ✓ empresas"
echo "     ✓ usuarios"
echo "     ✓ produtos"
echo "     ✓ hospitais"
echo "     ✓ medicos"
echo "     ✓ procedimentos_medicos"
echo "     ✓ vendas"
echo "     ✓ itens_venda"
echo "     ✓ fornecedores"
echo "     ✓ ordens_compra"
echo "     ✓ movimentacoes_estoque"
echo "     ✓ predicoes_ia\n"

echo -e "${GREEN}6️⃣  Após a execução bem-sucedida:${NC}"
echo "   Execute: npm run dev"
echo "   Acesse: http://localhost:5173\n"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📚 Guia detalhado: ${BLUE}cat GUIA_SETUP_DATABASE.md${NC}"
echo -e "${GREEN}🆘 Troubleshooting: ${BLUE}cat TROUBLESHOOTING.md${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"

# Perguntar se quer abrir o navegador
echo -e "${YELLOW}Deseja abrir o Supabase Dashboard no navegador? (s/N)${NC}"
read -r abrir
if [[ "$abrir" =~ ^[Ss]$ ]]; then
    SUPABASE_DASHBOARD="https://app.supabase.com/project/${PROJECT_REF}/editor"

    if command -v xdg-open &> /dev/null; then
        xdg-open "$SUPABASE_DASHBOARD" 2>/dev/null
    elif command -v open &> /dev/null; then
        open "$SUPABASE_DASHBOARD"
    else
        echo -e "${YELLOW}⚠️  Não foi possível abrir automaticamente.${NC}"
        echo -e "Acesse manualmente: ${BLUE}${SUPABASE_DASHBOARD}${NC}"
    fi
fi

echo -e "\n${GREEN}✨ Boa sorte com o setup!${NC}\n"
