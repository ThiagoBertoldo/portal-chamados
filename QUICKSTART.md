# Quick Start - Portal de Chamados

## 🚀 Início Rápido (5 minutos)

### Passo 1: Instalação
```bash
npm install
```

### Passo 2: Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env

# O banco SQLite será criado automaticamente!
# Apenas edite o JWT_SECRET se desejar
```

### Passo 3: Migrar e Popular
```bash
npm run prisma:migrate
cd packages/backend && npm run seed
```

### Passo 4: Iniciar
```bash
npm run dev
```

### Passo 5: Acessar
- **Frontend**: http://localhost:5173
- **Login**: admin@impulso.com / admin123

## 📱 Configurar Bot Telegram (Opcional)

```bash
# 1. Criar bot: @BotFather -> /newbot
# 2. Copiar token
# 3. Configurar
cp packages/telegram-bot/.env.example packages/telegram-bot/.env
# Cole o token em TELEGRAM_BOT_TOKEN
```

## 📚 Documentação

- [README.md](README.md) - Visão geral completa
- [SETUP.md](SETUP.md) - Guia detalhado de instalação
- [API.md](API.md) - Documentação da API REST
- [TELEGRAM_BOT.md](TELEGRAM_BOT.md) - Guia do bot
- [ESTRUTURA.md](ESTRUTURA.md) - Arquitetura do código
- [EXEMPLOS.md](EXEMPLOS.md) - Casos de uso práticos
- [COMANDOS.md](COMANDOS.md) - Comandos úteis
- [RESUMO.md](RESUMO.md) - Resumo executivo

## 🎯 Principais Funcionalidades

- ✅ Dashboard com métricas em tempo real
- ✅ Gestão completa de chamados
- ✅ Bot Telegram para abertura rápida
- ✅ 6 tipos de relatórios gerenciais
- ✅ Controle de SLA e prazos
- ✅ Multi-usuário com permissões
- ✅ Cadastros: Clientes, Categorias, SLAs

## 🛠️ Stack

- **Backend**: Node.js + Express + TypeScript + Prisma
- **Frontend**: React + TypeScript + TailwindCSS
- **Database**: SQLite (sem necessidade de instalação!)
- **Bot**: Telegram Bot API

## 📞 Suporte

Problemas? Consulte:
1. [SETUP.md](SETUP.md) - Guia detalhado
2. [COMANDOS.md](COMANDOS.md) - Troubleshooting
3. Logs: `npm run dev` (veja erros no console)

---
**Status**: ✅ Pronto para uso
**Versão**: 1.0.0
