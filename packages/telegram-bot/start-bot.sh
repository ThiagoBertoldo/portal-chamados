#!/bin/bash

# Script para iniciar o bot do Telegram na VPS
# Uso: bash start-bot.sh

echo "🤖 Iniciando Bot do Telegram..."
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório packages/telegram-bot/"
    exit 1
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo "❌ Erro: Arquivo .env não encontrado!"
    echo "📝 Copie o .env.example e configure:"
    echo "   cp .env.example .env"
    exit 1
fi

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    echo ""
fi

# Matar processos anteriores do bot (se existirem)
echo "🔍 Verificando processos anteriores..."
pkill -f "tsx.*telegram-bot" 2>/dev/null || true

# Iniciar bot em background com PM2 (se disponível) ou nohup
if command -v pm2 &> /dev/null; then
    echo "🚀 Iniciando bot com PM2..."
    pm2 delete telegram-bot 2>/dev/null || true
    pm2 start npm --name "telegram-bot" -- run dev
    pm2 save
    echo ""
    echo "✅ Bot iniciado com PM2!"
    echo "📊 Comandos úteis:"
    echo "   pm2 logs telegram-bot    # Ver logs"
    echo "   pm2 stop telegram-bot    # Parar bot"
    echo "   pm2 restart telegram-bot # Reiniciar bot"
    echo "   pm2 status               # Ver status"
else
    echo "🚀 Iniciando bot com nohup..."
    nohup npm run dev > bot.log 2>&1 &
    BOT_PID=$!
    echo $BOT_PID > bot.pid
    echo ""
    echo "✅ Bot iniciado!"
    echo "🆔 PID: $BOT_PID"
    echo "📄 Logs: tail -f bot.log"
    echo "🛑 Parar: kill $(cat bot.pid)"
fi

echo ""
echo "🎉 Bot do Telegram está rodando!"
