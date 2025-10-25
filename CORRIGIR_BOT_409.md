# Como Corrigir Erro 409 do Bot Telegram

## 🔴 Problema

```
Error 409 Conflict: terminated by other getUpdates request
make sure that only one bot instance is running
```

Este erro ocorre quando **há mais de uma instância do bot tentando se conectar ao mesmo tempo**.

## ✅ Solução Rápida

### Passo 1: Conectar na VPS

```bash
ssh root@207.180.205.115
```

### Passo 2: Parar TODAS as instâncias do bot

Execute os comandos abaixo para encontrar e parar todos os processos:

```bash
# Verificar processos do bot
ps aux | grep telegram
ps aux | grep tsx

# Parar com PM2 (se estiver usando)
pm2 list
pm2 stop telegram-bot
pm2 delete telegram-bot
pm2 kill

# Matar processos manualmente
pkill -f "telegram-bot"
pkill -f "tsx.*index.ts"
pkill -9 -f "telegram"

# Verificar se parou
ps aux | grep telegram
# Deve retornar vazio ou apenas o próprio grep
```

### Passo 3: Limpar webhooks do Telegram (importante!)

Às vezes o bot fica "preso" mesmo sem processo rodando. Execute:

```bash
# Método 1: Via curl
curl -X POST "https://api.telegram.org/bot8349176809:AAEnM6AaRBOppMBQUJJ_2Uz-mbB9x_HNeE4/deleteWebhook?drop_pending_updates=true"

# Método 2: Via navegador
# Abra no navegador:
# https://api.telegram.org/bot8349176809:AAEnM6AaRBOppMBQUJJ_2Uz-mbB9x_HNeE4/deleteWebhook?drop_pending_updates=true
```

Você deve ver uma resposta como:
```json
{"ok":true,"result":true,"description":"Webhook was deleted"}
```

### Passo 4: Reiniciar o bot

Agora você pode iniciar o bot normalmente:

```bash
# Na VPS, no diretório do bot
cd /var/www/portal-chamados/packages/telegram-bot

# Verificar .env
cat .env
# Deve mostrar:
# TELEGRAM_BOT_TOKEN=8349176809:AAEnM6AaRBOppMBQUJJ_2Uz-mbB9x_HNeE4
# API_URL=http://localhost:3001

# Iniciar com PM2
pm2 start npm --name "telegram-bot" -- run dev
pm2 save

# OU iniciar com o script
bash start-bot.sh

# Ver logs
pm2 logs telegram-bot
```

## 🔍 Verificar Status

```bash
# Ver processos
pm2 status

# Ver logs em tempo real
pm2 logs telegram-bot --lines 50

# Verificar se bot está respondendo
# Abra o Telegram e envie /start para o bot
```

## 🎯 Comandos Úteis para Telegram API

### Ver informações do bot
```bash
curl "https://api.telegram.org/bot8349176809:AAEnM6AaRBOppMBQUJJ_2Uz-mbB9x_HNeE4/getMe"
```

### Ver webhook atual
```bash
curl "https://api.telegram.org/bot8349176809:AAEnM6AaRBOppMBQUJJ_2Uz-mbB9x_HNeE4/getWebhookInfo"
```

### Deletar webhook
```bash
curl -X POST "https://api.telegram.org/bot8349176809:AAEnM6AaRBOppMBQUJJ_2Uz-mbB9x_HNeE4/deleteWebhook?drop_pending_updates=true"
```

### Ver atualizações pendentes
```bash
curl "https://api.telegram.org/bot8349176809:AAEnM6AaRBOppMBQUJJ_2Uz-mbB9x_HNeE4/getUpdates"
```

## 🔧 Troubleshooting Avançado

### Se o erro persistir após parar todos os processos:

1. **Limpar webhooks novamente:**
   ```bash
   curl -X POST "https://api.telegram.org/bot8349176809:AAEnM6AaRBOppMBQUJJ_2Uz-mbB9x_HNeE4/deleteWebhook?drop_pending_updates=true"
   ```

2. **Aguardar 30 segundos** antes de reiniciar o bot

3. **Verificar se há bot rodando em outro servidor:**
   - Você pode ter outra instância rodando no seu PC local
   - Ou em outro servidor
   - Verifique todos os locais onde você iniciou o bot

4. **Resetar conexão do Telegram:**
   ```bash
   # Fazer logout forçado
   curl -X POST "https://api.telegram.org/bot8349176809:AAEnM6AaRBOppMBQUJJ_2Uz-mbB9x_HNeE4/logOut"

   # Aguardar 10 segundos
   sleep 10

   # Deletar webhook novamente
   curl -X POST "https://api.telegram.org/bot8349176809:AAEnM6AaRBOppMBQUJJ_2Uz-mbB9x_HNeE4/deleteWebhook?drop_pending_updates=true"
   ```

## 📝 Checklist de Verificação

Antes de reiniciar o bot, confirme:

- [ ] Todos os processos do bot foram parados (pm2, nohup, etc)
- [ ] Webhook foi deletado com sucesso
- [ ] Aguardou pelo menos 30 segundos
- [ ] Não há bot rodando em outro servidor/PC
- [ ] .env está configurado corretamente
- [ ] Backend está rodando na porta 3001

## 🚨 Importante

**NUNCA rode o bot em dois lugares ao mesmo tempo:**
- ❌ Local + VPS
- ❌ Duas instâncias na VPS
- ❌ PM2 + nohup simultaneamente

**Sempre mantenha apenas UMA instância rodando!**

## 📞 Comandos de Emergência

Se nada funcionar, execute esta sequência completa:

```bash
# 1. Matar tudo
pm2 kill
pkill -9 -f telegram
pkill -9 -f tsx
pkill -9 -f node

# 2. Limpar Telegram
curl -X POST "https://api.telegram.org/bot8349176809:AAEnM6AaRBOppMBQUJJ_2Uz-mbB9x_HNeE4/logOut"
sleep 5
curl -X POST "https://api.telegram.org/bot8349176809:AAEnM6AaRBOppMBQUJJ_2Uz-mbB9x_HNeE4/deleteWebhook?drop_pending_updates=true"

# 3. Aguardar
sleep 30

# 4. Reiniciar
cd /var/www/portal-chamados/packages/telegram-bot
pm2 start npm --name "telegram-bot" -- run dev
pm2 logs telegram-bot
```

---

**Última atualização**: 2025-10-25
