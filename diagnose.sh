#!/bin/bash
# ============================================
# ICARUS v5.0 - Script de Diagnóstico
# ============================================
# 
# Uso: ./diagnose.sh
#
# Verifica:
# 1. Componente textarea.tsx
# 2. Imports case-sensitive
# 3. TypeScript errors
# 4. ESLint warnings
# 5. Build funciona
#
# ============================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "🔍 ============================================"
echo "   ICARUS v5.0 - Diagnóstico Completo"
echo "============================================"
echo ""

# ============================================
# 1. Verificar textarea.tsx
# ============================================

echo -e "${BLUE}1️⃣ Verificando textarea.tsx...${NC}"

if [ -f "src/components/ui/textarea.tsx" ]; then
  echo -e "${GREEN}✅ textarea.tsx existe${NC}"
  
  # Verificar se tem export correto
  if grep -q "export { Textarea }" "src/components/ui/textarea.tsx"; then
    echo -e "${GREEN}✅ Export correto encontrado${NC}"
  else
    echo -e "${RED}⚠️ Export pode estar incorreto${NC}"
  fi
else
  echo -e "${RED}❌ textarea.tsx NÃO EXISTE${NC}"
  echo -e "${YELLOW}   Solução: npx shadcn@latest add textarea${NC}"
  echo -e "${YELLOW}   OU copiar de: ./textarea.tsx${NC}"
fi

echo ""

# ============================================
# 2. Verificar imports case-sensitive
# ============================================

echo -e "${BLUE}2️⃣ Verificando imports case-sensitive...${NC}"

# Procurar imports uppercase em components/ui
UPPERCASE_IMPORTS=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec grep -l "from ['\"]@/components/ui/[A-Z]" {} \; 2>/dev/null || true)

if [ -z "$UPPERCASE_IMPORTS" ]; then
  echo -e "${GREEN}✅ Nenhum import uppercase encontrado${NC}"
else
  echo -e "${RED}❌ Imports uppercase encontrados:${NC}"
  echo "$UPPERCASE_IMPORTS" | while read file; do
    echo -e "${YELLOW}   - $file${NC}"
    grep -n "from ['\"]@/components/ui/[A-Z]" "$file" | head -5
  done
fi

# Verificar especificamente Contact.tsx
echo ""
echo -e "${BLUE}Verificando Contact.tsx especificamente...${NC}"

if [ -f "src/pages/Contact.tsx" ]; then
  if grep -q "from ['\"]@/components/ui/Textarea" "src/pages/Contact.tsx"; then
    echo -e "${RED}❌ Contact.tsx tem import ERRADO: Textarea (uppercase)${NC}"
    echo -e "${YELLOW}   Linha:${NC}"
    grep -n "Textarea" "src/pages/Contact.tsx"
    echo -e "${YELLOW}   Corrigir para: textarea (lowercase)${NC}"
  else
    echo -e "${GREEN}✅ Contact.tsx OK (ou não usa Textarea)${NC}"
  fi
else
  echo -e "${YELLOW}⚠️ Contact.tsx não encontrado${NC}"
fi

echo ""

# ============================================
# 3. Verificar TypeScript
# ============================================

echo -e "${BLUE}3️⃣ Verificando TypeScript...${NC}"

if npm run type-check > /tmp/ts_check.log 2>&1; then
  echo -e "${GREEN}✅ Sem erros TypeScript${NC}"
else
  TS_ERRORS=$(grep -c "error TS" /tmp/ts_check.log || echo 0)
  echo -e "${RED}❌ $TS_ERRORS erros TypeScript encontrados${NC}"
  echo -e "${YELLOW}   Ver detalhes: cat /tmp/ts_check.log${NC}"
  
  # Mostrar primeiros 5 erros
  echo -e "${YELLOW}   Primeiros erros:${NC}"
  grep "error TS" /tmp/ts_check.log | head -5
fi

echo ""

# ============================================
# 4. Verificar ESLint
# ============================================

echo -e "${BLUE}4️⃣ Verificando ESLint...${NC}"

if npm run lint > /tmp/lint_check.log 2>&1; then
  echo -e "${GREEN}✅ ESLint passou sem erros${NC}"
else
  LINT_ERRORS=$(grep -c "error" /tmp/lint_check.log || echo 0)
  LINT_WARNINGS=$(grep -c "warning" /tmp/lint_check.log || echo 0)
  
  echo -e "${YELLOW}📊 ESLint:${NC}"
  echo -e "   - ${RED}Erros: $LINT_ERRORS${NC}"
  echo -e "   - ${YELLOW}Warnings: $LINT_WARNINGS${NC}"
  
  if [ $LINT_ERRORS -gt 0 ]; then
    echo -e "${YELLOW}   Primeiros erros:${NC}"
    grep "error" /tmp/lint_check.log | head -5
  fi
fi

echo ""

# ============================================
# 5. Testar Build
# ============================================

echo -e "${BLUE}5️⃣ Testando build...${NC}"

if npm run build > /tmp/build_check.log 2>&1; then
  echo -e "${GREEN}✅ Build FUNCIONOU${NC}"
  
  # Verificar tamanho do bundle
  if [ -d "dist" ]; then
    BUNDLE_SIZE=$(du -sh dist | cut -f1)
    echo -e "${GREEN}   Bundle size: $BUNDLE_SIZE${NC}"
  fi
else
  echo -e "${RED}❌ Build FALHOU${NC}"
  echo -e "${YELLOW}   Ver detalhes: cat /tmp/build_check.log${NC}"
  
  # Mostrar erro principal
  echo -e "${YELLOW}   Erro:${NC}"
  grep -A 5 "error" /tmp/build_check.log | head -10
fi

echo ""

# ============================================
# 6. Resumo e Recomendações
# ============================================

echo "============================================"
echo -e "${BLUE}📊 RESUMO${NC}"
echo "============================================"
echo ""

# Contar problemas
PROBLEMS=0

[ ! -f "src/components/ui/textarea.tsx" ] && ((PROBLEMS++))
[ -n "$UPPERCASE_IMPORTS" ] && ((PROBLEMS++))
[ $TS_ERRORS -gt 0 ] 2>/dev/null && ((PROBLEMS++))
[ $LINT_ERRORS -gt 0 ] 2>/dev/null && ((PROBLEMS++))

if ! npm run build > /dev/null 2>&1; then
  ((PROBLEMS++))
fi

if [ $PROBLEMS -eq 0 ]; then
  echo -e "${GREEN}✅ TUDO OK! Sistema pronto para deploy${NC}"
  echo ""
  echo "Próximo passo:"
  echo "  git add ."
  echo "  git commit -m \"fix: resolver problemas de deploy\""
  echo "  git push origin main"
else
  echo -e "${RED}⚠️ $PROBLEMS problema(s) encontrado(s)${NC}"
  echo ""
  echo "Ações necessárias:"
  echo ""
  
  if [ ! -f "src/components/ui/textarea.tsx" ]; then
    echo "1. Criar textarea.tsx:"
    echo "   npx shadcn@latest add textarea"
    echo "   OU copiar arquivo textarea.tsx fornecido"
    echo ""
  fi
  
  if [ -n "$UPPERCASE_IMPORTS" ]; then
    echo "2. Corrigir imports case-sensitive:"
    echo "   Arquivos com problema listados acima"
    echo "   Trocar uppercase por lowercase"
    echo ""
  fi
  
  if ! npm run build > /dev/null 2>&1; then
    echo "3. Corrigir erro de build:"
    echo "   Ver: cat /tmp/build_check.log"
    echo ""
  fi
fi

echo ""
echo "============================================"
echo "Diagnóstico completo!"
echo "============================================"
echo ""

# Cleanup
rm -f /tmp/ts_check.log /tmp/lint_check.log /tmp/build_check.log

exit 0
