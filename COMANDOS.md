# Comandos Úteis

## Instalação e Setup

```bash
# Instalar todas as dependências
npm install

# Instalar dependências de cada package individualmente
cd packages/backend && npm install
cd ../frontend && npm install
cd ../telegram-bot && npm install
cd ../..

# Criar arquivo .env em cada package
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env
cp packages/telegram-bot/.env.example packages/telegram-bot/.env
```

## Banco de Dados

```bash
# Criar banco PostgreSQL
createdb impulso_chamados

# Ou via psql
psql -U postgres
CREATE DATABASE impulso_chamados;
\q

# Gerar cliente Prisma
npm run prisma:generate

# Criar/executar migrações
npm run prisma:migrate

# Resetar banco (apaga tudo!)
cd packages/backend
npx prisma migrate reset

# Popular banco com dados iniciais
cd packages/backend
npm run seed

# Abrir Prisma Studio (interface visual)
npm run prisma:studio
# Acesse: http://localhost:5555
```

## Desenvolvimento

```bash
# Iniciar TUDO (backend + frontend + bot)
npm run dev

# Iniciar apenas backend
npm run dev:backend

# Iniciar apenas frontend
npm run dev:frontend

# Iniciar apenas bot
npm run dev:bot

# Build para produção
npm run build

# Build individual
cd packages/backend && npm run build
cd packages/frontend && npm run build
```

## Git

```bash
# Inicializar repositório
git init
git add .
git commit -m "Initial commit: Portal de Chamados"

# Adicionar remote
git remote add origin <sua-url-git>
git push -u origin main

# Ignorar node_modules e .env (já configurado no .gitignore)
# Verificar status
git status

# Criar branch para feature
git checkout -b feature/nova-funcionalidade
git add .
git commit -m "Adiciona nova funcionalidade"
git push origin feature/nova-funcionalidade
```

## PostgreSQL

```bash
# Conectar ao banco
psql -U postgres -d impulso_chamados

# Comandos úteis no psql
\dt                    # Listar tabelas
\d nome_tabela        # Descrever tabela
\l                    # Listar databases
\q                    # Sair

# Backup
pg_dump impulso_chamados > backup.sql
pg_dump impulso_chamados | gzip > backup.sql.gz

# Restaurar
psql impulso_chamados < backup.sql
gunzip -c backup.sql.gz | psql impulso_chamados

# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql  # Linux
brew services list               # Mac
```

## Troubleshooting

```bash
# Verificar portas em uso
lsof -i :3001  # Backend
lsof -i :5173  # Frontend
lsof -i :5432  # PostgreSQL

# Matar processo em porta específica
lsof -ti:3001 | xargs kill -9

# Ver logs do sistema
cd packages/backend && npm run dev    # Ver logs backend
cd packages/telegram-bot && npm run dev # Ver logs bot

# Limpar cache node_modules
rm -rf node_modules packages/*/node_modules
npm install

# Limpar build
rm -rf packages/*/dist packages/frontend/build

# Verificar versões
node -v
npm -v
psql --version
```

## NPM

```bash
# Atualizar dependências
npm update

# Ver dependências desatualizadas
npm outdated

# Instalar nova dependência
cd packages/backend
npm install nome-do-pacote

# Remover dependência
npm uninstall nome-do-pacote

# Limpar cache
npm cache clean --force

# Verificar vulnerabilidades
npm audit
npm audit fix
```

## Docker (Opcional)

```bash
# Criar Dockerfile para backend
cat > packages/backend/Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
CMD ["npm", "start"]
EOF

# Build imagem
cd packages/backend
docker build -t portal-backend .

# Rodar container
docker run -p 3001:3001 --env-file .env portal-backend

# Docker Compose (criar docker-compose.yml na raiz)
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: impulso_chamados
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./packages/backend
    ports:
      - "3001:3001"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/impulso_chamados

volumes:
  postgres_data:
EOF

# Subir tudo com Docker Compose
docker-compose up -d
```

## Testes (Adicionar futuramente)

```bash
# Instalar Jest
cd packages/backend
npm install -D jest @types/jest ts-jest

# Criar config
npx ts-jest config:init

# Rodar testes
npm test

# Testes com coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Produção

```bash
# Build otimizado
npm run build

# Rodar backend em produção
cd packages/backend
npm start

# Rodar com PM2 (process manager)
npm install -g pm2
pm2 start packages/backend/dist/index.js --name backend
pm2 start packages/telegram-bot/dist/index.js --name bot
pm2 save
pm2 startup

# Ver status
pm2 status
pm2 logs
pm2 monit

# Restart
pm2 restart all
pm2 restart backend

# Stop
pm2 stop all
pm2 delete all
```

## Ambiente de Produção

```bash
# Configurar variáveis de ambiente
export NODE_ENV=production
export DATABASE_URL="sua-url-producao"
export JWT_SECRET="secret-super-seguro"

# Ou criar arquivo .env.production
cat > packages/backend/.env.production << 'EOF'
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=seu-secret-aqui
PORT=3001
NODE_ENV=production
EOF

# Rodar com env específico
NODE_ENV=production npm start
```

## Nginx (Reverse Proxy)

```bash
# Instalar Nginx
sudo apt install nginx  # Ubuntu/Debian
brew install nginx      # Mac

# Configurar proxy
sudo nano /etc/nginx/sites-available/portal

# Adicionar:
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}

# Ativar site
sudo ln -s /etc/nginx/sites-available/portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL com Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

## Monitoramento

```bash
# Instalar ferramentas
npm install -g clinic

# Profile CPU
clinic doctor -- node packages/backend/dist/index.js

# Ver uso de memória
node --inspect packages/backend/dist/index.js

# Logs estruturados (Winston)
cd packages/backend
npm install winston
```

## Backup Automático

```bash
# Criar script de backup
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump impulso_chamados | gzip > backup_$DATE.sql.gz
find . -name "backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x backup.sh

# Adicionar ao crontab (todo dia às 2h)
crontab -e
# Adicionar linha:
0 2 * * * /caminho/para/backup.sh
```

## Utilitários

```bash
# Gerar JWT Secret aleatório
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Gerar UUID
node -e "console.log(require('crypto').randomUUID())"

# Hash de senha (bcrypt)
node -e "const bcrypt=require('bcrypt'); bcrypt.hash('senha123', 10).then(console.log)"

# Verificar sintaxe JSON
cat packages/backend/package.json | jq .

# Contar linhas de código
find packages -name "*.ts" -o -name "*.tsx" | xargs wc -l

# Buscar em todos os arquivos
grep -r "palavra" packages/
```

## Análise de Código

```bash
# Instalar ESLint
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Rodar linter
npm run lint

# Fix automático
npm run lint -- --fix

# Prettier (formatação)
npm install -D prettier
npx prettier --write "packages/**/*.{ts,tsx,js,jsx}"
```

## Telegram Bot

```bash
# Ver webhook info
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo

# Deletar webhook (usar polling)
curl https://api.telegram.org/bot<TOKEN>/deleteWebhook

# Set webhook
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -d "url=https://seu-dominio.com/bot<TOKEN>"

# Testar envio de mensagem
curl -X POST https://api.telegram.org/bot<TOKEN>/sendMessage \
  -d "chat_id=SEU_CHAT_ID&text=Teste"
```

## Quick Start (Do Zero)

```bash
# 1. Clone
git clone <repo>
cd impulso-tecnologia-portal

# 2. Instale
npm install

# 3. Configure PostgreSQL
createdb impulso_chamados

# 4. Configure .env (3 arquivos)
# packages/backend/.env
# packages/frontend/.env
# packages/telegram-bot/.env

# 5. Migre banco
npm run prisma:migrate

# 6. Popule dados
cd packages/backend && npm run seed && cd ../..

# 7. Inicie
npm run dev

# 8. Acesse
# http://localhost:5173
# Login: admin@impulso.com / admin123

# 9. Configure bot Telegram
# @BotFather -> /newbot -> copiar token
# Colar no packages/telegram-bot/.env

# 10. Teste!
```

## Atalhos VS Code

Crie arquivo `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Dev: All",
      "type": "npm",
      "script": "dev",
      "problemMatcher": []
    },
    {
      "label": "Dev: Backend",
      "type": "npm",
      "script": "dev:backend",
      "problemMatcher": []
    },
    {
      "label": "Prisma Studio",
      "type": "npm",
      "script": "prisma:studio",
      "problemMatcher": []
    }
  ]
}
```

Use: `Ctrl+Shift+B` para ver tasks.

## Checklist de Deploy

```bash
# [ ] Build passou sem erros
npm run build

# [ ] Testes passando
npm test

# [ ] Variáveis de ambiente configuradas
# [ ] Banco de dados migrado
npm run prisma:migrate

# [ ] SSL/HTTPS configurado
# [ ] Backup configurado
# [ ] Monitoramento ativo
# [ ] Logs funcionando
# [ ] Performance testada
# [ ] Segurança revisada
```
