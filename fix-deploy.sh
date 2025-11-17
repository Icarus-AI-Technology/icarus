#!/bin/bash
# ============================================
# ICARUS v5.0 - Script de Correção Automática
# ============================================
# 
# Uso: ./fix-deploy.sh
#
# Corrige:
# 1. Cria textarea.tsx se não existir
# 2. Corrige imports case-sensitive
# 3. Faz build de teste
# 4. Prepara commit
#
# ============================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "🔧 ============================================"
echo "   ICARUS v5.0 - Correção Automática"
echo "============================================"
echo ""

# ============================================
# 1. Criar textarea.tsx
# ============================================

echo -e "${BLUE}1️⃣ Verificando/Criando textarea.tsx...${NC}"

if [ -f "src/components/ui/textarea.tsx" ]; then
  echo -e "${GREEN}✅ textarea.tsx já existe${NC}"
else
  echo -e "${YELLOW}⚠️ Criando textarea.tsx...${NC}"
  
  # Criar diretório se não existir
  mkdir -p src/components/ui
  
  # Criar arquivo textarea.tsx
  cat > src/components/ui/textarea.tsx << 'EOF'
// src/components/ui/textarea.tsx
// Componente Textarea seguindo padrão shadcn/ui

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md",
          "border border-input bg-background",
          "px-3 py-2 text-sm",
          "ring-offset-background",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-ring",
          "focus-visible:ring-offset-2",
          "placeholder:text-muted-foreground",
          "disabled:cursor-not-allowed",
          "disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea }
EOF
  
  echo -e "${GREEN}✅ textarea.tsx criado${NC}"
fi

echo ""

# ============================================
# 2. Corrigir imports case-sensitive
# ============================================

echo -e "${BLUE}2️⃣ Corrigindo imports case-sensitive...${NC}"

# Backup antes de modificar
BACKUP_DIR=".backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Encontrar e corrigir Contact.tsx
if [ -f "src/pages/Contact.tsx" ]; then
  if grep -q "from ['\"]@/components/ui/Textarea" "src/pages/Contact.tsx"; then
    echo -e "${YELLOW}   Corrigindo Contact.tsx...${NC}"
    
    # Backup
    cp "src/pages/Contact.tsx" "$BACKUP_DIR/"
    
    # Corrigir import
    sed -i.bak "s/from ['\"]@\/components\/ui\/Textarea/from '@\/components\/ui\/textarea/g" "src/pages/Contact.tsx"
    rm -f "src/pages/Contact.tsx.bak"
    
    echo -e "${GREEN}✅ Contact.tsx corrigido${NC}"
  else
    echo -e "${GREEN}✅ Contact.tsx já está correto${NC}"
  fi
fi

# Procurar outros arquivos com problema
echo -e "${YELLOW}   Procurando outros arquivos...${NC}"

FIXED_COUNT=0

find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  if grep -q "from ['\"]@/components/ui/[A-Z]" "$file"; then
    echo -e "${YELLOW}   Corrigindo $file...${NC}"
    
    # Backup
    cp "$file" "$BACKUP_DIR/"
    
    # Corrigir todos componentes shadcn/ui comuns
    sed -i.bak "s/from ['\"]@\/components\/ui\/Button/from '@\/components\/ui\/button/g" "$file"
    sed -i.bak "s/from ['\"]@\/components\/ui\/Card/from '@\/components\/ui\/card/g" "$file"
    sed -i.bak "s/from ['\"]@\/components\/ui\/Input/from '@\/components\/ui\/input/g" "$file"
    sed -i.bak "s/from ['\"]@\/components\/ui\/Textarea/from '@\/components\/ui\/textarea/g" "$file"
    sed -i.bak "s/from ['\"]@\/components\/ui\/Select/from '@\/components\/ui\/select/g" "$file"
    sed -i.bak "s/from ['\"]@\/components\/ui\/Dialog/from '@\/components\/ui\/dialog/g" "$file"
    sed -i.bak "s/from ['\"]@\/components\/ui\/Table/from '@\/components\/ui\/table/g" "$file"
    sed -i.bak "s/from ['\"]@\/components\/ui\/Tabs/from '@\/components\/ui\/tabs/g" "$file"
    
    rm -f "$file.bak"
    
    ((FIXED_COUNT++))
  fi
done

echo -e "${GREEN}✅ $FIXED_COUNT arquivo(s) corrigido(s)${NC}"
echo -e "${YELLOW}   Backups salvos em: $BACKUP_DIR${NC}"

echo ""

# ============================================
# 3. Testar Build
# ============================================

echo -e "${BLUE}3️⃣ Testando build...${NC}"

if npm run build > /tmp/build_test.log 2>&1; then
  echo -e "${GREEN}✅ Build FUNCIONOU!${NC}"
  
  # Limpar build de teste
  rm -rf dist
else
  echo -e "${RED}❌ Build ainda falhou${NC}"
  echo -e "${YELLOW}   Ver detalhes: cat /tmp/build_test.log${NC}"
  echo ""
  echo -e "${RED}Erro:${NC}"
  tail -20 /tmp/build_test.log
  echo ""
  echo "Correção manual necessária. Verifique o log acima."
  exit 1
fi

echo ""

# ============================================
# 4. Preparar Commit
# ============================================

echo -e "${BLUE}4️⃣ Preparando commit...${NC}"

# Verificar se há mudanças
if git diff --quiet; then
  echo -e "${YELLOW}⚠️ Nenhuma mudança detectada${NC}"
else
  echo -e "${GREEN}Mudanças detectadas:${NC}"
  git status -s
  
  echo ""
  echo -e "${YELLOW}Comandos para commit:${NC}"
  echo ""
  echo "  git add ."
  echo "  git commit -m \"fix(critical): corrigir imports case-sensitive e adicionar textarea\""
  echo "  git push origin main"
  echo ""
  
  # Perguntar se quer fazer commit automático
  read -p "Fazer commit e push automaticamente? (y/n) " -n 1 -r
  echo ""
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .
    git commit -m "fix(critical): corrigir imports case-sensitive e adicionar textarea"
    
    echo ""
    read -p "Fazer push para origin main? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      git push origin main
      echo -e "${GREEN}✅ Push realizado!${NC}"
      echo ""
      echo "Aguarde o deploy automático no Vercel (2-3 minutos)"
    else
      echo -e "${YELLOW}Push cancelado. Faça manualmente quando pronto.${NC}"
    fi
  else
    echo -e "${YELLOW}Commit cancelado. Faça manualmente quando pronto.${NC}"
  fi
fi

echo ""

# ============================================
# Resumo Final
# ============================================

echo "============================================"
echo -e "${GREEN}✅ CORREÇÃO COMPLETA!${NC}"
echo "============================================"
echo ""
echo "O que foi feito:"
echo "  ✅ textarea.tsx criado/verificado"
echo "  ✅ Imports case-sensitive corrigidos"
echo "  ✅ Build testado e funcionando"
echo "  ✅ Mudanças prontas para commit"
echo ""
echo "Próximos passos:"
echo "  1. Verificar mudanças: git diff"
echo "  2. Commit: git commit -am \"fix: deploy\""
echo "  3. Push: git push origin main"
echo "  4. Aguardar deploy Vercel (2-3 min)"
echo "  5. Verificar URL produção"
echo ""
echo "Backups salvos em: $BACKUP_DIR"
echo ""
echo "============================================"

# Cleanup
rm -f /tmp/build_test.log

exit 0
