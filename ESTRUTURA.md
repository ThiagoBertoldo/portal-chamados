# Estrutura do Projeto

```
impulso-tecnologia-portal/
│
├── packages/
│   │
│   ├── backend/                      # API REST (Node.js + Express + TypeScript)
│   │   ├── prisma/
│   │   │   └── schema.prisma         # Schema do banco de dados
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── database.ts       # Configuração Prisma
│   │   │   │   └── env.ts            # Variáveis de ambiente
│   │   │   ├── controllers/          # Lógica de negócio
│   │   │   │   ├── authController.ts
│   │   │   │   ├── clientController.ts
│   │   │   │   ├── categoryController.ts
│   │   │   │   ├── slaController.ts
│   │   │   │   ├── userController.ts
│   │   │   │   ├── ticketController.ts
│   │   │   │   └── reportController.ts
│   │   │   ├── middlewares/          # Middlewares Express
│   │   │   │   ├── auth.ts           # Autenticação JWT
│   │   │   │   └── errorHandler.ts
│   │   │   ├── routes/               # Rotas da API
│   │   │   │   ├── index.ts
│   │   │   │   ├── authRoutes.ts
│   │   │   │   ├── clientRoutes.ts
│   │   │   │   ├── categoryRoutes.ts
│   │   │   │   ├── slaRoutes.ts
│   │   │   │   ├── userRoutes.ts
│   │   │   │   ├── ticketRoutes.ts
│   │   │   │   └── reportRoutes.ts
│   │   │   ├── types/
│   │   │   │   └── express.d.ts      # Tipos TypeScript
│   │   │   ├── utils/
│   │   │   │   ├── password.ts       # Hash de senhas
│   │   │   │   └── jwt.ts            # Geração de tokens
│   │   │   ├── index.ts              # Entry point
│   │   │   └── seed.ts               # Popular banco
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── frontend/                     # Dashboard Web (React + TypeScript)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   └── Layout.tsx        # Layout principal
│   │   │   ├── contexts/
│   │   │   │   └── AuthContext.tsx   # Context de autenticação
│   │   │   ├── pages/                # Páginas da aplicação
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Clients.tsx
│   │   │   │   ├── Categories.tsx
│   │   │   │   ├── SLAs.tsx
│   │   │   │   ├── Users.tsx
│   │   │   │   ├── Tickets.tsx
│   │   │   │   └── Reports.tsx
│   │   │   ├── services/
│   │   │   │   └── api.ts            # Cliente Axios
│   │   │   ├── styles/
│   │   │   │   └── index.css         # Estilos globais
│   │   │   ├── types/
│   │   │   │   └── index.ts          # Tipos TypeScript
│   │   │   ├── App.tsx               # Componente raiz
│   │   │   ├── main.tsx              # Entry point
│   │   │   └── vite-env.d.ts
│   │   ├── index.html
│   │   ├── .env.example
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   └── postcss.config.js
│   │
│   └── telegram-bot/                 # Bot Telegram (Node.js + TypeScript)
│       ├── src/
│       │   ├── config/
│       │   │   └── env.ts            # Variáveis de ambiente
│       │   ├── services/
│       │   │   └── api.ts            # Cliente API
│       │   ├── types/
│       │   │   └── index.ts          # Tipos TypeScript
│       │   └── index.ts              # Entry point + lógica bot
│       ├── .env.example
│       ├── package.json
│       └── tsconfig.json
│
├── .gitignore
├── package.json                      # Workspace raiz
├── README.md                         # Documentação principal
├── SETUP.md                          # Guia de instalação
├── API.md                            # Documentação da API
├── TELEGRAM_BOT.md                   # Guia do bot
└── ESTRUTURA.md                      # Este arquivo
```

## Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Superset do JavaScript
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação via tokens
- **bcrypt** - Hash de senhas

### Frontend
- **React** - Library UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **TailwindCSS** - Framework CSS
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones

### Bot Telegram
- **Node.js** - Runtime
- **TypeScript** - Tipagem
- **node-telegram-bot-api** - SDK Telegram
- **Axios** - Cliente HTTP

## Modelos do Banco de Dados

### User
- Usuários do sistema
- Roles: ADMIN, ATTENDANT, VIEWER

### Client
- Clientes que abrem chamados
- Informações de contato

### Category
- Categorias de chamados
- Ex: Suporte Técnico, Financeiro

### SLA
- Service Level Agreements
- Tempos de resposta e resolução

### Ticket
- Chamados/tickets
- Status, prioridade, prazos

### TicketComment
- Comentários em chamados
- Podem ser internos ou públicos

### TicketHistory
- Histórico de alterações
- Auditoria de mudanças

## Fluxo de Dados

### Criação de Chamado via Telegram

```
Usuário Telegram
    ↓
Bot Telegram (/novo)
    ↓
Seleciona Cliente
    ↓
Seleciona Categoria
    ↓
Digite Descrição
    ↓
Bot → API Backend (POST /api/tickets)
    ↓
Backend valida dados
    ↓
Backend busca SLA por categoria
    ↓
Backend calcula prazos
    ↓
Backend salva no PostgreSQL
    ↓
Backend retorna ticket criado
    ↓
Bot confirma para usuário
```

### Login no Portal Web

```
Usuário acessa /login
    ↓
Digita email/senha
    ↓
Frontend → API (POST /api/auth/login)
    ↓
Backend valida credenciais
    ↓
Backend gera JWT token
    ↓
Backend retorna user + token
    ↓
Frontend salva no localStorage
    ↓
Frontend redireciona para Dashboard
```

### Geração de Relatórios

```
Usuário acessa /reports
    ↓
Seleciona tipo de relatório
    ↓
Define filtros (datas, cliente, etc)
    ↓
Frontend → API (GET /api/reports/*)
    ↓
Backend consulta banco com agregações
    ↓
Backend processa dados
    ↓
Backend retorna JSON formatado
    ↓
Frontend renderiza gráficos/tabelas
```

## Padrões de Código

### Backend
- **Controllers**: Lógica de negócio e validação
- **Routes**: Definição de endpoints e middlewares
- **Services**: Lógica reutilizável (futuro)
- **Middlewares**: Autenticação, validação, erros

### Frontend
- **Components**: Componentes reutilizáveis
- **Pages**: Páginas completas da aplicação
- **Contexts**: Estado global (Auth)
- **Services**: Comunicação com API

### Convenções
- **camelCase** para variáveis e funções
- **PascalCase** para componentes React e tipos
- **kebab-case** para arquivos CSS
- **UPPER_CASE** para constantes e enums

## Variáveis de Ambiente

### Backend (.env)
```env
DATABASE_URL=
JWT_SECRET=
PORT=3001
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

### Bot Telegram (.env)
```env
TELEGRAM_BOT_TOKEN=
API_URL=http://localhost:3001
```

## Scripts Disponíveis

### Raiz do Projeto
```bash
npm run dev              # Inicia todos os serviços
npm run dev:backend      # Apenas backend
npm run dev:frontend     # Apenas frontend
npm run dev:bot          # Apenas bot
npm run build            # Build produção
npm run prisma:migrate   # Executar migrações
npm run prisma:studio    # Interface visual DB
npm run prisma:generate  # Gerar cliente Prisma
```

### Backend
```bash
npm run dev              # Modo desenvolvimento
npm run build            # Compilar TypeScript
npm run start            # Rodar produção
npm run seed             # Popular banco
```

### Frontend
```bash
npm run dev              # Servidor dev (HMR)
npm run build            # Build produção
npm run preview          # Preview build
```

### Bot Telegram
```bash
npm run dev              # Modo desenvolvimento
npm run build            # Compilar TypeScript
npm run start            # Rodar produção
```

## Portas Padrão

| Serviço | Porta |
|---------|-------|
| Backend API | 3001 |
| Frontend Web | 5173 |
| Prisma Studio | 5555 |
| PostgreSQL | 5432 |

## Segurança

### Implementado
- ✅ Autenticação JWT
- ✅ Hash de senhas (bcrypt)
- ✅ CORS configurado
- ✅ Validação de inputs
- ✅ Rate limiting (pode implementar)
- ✅ Roles de usuário

### Recomendações Produção
- Usar HTTPS
- Configurar rate limiting
- Implementar logs de auditoria
- Backups automáticos do banco
- Monitoramento de erros
- Validação de tokens Telegram
