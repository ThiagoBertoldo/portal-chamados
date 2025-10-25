# Documentação da API

Base URL: `http://localhost:3001/api`

## Autenticação

A maioria dos endpoints requer autenticação via JWT Token.

Adicione o token no header:
```
Authorization: Bearer seu-token-aqui
```

## Endpoints

### 🔐 Autenticação

#### POST /auth/login
Login no sistema.

**Body:**
```json
{
  "email": "admin@impulso.com",
  "password": "admin123"
}
```

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@impulso.com",
    "name": "Administrador",
    "role": "ADMIN"
  },
  "token": "jwt-token"
}
```

#### POST /auth/register
Criar novo usuário.

#### GET /auth/me
Retorna dados do usuário autenticado.

---

### 👥 Clientes

#### GET /clients
Listar clientes.

**Query Params:**
- `active`: boolean - Filtrar por status
- `search`: string - Buscar por nome/email/documento

#### GET /clients/:id
Buscar cliente por ID.

#### POST /clients
Criar novo cliente.

**Body:**
```json
{
  "name": "Empresa ABC",
  "email": "contato@empresa.com",
  "phone": "(11) 98765-4321",
  "document": "12.345.678/0001-90",
  "address": "Rua Exemplo, 123"
}
```

#### PUT /clients/:id
Atualizar cliente.

#### DELETE /clients/:id
Deletar cliente.

---

### 📂 Categorias

#### GET /categories
Listar categorias.

**Query Params:**
- `active`: boolean

#### POST /categories
Criar categoria.

**Body:**
```json
{
  "name": "Suporte Técnico",
  "description": "Problemas técnicos",
  "color": "#3B82F6"
}
```

---

### ⏱️ SLAs

#### GET /slas
Listar SLAs.

#### POST /slas
Criar SLA.

**Body:**
```json
{
  "name": "SLA Urgente",
  "categoryId": "uuid",
  "responseTime": 30,
  "resolutionTime": 240,
  "priority": "URGENT"
}
```

---

### 🎫 Chamados

#### GET /tickets
Listar chamados.

**Query Params:**
- `status`: OPEN | IN_PROGRESS | RESOLVED | CLOSED
- `priority`: LOW | MEDIUM | HIGH | URGENT
- `clientId`: uuid
- `categoryId`: uuid
- `page`: number (default: 1)
- `limit`: number (default: 50)

**Response:**
```json
{
  "tickets": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "pages": 2
  }
}
```

#### GET /tickets/:id
Buscar chamado com detalhes, comentários e histórico.

#### POST /tickets
Criar chamado.

**Body:**
```json
{
  "title": "Título do chamado",
  "description": "Descrição detalhada",
  "priority": "MEDIUM",
  "clientId": "uuid",
  "categoryId": "uuid",
  "assignedToId": "uuid"
}
```

#### PUT /tickets/:id
Atualizar chamado.

**Body:**
```json
{
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "assignedToId": "uuid"
}
```

#### POST /tickets/:id/comments
Adicionar comentário.

**Body:**
```json
{
  "content": "Comentário aqui",
  "isInternal": false
}
```

---

### 👨‍💼 Usuários

#### GET /users
Listar usuários (Admin only).

#### POST /users
Criar usuário (Admin only).

**Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123",
  "name": "Nome do Usuário",
  "role": "ATTENDANT"
}
```

---

### 📊 Relatórios

#### GET /reports/client-synthetic
Relatório sintético por cliente.

**Query Params:**
- `startDate`: ISO date
- `endDate`: ISO date

**Response:**
```json
[
  {
    "clientId": "uuid",
    "clientName": "Empresa ABC",
    "totalTickets": 50,
    "openTickets": 10,
    "inProgressTickets": 15,
    "resolvedTickets": 20,
    "closedTickets": 5
  }
]
```

#### GET /reports/client-analytical
Relatório analítico por cliente.

**Query Params:**
- `startDate`: ISO date
- `endDate`: ISO date
- `clientId`: uuid (optional)

#### GET /reports/daily-tickets
Chamados por dia.

**Query Params (obrigatórios):**
- `startDate`: ISO date
- `endDate`: ISO date

**Response:**
```json
[
  {
    "date": "2024-01-15",
    "total": 25,
    "byStatus": {
      "OPEN": 10,
      "IN_PROGRESS": 8,
      "RESOLVED": 5,
      "CLOSED": 2
    },
    "byPriority": {
      "LOW": 5,
      "MEDIUM": 12,
      "HIGH": 6,
      "URGENT": 2
    }
  }
]
```

#### GET /reports/monthly-tickets
Chamados por mês.

#### GET /reports/by-category
Relatório por categoria.

#### GET /reports/sla-compliance
Cumprimento de SLA.

**Query Params:**
- `startDate`: ISO date
- `endDate`: ISO date
- `slaId`: uuid (optional)

---

## Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado |
| 204 | Sem conteúdo |
| 400 | Requisição inválida |
| 401 | Não autorizado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 500 | Erro interno |

## Exemplos com cURL

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@impulso.com","password":"admin123"}'
```

### Listar Clientes
```bash
curl http://localhost:3001/api/clients \
  -H "Authorization: Bearer seu-token"
```

### Criar Chamado
```bash
curl -X POST http://localhost:3001/api/tickets \
  -H "Authorization: Bearer seu-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Problema no sistema",
    "description": "Sistema não está respondendo",
    "clientId": "uuid-do-cliente",
    "categoryId": "uuid-da-categoria",
    "priority": "HIGH"
  }'
```
