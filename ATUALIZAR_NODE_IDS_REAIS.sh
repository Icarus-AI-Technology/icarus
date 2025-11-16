#!/bin/bash

# 🎨 ICARUS v5.0 - Atualizar Node IDs Reais do Figma Make
# Substitui Node IDs genéricos por Node IDs reais obtidos do Figma

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

clear

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                               ║${NC}"
echo -e "${BLUE}║  ${BOLD}🎨 Atualizar Node IDs Reais - Figma Make${NC}${BLUE}                 ║${NC}"
echo -e "${BLUE}║                                                               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}📋 Arquivo Figma Make:${NC}"
echo "   https://www.figma.com/make/mo8QUMAQbaomxqo7BHHTTN/Icarus-Cursor--cópia-"
echo ""

echo -e "${YELLOW}📝 Como obter Node IDs:${NC}"
echo ""
echo "1. Acesse o link acima"
echo "2. Clique em cada componente (NeuButton, NeuCard, etc.)"
echo "3. Copie o node-id da URL (ex: node-id=123-456)"
echo "4. Informe abaixo"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Solicitar Node IDs
echo -e "${BOLD}Informe os Node IDs encontrados no Figma Make:${NC}"
echo ""

read -p "$(echo -e ${YELLOW}Node ID do NeuButton${NC} (ex: 123-456): )" NODE_BUTTON
if [ -z "$NODE_BUTTON" ]; then
    echo -e "${RED}❌ Node ID do NeuButton é obrigatório${NC}"
    exit 1
fi

read -p "$(echo -e ${YELLOW}Node ID do NeuCard${NC} (ex: 789-012): )" NODE_CARD
if [ -z "$NODE_CARD" ]; then
    echo -e "${RED}❌ Node ID do NeuCard é obrigatório${NC}"
    exit 1
fi

read -p "$(echo -e ${YELLOW}Node ID do NeuInput${NC} (ex: 345-678): )" NODE_INPUT
if [ -z "$NODE_INPUT" ]; then
    echo -e "${RED}❌ Node ID do NeuInput é obrigatório${NC}"
    exit 1
fi

read -p "$(echo -e ${YELLOW}Node ID do Sidebar${NC} (ex: 901-234): )" NODE_SIDEBAR
if [ -z "$NODE_SIDEBAR" ]; then
    echo -e "${RED}❌ Node ID do Sidebar é obrigatório${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📝 Node IDs informados:${NC}"
echo ""
echo "  • NeuButton → $NODE_BUTTON"
echo "  • NeuCard → $NODE_CARD"
echo "  • NeuInput → $NODE_INPUT"
echo "  • Sidebar → $NODE_SIDEBAR"
echo ""

read -p "$(echo -e ${GREEN}Confirma a atualização? ${NC}${BOLD}[s/N]${NC} )" -n 1 -r
echo
if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    echo -e "${YELLOW}Operação cancelada.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🔧 Atualizando Node IDs...${NC}"
echo ""

# Atualizar cada arquivo
if sed -i "s|node-id=1001-2001|node-id=$NODE_BUTTON|g" src/components/ui/neu-button.figma.tsx 2>/dev/null; then
    echo -e "  ${GREEN}✅${NC} NeuButton → node-id=$NODE_BUTTON"
else
    echo -e "  ${RED}❌${NC} Erro ao atualizar NeuButton"
fi

if sed -i "s|node-id=1002-2002|node-id=$NODE_CARD|g" src/components/ui/neu-card.figma.tsx 2>/dev/null; then
    echo -e "  ${GREEN}✅${NC} NeuCard → node-id=$NODE_CARD"
else
    echo -e "  ${RED}❌${NC} Erro ao atualizar NeuCard"
fi

if sed -i "s|node-id=1003-2003|node-id=$NODE_INPUT|g" src/components/ui/neu-input.figma.tsx 2>/dev/null; then
    echo -e "  ${GREEN}✅${NC} NeuInput → node-id=$NODE_INPUT"
else
    echo -e "  ${RED}❌${NC} Erro ao atualizar NeuInput"
fi

if sed -i "s|node-id=1004-2004|node-id=$NODE_SIDEBAR|g" src/components/layout/sidebar.figma.tsx 2>/dev/null; then
    echo -e "  ${GREEN}✅${NC} Sidebar → node-id=$NODE_SIDEBAR"
else
    echo -e "  ${RED}❌${NC} Erro ao atualizar Sidebar"
fi

echo ""
echo -e "${BLUE}🧪 Testando configuração...${NC}"
echo ""

# Test parse
if npm run figma:parse > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅${NC} Parse: OK"
else
    echo -e "  ${YELLOW}⚠️${NC}  Parse: Com avisos (verificar output)"
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}║  ${BOLD}🎉 NODE IDS REAIS APLICADOS! 🎉${NC}${GREEN}                          ║${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📊 Componentes atualizados:${NC}"
echo ""
echo "  https://www.figma.com/design/mo8QUMAQbaomxqo7BHHTTN?node-id=$NODE_BUTTON"
echo "  https://www.figma.com/design/mo8QUMAQbaomxqo7BHHTTN?node-id=$NODE_CARD"
echo "  https://www.figma.com/design/mo8QUMAQbaomxqo7BHHTTN?node-id=$NODE_INPUT"
echo "  https://www.figma.com/design/mo8QUMAQbaomxqo7BHHTTN?node-id=$NODE_SIDEBAR"
echo ""

echo -e "${YELLOW}📝 Próximos passos:${NC}"
echo ""
echo "  1. Verificar Node IDs:"
echo -e "     ${BLUE}grep \"node-id=\" src/components/**/*.figma.tsx${NC}"
echo ""
echo "  2. Testar parse:"
echo -e "     ${BLUE}npm run figma:parse${NC}"
echo ""
echo "  3. Publicar para Figma (opcional):"
echo -e "     ${BLUE}FIGMA_ACCESS_TOKEN=\"figd_UIjMfX9...\" npm run figma:publish${NC}"
echo ""
echo "  4. Commit alterações:"
echo -e "     ${BLUE}git add src/components/**/*.figma.tsx${NC}"
echo -e "     ${BLUE}git commit -m \"feat: Update with real Node IDs from Figma Make\"${NC}"
echo ""

echo -e "${GREEN}✨ Concluído! Agora você tem Node IDs reais do Figma Make!${NC}"
echo ""
