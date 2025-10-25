#!/bin/bash

# Script para corrigir autenticação do PostgreSQL
# VPS: 207.180.205.115

set -e

echo "========================================="
echo "  Correção de Autenticação PostgreSQL"
echo "========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

DB_USER="impulso_user"
DB_PASSWORD="impulso_password_2025"
DB_NAME="impulso_tickets"

echo -e "${YELLOW}[1/5]${NC} Encontrando versão do PostgreSQL..."
PG_VERSION=$(psql --version | grep -oP '\d+' | head -1)
echo -e "${GREEN}✓${NC} PostgreSQL versão: $PG_VERSION"
echo ""

echo -e "${YELLOW}[2/5]${NC} Configurando pg_hba.conf para aceitar senha..."

PG_HBA_FILE="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"

# Backup do arquivo
cp $PG_HBA_FILE ${PG_HBA_FILE}.backup

# Adicionar regra para aceitar senha
cat >> $PG_HBA_FILE << 'EOF'

# Configuração para aplicação Impulso
local   impulso_tickets    impulso_user                     md5
host    impulso_tickets    impulso_user    127.0.0.1/32     md5
host    impulso_tickets    impulso_user    ::1/128          md5
EOF

echo -e "${GREEN}✓${NC} pg_hba.conf configurado"
echo ""

echo -e "${YELLOW}[3/5]${NC} Reiniciando PostgreSQL..."
systemctl restart postgresql
sleep 2
echo -e "${GREEN}✓${NC} PostgreSQL reiniciado"
echo ""

echo -e "${YELLOW}[4/5]${NC} Recriando usuário e banco com permissões corretas..."

# Recriar usuário e banco
sudo -u postgres psql << EOF
-- Dropar conexões existentes
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME';

-- Dropar e recriar
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;

-- Criar usuário com todas as permissões
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD' CREATEDB CREATEROLE;

-- Criar banco
CREATE DATABASE $DB_NAME OWNER $DB_USER;

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER WITH SUPERUSER;
EOF

# Conectar no banco e configurar schema public
sudo -u postgres psql -d $DB_NAME << EOF
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL ON SCHEMA public TO public;
EOF

echo -e "${GREEN}✓${NC} Usuário e banco recriados"
echo ""

echo -e "${YELLOW}[5/5]${NC} Testando conexão..."

if PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -h localhost -c "SELECT 'Conexão OK' as status;" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Conexão bem-sucedida!"
    echo ""
    echo "========================================="
    echo -e "${GREEN}✓ Correção concluída com sucesso!${NC}"
    echo "========================================="
    echo ""
    echo "📊 Teste de conexão:"
    PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -h localhost -c "\l $DB_NAME"
    echo ""
    echo "✅ PostgreSQL está pronto!"
    echo ""
    echo "Próximo passo: Continue a instalação com:"
    echo "  bash /root/install-postgresql-vps.sh"
    echo ""
else
    echo -e "${RED}✗${NC} Erro na conexão. Detalhes:"
    PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -h localhost 2>&1
    exit 1
fi
