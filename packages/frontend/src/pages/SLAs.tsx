import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';
import { SLA, Category } from '../types';
import { Plus, Edit, Trash2, Search, Clock } from 'lucide-react';

export const SLAs: React.FC = () => {
  const [slas, setSlas] = useState<SLA[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSLA, setEditingSLA] = useState<SLA | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    responseTime: '',
    resolutionTime: '',
    priority: 'MEDIUM',
  });

  useEffect(() => {
    loadSLAs();
    loadCategories();
  }, []);

  const loadSLAs = async () => {
    try {
      const response = await api.get('/slas', { params: { search } });
      setSlas(response.data);
    } catch (error) {
      console.error('Erro ao carregar SLAs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        categoryId: formData.categoryId || undefined,
        responseTime: parseInt(formData.responseTime),
        resolutionTime: parseInt(formData.resolutionTime),
        priority: formData.priority,
      };

      if (editingSLA) {
        await api.put(`/slas/${editingSLA.id}`, data);
      } else {
        await api.post('/slas', data);
      }
      setShowModal(false);
      resetForm();
      loadSLAs();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar SLA');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este SLA?')) return;
    try {
      await api.delete(`/slas/${id}`);
      loadSLAs();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao excluir SLA');
    }
  };

  const handleEdit = (sla: SLA) => {
    setEditingSLA(sla);
    setFormData({
      name: sla.name,
      categoryId: sla.categoryId || '',
      responseTime: sla.responseTime.toString(),
      resolutionTime: sla.resolutionTime.toString(),
      priority: sla.priority,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingSLA(null);
    setFormData({
      name: '',
      categoryId: '',
      responseTime: '',
      resolutionTime: '',
      priority: 'MEDIUM',
    });
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, string> = {
      LOW: 'badge-open',
      MEDIUM: 'badge-in-progress',
      HIGH: 'badge-cancelled',
      URGENT: 'badge-closed',
    };
    const labels: Record<string, string> = {
      LOW: 'Baixa',
      MEDIUM: 'Média',
      HIGH: 'Alta',
      URGENT: 'Urgente',
    };
    return (
      <span className={`badge ${badges[priority]}`}>
        {labels[priority]}
      </span>
    );
  };

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">SLAs</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Novo SLA
          </button>
        </div>

        <div className="card mb-6">
          <div className="flex items-center gap-2">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadSLAs()}
              placeholder="Buscar por nome ou categoria..."
              className="input"
            />
            <button onClick={loadSLAs} className="btn btn-primary">
              Buscar
            </button>
          </div>
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
                  <th className="text-left py-3 px-4">Nome</th>
                  <th className="text-left py-3 px-4">Categoria</th>
                  <th className="text-left py-3 px-4">Prioridade</th>
                  <th className="text-left py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      Tempo Resposta
                    </div>
                  </th>
                  <th className="text-left py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      Tempo Resolução
                    </div>
                  </th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {slas.map((sla) => (
                  <tr key={sla.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{sla.name}</td>
                    <td className="py-3 px-4">
                      {sla.category?.name || 'Todas'}
                    </td>
                    <td className="py-3 px-4">{getPriorityBadge(sla.priority)}</td>
                    <td className="py-3 px-4">{formatTime(sla.responseTime)}</td>
                    <td className="py-3 px-4">{formatTime(sla.resolutionTime)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`badge ${
                          sla.active ? 'badge-resolved' : 'badge-closed'
                        }`}
                      >
                        {sla.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEdit(sla)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(sla.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {slas.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Nenhum SLA encontrado
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                {editingSLA ? 'Editar SLA' : 'Novo SLA'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    required
                    placeholder="Ex: SLA Suporte Técnico"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Categoria (opcional)
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className="input"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Se não especificar, o SLA será aplicado a todas as categorias
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Prioridade *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
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
                  <label className="block text-sm font-medium mb-1">
                    Tempo de Resposta (minutos) *
                  </label>
                  <input
                    type="number"
                    value={formData.responseTime}
                    onChange={(e) =>
                      setFormData({ ...formData, responseTime: e.target.value })
                    }
                    className="input"
                    required
                    min="1"
                    placeholder="Ex: 60 (1 hora)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tempo máximo para primeira resposta ao cliente
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tempo de Resolução (minutos) *
                  </label>
                  <input
                    type="number"
                    value={formData.resolutionTime}
                    onChange={(e) =>
                      setFormData({ ...formData, resolutionTime: e.target.value })
                    }
                    className="input"
                    required
                    min="1"
                    placeholder="Ex: 480 (8 horas)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tempo máximo para resolver completamente o chamado
                  </p>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary flex-1">
                    Salvar
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
