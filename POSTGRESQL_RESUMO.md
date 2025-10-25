# PostgreSQL - Resumo Rápido de Comandos

Guia rápido para instalar PostgreSQL na VPS **207.180.205.115**

## 🚀 Instalação Rápida (5 minutos)

```bash
# 1. Conectar na VPS
ssh root@207.180.205.115

# 2. Instalar PostgreSQL
apt update && apt install postgresql postgresql-contrib -y

# 3. Configurar banco
sudo -u postgres psql << EOF
CREATE USER impulso_user WITH PASSWORD 'impulso_password_2025';
CREATE DATABASE impulso_tickets;
GRANT ALL PRIVILEGES ON DATABASE impulso_tickets TO impulso_user;
\c impulso_tickets
GRANT ALL ON SCHEMA public TO impulso_user;
\q
EOF

# 4. Testar conexão
psql -U impulso_user -d impulso_tickets -h localhost
# Senha: impulso_password_2025
# Se conectou: \q para sair

# 5. Configurar Backend
cd /root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/backend

# 6. Backup do schema atual
cp prisma/schema.prisma prisma/schema.sqlite.backup

# 7. Atualizar .env
nano .env
# Mudar DATABASE_URL para:
# DATABASE_URL="postgresql://impulso_user:impulso_password_2025@localhost:5432/impulso_tickets?schema=public"

# 8. Copiar novo schema
# (Copie o conteúdo do arquivo schema.postgresql.prisma para schema.prisma)

# 9. Aplicar migrations
npx prisma generate
npx prisma migrate dev --name init

# 10. Popular com dados
npm run seed

# 11. Reiniciar backend
pm2 restart backend
pm2 logs backend

# 12. Testar
curl http://localhost:3001/health
curl http://localhost:3001/api/public/clients
```

## 📝 Connection String

```
postgresql://impulso_user:impulso_password_2025@localhost:5432/impulso_tickets?schema=public
```

## 🔧 Comandos Úteis

```bash
# Ver status
systemctl status postgresql

# Conectar no banco
psql -U impulso_user -d impulso_tickets -h localhost

# Ver tabelas
psql -U impulso_user -d impulso_tickets -h localhost -c "\dt"

# Backup
pg_dump -U impulso_user -h localhost impulso_tickets > backup_$(date +%Y%m%d).sql

# Restaurar
psql -U impulso_user -h localhost impulso_tickets < backup.sql

# Logs PostgreSQL
tail -f /var/log/postgresql/postgresql-*-main.log
```

## ✅ Checklist

- [ ] PostgreSQL instalado
- [ ] Usuário e banco criados
- [ ] .env atualizado
- [ ] schema.prisma atualizado
- [ ] Migrations aplicadas
- [ ] Seed executado
- [ ] Backend reiniciado
- [ ] API testada

## 📚 Documentação Completa

Veja [INSTALAR_POSTGRESQL_VPS.md](INSTALAR_POSTGRESQL_VPS.md) para guia detalhado.

---

**VPS**: 207.180.205.115
**Usuário**: impulso_user
**Banco**: impulso_tickets
