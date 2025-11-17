#!/bin/bash
echo "🔍 Verificando instalação do ICARUS v5.0..."
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

# Teste 1: Node.js
if node --version | grep -q "v[0-9][0-9]"; then
  echo -e "${GREEN}✅${NC} Node.js instalado: $(node --version)"
  ((PASS++))
else
  echo -e "${RED}❌${NC} Node.js não encontrado"
  ((FAIL++))
fi

# Teste 2: npm
if npm --version | grep -q "[0-9]"; then
  echo -e "${GREEN}✅${NC} npm instalado: $(npm --version)"
  ((PASS++))
else
  echo -e "${RED}❌${NC} npm não encontrado"
  ((FAIL++))
fi

# Teste 3: node_modules
if [ -d "node_modules" ]; then
  COUNT=$(ls -1 node_modules 2>/dev/null | wc -l)
  echo -e "${GREEN}✅${NC} node_modules existe: $COUNT pacotes"
  ((PASS++))
else
  echo -e "${RED}❌${NC} node_modules não encontrado"
  ((FAIL++))
fi

# Teste 4: package.json
if [ -f "package.json" ]; then
  echo -e "${GREEN}✅${NC} package.json existe"
  ((PASS++))
else
  echo -e "${RED}❌${NC} package.json não encontrado"
  ((FAIL++))
fi

# Teste 5: TypeScript
if npx tsc --version > /dev/null 2>&1; then
  echo -e "${GREEN}✅${NC} TypeScript instalado: $(npx tsc --version)"
  ((PASS++))
else
  echo -e "${RED}❌${NC} TypeScript não encontrado"
  ((FAIL++))
fi

# Teste 6: Vite
if npx vite --version > /dev/null 2>&1; then
  echo -e "${GREEN}✅${NC} Vite instalado: $(npx vite --version)"
  ((PASS++))
else
  echo -e "${RED}❌${NC} Vite não encontrado"
  ((FAIL++))
fi

# Teste 7: Tailwind CSS
if [ -f "tailwind.config.js" ] || [ -f "tailwind.config.ts" ]; then
  echo -e "${GREEN}✅${NC} Tailwind configurado"
  ((PASS++))
else
  echo -e "${RED}❌${NC} Tailwind não configurado"
  ((FAIL++))
fi

# Teste 8: .env
if [ -f ".env" ]; then
  echo -e "${GREEN}✅${NC} .env existe"
  ((PASS++))
else
  echo -e "${YELLOW}⚠️${NC}  .env não encontrado (opcional)"
fi

# Teste 9: Espaço em disco
DISK_SPACE=$(df -h . | tail -1 | awk '{print $4}')
echo -e "${GREEN}✅${NC} Espaço em disco disponível: $DISK_SPACE"
((PASS++))

# Teste 10: Git
if git --version > /dev/null 2>&1; then
  echo -e "${GREEN}✅${NC} Git instalado: $(git --version)"
  ((PASS++))
else
  echo -e "${YELLOW}⚠️${NC}  Git não encontrado (opcional)"
fi

echo ""
echo "========================================="
echo "RESULTADOS:"
echo -e "${GREEN}✅ Passou: $PASS${NC}"
echo -e "${RED}❌ Falhou: $FAIL${NC}"
echo "========================================="

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}🎉 INSTALAÇÃO COMPLETA E VALIDADA!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  INSTALAÇÃO INCOMPLETA - Corrija os erros acima${NC}"
  exit 1
fi
