import { Router } from 'express';
import prisma from '../config/database';

const router = Router();

// Rotas públicas para o bot do Telegram (sem autenticação)
// Estas rotas são somente leitura e criação de tickets

// GET /api/public/clients - Listar clientes ativos
router.get('/clients', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// GET /api/public/categories - Listar categorias ativas
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// POST /api/public/tickets - Criar ticket (para o bot)
router.post('/tickets', async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      clientId,
      categoryId,
      telegramUserId,
      telegramChatId,
    } = req.body;

    // Validar que cliente e categoria existem
    const [client, category] = await Promise.all([
      prisma.client.findUnique({ where: { id: clientId } }),
      prisma.category.findUnique({ where: { id: categoryId } }),
    ]);

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    // Buscar SLA por categoria
    let slaToUse = null;
    const sla = await prisma.sLA.findFirst({
      where: {
        categoryId,
        active: true,
      },
    });

    if (sla) {
      slaToUse = sla.id;
    }

    // Calcular deadlines baseado no SLA
    let responseDeadline = null;
    let resolutionDeadline = null;

    if (sla) {
      const now = new Date();
      responseDeadline = new Date(now.getTime() + sla.responseTime * 60000);
      resolutionDeadline = new Date(now.getTime() + sla.resolutionTime * 60000);
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        clientId,
        categoryId,
        slaId: slaToUse,
        telegramUserId,
        telegramChatId,
        responseDeadline,
        resolutionDeadline,
      },
      include: {
        client: true,
        category: true,
        sla: true,
      },
    });

    // Criar registro de histórico
    await prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        action: 'Chamado criado via Telegram',
        newValue: 'OPEN',
      },
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Erro ao criar chamado' });
  }
});

export default router;
