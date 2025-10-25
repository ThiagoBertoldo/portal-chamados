# Setup do Novo Bot Telegram - Impulso_Tec_bot

Bot criado em: 2025-10-25
Bot URL: https://t.me/Impulso_Tec_bot

## 🤖 Informações do Bot

- **Nome**: Impulso_Tec_bot
- **Username**: @Impulso_Tec_bot
- **Token**: `8298311365:AAE0L-oyEiFU8V6yZRzXvjlhEgNhSoAKsGA`
- **Link**: https://t.me/Impulso_Tec_bot

## 🚀 Deploy na VPS (207.180.205.115)

### Passo 1: Conectar na VPS

```bash
ssh root@207.180.205.115
```

### Passo 2: Navegar até o diretório do projeto

```bash
cd /root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/telegram-bot
```

### Passo 3: Atualizar o arquivo .env

```bash
# Criar/editar o arquivo .env
nano .env
```

**Cole este conteúdo:**
```env
TELEGRAM_BOT_TOKEN=8298311365:AAE0L-oyEiFU8V6yZRzXvjlhEgNhSoAKsGA
API_URL=http://localhost:3001
```

**Salvar**: `Ctrl + O`, `Enter`, `Ctrl + X`

### Passo 4: Verificar se as dependências estão instaladas

```bash
# Se node_modules não existir, instalar
npm install
```

### Passo 5: Parar qualquer bot anterior

```bash
# Parar processos anteriores
pm2 stop telegram-bot 2>/dev/null || true
pm2 delete telegram-bot 2>/dev/null || true

# Matar processos manualmente
pkill -9 -f "telegram" 2>/dev/null || true
pkill -9 -f "tsx.*index" 2>/dev/null || true

# Verificar se parou
ps aux | grep telegram
# Deve mostrar apenas o grep
```

### Passo 6: Instalar PM2 (se não tiver)

```bash
npm install -g pm2
```

### Passo 7: Iniciar o bot

```bash
# Iniciar com PM2
pm2 start npm --name "telegram-bot" -- run dev

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup
# Execute o comando que o PM2 mostrar
```

### Passo 8: Verificar logs

```bash
# Ver logs em tempo real
pm2 logs telegram-bot

# Ver status
pm2 status
```

Você deve ver algo como:
```
🤖 Iniciando bot do Telegram...
ℹ️  Bot sem autenticação - algumas operações podem falhar
✅ Bot do Telegram iniciado!
📱 Aguardando mensagens...
```

## ✅ Testar o Bot

1. Abra o Telegram
2. Procure por: **@Impulso_Tec_bot** ou acesse https://t.me/Impulso_Tec_bot
3. Envie `/start`
4. Você deve receber uma mensagem de boas-vindas!
5. Teste criar um chamado com `/novo`

## 📊 Comandos Úteis

### Gerenciar o Bot

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs telegram-bot

# Parar bot
pm2 stop telegram-bot

# Reiniciar bot
pm2 restart telegram-bot

# Ver logs das últimas 100 linhas
pm2 logs telegram-bot --lines 100
```

### Verificar conectividade

```bash
# Testar API local
curl http://localhost:3001/health

# Testar clientes
curl http://localhost:3001/api/public/clients

# Testar categorias
curl http://localhost:3001/api/public/categories
```

### Verificar bot no Telegram

```bash
# Ver informações do bot
curl "https://api.telegram.org/bot8298311365:AAE0L-oyEiFU8V6yZRzXvjlhEgNhSoAKsGA/getMe"

# Ver webhook (deve estar vazio para polling)
curl "https://api.telegram.org/bot8298311365:AAE0L-oyEiFU8V6yZRzXvjlhEgNhSoAKsGA/getWebhookInfo"
```

## 🔧 Troubleshooting

### Bot não responde

1. **Verificar se está rodando:**
   ```bash
   pm2 status
   pm2 logs telegram-bot
   ```

2. **Verificar se API está rodando:**
   ```bash
   curl http://localhost:3001/health
   pm2 list
   ```

3. **Reiniciar bot:**
   ```bash
   pm2 restart telegram-bot
   pm2 logs telegram-bot
   ```

### Erro 409 (Conflict)

Se aparecer erro 409, significa que há outra instância rodando:

```bash
# Parar tudo
pm2 stop all
pm2 delete all
pkill -9 -f telegram
pkill -9 -f tsx

# Aguardar 30 segundos
sleep 30

# Reiniciar
pm2 start npm --name "telegram-bot" -- run dev
```

### Bot não se conecta à API

Verificar se o backend está rodando:

```bash
pm2 list
curl http://localhost:3001/health
```

Se não estiver, iniciar o backend:

```bash
cd /root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/backend
pm2 start npm --name "backend" -- run dev
```

## 🔄 Atualizar o Bot

Quando fizer alterações no código:

```bash
# Na VPS
cd /root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/telegram-bot

# Se usando Git
git pull origin main

# Reinstalar dependências (se necessário)
npm install

# Reiniciar bot
pm2 restart telegram-bot
```

## 🔒 Segurança

**IMPORTANTE**: Nunca compartilhe o token do bot!

```bash
# Proteger o arquivo .env
chmod 600 .env

# Verificar permissões
ls -la .env
# Deve mostrar: -rw------- (somente root pode ler/escrever)
```

## 📝 Comandos do Bot

Comandos disponíveis no Telegram:

- `/start` - Iniciar conversa
- `/novo` - Abrir novo chamado
- `/ajuda` - Ver ajuda
- `/cancelar` - Cancelar operação

## 🎯 Resumo Rápido

```bash
# Conectar
ssh root@207.180.205.115

# Ir para diretório
cd /root/aplications/Tickets_ImpulsoTecnologia/portal-chamados/packages/telegram-bot

# Verificar .env
cat .env

# Iniciar bot
pm2 start npm --name "telegram-bot" -- run dev
pm2 save

# Ver logs
pm2 logs telegram-bot
```

## ✅ Checklist Final

- [ ] Conectado na VPS
- [ ] Arquivo .env criado com token correto
- [ ] Dependências instaladas (`npm install`)
- [ ] PM2 instalado globalmente
- [ ] Backend rodando na porta 3001
- [ ] Bot iniciado com PM2
- [ ] Bot respondendo no Telegram
- [ ] PM2 salvo (`pm2 save`)
- [ ] PM2 configurado para auto-start (`pm2 startup`)

---

**Última atualização**: 2025-10-25
**Bot URL**: https://t.me/Impulso_Tec_bot
