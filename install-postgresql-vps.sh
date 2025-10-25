#!/bin/bash

# Script de Instalação Automática do PostgreSQL
# Para VPS: 207.180.205.115
# Portal de Chamados - Impulso Tecnologia

set -e  # Parar em caso de erro

echo "========================================="
echo "  Instalação PostgreSQL - Portal Chamados"
echo "  VPS: 207.180.205.115"
echo "========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variáveis de configuração
DB_USER="impulso_user"
DB_PASSWORD="impulso_password_2025"
DB_NAME="impulso_tickets"
PROJECT_DIR="/root/aplications/Tickets_ImpulsoTecnologia/portal-chamados"
BACKEND_DIR="$PROJECT_DIR/packages/backend"

echo -e "${YELLOW}[1/10]${NC} Atualizando sistema..."
apt update -qq
echo -e "${GREEN}✓${NC} Sistema atualizado"
echo ""

echo -e "${YELLOW}[2/10]${NC} Instalando PostgreSQL..."
apt install -y postgresql postgresql-contrib > /dev/null 2>&1
echo -e "${GREEN}✓${NC} PostgreSQL instalado"
echo ""

echo -e "${YELLOW}[3/10]${NC} Iniciando serviço PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql > /dev/null 2>&1
echo -e "${GREEN}✓${NC} PostgreSQL iniciado"
echo ""

echo -e "${YELLOW}[4/10]${NC} Criando usuário e banco de dados..."
sudo -u postgres psql << EOF > /dev/null 2>&1
-- Dropar se existir (para reinstalação)
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;

-- Criar novo
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE $DB_NAME;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
EOF

# Conectar e dar permissões no schema
sudo -u postgres psql -d $DB_NAME << EOF > /dev/null 2>&1
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;
EOF

echo -e "${GREEN}✓${NC} Banco de dados criado"
echo ""

echo -e "${YELLOW}[5/10]${NC} Testando conexão..."
if PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -h localhost -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Conexão bem-sucedida"
else
    echo -e "${RED}✗${NC} Erro na conexão"
    exit 1
fi
echo ""

echo -e "${YELLOW}[6/10]${NC} Navegando para diretório do backend..."
cd $BACKEND_DIR
echo -e "${GREEN}✓${NC} Diretório: $(pwd)"
echo ""

echo -e "${YELLOW}[7/10]${NC} Fazendo backup do schema.prisma..."
cp prisma/schema.prisma prisma/schema.sqlite.backup
echo -e "${GREEN}✓${NC} Backup criado: prisma/schema.sqlite.backup"
echo ""

echo -e "${YELLOW}[8/10]${NC} Atualizando .env com PostgreSQL..."
# Backup do .env
cp .env .env.backup

# Atualizar DATABASE_URL
sed -i 's|^DATABASE_URL=.*|DATABASE_URL="postgresql://'$DB_USER':'$DB_PASSWORD'@localhost:5432/'$DB_NAME'?schema=public"|' .env

# Atualizar NODE_ENV para production
sed -i 's|^NODE_ENV=.*|NODE_ENV=production|' .env

echo -e "${GREEN}✓${NC} .env atualizado"
echo ""

echo -e "${YELLOW}[9/10]${NC} Copiando novo schema PostgreSQL..."
cat > prisma/schema.prisma << 'EOF'
// Prisma schema para PostgreSQL

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN
  ATTENDANT
  VIEWER
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      UserRole @default(ATTENDANT)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  assignedTickets Ticket[] @relation("AssignedTickets")

  @@map("users")
}

model Client {
  id        String   @id @default(uuid())
  name      String
  email     String?
  phone     String?
  document  String?  @unique
  address   String?
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tickets Ticket[]

  @@map("clients")
}

model Category {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  color       String?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tickets Ticket[]
  slas    SLA[]

  @@map("categories")
}

model SLA {
  id               String   @id @default(uuid())
  name             String
  categoryId       String?
  responseTime     Int
  resolutionTime   Int
  priority         Priority @default(MEDIUM)
  active           Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  tickets  Ticket[]

  @@map("slas")
}

model Ticket {
  id               String   @id @default(uuid())
  title            String
  description      String
  status           TicketStatus @default(OPEN)
  priority         Priority @default(MEDIUM)

  clientId         String
  categoryId       String
  slaId            String?
  assignedToId     String?

  telegramUserId   String?
  telegramChatId   String?

  responseDeadline DateTime?
  resolutionDeadline DateTime?

  respondedAt      DateTime?
  resolvedAt       DateTime?
  closedAt         DateTime?

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  client     Client    @relation(fields: [clientId], references: [id])
  category   Category  @relation(fields: [categoryId], references: [id])
  sla        SLA?      @relation(fields: [slaId], references: [id], onDelete: SetNull)
  assignedTo User?     @relation("AssignedTickets", fields: [assignedToId], references: [id], onDelete: SetNull)

  comments   TicketComment[]
  history    TicketHistory[]

  @@map("tickets")
}

model TicketComment {
  id        String   @id @default(uuid())
  ticketId  String
  userId    String?
  content   String
  isInternal Boolean @default(false)
  createdAt DateTime @default(now())

  ticket Ticket @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  @@map("ticket_comments")
}

model TicketHistory {
  id        String   @id @default(uuid())
  ticketId  String
  userId    String?
  action    String
  oldValue  String?
  newValue  String?
  createdAt DateTime @default(now())

  ticket Ticket @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  @@map("ticket_history")
}
EOF

echo -e "${GREEN}✓${NC} Schema PostgreSQL instalado"
echo ""

echo -e "${YELLOW}[10/10]${NC} Gerando Prisma Client e aplicando migrations..."

# Limpar migrations antigas
rm -rf prisma/migrations

# Gerar client
npx prisma generate

# Criar e aplicar migrations
npx prisma migrate dev --name init --skip-seed

# Popular banco com dados
npm run seed

echo -e "${GREEN}✓${NC} Migrations aplicadas e banco populado"
echo ""

echo "========================================="
echo -e "${GREEN}✓ Instalação concluída com sucesso!${NC}"
echo "========================================="
echo ""
echo "📊 Informações do Banco:"
echo "  • Usuário: $DB_USER"
echo "  • Banco: $DB_NAME"
echo "  • Host: localhost:5432"
echo ""
echo "🔗 Connection String:"
echo "  postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public"
echo ""
echo "📝 Próximos passos:"
echo "  1. Reiniciar backend: pm2 restart backend"
echo "  2. Ver logs: pm2 logs backend"
echo "  3. Testar API: curl http://localhost:3001/health"
echo ""
echo "✅ PostgreSQL está pronto para uso!"
echo ""
