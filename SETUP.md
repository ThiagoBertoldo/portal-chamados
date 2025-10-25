# Guia de Instalação - Portal de Chamados

Este guia irá ajudá-lo a configurar e executar o Portal de Chamados da Impulso Tecnologia.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (vem com Node.js)

**Apenas isso!** O banco de dados SQLite será criado automaticamente, sem necessidade de instalação adicional.

## Passo 1: Instalação de Dependências

### 1.1. Instalar dependências raiz

```bash
npm install
```

### 1.2. Instalar dependências de cada pacote

```bash
cd packages/backend && npm install
cd ../frontend && npm install
cd ../telegram-bot && npm install
cd ../..
```

## Passo 2: Configurar Variáveis de Ambiente

### 2.1. Backend

Copie o arquivo de exemplo:

```bash
cp packages/backend/.env.example packages/backend/.env
```

O arquivo já vem configurado com SQLite. Você pode usá-lo como está:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="seu-secret-super-seguro-aqui-gere-um-aleatorio"
PORT=3001
NODE_ENV=development
```

**Opcional - Gerar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.2. Frontend

```bash
cp packages/frontend/.env.example packages/frontend/.env
```

O arquivo já vem configurado corretamente:

```env
VITE_API_URL=http://localhost:3001
```

## Passo 3: Executar Migrações do Banco

```bash
npm run prisma:migrate
```

Quando solicitado, dê um nome para a migração (ex: "init").

**O arquivo `dev.db` será criado automaticamente no diretório `packages/backend/`!**

## Passo 4: Popular Banco de Dados (Seed)

```bash
cd packages/backend
npm run seed
```

Isso criará:
- ✅ Usuário Admin: `admin@impulso.com` / `admin123`
- ✅ Usuário Atendente: `atendente@impulso.com` / `atendente123`
- ✅ 5 Categorias padrão
- ✅ 4 SLAs padrão
- ✅ 3 Clientes de exemplo

## Passo 5: Configurar Frontend

### 5.1. Configurar variáveis de ambiente

```bash
cp packages/frontend/.env.example packages/frontend/.env
```

Edite `packages/frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

## Passo 6: Configurar Bot do Telegram

### 6.1. Obter Token do Bot

1. Abra o Telegram e procure por **@BotFather**
2. Envie o comando `/newbot`
3. Escolha um nome para o bot (ex: "Portal Chamados Impulso")
4. Escolha um username (deve terminar com 'bot', ex: "impulso_chamados_bot")
5. Copie o token fornecido

### 6.2. Configurar variáveis de ambiente

```bash
cp packages/telegram-bot/.env.example packages/telegram-bot/.env
```

Edite `packages/telegram-bot/.env`:

```env
TELEGRAM_BOT_TOKEN=seu-token-aqui
API_URL=http://localhost:3001
```

### 6.3. Criar usuário para o bot (Opcional)

Para que o bot possa criar chamados sem problemas de autenticação, crie um usuário específico:

```bash
# No Prisma Studio ou via API
# Email: bot@impulso.com
# Password: bot123
# Role: ATTENDANT
```

## Passo 7: Executar o Projeto

### Opção 1: Executar tudo de uma vez

```bash
npm run dev
```

Isso iniciará:
- Backend (porta 3001)
- Frontend (porta 5173)
- Bot Telegram

### Opção 2: Executar individualmente

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

**Terminal 3 - Bot Telegram:**
```bash
npm run dev:bot
```

## Passo 8: Acessar o Sistema

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

### Credenciais de Acesso

**Administrador:**
- Email: `admin@impulso.com`
- Senha: `admin123`

**Atendente:**
- Email: `atendente@impulso.com`
- Senha: `atendente123`

## Passo 9: Testar o Bot Telegram

1. Abra o Telegram
2. Procure pelo seu bot (username que você criou)
3. Envie `/start` para iniciar
4. Envie `/novo` para criar um chamado
5. Siga o fluxo guiado

## Ferramentas Úteis

### Prisma Studio (Interface visual do banco)

```bash
npm run prisma:studio
```

Acesse: http://localhost:5555

### Ver logs do Backend

```bash
cd packages/backend
npm run dev
```

### Build para Produção

```bash
npm run build
```

## Estrutura de Portas

| Serviço | Porta | URL |
|---------|-------|-----|
| Backend | 3001 | http://localhost:3001 |
| Frontend | 5173 | http://localhost:5173 |
| Prisma Studio | 5555 | http://localhost:5555 |
| PostgreSQL | 5432 | - |

## Troubleshooting

### Erro: "DATABASE_URL não está definida"
- Verifique se o arquivo `.env` existe em `packages/backend/`
- Verifique se DATABASE_URL está corretamente configurada

### Erro: "Cannot connect to database"
- Verifique se o PostgreSQL está rodando
- Verifique se o banco `impulso_chamados` foi criado
- Verifique usuário e senha no DATABASE_URL

### Erro: "Port 3001 already in use"
- Altere a porta no `packages/backend/.env`
- Ou mate o processo: `lsof -ti:3001 | xargs kill -9`

### Bot Telegram não responde
- Verifique se o token está correto
- Verifique se o bot está rodando (`npm run dev:bot`)
- Verifique se a API está acessível

### Frontend não conecta na API
- Verifique se o backend está rodando
- Verifique a URL no `packages/frontend/.env`
- Verifique CORS no backend

## Próximos Passos

Após a instalação, você pode:

1. ✅ Fazer login no sistema
2. ✅ Cadastrar novos clientes
3. ✅ Cadastrar novas categorias
4. ✅ Configurar SLAs
5. ✅ Criar usuários adicionais
6. ✅ Testar a criação de chamados via Telegram
7. ✅ Explorar os relatórios

## Suporte

Para problemas ou dúvidas:
- Verifique a documentação no [README.md](README.md)
- Revise este guia de setup
- Verifique os logs dos serviços
