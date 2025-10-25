import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';
import { Ticket, Client, Category } from '../types';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import { format } from 'date-fns';

export const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    categoryId: '',
    priority: 'MEDIUM',
  });

  useEffect(() => {
    loadTickets();
    loadClients();
    loadCategories();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await api.get('/tickets');
      setTickets(response.data.tickets || []);
    } catch (error) {
      console.error('Erro ao carregar chamados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await api.get('/clients', { params: { active: true } });
      setClients(response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories', { params: { active: true } });
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTicket) {
        await api.put(`/tickets/${editingTicket.id}`, formData);
      } else {
        await api.post('/tickets', formData);
      }
      setShowModal(false);
      resetForm();
      loadTickets();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar chamado');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este chamado?')) return;
    try {
      await api.delete(`/tickets/${id}`);
      loadTickets();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao excluir chamado');
    }
  };

  const handleEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setFormData({
      title: ticket.title,
      description: ticket.description,
      clientId: ticket.clientId,
      categoryId: ticket.categoryId,
      priority: ticket.priority,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingTicket(null);
    setFormData({
      title: '',
      description: '',
      clientId: '',
      categoryId: '',
      priority: 'MEDIUM',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      OPEN: 'badge-open',
      IN_PROGRESS: 'badge-in-progress',
      RESOLVED: 'badge-resolved',
      CLOSED: 'badge-closed',
    };
    return badges[status] || 'badge';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      OPEN: 'Aberto',
      IN_PROGRESS: 'Em Andamento',
      RESOLVED: 'Resolvido',
      CLOSED: 'Fechado',
      CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: { [key: string]: string } = {
      LOW: 'Baixa',
      MEDIUM: 'Média',
      HIGH: 'Alta',
      URGENT: 'Urgente',
    };
    return labels[priority] || priority;
  };

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Chamados</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Chamado
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Título</th>
                  <th className="text-left py-3 px-4">Cliente</th>
                  <th className="text-left py-3 px-4">Categoria</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Prioridade</th>
                  <th className="text-left py-3 px-4">Criado em</th>
                  <th className="text-right py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">
                      {ticket.id.substring(0, 8)}...
                    </td>
                    <td className="py-3 px-4 font-medium">{ticket.title}</td>
                    <td className="py-3 px-4">{ticket.client?.name}</td>
                    <td className="py-3 px-4">{ticket.category?.name}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getStatusBadge(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">{getPriorityLabel(ticket.priority)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEdit(ticket)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(ticket.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tickets.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Nenhum chamado encontrado. Clique em "Novo Chamado" para criar um.
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingTicket ? 'Editar Chamado' : 'Novo Chamado'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input"
                    required
                    placeholder="Resumo do problema"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Cliente *</label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Categoria *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Prioridade *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descrição *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows={5}
                    required
                    placeholder="Descreva o problema detalhadamente..."
                  />
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingTicket ? 'Atualizar' : 'Criar Chamado'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="btn btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
