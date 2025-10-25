# Como Executar a Instalação do PostgreSQL na VPS

Guia rápido para instalar PostgreSQL na VPS usando o script automatizado.

## 🚀 Método 1: Script Automatizado (Recomendado - 2 minutos)

### Passo 1: Enviar o script para a VPS

**No seu computador local:**

```bash
# Enviar script para VPS
scp install-postgresql-vps.sh root@207.180.205.115:/root/
```

### Passo 2: Conectar na VPS e executar

```bash
# Conectar na VPS
ssh root@207.180.205.115

# Dar permissão de execução
chmod +x /root/install-postgresql-vps.sh

# Executar script
bash /root/install-postgresql-vps.sh
```

O script vai:
1. ✅ Atualizar o sistema
2. ✅ Instalar PostgreSQL
3. ✅ Criar usuário e banco de dados
4. ✅ Configurar permissões
5. ✅ Atualizar schema.prisma
6. ✅ Atualizar .env
7. ✅ Executar migrations
8. ✅ Popular banco com dados iniciais

### Passo 3: Reiniciar o backend

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

## 🔧 Método 2: Manual (Passo a Passo)

Se preferir executar manualmente, siga o guia completo: [INSTALAR_POSTGRESQL_VPS.md](INSTALAR_POSTGRESQL_VPS.md)

---

## ✅ Verificar Instalação

### 1. Verificar PostgreSQL

```bash
# Status do serviço
systemctl status postgresql

# Conectar no banco
psql -U impulso_user -d impulso_tickets -h localhost
# Senha: impulso_password_2025

# Dentro do PostgreSQL
\dt  # Listar tabelas
SELECT COUNT(*) FROM users;  # Deve ter 2 usuários
SELECT COUNT(*) FROM clients;  # Deve ter clientes
\q  # Sair
```

### 2. Verificar Backend

```bash
# Ver status do PM2
pm2 status

# Ver logs do backend
pm2 logs backend --lines 50

# Testar endpoints
curl http://localhost:3001/health
curl http://localhost:3001/api/public/clients
curl http://localhost:3001/api/public/categories
```

### 3. Testar no navegador

Acesse:
- Frontend: http://207.180.205.115:5173
- Login: `admin@impulso.com` / `admin123`

---

## 🔄 Após a Instalação

### Reiniciar todos os serviços

```bash
# Parar tudo
pm2 stop all

# Iniciar backend
cd /root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/backend
pm2 start npm --name "backend" -- run dev

# Iniciar bot do Telegram
cd /root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/telegram-bot
pm2 start npm --name "telegram-bot" -- run dev

# Salvar configuração
pm2 save

# Ver status
pm2 status

# Ver todos os logs
pm2 logs
```

---

## 📊 Informações do Banco

- **Host**: localhost
- **Porta**: 5432
- **Usuário**: impulso_user
- **Senha**: impulso_password_2025
- **Banco**: impulso_tickets

**Connection String:**
```
postgresql://impulso_user:impulso_password_2025@localhost:5432/impulso_tickets?schema=public
```

---

## 🔧 Troubleshooting

### Script falhou na execução

```bash
# Ver o erro completo
bash -x /root/install-postgresql-vps.sh
```

### Backend não conecta ao banco

```bash
# Verificar se PostgreSQL está rodando
systemctl status postgresql

# Verificar .env
cat /root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/backend/.env

# Testar conexão manualmente
psql -U impulso_user -d impulso_tickets -h localhost
```

### Erro de permissão

```bash
# Dar permissões novamente
sudo -u postgres psql -d impulso_tickets << EOF
GRANT ALL ON SCHEMA public TO impulso_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO impulso_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO impulso_user;
EOF
```

### Resetar e reinstalar

```bash
# Remover banco e usuário
sudo -u postgres psql << EOF
DROP DATABASE IF EXISTS impulso_tickets;
DROP USER IF EXISTS impulso_user;
EOF

# Executar script novamente
bash /root/install-postgresql-vps.sh
```

---

## 📝 Arquivos Modificados pelo Script

1. `/root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/backend/.env`
2. `/root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/backend/prisma/schema.prisma`
3. Cria: `.env.backup` e `schema.sqlite.backup`

---

## ✅ Checklist Final

- [ ] Script executado sem erros
- [ ] PostgreSQL instalado e rodando
- [ ] Banco `impulso_tickets` criado
- [ ] Tabelas criadas (8 tabelas)
- [ ] Dados iniciais inseridos (users, clients, categories, slas)
- [ ] Backend reiniciado com PM2
- [ ] API respondendo (teste curl)
- [ ] Frontend acessível
- [ ] Bot do Telegram funcionando

---

**Tempo estimado**: 2-3 minutos com script automatizado

**Documentação completa**:
- [INSTALAR_POSTGRESQL_VPS.md](INSTALAR_POSTGRESQL_VPS.md) - Guia detalhado
- [POSTGRESQL_RESUMO.md](POSTGRESQL_RESUMO.md) - Comandos rápidos
