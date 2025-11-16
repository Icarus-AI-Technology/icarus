#!/bin/bash

# 🔐 ICARUS v5.0 - Figma Code Connect Authentication Script
# Este script ajuda a configurar a autenticação do Figma Code Connect

set -e

echo "════════════════════════════════════════════════════════════"
echo "  🎨 ICARUS v5.0 - Figma Code Connect Authentication"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if already authenticated
if [ -f ~/.figma/code-connect.json ]; then
    echo -e "${GREEN}✅ Autenticação existente encontrada${NC}"
    echo ""
    echo "Arquivo de configuração:"
    cat ~/.figma/code-connect.json | head -5
    echo ""
    echo -e "${YELLOW}⚠️  Se quiser reautenticar, delete o arquivo:${NC}"
    echo "   rm ~/.figma/code-connect.json"
    echo ""
else
    echo -e "${YELLOW}⚠️  Nenhuma autenticação encontrada${NC}"
    echo ""
fi

# Check if figma.config.json exists
if [ -f figma.config.json ]; then
    echo -e "${GREEN}✅ figma.config.json encontrado${NC}"
else
    echo -e "${RED}❌ figma.config.json não encontrado${NC}"
    exit 1
fi

# Count .figma.tsx files
FIGMA_FILES=$(find src/components -name "*.figma.tsx" 2>/dev/null | wc -l)
echo -e "${GREEN}✅ $FIGMA_FILES arquivos .figma.tsx encontrados${NC}"

# List .figma.tsx files
echo ""
echo "Componentes conectados:"
find src/components -name "*.figma.tsx" 2>/dev/null | while read file; do
    echo "  - $(basename "$file")"
done

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  📋 Próximos Passos"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "1️⃣  Gerar Personal Access Token no Figma:"
echo "   ${BLUE}https://www.figma.com/settings${NC}"
echo ""
echo "   Scopes necessários:"
echo "   - ✅ File content (Read)"
echo "   - ✅ Code Connect (Write)"
echo ""
echo "2️⃣  Autenticar no terminal:"
echo "   ${BLUE}npx figma connect auth${NC}"
echo ""
echo "3️⃣  Verificar autenticação:"
echo "   ${BLUE}npm run figma:parse${NC}"
echo ""
echo "4️⃣  Publicar componentes (opcional):"
echo "   ${BLUE}npm run figma:publish${NC}"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "  📚 Documentação"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Guia completo: ${BLUE}cat FIGMA_AUTH_GUIDE.md${NC}"
echo "Documentação Figma: ${BLUE}https://www.figma.com/developers/code-connect${NC}"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Ask if user wants to authenticate now
read -p "Deseja autenticar agora? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Iniciando autenticação..."
    echo ""
    npx figma connect auth
else
    echo ""
    echo "Autenticação cancelada. Execute quando estiver pronto:"
    echo "${BLUE}npx figma connect auth${NC}"
    echo ""
fi
