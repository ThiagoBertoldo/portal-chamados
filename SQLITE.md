# SQLite - Banco de Dados Simplificado

## Por que SQLite?

O projeto foi configurado para usar **SQLite** por padrão, tornando o primeiro acesso muito mais simples:

✅ **Sem instalação** - Não precisa instalar PostgreSQL, MySQL ou outro SGBD
✅ **Arquivo único** - Todo o banco fica em um único arquivo (`dev.db`)
✅ **Portável** - Fácil de mover, copiar e fazer backup
✅ **Zero configuração** - Funciona imediatamente após `npm install`
✅ **Ideal para desenvolvimento** - Perfeito para testar e desenvolver

## Como funciona?

### Localização do Banco

O arquivo do banco SQLite fica em:
```
packages/backend/dev.db
```

Este arquivo é criado automaticamente quando você executa:
```bash
npm run prisma:migrate
```

### Visualizar Dados

Você pode visualizar os dados de 3 formas:

#### 1. Prisma Studio (Recomendado)
```bash
npm run prisma:studio
```
Abre interface visual em: http://localhost:5555

#### 2. SQLite CLI
```bash
cd packages/backend
sqlite3 dev.db

# Comandos úteis:
.tables                  # Listar tabelas
.schema users           # Ver estrutura da tabela users
SELECT * FROM users;    # Consultar dados
.quit                   # Sair
```

#### 3. Extensões VSCode

Instale uma destas extensões:
- **SQLite Viewer** (alexcvzz.vscode-sqlite)
- **SQLite** (qwtel.sqlite)

## Backup e Restore

### Fazer Backup
```bash
# Copiar arquivo
cp packages/backend/dev.db packages/backend/dev.db.backup

# Ou com data
cp packages/backend/dev.db "backup-$(date +%Y%m%d).db"
```

### Restaurar Backup
```bash
cp packages/backend/dev.db.backup packages/backend/dev.db
```

## Resetar Banco de Dados

### Opção 1: Deletar e recriar
```bash
# Deletar banco
rm packages/backend/dev.db

# Recriar
npm run prisma:migrate

# Popular dados
cd packages/backend && npm run seed
```

### Opção 2: Usar Prisma Reset
```bash
cd packages/backend
npx prisma migrate reset
npm run seed
```

## Limitações do SQLite

SQLite é excelente para desenvolvimento, mas tem algumas limitações:

❌ **Não recomendado para alta concorrência** - Muitos usuários simultâneos
❌ **Sem usuários/permissões** - Não tem sistema de usuários do banco
❌ **Sem replicação nativa** - Dificulta alta disponibilidade
❌ **Tipos de dados limitados** - Menos tipos que PostgreSQL

## Migrar para PostgreSQL (Produção)

Se você decidir usar PostgreSQL em produção:

### 1. Instalar PostgreSQL
```bash
# Ubuntu/Debian
sudo apt install postgresql

# macOS
brew install postgresql

# Windows
# Download em: https://www.postgresql.org/download/
```

### 2. Criar Banco
```bash
createdb impulso_chamados
```

### 3. Atualizar Prisma Schema
Edite `packages/backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Mudou aqui
  url      = env("DATABASE_URL")
}
```

### 4. Atualizar .env
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/impulso_chamados"
```

### 5. Recriar Migrações
```bash
cd packages/backend

# Deletar pasta de migrações antigas
rm -rf prisma/migrations

# Criar nova migração para PostgreSQL
npx prisma migrate dev --name init

# Popular dados
npm run seed
```

## Quando usar SQLite vs PostgreSQL?

### Use SQLite se:
- ✅ Desenvolvimento local
- ✅ Testes e protótipos
- ✅ Aplicações pequenas (< 100 usuários simultâneos)
- ✅ Portabilidade é importante
- ✅ Simplicidade é prioridade

### Use PostgreSQL se:
- ✅ Produção com muitos usuários
- ✅ Alta concorrência (> 100 requisições/segundo)
- ✅ Precisa de replicação
- ✅ Recursos avançados (JSON, Full Text Search, etc)
- ✅ Compliance e auditoria rigorosa

## Alternativas

Caso queira experimentar outros bancos:

### MySQL/MariaDB
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/impulso_chamados"
```

### MongoDB (com Prisma)
```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

```env
DATABASE_URL="mongodb://localhost:27017/impulso_chamados"
```

## Dicas

### Performance

SQLite é surpreendentemente rápido para aplicações pequenas/médias:

```sql
-- Criar índices para melhorar buscas
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_client ON tickets(clientId);
```

### Integridade

SQLite suporta transações ACID completas:

```typescript
// Exemplo de transação
await prisma.$transaction([
  prisma.ticket.create({ data: ticketData }),
  prisma.ticketHistory.create({ data: historyData }),
]);
```

### Tamanho do Arquivo

Monitore o tamanho:
```bash
ls -lh packages/backend/dev.db
```

Compacte se necessário:
```bash
sqlite3 dev.db "VACUUM;"
```

## FAQ

**Q: O arquivo dev.db deve ir pro Git?**
A: Não! Ele já está no .gitignore. Cada desenvolvedor cria o seu próprio.

**Q: Posso usar SQLite em produção?**
A: Sim, mas apenas para aplicações pequenas (< 100 usuários simultâneos).

**Q: Como compartilhar dados com a equipe?**
A: Compartilhe o arquivo dev.db diretamente, ou use seed scripts.

**Q: SQLite funciona no Docker?**
A: Sim, perfeitamente! O arquivo fica dentro do container.

**Q: Posso ter múltiplos bancos?**
A: Sim, basta criar arquivos diferentes:
```env
DATABASE_URL="file:./test.db"
DATABASE_URL="file:./staging.db"
```

## Recursos

- [Documentação SQLite](https://www.sqlite.org/docs.html)
- [Prisma + SQLite](https://www.prisma.io/docs/concepts/database-connectors/sqlite)
- [SQLite Tutorial](https://www.sqlitetutorial.net/)

---

**Resumo**: SQLite foi escolhido para facilitar o **primeiro acesso** ao projeto. Para produção com muitos usuários, considere migrar para PostgreSQL seguindo o guia acima.
