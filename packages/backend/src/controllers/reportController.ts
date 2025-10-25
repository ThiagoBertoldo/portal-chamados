import { Request, Response } from 'express';
import prisma from '../config/database';

// Relatório Cliente Sintético - Resumo por cliente
export const clientSynthetic = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const clients = await prisma.client.findMany({
      where: { active: true },
      include: {
        tickets: {
          where,
        },
      },
    });

    const report = clients.map(client => {
      const tickets = client.tickets;
      const openTickets = tickets.filter(t => t.status === 'OPEN').length;
      const inProgressTickets = tickets.filter(t => t.status === 'IN_PROGRESS').length;
      const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED').length;
      const closedTickets = tickets.filter(t => t.status === 'CLOSED').length;

      return {
        clientId: client.id,
        clientName: client.name,
        totalTickets: tickets.length,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
      };
    }).filter(item => item.totalTickets > 0);

    res.json(report);
  } catch (error) {
    console.error('Client synthetic report error:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
};

// Relatório Cliente Analítico - Detalhado por cliente
export const clientAnalytical = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, clientId } = req.query;

    const where: any = {};

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    if (clientId) {
      where.clientId = clientId;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        client: true,
        category: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
        sla: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const report = tickets.map(ticket => {
      const slaCompliance = ticket.resolvedAt && ticket.resolutionDeadline
        ? ticket.resolvedAt <= ticket.resolutionDeadline
        : null;

      const resolutionTime = ticket.resolvedAt
        ? Math.floor((ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) / 60000)
        : null;

      return {
        ticketId: ticket.id,
        title: ticket.title,
        clientName: ticket.client.name,
        categoryName: ticket.category.name,
        status: ticket.status,
        priority: ticket.priority,
        assignedTo: ticket.assignedTo?.name || 'Não atribuído',
        createdAt: ticket.createdAt,
        resolvedAt: ticket.resolvedAt,
        resolutionTimeMinutes: resolutionTime,
        slaCompliance,
        slaName: ticket.sla?.name,
      };
    });

    res.json(report);
  } catch (error) {
    console.error('Client analytical report error:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
};

// Relatório de Chamados Abertos por Dia
export const dailyTickets = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate e endDate são obrigatórios' });
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        },
      },
      select: {
        createdAt: true,
        status: true,
        priority: true,
      },
    });

    // Agrupar por dia
    const grouped: { [key: string]: any } = {};

    tickets.forEach(ticket => {
      const date = ticket.createdAt.toISOString().split('T')[0];

      if (!grouped[date]) {
        grouped[date] = {
          date,
          total: 0,
          byStatus: {
            OPEN: 0,
            IN_PROGRESS: 0,
            RESOLVED: 0,
            CLOSED: 0,
            CANCELLED: 0,
          },
          byPriority: {
            LOW: 0,
            MEDIUM: 0,
            HIGH: 0,
            URGENT: 0,
          },
        };
      }

      grouped[date].total++;
      grouped[date].byStatus[ticket.status]++;
      grouped[date].byPriority[ticket.priority]++;
    });

    const report = Object.values(grouped).sort((a: any, b: any) =>
      a.date.localeCompare(b.date)
    );

    res.json(report);
  } catch (error) {
    console.error('Daily tickets report error:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
};

// Relatório de Chamados Abertos por Mês
export const monthlyTickets = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate e endDate são obrigatórios' });
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        },
      },
      select: {
        createdAt: true,
        status: true,
        priority: true,
      },
    });

    // Agrupar por mês
    const grouped: { [key: string]: any } = {};

    tickets.forEach(ticket => {
      const yearMonth = ticket.createdAt.toISOString().substring(0, 7); // YYYY-MM

      if (!grouped[yearMonth]) {
        grouped[yearMonth] = {
          yearMonth,
          total: 0,
          byStatus: {
            OPEN: 0,
            IN_PROGRESS: 0,
            RESOLVED: 0,
            CLOSED: 0,
            CANCELLED: 0,
          },
          byPriority: {
            LOW: 0,
            MEDIUM: 0,
            HIGH: 0,
            URGENT: 0,
          },
        };
      }

      grouped[yearMonth].total++;
      grouped[yearMonth].byStatus[ticket.status]++;
      grouped[yearMonth].byPriority[ticket.priority]++;
    });

    const report = Object.values(grouped).sort((a: any, b: any) =>
      a.yearMonth.localeCompare(b.yearMonth)
    );

    res.json(report);
  } catch (error) {
    console.error('Monthly tickets report error:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
};

// Relatório por Categorias
export const byCategory = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const categories = await prisma.category.findMany({
      where: { active: true },
      include: {
        tickets: {
          where,
        },
      },
    });

    const report = categories.map(category => {
      const tickets = category.tickets;
      const openTickets = tickets.filter(t => t.status === 'OPEN').length;
      const inProgressTickets = tickets.filter(t => t.status === 'IN_PROGRESS').length;
      const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED').length;
      const closedTickets = tickets.filter(t => t.status === 'CLOSED').length;

      const avgResolutionTime = tickets
        .filter(t => t.resolvedAt)
        .reduce((acc, t) => {
          const time = t.resolvedAt!.getTime() - t.createdAt.getTime();
          return acc + time;
        }, 0) / (tickets.filter(t => t.resolvedAt).length || 1);

      return {
        categoryId: category.id,
        categoryName: category.name,
        totalTickets: tickets.length,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        avgResolutionTimeMinutes: Math.floor(avgResolutionTime / 60000),
      };
    }).filter(item => item.totalTickets > 0);

    res.json(report);
  } catch (error) {
    console.error('By category report error:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
};

// Relatório de Cumprimento de SLA
export const slaCompliance = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, slaId } = req.query;

    const where: any = {};

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    if (slaId) {
      where.slaId = slaId;
    } else {
      where.slaId = { not: null };
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        sla: true,
        client: true,
        category: true,
      },
    });

    const slaGroups: { [key: string]: any } = {};

    tickets.forEach(ticket => {
      if (!ticket.sla) return;

      const slaKey = ticket.sla.id;

      if (!slaGroups[slaKey]) {
        slaGroups[slaKey] = {
          slaId: ticket.sla.id,
          slaName: ticket.sla.name,
          responseTime: ticket.sla.responseTime,
          resolutionTime: ticket.sla.resolutionTime,
          totalTickets: 0,
          respondedOnTime: 0,
          resolvedOnTime: 0,
          pendingResponse: 0,
          pendingResolution: 0,
          tickets: [],
        };
      }

      const group = slaGroups[slaKey];
      group.totalTickets++;

      // Verificar cumprimento de resposta
      if (ticket.respondedAt) {
        if (ticket.responseDeadline && ticket.respondedAt <= ticket.responseDeadline) {
          group.respondedOnTime++;
        }
      } else {
        group.pendingResponse++;
      }

      // Verificar cumprimento de resolução
      if (ticket.resolvedAt) {
        if (ticket.resolutionDeadline && ticket.resolvedAt <= ticket.resolutionDeadline) {
          group.resolvedOnTime++;
        }
      } else if (ticket.status !== 'CANCELLED') {
        group.pendingResolution++;
      }

      group.tickets.push({
        ticketId: ticket.id,
        title: ticket.title,
        clientName: ticket.client.name,
        categoryName: ticket.category.name,
        status: ticket.status,
        createdAt: ticket.createdAt,
        responseDeadline: ticket.responseDeadline,
        respondedAt: ticket.respondedAt,
        resolutionDeadline: ticket.resolutionDeadline,
        resolvedAt: ticket.resolvedAt,
        respondedOnTime: ticket.respondedAt && ticket.responseDeadline
          ? ticket.respondedAt <= ticket.responseDeadline
          : null,
        resolvedOnTime: ticket.resolvedAt && ticket.resolutionDeadline
          ? ticket.resolvedAt <= ticket.resolutionDeadline
          : null,
      });
    });

    const report = Object.values(slaGroups).map((group: any) => {
      const responseComplianceRate = group.totalTickets > 0
        ? (group.respondedOnTime / (group.totalTickets - group.pendingResponse)) * 100
        : 0;

      const resolutionComplianceRate = group.totalTickets > 0
        ? (group.resolvedOnTime / (group.totalTickets - group.pendingResolution)) * 100
        : 0;

      return {
        ...group,
        responseComplianceRate: parseFloat(responseComplianceRate.toFixed(2)),
        resolutionComplianceRate: parseFloat(resolutionComplianceRate.toFixed(2)),
      };
    });

    res.json(report);
  } catch (error) {
    console.error('SLA compliance report error:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
};
