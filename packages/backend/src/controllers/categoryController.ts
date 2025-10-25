import { Request, Response } from 'express';
import prisma from '../config/database';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { active } = req.query;

    const where: any = {};

    if (active !== undefined) {
      where.active = active === 'true';
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
};

export const getCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tickets: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Erro ao buscar categoria' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, color } = req.body;

    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'Categoria já existe' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        color,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, color, active } = req.body;

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    if (name && name !== existingCategory.name) {
      const categoryWithName = await prisma.category.findUnique({
        where: { name },
      });

      if (categoryWithName) {
        return res.status(400).json({ error: 'Nome de categoria já existe' });
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        color,
        active,
      },
    });

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        tickets: true,
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    if (category.tickets.length > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir categoria com chamados associados',
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Erro ao deletar categoria' });
  }
};
