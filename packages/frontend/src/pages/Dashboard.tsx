import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  TrendingUp,
  AlertTriangle,
  Target,
} from 'lucide-react';

interface TicketsByClient {
  clientName: string;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  total: number;
}

interface TicketsByCategory {
  categoryName: string;
  count: number;
}

interface TicketsByAttendant {
  attendantName: string;
  open: number;
  inProgress: number;
  resolved: number;
  total: number;
}

interface SLACompliance {
  withinSLA: number;
  outsideSLA: number;
  noSLA: number;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    total: 0,
  });
  const [ticketsByClient, setTicketsByClient] = useState<TicketsByClient[]>([]);
  const [ticketsByCategory, setTicketsByCategory] = useState<TicketsByCategory[]>([]);
  const [ticketsByAttendant, setTicketsByAttendant] = useState<TicketsByAttendant[]>([]);
  const [slaCompliance, setSlaCompliance] = useState<SLACompliance>({
    withinSLA: 0,
    outsideSLA: 0,
    noSLA: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await api.get('/tickets');
      const tickets = response.data.tickets || [];

      // Estatísticas gerais
      const generalStats = {
        open: tickets.filter((t: any) => t.status === 'OPEN').length,
        inProgress: tickets.filter((t: any) => t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter((t: any) => t.status === 'RESOLVED').length,
        closed: tickets.filter((t: any) => t.status === 'CLOSED').length,
        total: tickets.length,
      };
      setStats(generalStats);

      // Chamados por cliente
      const clientMap = new Map<string, TicketsByClient>();
      tickets.forEach((ticket: any) => {
        const clientName = ticket.client?.name || 'Sem cliente';
        if (!clientMap.has(clientName)) {
          clientMap.set(clientName, {
            clientName,
            open: 0,
            inProgress: 0,
            resolved: 0,
            closed: 0,
            total: 0,
          });
        }
        const client = clientMap.get(clientName)!;
        client.total++;
        if (ticket.status === 'OPEN') client.open++;
        if (ticket.status === 'IN_PROGRESS') client.inProgress++;
        if (ticket.status === 'RESOLVED') client.resolved++;
        if (ticket.status === 'CLOSED') client.closed++;
      });
      const clientsArray = Array.from(clientMap.values()).sort((a, b) => b.total - a.total);
      setTicketsByClient(clientsArray.slice(0, 10)); // Top 10 clientes

      // Chamados por categoria
      const categoryMap = new Map<string, number>();
      tickets.forEach((ticket: any) => {
        const categoryName = ticket.category?.name || 'Sem categoria';
        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
      });
      const categoriesArray = Array.from(categoryMap.entries())
        .map(([categoryName, count]) => ({ categoryName, count }))
        .sort((a, b) => b.count - a.count);
      setTicketsByCategory(categoriesArray);

      // Chamados por atendente
      const attendantMap = new Map<string, TicketsByAttendant>();
      tickets.forEach((ticket: any) => {
        if (ticket.assignedTo) {
          const attendantName = ticket.assignedTo?.name || 'Não atribuído';
          if (!attendantMap.has(attendantName)) {
            attendantMap.set(attendantName, {
              attendantName,
              open: 0,
              inProgress: 0,
              resolved: 0,
              total: 0,
            });
          }
          const attendant = attendantMap.get(attendantName)!;
          attendant.total++;
          if (ticket.status === 'OPEN') attendant.open++;
          if (ticket.status === 'IN_PROGRESS') attendant.inProgress++;
          if (ticket.status === 'RESOLVED') attendant.resolved++;
        }
      });
      const attendantsArray = Array.from(attendantMap.values()).sort((a, b) => b.total - a.total);
      setTicketsByAttendant(attendantsArray);

      // Conformidade com SLA
      const now = new Date();
      let withinSLA = 0;
      let outsideSLA = 0;
      let noSLA = 0;

      tickets.forEach((ticket: any) => {
        if (!ticket.resolutionDeadline) {
          noSLA++;
        } else if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
          const resolvedDate = new Date(ticket.resolvedAt || ticket.closedAt);
          const deadline = new Date(ticket.resolutionDeadline);
          if (resolvedDate <= deadline) {
            withinSLA++;
          } else {
            outsideSLA++;
          }
        } else {
          const deadline = new Date(ticket.resolutionDeadline);
          if (now <= deadline) {
            withinSLA++;
          } else {
            outsideSLA++;
          }
        }
      });

      setSlaCompliance({ withinSLA, outsideSLA, noSLA });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Abertos',
      value: stats.open,
      icon: AlertCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Em Andamento',
      value: stats.inProgress,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      title: 'Resolvidos',
      value: stats.resolved,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Fechados',
      value: stats.closed,
      icon: XCircle,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
    },
  ];

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500';
      case 'inProgress':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Cards de estatísticas gerais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.title} className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`${stat.bg} p-3 rounded-lg`}>
                        <Icon className={stat.color} size={24} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Conformidade com SLA */}
            <div className="card mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Target className="text-primary-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Conformidade com SLA</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Dentro do SLA</p>
                  <p className="text-3xl font-bold text-green-600">{slaCompliance.withinSLA}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.total > 0
                      ? Math.round((slaCompliance.withinSLA / stats.total) * 100)
                      : 0}
                    % do total
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Fora do SLA</p>
                  <p className="text-3xl font-bold text-red-600">{slaCompliance.outsideSLA}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.total > 0
                      ? Math.round((slaCompliance.outsideSLA / stats.total) * 100)
                      : 0}
                    % do total
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Sem SLA</p>
                  <p className="text-3xl font-bold text-gray-600">{slaCompliance.noSLA}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.total > 0 ? Math.round((slaCompliance.noSLA / stats.total) * 100) : 0}%
                    do total
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Chamados por Cliente */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="text-primary-600" size={24} />
                  <h2 className="text-xl font-bold text-gray-900">Chamados por Cliente</h2>
                </div>
                {ticketsByClient.length > 0 ? (
                  <div className="space-y-4">
                    {ticketsByClient.map((client) => (
                      <div key={client.clientName}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900">{client.clientName}</span>
                          <span className="text-sm text-gray-600">{client.total} chamados</span>
                        </div>
                        <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-200">
                          {client.open > 0 && (
                            <div
                              className="bg-blue-500"
                              style={{ width: `${(client.open / client.total) * 100}%` }}
                              title={`${client.open} abertos`}
                            />
                          )}
                          {client.inProgress > 0 && (
                            <div
                              className="bg-yellow-500"
                              style={{ width: `${(client.inProgress / client.total) * 100}%` }}
                              title={`${client.inProgress} em andamento`}
                            />
                          )}
                          {client.resolved > 0 && (
                            <div
                              className="bg-green-500"
                              style={{ width: `${(client.resolved / client.total) * 100}%` }}
                              title={`${client.resolved} resolvidos`}
                            />
                          )}
                          {client.closed > 0 && (
                            <div
                              className="bg-gray-500"
                              style={{ width: `${(client.closed / client.total) * 100}%` }}
                              title={`${client.closed} fechados`}
                            />
                          )}
                        </div>
                        <div className="flex gap-3 mt-1 text-xs text-gray-600">
                          <span>🔵 {client.open} abertos</span>
                          <span>🟡 {client.inProgress} em andamento</span>
                          <span>🟢 {client.resolved} resolvidos</span>
                          <span>⚫ {client.closed} fechados</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
                )}
              </div>

              {/* Chamados por Categoria */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="text-primary-600" size={24} />
                  <h2 className="text-xl font-bold text-gray-900">Chamados por Categoria</h2>
                </div>
                {ticketsByCategory.length > 0 ? (
                  <div className="space-y-3">
                    {ticketsByCategory.map((category) => (
                      <div key={category.categoryName}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-900">
                            {category.categoryName}
                          </span>
                          <span className="text-sm text-gray-600">{category.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{
                              width: `${(category.count / stats.total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Nenhum dado disponível</p>
                )}
              </div>
            </div>

            {/* Chamados por Atendente */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-primary-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">
                  Desempenho por Atendente
                </h2>
              </div>
              {ticketsByAttendant.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Atendente</th>
                        <th className="text-center py-2 px-4">Abertos</th>
                        <th className="text-center py-2 px-4">Em Andamento</th>
                        <th className="text-center py-2 px-4">Resolvidos</th>
                        <th className="text-center py-2 px-4">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticketsByAttendant.map((attendant) => (
                        <tr key={attendant.attendantName} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4 font-medium">{attendant.attendantName}</td>
                          <td className="text-center py-2 px-4">{attendant.open}</td>
                          <td className="text-center py-2 px-4">{attendant.inProgress}</td>
                          <td className="text-center py-2 px-4">{attendant.resolved}</td>
                          <td className="text-center py-2 px-4 font-bold">{attendant.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhum chamado atribuído a atendentes
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};
