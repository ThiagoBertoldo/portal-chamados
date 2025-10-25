export interface UserSession {
  step: 'awaiting_client' | 'awaiting_category' | 'awaiting_description' | 'idle';
  clientId?: string;
  categoryId?: string;
  description?: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
}
