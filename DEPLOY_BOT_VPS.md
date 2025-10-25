# Deploy do Bot Telegram na VPS

Este guia explica como fazer o deploy e manter o bot do Telegram rodando na VPS.

## 📋 Pré-requisitos

- VPS com acesso SSH (207.180.205.115)
- Node.js instalado na VPS (>= 18.0.0)
- Backend já rodando na VPS (porta 3001)

## 🚀 Passo a Passo

### 1. Conectar na VPS

```bash
ssh root@207.180.205.115
# ou
ssh seu-usuario@207.180.205.115
```

### 2. Fazer Upload dos Arquivos

**Opção A: Via Git (Recomendado)**

```bash
# Na VPS
cd /var/www  # ou o diretório de sua preferência
git clone [URL_DO_SEU_REPOSITORIO]
cd portal-chamados/packages/telegram-bot
```

**Opção B: Via SCP/SFTP**

```bash
# No seu computador local
cd /home/thiago-bertoldo/Documentos/VSCode/portal-chamados
scp -r packages/telegram-bot root@207.180.205.115:/var/www/portal-chamados/packages/
```

**Opção C: Via rsync (Sincronização)**

```bash
# No seu computador local
rsync -avz --exclude 'node_modules' \
  packages/telegram-bot/ \
  root@207.180.205.115:/var/www/portal-chamados/packages/telegram-bot/
```

### 3. Configurar o Bot na VPS

```bash
# Na VPS, no diretório do bot
cd /var/www/portal-chamados/packages/telegram-bot

# Copiar configurações
cp .env.example .env

# Editar .env com as configurações corretas
nano .env
```

**Conteúdo do .env:**
```env
TELEGRAM_BOT_TOKEN=8349176809:AAEnM6AaRBOppMBQUJJ_2Uz-mbB9x_HNeE4
API_URL=http://localhost:3001
```

⚠️ **IMPORTANTE**: Na VPS, use `http://localhost:3001` (não o IP externo), pois o bot estará na mesma máquina que a API.

### 4. Instalar Dependências

```bash
npm install
```

### 5. Instalar PM2 (Gerenciador de Processos)

PM2 mantém o bot rodando continuamente, mesmo após reiniciar a VPS:

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Configurar PM2 para iniciar automaticamente no boot
pm2 startup
# Execute o comando que o PM2 mostrar
```

### 6. Iniciar o Bot

**Opção A: Com PM2 (Recomendado)**

```bash
# Iniciar bot
bash start-bot.sh

# Ou manualmente:
pm2 start npm --name "telegram-bot" -- run dev
pm2 save
```

**Opção B: Com nohup (Alternativa)**

```bash
nohup npm run dev > bot.log 2>&1 &
echo $! > bot.pid
```

## 📊 Comandos Úteis

### Gerenciamento com PM2

```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs telegram-bot

# Ver logs anteriores
pm2 logs telegram-bot --lines 100

# Parar bot
pm2 stop telegram-bot

# Reiniciar bot
pm2 restart telegram-bot

# Deletar bot do PM2
pm2 delete telegram-bot

# Ver uso de CPU/memória
pm2 monit
```

### Scripts Criados

```bash
# Iniciar bot (funciona com PM2 ou nohup)
bash start-bot.sh

# Parar bot
bash stop-bot.sh
```

### Verificar se Bot Está Rodando

```bash
# Ver processos Node.js
ps aux | grep node

# Ver logs do bot (se usando nohup)
tail -f bot.log

# Testar conectividade com API
curl http://localhost:3001/health
curl http://localhost:3001/api/public/clients
```

## 🔧 Troubleshooting

### Bot não responde

1. **Verificar se está rodando:**
   ```bash
   pm2 status
   # ou
   ps aux | grep telegram
   ```

2. **Verificar logs:**
   ```bash
   pm2 logs telegram-bot
   # ou
   tail -f bot.log
   ```

3. **Testar API:**
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:3001/api/public/clients
   ```

### Erro de permissão

```bash
# Dar permissão aos scripts
chmod +x start-bot.sh stop-bot.sh

# Verificar permissões do diretório
ls -la
```

### Porta 3001 não acessível

```bash
# Verificar se backend está rodando
pm2 status
netstat -tulpn | grep 3001

# Verificar firewall
sudo ufw status
sudo ufw allow 3001
```

### Bot não se conecta à API

1. Verificar URL no .env (deve ser `http://localhost:3001`)
2. Testar conectividade: `curl http://localhost:3001/health`
3. Verificar se backend está escutando em `0.0.0.0` ou apenas `localhost`

## 🔄 Atualizar o Bot

```bash
# Conectar na VPS
ssh root@207.180.205.115

# Ir para o diretório
cd /var/www/portal-chamados/packages/telegram-bot

# Se usando Git
git pull origin main

# Se usando rsync (no computador local)
rsync -avz --exclude 'node_modules' \
  packages/telegram-bot/ \
  root@207.180.205.115:/var/www/portal-chamados/packages/telegram-bot/

# Reinstalar dependências (se necessário)
npm install

# Reiniciar bot
pm2 restart telegram-bot
```

## 🔒 Segurança

1. **Nunca commitar o .env no Git**
   - Arquivo já está no .gitignore
   - Sempre configure manualmente na VPS

2. **Proteger o token do bot**
   ```bash
   chmod 600 .env
   ```

3. **Usar usuário não-root**
   ```bash
   # Criar usuário para aplicação
   adduser appuser
   chown -R appuser:appuser /var/www/portal-chamados

   # Rodar como appuser
   su - appuser
   cd /var/www/portal-chamados/packages/telegram-bot
   bash start-bot.sh
   ```

## 📝 Logs e Monitoramento

### Localização dos Logs

- **PM2**: `~/.pm2/logs/`
- **nohup**: `bot.log` no diretório do bot
- **Sistema**: `/var/log/syslog`

### Monitorar Logs

```bash
# Logs do PM2
pm2 logs telegram-bot --lines 50

# Logs do nohup
tail -f bot.log

# Logs do sistema
tail -f /var/log/syslog | grep telegram
```

## ✅ Checklist Final

- [ ] VPS acessível via SSH
- [ ] Node.js instalado (>= 18)
- [ ] Arquivos do bot na VPS
- [ ] .env configurado com token e URL
- [ ] Dependências instaladas (`npm install`)
- [ ] PM2 instalado e configurado
- [ ] Bot iniciado (`pm2 start` ou `bash start-bot.sh`)
- [ ] Bot respondendo no Telegram (`/start`)
- [ ] PM2 configurado para auto-start (`pm2 startup` e `pm2 save`)

## 🎯 URLs e Portas

- **API Backend**: http://localhost:3001 (dentro da VPS)
- **API Backend (externa)**: http://207.180.205.115:3001
- **Frontend**: http://207.180.205.115:5173
- **Token Bot**: `8349176809:AAEnM6AaRBOppMBQUJJ_2Uz-mbB9x_HNeE4`

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs: `pm2 logs telegram-bot`
2. Verificar status: `pm2 status`
3. Testar API: `curl http://localhost:3001/health`
4. Reiniciar bot: `pm2 restart telegram-bot`

---

**Última atualização**: 2025-10-25
