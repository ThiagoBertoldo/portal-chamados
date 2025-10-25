import dotenv from 'dotenv';

dotenv.config();

export const config = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  apiUrl: process.env.API_URL || 'http://localhost:3001',
};

if (!config.telegramBotToken) {
  console.error('❌ TELEGRAM_BOT_TOKEN não está definido no arquivo .env');
  console.log('📝 Para obter um token:');
  console.log('1. Abra o Telegram e procure por @BotFather');
  console.log('2. Envie o comando /newbot');
  console.log('3. Siga as instruções para escolher nome e username');
  console.log('4. Copie o token fornecido e cole no .env');
  process.exit(1);
}
