# Instalação e Configuração do PostgreSQL na VPS

Guia completo para instalar PostgreSQL na VPS e migrar do SQLite.

## 📋 Pré-requisitos

- VPS Ubuntu/Debian (207.180.205.115)
- Acesso root via SSH
- Projeto já instalado na VPS

## 🚀 Passo a Passo

### 1. Conectar na VPS

```bash
ssh root@207.180.205.115
```

### 2. Atualizar o sistema

```bash
apt update
apt upgrade -y
```

### 3. Instalar PostgreSQL

```bash
# Instalar PostgreSQL
apt install postgresql postgresql-contrib -y

# Verificar se está rodando
systemctl status postgresql

# Se não estiver rodando, iniciar
systemctl start postgresql
systemctl enable postgresql
```

### 4. Configurar PostgreSQL

```bash
# Acessar como usuário postgres
sudo -u postgres psql

# Dentro do PostgreSQL, execute:
```

```sql
-- Criar usuário para a aplicação
CREATE USER impulso_user WITH PASSWORD 'impulso_password_2025';

-- Criar banco de dados
CREATE DATABASE impulso_tickets;

-- Dar permissões ao usuário
GRANT ALL PRIVILEGES ON DATABASE impulso_tickets TO impulso_user;

-- Conectar no banco criado
\c impulso_tickets

-- Dar permissões no schema public
GRANT ALL ON SCHEMA public TO impulso_user;

-- Sair
\q
```

### 5. Configurar acesso externo (Opcional)

Se quiser acessar o banco remotamente:

```bash
# Editar pg_hba.conf
nano /etc/postgresql/*/main/pg_hba.conf
```

Adicione no final:
```
# Permitir conexões da aplicação local
host    impulso_tickets    impulso_user    127.0.0.1/32    md5
```

```bash
# Editar postgresql.conf
nano /etc/postgresql/*/main/postgresql.conf
```

Encontre e descomente/altere:
```
listen_addresses = 'localhost'
```

```bash
# Reiniciar PostgreSQL
systemctl restart postgresql
```

### 6. Testar Conexão

```bash
# Testar login
psql -U impulso_user -d impulso_tickets -h localhost

# Senha: impulso_password_2025

# Se conectou, tudo certo! Sair:
\q
```

## 🔧 Configurar o Backend

### 1. Navegar até o diretório do backend

```bash
cd /root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/backend
```

### 2. Fazer backup do schema atual

```bash
cp prisma/schema.prisma prisma/schema.sqlite.backup
```

### 3. Atualizar schema.prisma para PostgreSQL

```bash
nano prisma/schema.prisma
```

Substitua o conteúdo por:

```prisma
// Prisma schema para PostgreSQL

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enums nativos do PostgreSQL
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
```

**Salvar**: `Ctrl + O`, `Enter`, `Ctrl + X`

### 4. Atualizar .env do backend

```bash
nano .env
```

Atualizar a linha DATABASE_URL:

```env
DATABASE_URL="postgresql://impulso_user:impulso_password_2025@localhost:5432/impulso_tickets?schema=public"
JWT_SECRET="seu-secret-super-seguro-aqui-troque-por-um-valor-aleatorio"
PORT=3001
NODE_ENV=production
```

**Salvar**: `Ctrl + O`, `Enter`, `Ctrl + X`

### 5. Gerar novo Prisma Client

```bash
npx prisma generate
```

### 6. Criar as migrations

```bash
# Resetar migrations (cuidado: isso apaga dados!)
rm -rf prisma/migrations

# Criar nova migration inicial
npx prisma migrate dev --name init

# Ou para produção:
npx prisma migrate deploy
```

### 7. Popular banco com dados iniciais

```bash
npm run seed
```

### 8. Reiniciar o backend

```bash
# Parar backend
pm2 stop backend

# Reiniciar
pm2 start npm --name "backend" -- run dev

# Ou se preferir produção:
pm2 start npm --name "backend" -- run start

# Salvar configuração
pm2 save

# Ver logs
pm2 logs backend
```

## ✅ Verificar Instalação

### 1. Testar conexão do backend

```bash
# Ver logs do backend
pm2 logs backend

# Testar API
curl http://localhost:3001/health
curl http://localhost:3001/api/public/clients
```

### 2. Verificar banco de dados

```bash
# Conectar no PostgreSQL
psql -U impulso_user -d impulso_tickets -h localhost

# Listar tabelas
\dt

# Ver usuários
SELECT * FROM users;

# Ver clientes
SELECT * FROM clients;

# Sair
\q
```

### 3. Testar Prisma Studio

```bash
cd /root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/backend
npx prisma studio
```

Acesse: http://207.180.205.115:5555

## 🔄 Migrar Dados do SQLite (Opcional)

Se você já tem dados no SQLite e quer migrar:

```bash
# Instalar sqlite3
apt install sqlite3 -y

# Exportar dados do SQLite
cd /root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/backend/prisma

# Exportar tabela users
sqlite3 dev.db ".mode insert users" ".output users.sql" "SELECT * FROM users;" ".exit"

# Importar no PostgreSQL
psql -U impulso_user -d impulso_tickets -h localhost < users.sql

# Repetir para cada tabela: clients, categories, slas, tickets, etc.
```

## 🔒 Segurança

### 1. Criar senha forte

```bash
# Gerar senha aleatória
openssl rand -base64 32
```

Use essa senha no .env e no PostgreSQL.

### 2. Proteger arquivos

```bash
chmod 600 /root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/backend/.env
```

### 3. Configurar firewall

```bash
# PostgreSQL não precisa estar acessível externamente
# Apenas localhost
ufw deny 5432
```

## 📊 Comandos Úteis PostgreSQL

```bash
# Status do serviço
systemctl status postgresql

# Reiniciar
systemctl restart postgresql

# Ver logs
tail -f /var/log/postgresql/postgresql-*-main.log

# Conectar no banco
psql -U impulso_user -d impulso_tickets -h localhost

# Backup do banco
pg_dump -U impulso_user -h localhost impulso_tickets > backup.sql

# Restaurar backup
psql -U impulso_user -h localhost impulso_tickets < backup.sql
```

## 🔧 Troubleshooting

### Erro: "peer authentication failed"

Edite `/etc/postgresql/*/main/pg_hba.conf`:

```
# Mudar de:
local   all             all                                     peer

# Para:
local   all             all                                     md5
```

Reinicie: `systemctl restart postgresql`

### Erro: "password authentication failed"

```bash
# Resetar senha do usuário
sudo -u postgres psql
ALTER USER impulso_user WITH PASSWORD 'nova_senha';
\q
```

Atualize o .env com a nova senha.

### Backend não conecta

```bash
# Verificar se PostgreSQL está rodando
systemctl status postgresql

# Verificar se o banco existe
sudo -u postgres psql -l | grep impulso_tickets

# Testar conexão manualmente
psql -U impulso_user -d impulso_tickets -h localhost
```

## 📝 Checklist Final

- [ ] PostgreSQL instalado e rodando
- [ ] Usuário `impulso_user` criado
- [ ] Banco `impulso_tickets` criado
- [ ] Permissões configuradas
- [ ] schema.prisma atualizado para PostgreSQL
- [ ] .env atualizado com connection string
- [ ] `npx prisma generate` executado
- [ ] Migrations criadas e aplicadas
- [ ] Seed executado com sucesso
- [ ] Backend reiniciado e funcionando
- [ ] API respondendo corretamente
- [ ] Bot do Telegram funcionando

## 🎯 Connection String

```
postgresql://impulso_user:impulso_password_2025@localhost:5432/impulso_tickets?schema=public
```

**Componentes:**
- **Protocolo**: postgresql://
- **Usuário**: impulso_user
- **Senha**: impulso_password_2025
- **Host**: localhost
- **Porta**: 5432 (padrão do PostgreSQL)
- **Banco**: impulso_tickets
- **Schema**: public

---

**Última atualização**: 2025-10-25
**VPS**: 207.180.205.115
