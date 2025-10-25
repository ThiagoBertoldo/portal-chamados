#!/bin/bash

# Script para parar o bot do Telegram na VPS
# Uso: bash stop-bot.sh

echo "🛑 Parando Bot do Telegram..."
echo ""

# Tentar parar com PM2 primeiro
if command -v pm2 &> /dev/null; then
    echo "Parando bot no PM2..."
    pm2 stop telegram-bot 2>/dev/null || true
    pm2 delete telegram-bot 2>/dev/null || true
    echo "✅ Bot parado no PM2"
fi

# Parar processo usando PID file
if [ -f "bot.pid" ]; then
    PID=$(cat bot.pid)
    if ps -p $PID > /dev/null 2>&1; then
        kill $PID
        echo "✅ Bot (PID: $PID) parado"
        rm bot.pid
    else
        echo "ℹ️  Processo não encontrado"
        rm bot.pid
    fi
fi

# Matar qualquer processo restante
pkill -f "tsx.*telegram-bot" 2>/dev/null && echo "✅ Processos remanescentes encerrados"

echo ""
echo "✅ Bot parado com sucesso!"
