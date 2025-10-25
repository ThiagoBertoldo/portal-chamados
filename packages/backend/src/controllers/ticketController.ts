import { Request, Response } from 'express';
import prisma from '../config/database';

export const getTickets = async (req: Request, res: Response) => {
  try {
    const { status, priority, clientId, categoryId, assignedToId, page = '1', limit = '50' } = req.query;

    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (clientId) where.clientId = clientId;
    if (categoryId) where.categoryId = categoryId;
    if (assignedToId) where.assignedToId = assignedToId;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          client: true,
          category: true,
          sla: true,
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.ticket.count({ where }),
    ]);

    res.json({
      tickets,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Erro ao buscar chamados' });
  }
};

export const getTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        client: true,
        category: true,
        sla: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
        },
        history: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Erro ao buscar chamado' });
  }
};

export const createTicket = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      priority,
      clientId,
      categoryId,
      slaId,
      assignedToId,
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

    // Buscar SLA se fornecido ou buscar por categoria
    let slaToUse = slaId;
    if (!slaToUse) {
      const sla = await prisma.sLA.findFirst({
        where: {
          categoryId,
          active: true,
        },
      });
      if (sla) {
        slaToUse = sla.id;
      }
    }

    // Calcular deadlines baseado no SLA
    let responseDeadline = null;
    let resolutionDeadline = null;

    if (slaToUse) {
      const sla = await prisma.sLA.findUnique({ where: { id: slaToUse } });
      if (sla) {
        const now = new Date();
        responseDeadline = new Date(now.getTime() + sla.responseTime * 60000);
        resolutionDeadline = new Date(now.getTime() + sla.resolutionTime * 60000);
      }
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        clientId,
        categoryId,
        slaId: slaToUse,
        assignedToId,
        telegramUserId,
        telegramChatId,
        responseDeadline,
        resolutionDeadline,
      },
      include: {
        client: true,
        category: true,
        sla: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Criar registro de histórico
    await prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        action: 'Chamado criado',
        newValue: 'OPEN',
      },
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Erro ao criar chamado' });
  }
};

export const updateTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignedToId, categoryId, slaId } = req.body;

    const existingTicket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    const updateData: any = {};
    const historyEntries: any[] = [];

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    if (status && status !== existingTicket.status) {
      updateData.status = status;
      historyEntries.push({
        ticketId: id,
        userId: req.user?.id,
        action: 'Status alterado',
        oldValue: existingTicket.status,
        newValue: status,
      });

      if (status === 'IN_PROGRESS' && !existingTicket.respondedAt) {
        updateData.respondedAt = new Date();
      }

      if (status === 'RESOLVED' && !existingTicket.resolvedAt) {
        updateData.resolvedAt = new Date();
      }

      if (status === 'CLOSED' && !existingTicket.closedAt) {
        updateData.closedAt = new Date();
      }
    }

    if (priority && priority !== existingTicket.priority) {
      updateData.priority = priority;
      historyEntries.push({
        ticketId: id,
        userId: req.user?.id,
        action: 'Prioridade alterada',
        oldValue: existingTicket.priority,
        newValue: priority,
      });
    }

    if (assignedToId !== undefined && assignedToId !== existingTicket.assignedToId) {
      updateData.assignedToId = assignedToId;
      historyEntries.push({
        ticketId: id,
        userId: req.user?.id,
        action: 'Atendente atribuído',
        oldValue: existingTicket.assignedToId || 'Nenhum',
        newValue: assignedToId || 'Nenhum',
      });
    }

    if (categoryId && categoryId !== existingTicket.categoryId) {
      updateData.categoryId = categoryId;
      historyEntries.push({
        ticketId: id,
        userId: req.user?.id,
        action: 'Categoria alterada',
        oldValue: existingTicket.categoryId,
        newValue: categoryId,
      });
    }

    if (slaId !== undefined && slaId !== existingTicket.slaId) {
      updateData.slaId = slaId;
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        category: true,
        sla: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Criar entradas de histórico
    if (historyEntries.length > 0) {
      await prisma.ticketHistory.createMany({
        data: historyEntries,
      });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Erro ao atualizar chamado' });
  }
};

export const deleteTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    await prisma.ticket.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ error: 'Erro ao deletar chamado' });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, isInternal } = req.body;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    const comment = await prisma.ticketComment.create({
      data: {
        ticketId: id,
        userId: req.user?.id,
        content,
        isInternal: isInternal || false,
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Erro ao adicionar comentário' });
  }
};
