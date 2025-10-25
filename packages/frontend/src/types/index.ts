export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'ATTENDANT' | 'VIEWER';
  active: boolean;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  address?: string;
  active: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  active: boolean;
  createdAt: string;
}

export interface SLA {
  id: string;
  name: string;
  categoryId?: string;
  category?: Category;
  responseTime: number;
  resolutionTime: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  active: boolean;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  clientId: string;
  client: Client;
  categoryId: string;
  category: Category;
  slaId?: string;
  sla?: SLA;
  assignedToId?: string;
  assignedTo?: User;
  responseDeadline?: string;
  resolutionDeadline?: string;
  respondedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
