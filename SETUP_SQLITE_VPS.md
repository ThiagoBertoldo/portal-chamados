# Configuração SQLite na VPS

Guia para configurar SQLite na VPS **207.180.205.115**

## 🚀 Por que SQLite?

- ✅ **Simples**: Sem servidor de banco de dados separado
- ✅ **Rápido**: Perfeito para aplicações pequenas/médias
- ✅ **Zero configuração**: Apenas um arquivo
- ✅ **Confiável**: Usado por milhões de aplicações
- ✅ **Backup fácil**: Copiar um único arquivo
- ✅ **Sem autenticação**: Sem problemas de senha

## 📋 Método Automatizado (1 minuto)

### Passo 1: Enviar script para VPS

**No seu computador local:**

```bash
cd /home/thiago-bertoldo/Documentos/VSCode/portal-chamados
scp setup-sqlite-vps.sh root@207.180.205.115:/root/
```

### Passo 2: Executar na VPS

```bash
# Conectar na VPS
ssh root@207.180.205.115

# Executar script
bash /root/setup-sqlite-vps.sh
```

### Passo 3: Reiniciar Backend

```bash
# Reiniciar backend
pm2 restart backend

# Ver logs
pm2 logs backend

# Testar API
curl http://localhost:3001/health
curl http://localhost:3001/api/public/clients
```

---

## 🔧 Método Manual

Se preferir fazer passo a passo:

### 1. Instalar SQLite3

```bash
ssh root@207.180.205.115

apt update
apt install -y sqlite3
sqlite3 --version
```

### 2. Configurar .env

```bash
cd /root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/backend

# Editar .env
nano .env
```

**Conteúdo do .env:**
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="seu-secret-super-seguro-aqui-troque-por-um-valor-aleatorio"
PORT=3001
NODE_ENV=production
```

### 3. Limpar e recriar banco

```bash
# Remover banco antigo
rm -f prisma/dev.db prisma/dev.db-journal

# Remover migrations antigas
rm -rf prisma/migrations

# Gerar Prisma Client
npx prisma generate

# Criar migrations
npx prisma migrate dev --name init

# Popular banco
npm run seed
```

### 4. Reiniciar aplicação

```bash
pm2 restart backend
pm2 logs backend
```

---

## ✅ Verificar Instalação

### 1. Verificar arquivo do banco

```bash
cd /root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/backend

# Ver tamanho do banco
ls -lh prisma/dev.db

# Conectar no banco
sqlite3 prisma/dev.db

# Dentro do SQLite:
.tables                    # Listar tabelas
.schema users             # Ver estrutura da tabela users
SELECT * FROM users;      # Ver usuários
.quit                     # Sair
```

### 2. Testar API

```bash
# Health check
curl http://localhost:3001/health

# Listar clientes
curl http://localhost:3001/api/public/clients

# Listar categorias
curl http://localhost:3001/api/public/categories
```

### 3. Ver dados criados

```bash
sqlite3 prisma/dev.db << 'EOF'
.mode column
.headers on
SELECT 'Tabela' as tipo, 'Registros' as qtd;
SELECT 'users', COUNT(*) FROM users;
SELECT 'clients', COUNT(*) FROM clients;
SELECT 'categories', COUNT(*) FROM categories;
SELECT 'slas', COUNT(*) FROM slas;
EOF
```

---

## 📊 Informações do Banco

- **Tipo**: SQLite
- **Localização**: `/root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/backend/prisma/dev.db`
- **Connection String**: `file:./dev.db`

---

## 🔄 Backup do Banco

### Criar backup

```bash
cd /root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/backend/prisma

# Backup simples
cp dev.db dev.db.backup

# Backup com data
cp dev.db backup_$(date +%Y%m%d_%H%M%S).db

# Backup compactado
tar -czf backup_$(date +%Y%m%d_%H%M%S).tar.gz dev.db
```

### Restaurar backup

```bash
cd /root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/backend/prisma

# Parar backend
pm2 stop backend

# Restaurar
cp dev.db.backup dev.db

# Reiniciar
pm2 start backend
```

### Baixar backup para seu PC

```bash
# No seu PC local
scp root@207.180.205.115:/root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/backend/prisma/dev.db ./backup-vps.db
```

---

## 📈 Comandos Úteis SQLite

### Conectar no banco

```bash
cd /root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/backend
sqlite3 prisma/dev.db
```

### Comandos dentro do SQLite

```sql
.tables                          -- Listar todas as tabelas
.schema                          -- Ver estrutura de todas as tabelas
.schema users                    -- Ver estrutura de uma tabela
.mode column                     -- Modo coluna (melhor visualização)
.headers on                      -- Mostrar cabeçalhos
SELECT * FROM users;             -- Ver usuários
SELECT * FROM clients;           -- Ver clientes
SELECT COUNT(*) FROM tickets;    -- Contar tickets
.quit                           -- Sair
```

### Queries úteis

```sql
-- Ver todos os usuários
SELECT email, name, role FROM users;

-- Ver todos os clientes ativos
SELECT name, email, phone FROM clients WHERE active = 1;

-- Ver categorias
SELECT name, description FROM categories;

-- Ver chamados recentes
SELECT id, title, status, createdAt FROM tickets ORDER BY createdAt DESC LIMIT 10;

-- Estatísticas
SELECT status, COUNT(*) as total FROM tickets GROUP BY status;
```

---

## 🔧 Troubleshooting

### Backend não inicia

```bash
# Ver logs detalhados
pm2 logs backend --lines 100

# Verificar se arquivo existe
ls -la /root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/backend/prisma/dev.db

# Verificar permissões
chmod 644 prisma/dev.db
```

### Banco corrompido

```bash
# Verificar integridade
sqlite3 prisma/dev.db "PRAGMA integrity_check;"

# Se corrompido, restaurar backup
pm2 stop backend
cp dev.db.backup dev.db
pm2 start backend
```

### Resetar banco completamente

```bash
cd /root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/backend

# Parar backend
pm2 stop backend

# Remover banco
rm -f prisma/dev.db prisma/dev.db-journal
rm -rf prisma/migrations

# Recriar
npx prisma migrate dev --name init
npm run seed

# Reiniciar
pm2 start backend
```

---

## 📝 Dados Iniciais (Seed)

Após o seed, você terá:

**Usuários:**
- `admin@impulso.com` / `admin123` (ADMIN)
- `atendente@impulso.com` / `atendente123` (ATTENDANT)

**Clientes:**
- João Silva
- Maria Santos
- Empresa ABC Ltda
- Petmania

**Categorias:**
- Suporte Técnico
- Financeiro
- Comercial
- Infraestrutura
- Outros

**SLAs:**
- Crítico (2h resposta / 4h resolução)
- Alto (4h resposta / 8h resolução)
- Médio (8h resposta / 24h resolução)
- Baixo (24h resposta / 72h resolução)

---

## ✅ Checklist Final

- [ ] SQLite3 instalado na VPS
- [ ] .env configurado com `file:./dev.db`
- [ ] Banco dev.db criado
- [ ] Migrations aplicadas (8 tabelas criadas)
- [ ] Seed executado (dados iniciais inseridos)
- [ ] Backend reiniciado com PM2
- [ ] API respondendo em http://localhost:3001/health
- [ ] Endpoints públicos funcionando
- [ ] Bot do Telegram funcionando
- [ ] Frontend acessível

---

## 🎯 Comparação: SQLite vs PostgreSQL

| Aspecto | SQLite | PostgreSQL |
|---------|--------|------------|
| **Instalação** | ✅ Simples | ❌ Complexa |
| **Configuração** | ✅ Automática | ❌ Manual |
| **Autenticação** | ✅ Sem senha | ❌ Usuário/senha |
| **Backup** | ✅ Copiar arquivo | ❌ pg_dump |
| **Performance** | ✅ Rápido (até 100k req/dia) | ⚡ Muito rápido |
| **Escalabilidade** | ⚠️ Limitada | ✅ Excelente |
| **Recursos** | ⚠️ Básicos | ✅ Avançados |
| **Recomendado para** | ✅ Esta aplicação | ⚠️ Apps grandes |

**Conclusão**: Para o Portal de Chamados, SQLite é perfeito! ✅

---

**Tempo estimado**: 1-2 minutos com script automatizado

**Script**: [setup-sqlite-vps.sh](setup-sqlite-vps.sh)
