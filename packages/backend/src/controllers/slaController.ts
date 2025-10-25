import { Request, Response } from 'express';
import prisma from '../config/database';

export const getSLAs = async (req: Request, res: Response) => {
  try {
    const { active } = req.query;

    const where: any = {};

    if (active !== undefined) {
      where.active = active === 'true';
    }

    const slas = await prisma.sLA.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json(slas);
  } catch (error) {
    console.error('Get SLAs error:', error);
    res.status(500).json({ error: 'Erro ao buscar SLAs' });
  }
};

export const getSLA = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sla = await prisma.sLA.findUnique({
      where: { id },
      include: {
        category: true,
        _count: {
          select: { tickets: true },
        },
      },
    });

    if (!sla) {
      return res.status(404).json({ error: 'SLA não encontrado' });
    }

    res.json(sla);
  } catch (error) {
    console.error('Get SLA error:', error);
    res.status(500).json({ error: 'Erro ao buscar SLA' });
  }
};

export const createSLA = async (req: Request, res: Response) => {
  try {
    const { name, categoryId, responseTime, resolutionTime, priority } = req.body;

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }
    }

    const sla = await prisma.sLA.create({
      data: {
        name,
        categoryId,
        responseTime,
        resolutionTime,
        priority,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json(sla);
  } catch (error) {
    console.error('Create SLA error:', error);
    res.status(500).json({ error: 'Erro ao criar SLA' });
  }
};

export const updateSLA = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, categoryId, responseTime, resolutionTime, priority, active } = req.body;

    const existingSLA = await prisma.sLA.findUnique({
      where: { id },
    });

    if (!existingSLA) {
      return res.status(404).json({ error: 'SLA não encontrado' });
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }
    }

    const sla = await prisma.sLA.update({
      where: { id },
      data: {
        name,
        categoryId,
        responseTime,
        resolutionTime,
        priority,
        active,
      },
      include: {
        category: true,
      },
    });

    res.json(sla);
  } catch (error) {
    console.error('Update SLA error:', error);
    res.status(500).json({ error: 'Erro ao atualizar SLA' });
  }
};

export const deleteSLA = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sla = await prisma.sLA.findUnique({
      where: { id },
      include: {
        tickets: true,
      },
    });

    if (!sla) {
      return res.status(404).json({ error: 'SLA não encontrado' });
    }

    if (sla.tickets.length > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir SLA com chamados associados',
      });
    }

    await prisma.sLA.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete SLA error:', error);
    res.status(500).json({ error: 'Erro ao deletar SLA' });
  }
};
