import { Request, Response } from 'express';
import prisma from '../config/database';

export const getClients = async (req: Request, res: Response) => {
  try {
    const { active, search } = req.query;

    const where: any = {};

    if (active !== undefined) {
      where.active = active === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { document: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
};

export const getClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        tickets: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(client);
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
};

export const createClient = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, document, address } = req.body;

    if (document) {
      const existingClient = await prisma.client.findUnique({
        where: { document },
      });

      if (existingClient) {
        return res.status(400).json({ error: 'Documento já cadastrado' });
      }
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        document,
        address,
      },
    });

    res.status(201).json(client);
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, document, address, active } = req.body;

    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    if (document && document !== existingClient.document) {
      const clientWithDocument = await prisma.client.findUnique({
        where: { document },
      });

      if (clientWithDocument) {
        return res.status(400).json({ error: 'Documento já cadastrado' });
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        document,
        address,
        active,
      },
    });

    res.json(client);
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        tickets: true,
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    if (client.tickets.length > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir cliente com chamados associados',
      });
    }

    await prisma.client.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
};
