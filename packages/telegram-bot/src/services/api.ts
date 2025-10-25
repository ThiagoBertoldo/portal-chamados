import axios from 'axios';
import { config } from '../config/env';
import { Client, Category, Ticket } from '../types';

const api = axios.create({
  baseURL: config.apiUrl + '/api',
  timeout: 10000,
});

export const getClients = async (): Promise<Client[]> => {
  try {
    // Usando rota pública (sem autenticação)
    const response = await api.get('/public/clients');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    // Usando rota pública (sem autenticação)
    const response = await api.get('/public/categories');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
};

export const createTicket = async (data: {
  title: string;
  description: string;
  clientId: string;
  categoryId: string;
  telegramUserId: string;
  telegramChatId: string;
}): Promise<Ticket | null> => {
  try {
    // Usando rota pública (sem autenticação)
    const response = await api.post('/public/tickets', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar chamado:', error);
    return null;
  }
};

export const loginBot = async (): Promise<string | null> => {
  try {
    // Aqui você pode implementar uma lógica de autenticação específica para o bot
    // Por enquanto, vamos retornar null e fazer as chamadas sem autenticação
    // Em produção, você deve criar um usuário específico para o bot
    const response = await api.post('/auth/login', {
      email: 'bot@impulso.com',
      password: 'bot123',
    });
    return response.data.token;
  } catch (error) {
    console.log('ℹ️  Bot sem autenticação - algumas operações podem falhar');
    return null;
  }
};

// Configurar token de autenticação se disponível
export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};
