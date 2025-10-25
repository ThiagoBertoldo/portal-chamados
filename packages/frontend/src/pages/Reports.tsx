import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';
import {
  FileText,
  BarChart3,
  Calendar,
  TrendingUp,
  Target,
  Download,
  Filter,
  FileDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ReportType =
  | 'client-synthetic'
  | 'client-analytical'
  | 'daily'
  | 'monthly'
  | 'category'
  | 'sla'
  | null;

interface ClientSyntheticData {
  clientName: string;
  totalTickets: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

interface DailyData {
  date: string;
  count: number;
}

interface MonthlyData {
  month: string;
  count: number;
}

interface CategoryData {
  categoryName: string;
  count: number;
  percentage: number;
}

interface SLAData {
  categoryName: string;
  withinSLA: number;
  outsideSLA: number;
  noSLA: number;
  total: number;
  complianceRate: number;
}

export const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportType>(null);
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (selectedReport) {
      loadReportData();
    }
  }, [selectedReport, dateFilter]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateFilter.startDate) params.startDate = dateFilter.startDate;
      if (dateFilter.endDate) params.endDate = dateFilter.endDate;

      const response = await api.get('/tickets', { params });
      setTickets(response.data.tickets || []);
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateClientSynthetic = (): ClientSyntheticData[] => {
    const clientMap = new Map<string, ClientSyntheticData>();

    tickets.forEach((ticket: any) => {
      const clientName = ticket.client?.name || 'Sem cliente';
      if (!clientMap.has(clientName)) {
        clientMap.set(clientName, {
          clientName,
          totalTickets: 0,
          open: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0,
        });
      }
      const client = clientMap.get(clientName)!;
      client.totalTickets++;
      if (ticket.status === 'OPEN') client.open++;
      if (ticket.status === 'IN_PROGRESS') client.inProgress++;
      if (ticket.status === 'RESOLVED') client.resolved++;
      if (ticket.status === 'CLOSED') client.closed++;
    });

    return Array.from(clientMap.values()).sort((a, b) => b.totalTickets - a.totalTickets);
  };

  const generateDailyReport = (): DailyData[] => {
    const dailyMap = new Map<string, number>();

    tickets.forEach((ticket: any) => {
      const date = new Date(ticket.createdAt).toISOString().split('T')[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });

    return Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const generateMonthlyReport = (): MonthlyData[] => {
    const monthlyMap = new Map<string, number>();

    tickets.forEach((ticket: any) => {
      const date = new Date(ticket.createdAt);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
    });

    return Array.from(monthlyMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const generateCategoryReport = (): CategoryData[] => {
    const categoryMap = new Map<string, number>();
    const total = tickets.length;

    tickets.forEach((ticket: any) => {
      const categoryName = ticket.category?.name || 'Sem categoria';
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
    });

    return Array.from(categoryMap.entries())
      .map(([categoryName, count]) => ({
        categoryName,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const generateSLAReport = (): SLAData[] => {
    const categoryMap = new Map<string, SLAData>();
    const now = new Date();

    tickets.forEach((ticket: any) => {
      const categoryName = ticket.category?.name || 'Sem categoria';
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          categoryName,
          withinSLA: 0,
          outsideSLA: 0,
          noSLA: 0,
          total: 0,
          complianceRate: 0,
        });
      }
      const category = categoryMap.get(categoryName)!;
      category.total++;

      if (!ticket.resolutionDeadline) {
        category.noSLA++;
      } else if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
        const resolvedDate = new Date(ticket.resolvedAt || ticket.closedAt);
        const deadline = new Date(ticket.resolutionDeadline);
        if (resolvedDate <= deadline) {
          category.withinSLA++;
        } else {
          category.outsideSLA++;
        }
      } else {
        const deadline = new Date(ticket.resolutionDeadline);
        if (now <= deadline) {
          category.withinSLA++;
        } else {
          category.outsideSLA++;
        }
      }
    });

    const result = Array.from(categoryMap.values());
    result.forEach((cat) => {
      const withSLA = cat.withinSLA + cat.outsideSLA;
      cat.complianceRate = withSLA > 0 ? (cat.withinSLA / withSLA) * 100 : 0;
    });

    return result.sort((a, b) => b.total - a.total);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((header) => JSON.stringify(row[header] || '')).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = (title: string, data: any[], columns: string[]) => {
    if (data.length === 0) return;

    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text(title, 14, 20);

    // Informações do relatório
    doc.setFontSize(10);
    doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
    if (dateFilter.startDate || dateFilter.endDate) {
      const filterText = `Período: ${dateFilter.startDate ? new Date(dateFilter.startDate).toLocaleDateString('pt-BR') : 'Início'} até ${dateFilter.endDate ? new Date(dateFilter.endDate).toLocaleDateString('pt-BR') : 'Hoje'}`;
      doc.text(filterText, 14, 34);
    }

    // Tabela
    const tableData = data.map((row) =>
      columns.map((col) => row[col] !== undefined ? String(row[col]) : '-')
    );

    autoTable(doc, {
      head: [columns],
      body: tableData,
      startY: dateFilter.startDate || dateFilter.endDate ? 40 : 34,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const renderReport = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      );
    }

    switch (selectedReport) {
      case 'client-synthetic': {
        const data = generateClientSynthetic();
        const chartData = data.slice(0, 10).map((client) => ({
          name: client.clientName.length > 20 ? client.clientName.substring(0, 20) + '...' : client.clientName,
          total: client.totalTickets,
        }));

        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Cliente Sintético</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => exportToCSV(data, 'cliente_sintetico')}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Download size={18} />
                  CSV
                </button>
                <button
                  onClick={() => exportToPDF('Cliente Sintético', data, ['clientName', 'totalTickets', 'open', 'inProgress', 'resolved', 'closed'])}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <FileDown size={18} />
                  PDF
                </button>
              </div>
            </div>

            {/* Gráfico de Barras */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4">Top 10 Clientes - Gráfico de Barras</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#3b82f6" name="Total de Chamados" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Pizza */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4">Distribuição por Cliente - Gráfico de Pizza</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={(entry) => `${entry.name}: ${entry.total}`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
              <h3 className="text-lg font-bold mb-4">Detalhamento Completo</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Cliente</th>
                    <th className="text-center py-3 px-4">Total</th>
                    <th className="text-center py-3 px-4">Abertos</th>
                    <th className="text-center py-3 px-4">Em Andamento</th>
                    <th className="text-center py-3 px-4">Resolvidos</th>
                    <th className="text-center py-3 px-4">Fechados</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((client) => (
                    <tr key={client.clientName} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{client.clientName}</td>
                      <td className="text-center py-3 px-4 font-bold">{client.totalTickets}</td>
                      <td className="text-center py-3 px-4">{client.open}</td>
                      <td className="text-center py-3 px-4">{client.inProgress}</td>
                      <td className="text-center py-3 px-4">{client.resolved}</td>
                      <td className="text-center py-3 px-4">{client.closed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'client-analytical': {
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Cliente Analítico</h2>
              <button
                onClick={() => exportToCSV(tickets, 'cliente_analitico')}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Download size={18} />
                Exportar CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">ID</th>
                    <th className="text-left py-2 px-3">Cliente</th>
                    <th className="text-left py-2 px-3">Título</th>
                    <th className="text-left py-2 px-3">Categoria</th>
                    <th className="text-left py-2 px-3">Status</th>
                    <th className="text-left py-2 px-3">Criado em</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">#{ticket.id.slice(0, 8)}</td>
                      <td className="py-2 px-3">{ticket.client?.name || '-'}</td>
                      <td className="py-2 px-3">{ticket.title}</td>
                      <td className="py-2 px-3">{ticket.category?.name || '-'}</td>
                      <td className="py-2 px-3">
                        <span className={`badge badge-${ticket.status.toLowerCase()}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'daily': {
        const data = generateDailyReport();
        const maxCount = Math.max(...data.map((d) => d.count), 1);
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Abertos por Dia</h2>
              <button
                onClick={() => exportToCSV(data, 'abertos_por_dia')}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Download size={18} />
                Exportar CSV
              </button>
            </div>
            <div className="space-y-3">
              {data.map((day) => (
                <div key={day.date}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">
                      {new Date(day.date).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="text-sm text-gray-600">{day.count} chamados</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full"
                      style={{ width: `${(day.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'monthly': {
        const data = generateMonthlyReport();
        const maxCount = Math.max(...data.map((d) => d.count), 1);
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Abertos por Mês</h2>
              <button
                onClick={() => exportToCSV(data, 'abertos_por_mes')}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Download size={18} />
                Exportar CSV
              </button>
            </div>
            <div className="space-y-4">
              {data.map((month) => (
                <div key={month.month}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-lg">
                      {new Date(month.month + '-01').toLocaleDateString('pt-BR', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-sm text-gray-600 font-bold">{month.count} chamados</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full flex items-center justify-end px-2"
                      style={{ width: `${(month.count / maxCount) * 100}%` }}
                    >
                      {month.count > 0 && (
                        <span className="text-white text-xs font-bold">{month.count}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'category': {
        const data = generateCategoryReport();
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Por Categoria</h2>
              <button
                onClick={() => exportToCSV(data, 'por_categoria')}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Download size={18} />
                Exportar CSV
              </button>
            </div>
            <div className="space-y-4">
              {data.map((category) => (
                <div key={category.categoryName}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{category.categoryName}</span>
                    <span className="text-sm text-gray-600">
                      {category.count} ({category.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'sla': {
        const data = generateSLAReport();
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Cumprimento de SLA</h2>
              <button
                onClick={() => exportToCSV(data, 'cumprimento_sla')}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Download size={18} />
                Exportar CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Categoria</th>
                    <th className="text-center py-3 px-4">Total</th>
                    <th className="text-center py-3 px-4">Dentro do SLA</th>
                    <th className="text-center py-3 px-4">Fora do SLA</th>
                    <th className="text-center py-3 px-4">Sem SLA</th>
                    <th className="text-center py-3 px-4">Taxa de Conformidade</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((category) => (
                    <tr key={category.categoryName} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{category.categoryName}</td>
                      <td className="text-center py-3 px-4 font-bold">{category.total}</td>
                      <td className="text-center py-3 px-4 text-green-600">
                        {category.withinSLA}
                      </td>
                      <td className="text-center py-3 px-4 text-red-600">
                        {category.outsideSLA}
                      </td>
                      <td className="text-center py-3 px-4 text-gray-600">{category.noSLA}</td>
                      <td className="text-center py-3 px-4">
                        <span
                          className={`font-bold ${
                            category.complianceRate >= 80
                              ? 'text-green-600'
                              : category.complianceRate >= 60
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}
                        >
                          {category.complianceRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const reportCards = [
    {
      id: 'client-synthetic' as ReportType,
      title: 'Cliente Sintético',
      description: 'Resumo de chamados por cliente',
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      id: 'client-analytical' as ReportType,
      title: 'Cliente Analítico',
      description: 'Detalhamento de chamados por cliente',
      icon: BarChart3,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      id: 'daily' as ReportType,
      title: 'Abertos por Dia',
      description: 'Chamados abertos diariamente',
      icon: Calendar,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      id: 'monthly' as ReportType,
      title: 'Abertos por Mês',
      description: 'Chamados abertos mensalmente',
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      id: 'category' as ReportType,
      title: 'Por Categoria',
      description: 'Distribuição por categorias',
      icon: BarChart3,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      id: 'sla' as ReportType,
      title: 'Cumprimento de SLA',
      description: 'Análise de SLA compliance',
      icon: Target,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Relatórios</h1>

        {!selectedReport ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportCards.map((report) => {
              const Icon = report.icon;
              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className="card hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={`${report.bg} p-3 rounded-lg`}>
                      <Icon className={report.color} size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{report.title}</h3>
                      <p className="text-gray-600 text-sm">{report.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedReport(null)}
              className="btn btn-secondary mb-4"
            >
              ← Voltar aos Relatórios
            </button>

            {/* Filtro de data */}
            <div className="card mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter size={20} className="text-primary-600" />
                <h3 className="font-bold">Filtros</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Data Inicial</label>
                  <input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) =>
                      setDateFilter({ ...dateFilter, startDate: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data Final</label>
                  <input
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
            </div>

            <div className="card">{renderReport()}</div>
          </div>
        )}
      </div>
    </Layout>
  );
};
