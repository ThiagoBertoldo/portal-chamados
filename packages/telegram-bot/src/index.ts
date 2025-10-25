import TelegramBot from 'node-telegram-bot-api';
import { config } from './config/env';
import { getClients, getCategories, createTicket, loginBot, setAuthToken } from './services/api';
import { UserSession } from './types';

const bot = new TelegramBot(config.telegramBotToken, { polling: true });

// Armazenar sessões dos usuários
const userSessions = new Map<number, UserSession>();

// Inicializar bot
async function init() {
  console.log('🤖 Iniciando bot do Telegram...');

  // Tentar fazer login
  const token = await loginBot();
  if (token) {
    setAuthToken(token);
    console.log('✅ Bot autenticado com sucesso');
  }

  console.log('✅ Bot do Telegram iniciado!');
  console.log('📱 Aguardando mensagens...');
}

// Comando /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from?.first_name || 'usuário';

  await bot.sendMessage(
    chatId,
    `Olá ${userName}! 👋\n\n` +
    `Bem-vindo ao Portal de Chamados da Impulso Tecnologia.\n\n` +
    `Comandos disponíveis:\n` +
    `/novo - Abrir um novo chamado\n` +
    `/ajuda - Ver ajuda\n` +
    `/cancelar - Cancelar operação atual`
  );
});

// Comando /ajuda
bot.onText(/\/ajuda/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
    `📋 Ajuda - Portal de Chamados\n\n` +
    `Para abrir um chamado, siga estes passos:\n\n` +
    `1️⃣ Digite /novo\n` +
    `2️⃣ Selecione o cliente\n` +
    `3️⃣ Selecione a categoria\n` +
    `4️⃣ Digite a descrição do problema\n\n` +
    `Você pode cancelar a qualquer momento com /cancelar`
  );
});

// Comando /cancelar
bot.onText(/\/cancelar/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;

  if (userId) {
    userSessions.delete(userId);
  }

  await bot.sendMessage(chatId, '❌ Operação cancelada.\n\nDigite /novo para iniciar novamente.');
});

// Comando /novo - Iniciar abertura de chamado
bot.onText(/\/novo/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;

  if (!userId) {
    await bot.sendMessage(chatId, '❌ Erro ao identificar usuário.');
    return;
  }

  // Buscar clientes
  const clients = await getClients();

  if (clients.length === 0) {
    await bot.sendMessage(
      chatId,
      '❌ Nenhum cliente encontrado.\n\n' +
      'Por favor, cadastre clientes no portal antes de abrir chamados.'
    );
    return;
  }

  // Criar sessão do usuário
  userSessions.set(userId, {
    step: 'awaiting_client',
  });

  // Criar teclado com clientes
  const keyboard = {
    inline_keyboard: clients.map(client => [
      {
        text: client.name,
        callback_data: `client_${client.id}`,
      },
    ]),
  };

  await bot.sendMessage(
    chatId,
    '👤 Selecione o cliente:',
    { reply_markup: keyboard }
  );
});

// Callback para seleção de cliente
bot.on('callback_query', async (query) => {
  const chatId = query.message?.chat.id;
  const userId = query.from.id;
  const data = query.data;

  if (!chatId || !data) return;

  const session = userSessions.get(userId);

  if (!session) {
    await bot.answerCallbackQuery(query.id, {
      text: 'Sessão expirada. Digite /novo para iniciar novamente.',
    });
    return;
  }

  // Seleção de cliente
  if (data.startsWith('client_')) {
    const clientId = data.replace('client_', '');
    session.clientId = clientId;
    session.step = 'awaiting_category';
    userSessions.set(userId, session);

    await bot.answerCallbackQuery(query.id);

    // Buscar categorias
    const categories = await getCategories();

    if (categories.length === 0) {
      await bot.sendMessage(
        chatId,
        '❌ Nenhuma categoria encontrada.\n\n' +
        'Por favor, cadastre categorias no portal antes de continuar.'
      );
      userSessions.delete(userId);
      return;
    }

    const keyboard = {
      inline_keyboard: categories.map(category => [
        {
          text: category.name,
          callback_data: `category_${category.id}`,
        },
      ]),
    };

    await bot.sendMessage(
      chatId,
      '📂 Selecione a categoria do chamado:',
      { reply_markup: keyboard }
    );
  }

  // Seleção de categoria
  else if (data.startsWith('category_')) {
    const categoryId = data.replace('category_', '');
    session.categoryId = categoryId;
    session.step = 'awaiting_description';
    userSessions.set(userId, session);

    await bot.answerCallbackQuery(query.id);

    await bot.sendMessage(
      chatId,
      '📝 Digite a descrição do problema:\n\n' +
      '(Seja o mais detalhado possível)'
    );
  }
});

// Receber descrição do chamado
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  const text = msg.text;

  if (!userId || !text) return;

  // Ignorar comandos
  if (text.startsWith('/')) return;

  const session = userSessions.get(userId);

  if (!session || session.step !== 'awaiting_description') return;

  // Criar chamado
  await bot.sendMessage(chatId, '⏳ Criando chamado...');

  const ticket = await createTicket({
    title: text.substring(0, 100), // Primeiros 100 caracteres como título
    description: text,
    clientId: session.clientId!,
    categoryId: session.categoryId!,
    telegramUserId: userId.toString(),
    telegramChatId: chatId.toString(),
  });

  if (ticket) {
    await bot.sendMessage(
      chatId,
      `✅ Chamado criado com sucesso!\n\n` +
      `🎫 ID: ${ticket.id}\n` +
      `📋 Status: ${ticket.status}\n` +
      `⚡ Prioridade: ${ticket.priority}\n\n` +
      `Você receberá atualizações sobre este chamado em breve.`
    );
  } else {
    await bot.sendMessage(
      chatId,
      '❌ Erro ao criar chamado.\n\n' +
      'Por favor, tente novamente mais tarde ou entre em contato com o suporte.'
    );
  }

  // Limpar sessão
  userSessions.delete(userId);
});

// Tratamento de erros
bot.on('polling_error', (error) => {
  console.error('Erro no polling:', error);
});

// Iniciar bot
init();
