#!/bin/bash

# =====================================================
# ICARUS v5.0 - Executar Migrations no Supabase
# =====================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║   ICARUS v5.0 - Executar Migrations Supabase         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar se .env.local existe
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Erro: Arquivo .env.local não encontrado!${NC}"
    exit 1
fi

# Extrair credenciais
SUPABASE_URL=$(grep VITE_SUPABASE_URL .env.local | cut -d '=' -f2)
PROJECT_REF=$(echo $SUPABASE_URL | sed 's/https:\/\/\(.*\)\.supabase\.co/\1/')

echo -e "${GREEN}✅ Projeto Supabase: ${BLUE}${PROJECT_REF}${NC}"
echo ""

# Verificar se psql está instalado
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ Erro: psql não está instalado!${NC}"
    echo -e "${YELLOW}Instalando PostgreSQL client...${NC}"

    # Tentar instalar psql
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y postgresql-client
    elif command -v yum &> /dev/null; then
        sudo yum install -y postgresql
    else
        echo -e "${RED}Não foi possível instalar psql automaticamente.${NC}"
        echo -e "${YELLOW}Por favor, instale manualmente e tente novamente.${NC}"
        exit 1
    fi
fi

# Solicitar senha do banco (service_role ou postgres password)
echo -e "${YELLOW}Para executar as migrations, você precisa da senha do banco de dados.${NC}"
echo -e "${CYAN}Você pode encontrar a senha em:${NC}"
echo -e "  ${BLUE}https://app.supabase.com/project/${PROJECT_REF}/settings/database${NC}"
echo ""
echo -e "${CYAN}Procure por:${NC}"
echo -e "  • Database Password (postgres)"
echo -e "  • Connection String (URI)"
echo ""

# Opções de conexão
echo -e "${YELLOW}Escolha o método de conexão:${NC}"
echo -e "  ${GREEN}1)${NC} Informar senha manualmente"
echo -e "  ${GREEN}2)${NC} Usar connection string completa"
echo -e "  ${GREEN}3)${NC} Cancelar"
echo ""
read -p "Escolha (1-3): " escolha

case $escolha in
    1)
        echo ""
        read -sp "Digite a senha do banco de dados: " DB_PASSWORD
        echo ""

        # Connection string
        CONN_STRING="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"
        ;;

    2)
        echo ""
        read -p "Cole a connection string completa: " CONN_STRING
        echo ""
        ;;

    3|*)
        echo -e "${YELLOW}Operação cancelada.${NC}"
        exit 0
        ;;
esac

# Listar migrations disponíveis
echo -e "${CYAN}📋 Migrations disponíveis:${NC}"
MIGRATIONS=($(ls -1 supabase/migrations/*.sql 2>/dev/null | sort))

if [ ${#MIGRATIONS[@]} -eq 0 ]; then
    echo -e "${RED}❌ Nenhuma migration encontrada em supabase/migrations/${NC}"
    exit 1
fi

for i in "${!MIGRATIONS[@]}"; do
    MIGRATION_NAME=$(basename "${MIGRATIONS[$i]}")
    echo -e "  ${GREEN}$((i+1)))${NC} ${MIGRATION_NAME}"
done

echo ""
echo -e "${YELLOW}Qual migration você quer executar?${NC}"
echo -e "  ${GREEN}0)${NC} Executar TODAS as migrations em ordem"
echo ""
read -p "Escolha (0-${#MIGRATIONS[@]}): " migration_choice

# Função para executar uma migration
execute_migration() {
    local migration_file=$1
    local migration_name=$(basename "$migration_file")

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}Executando: ${BLUE}${migration_name}${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"

    if psql "$CONN_STRING" -f "$migration_file"; then
        echo -e "${GREEN}✅ Migration executada com sucesso!${NC}"
        return 0
    else
        echo -e "${RED}❌ Erro ao executar migration!${NC}"
        return 1
    fi
}

# Executar migration(s)
if [ "$migration_choice" = "0" ]; then
    echo -e "${YELLOW}Executando todas as migrations...${NC}"

    for migration in "${MIGRATIONS[@]}"; do
        if ! execute_migration "$migration"; then
            echo -e "${RED}❌ Falha ao executar migrations. Parando.${NC}"
            exit 1
        fi
    done

    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ Todas as migrations executadas com sucesso!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"

elif [ "$migration_choice" -ge 1 ] && [ "$migration_choice" -le "${#MIGRATIONS[@]}" ]; then
    selected_migration="${MIGRATIONS[$((migration_choice-1))]}"

    if execute_migration "$selected_migration"; then
        echo -e "${GREEN}✅ Operação concluída!${NC}"
    else
        echo -e "${RED}❌ Falha na execução.${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Opção inválida!${NC}"
    exit 1
fi

# Verificar tabelas criadas
echo ""
echo -e "${CYAN}📊 Verificando tabelas criadas...${NC}"
echo ""

psql "$CONN_STRING" -c "
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
" 2>/dev/null || echo -e "${YELLOW}⚠️  Não foi possível listar as tabelas${NC}"

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Database setup completo!${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Próximos passos:${NC}"
echo -e "  1. Execute: ${BLUE}npm run dev${NC}"
echo -e "  2. Acesse: ${BLUE}http://localhost:5173${NC}"
echo -e "  3. Faça login/cadastro"
echo ""
echo -e "${GREEN}✨ Sistema ICARUS v5.0 pronto para uso!${NC}"
echo ""
