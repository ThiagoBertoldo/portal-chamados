#!/bin/bash

# Script de Configuração SQLite na VPS
# Para VPS: 207.180.205.115
# Portal de Chamados - Impulso Tecnologia

set -e  # Parar em caso de erro

echo "========================================="
echo "  Configuração SQLite - Portal Chamados"
echo "  VPS: 207.180.205.115"
echo "========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variáveis de configuração
PROJECT_DIR="/root/aplications/Tickets_ImpulsoTecnologia/portal-chamados"
BACKEND_DIR="$PROJECT_DIR/packages/backend"

echo -e "${YELLOW}[1/8]${NC} Instalando SQLite3..."
apt update -qq
apt install -y sqlite3 > /dev/null 2>&1
echo -e "${GREEN}✓${NC} SQLite3 instalado"
echo ""

echo -e "${YELLOW}[2/8]${NC} Verificando versão do SQLite..."
SQLITE_VERSION=$(sqlite3 --version | awk '{print $1}')
echo -e "${GREEN}✓${NC} SQLite versão: $SQLITE_VERSION"
echo ""

echo -e "${YELLOW}[3/8]${NC} Navegando para diretório do backend..."
cd $BACKEND_DIR
echo -e "${GREEN}✓${NC} Diretório: $(pwd)"
echo ""

echo -e "${YELLOW}[4/8]${NC} Verificando/Atualizando .env..."

# Criar .env se não existir
if [ ! -f .env ]; then
    echo "Criando .env..."
    cp .env.example .env 2>/dev/null || true
fi

# Fazer backup
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Configurar .env para SQLite
cat > .env << 'EOF'
DATABASE_URL="file:./dev.db"
JWT_SECRET="seu-secret-super-seguro-aqui-troque-por-um-valor-aleatorio"
PORT=3001
NODE_ENV=production
EOF

echo -e "${GREEN}✓${NC} .env configurado para SQLite"
echo ""

echo -e "${YELLOW}[5/8]${NC} Verificando schema.prisma..."

# Garantir que está usando SQLite
if grep -q 'provider = "sqlite"' prisma/schema.prisma; then
    echo -e "${GREEN}✓${NC} Schema já configurado para SQLite"
else
    echo "Atualizando schema para SQLite..."
    sed -i 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Schema atualizado para SQLite"
fi
echo ""

echo -e "${YELLOW}[6/8]${NC} Removendo banco antigo e migrations..."

# Remover banco antigo se existir
rm -f prisma/dev.db prisma/dev.db-journal

# Limpar migrations antigas
rm -rf prisma/migrations

echo -e "${GREEN}✓${NC} Banco e migrations limpos"
echo ""

echo -e "${YELLOW}[7/8]${NC} Gerando Prisma Client e criando banco..."

# Gerar client
npx prisma generate

# Criar migrations
npx prisma migrate dev --name init --skip-seed

echo -e "${GREEN}✓${NC} Banco SQLite criado"
echo ""

echo -e "${YELLOW}[8/8]${NC} Populando banco com dados iniciais..."

# Popular banco
npm run seed

echo -e "${GREEN}✓${NC} Banco populado com sucesso"
echo ""

# Mostrar informações do banco
echo "========================================="
echo -e "${GREEN}✓ Configuração concluída com sucesso!${NC}"
echo "========================================="
echo ""
echo "📊 Informações do Banco SQLite:"
echo "  • Tipo: SQLite"
echo "  • Arquivo: $BACKEND_DIR/prisma/dev.db"
echo "  • Tamanho: $(du -h $BACKEND_DIR/prisma/dev.db | cut -f1)"
echo ""

# Mostrar estatísticas
echo "📈 Dados inseridos:"
sqlite3 $BACKEND_DIR/prisma/dev.db << 'SQL'
.mode column
.headers on
SELECT 'users' as tabela, COUNT(*) as registros FROM users
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'slas', COUNT(*) FROM slas;
SQL

echo ""
echo "👤 Usuários criados:"
sqlite3 $BACKEND_DIR/prisma/dev.db << 'SQL'
.mode column
.headers on
SELECT email, name, role FROM users;
SQL

echo ""
echo "📝 Próximos passos:"
echo "  1. Reiniciar backend: pm2 restart backend"
echo "  2. Ver logs: pm2 logs backend"
echo "  3. Testar API: curl http://localhost:3001/health"
echo "  4. Login frontend: admin@impulso.com / admin123"
echo ""
echo "✅ SQLite está pronto para uso!"
echo ""
