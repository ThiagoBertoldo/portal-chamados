# Exemplos Práticos de Uso

## Cenário 1: Primeiro Acesso ao Sistema

### 1. Instalar e Configurar
```bash
# Clone o projeto
git clone <seu-repositorio>
cd impulso-tecnologia-portal

# Instale dependências
npm install

# Configure o banco
createdb impulso_chamados

# Configure .env do backend
cp packages/backend/.env.example packages/backend/.env
# Edite com suas credenciais

# Execute migrações
npm run prisma:migrate

# Popule o banco
cd packages/backend && npm run seed
```

### 2. Fazer Login
```bash
# Inicie o sistema
npm run dev

# Acesse: http://localhost:5173
# Login: admin@impulso.com
# Senha: admin123
```

## Cenário 2: Cadastrar um Novo Cliente

### Via Interface Web

1. Acesse o menu **Clientes**
2. Clique em **"Novo Cliente"**
3. Preencha os dados:
   ```
   Nome: Tech Solutions Ltda
   Email: contato@techsolutions.com
   Telefone: (11) 99999-8888
   Documento: 12.345.678/0001-90
   Endereço: Av. Paulista, 1000 - São Paulo, SP
   ```
4. Clique em **"Salvar"**

### Via API

```bash
# Faça login primeiro
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@impulso.com","password":"admin123"}' \
  | jq -r '.token')

# Crie o cliente
curl -X POST http://localhost:3001/api/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Solutions Ltda",
    "email": "contato@techsolutions.com",
    "phone": "(11) 99999-8888",
    "document": "12.345.678/0001-90",
    "address": "Av. Paulista, 1000 - São Paulo, SP"
  }'
```

## Cenário 3: Configurar Bot do Telegram

### 1. Criar o Bot

1. Abra Telegram e procure: `@BotFather`
2. Envie: `/newbot`
3. Nome: `Portal Impulso`
4. Username: `impulso_portal_bot`
5. Copie o token recebido

### 2. Configurar

```bash
# Configure o .env
cd packages/telegram-bot
cp .env.example .env
nano .env

# Cole o token
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
API_URL=http://localhost:3001
```

### 3. Testar

```bash
# Inicie o bot
npm run dev

# No Telegram:
# 1. Procure seu bot
# 2. Envie: /start
# 3. Envie: /novo
# 4. Siga o fluxo
```

## Cenário 4: Criar Chamado via Telegram

### Fluxo Completo

```
Você: /novo

Bot: 👤 Selecione o cliente:
[Empresa ABC Ltda]
[João Silva]
[Maria Santos]
[Tech Solutions Ltda]

Você: [Clica "Tech Solutions Ltda"]

Bot: 📂 Selecione a categoria:
[Suporte Técnico]
[Financeiro]
[Comercial]
[Infraestrutura]
[Outros]

Você: [Clica "Suporte Técnico"]

Bot: 📝 Digite a descrição do problema:
(Seja o mais detalhado possível)

Você: Sistema de vendas apresentando erro 500 ao tentar
      finalizar pedidos. Problema começou após a última
      atualização às 14h. Afetando todos os vendedores.

Bot: ✅ Chamado criado com sucesso!

🎫 ID: abc-123-def
📋 Status: OPEN
⚡ Prioridade: MEDIUM

Você receberá atualizações sobre este chamado em breve.
```

## Cenário 5: Atender um Chamado

### 1. Ver Chamados Abertos

Acesse: **Chamados** → Filtrar por **Status: Aberto**

### 2. Abrir Detalhes

Clique no chamado para ver:
- Dados do cliente
- Descrição completa
- Categoria
- SLA aplicado
- Prazos

### 3. Atribuir para Si

```
Atribuir para: [Seu Nome] ✓
Status: Em Andamento ✓
Salvar
```

### 4. Adicionar Comentário

```
Comentário:
"Identifiquei o problema. Erro causado por timeout
no servidor de pagamentos. Aplicando correção."

[ ] Comentário interno
[Enviar]
```

### 5. Resolver

```
Status: Resolvido ✓
Comentário:
"Problema corrigido. Sistema funcionando normalmente.
Realizado rollback da atualização problemática."

[Salvar]
```

## Cenário 6: Gerar Relatório

### Relatório de SLA

1. Acesse: **Relatórios** → **Cumprimento de SLA**
2. Configure:
   ```
   Data Início: 01/01/2024
   Data Fim: 31/01/2024
   SLA: [Todos]
   ```
3. Clique: **Gerar Relatório**

### Via API

```bash
# Relatório de SLA
curl "http://localhost:3001/api/reports/sla-compliance?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer $TOKEN"

# Relatório por Cliente
curl "http://localhost:3001/api/reports/client-synthetic?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer $TOKEN"

# Chamados por Dia
curl "http://localhost:3001/api/reports/daily-tickets?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer $TOKEN"
```

## Cenário 7: Criar Novo Usuário Atendente

### Via Interface

1. Menu: **Usuários** (apenas Admin)
2. Clique: **Novo Usuário**
3. Preencha:
   ```
   Nome: Carlos Santos
   Email: carlos@impulso.com
   Senha: senha123
   Papel: Atendente
   ```
4. Salvar

### Via API

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Carlos Santos",
    "email": "carlos@impulso.com",
    "password": "senha123",
    "role": "ATTENDANT"
  }'
```

## Cenário 8: Configurar SLA Personalizado

### Exemplo: SLA para Urgência

```json
{
  "name": "SLA Crítico",
  "categoryId": "uuid-suporte-tecnico",
  "responseTime": 15,      // 15 minutos para primeira resposta
  "resolutionTime": 120,   // 2 horas para resolução
  "priority": "URGENT"
}
```

### Via Interface

1. Menu: **SLA**
2. Novo SLA
3. Preencha os dados acima
4. Salvar

### O que acontece?

- Chamados da categoria "Suporte Técnico" com prioridade "Urgente"
- Automaticamente usarão este SLA
- Sistema calculará prazos:
  - Resposta até: 15min após abertura
  - Resolução até: 2h após abertura
- Relatórios mostrarão se prazos foram cumpridos

## Cenário 9: Buscar Chamados

### Via Interface

Use os filtros:
```
Status: [Em Andamento]
Prioridade: [Alta]
Cliente: [Tech Solutions]
Categoria: [Suporte Técnico]
Buscar
```

### Via API

```bash
# Chamados em andamento de um cliente
curl "http://localhost:3001/api/tickets?status=IN_PROGRESS&clientId=uuid-cliente" \
  -H "Authorization: Bearer $TOKEN"

# Chamados urgentes
curl "http://localhost:3001/api/tickets?priority=URGENT" \
  -H "Authorization: Bearer $TOKEN"

# Com paginação
curl "http://localhost:3001/api/tickets?page=2&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

## Cenário 10: Monitorar Dashboard

### Métricas Disponíveis

Dashboard mostra em tempo real:

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│   Abertos: 12   │ Em Andamento: 8 │  Resolvidos: 45 │  Fechados: 120  │
│      🔵         │       🟡        │       🟢        │       ⚪        │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### Atualizar Métricas

As métricas são calculadas em tempo real:
- Cada refresh da página busca dados atualizados
- Sem cache
- Reflete estado atual do banco

## Cenário 11: Exportar Dados

### Preparar Endpoint de Exportação

Adicione ao `reportController.ts`:

```typescript
export const exportToCSV = async (req: Request, res: Response) => {
  const tickets = await prisma.ticket.findMany({
    include: { client: true, category: true }
  });

  const csv = tickets.map(t =>
    `${t.id},${t.client.name},${t.category.name},${t.status}`
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=tickets.csv');
  res.send(csv);
};
```

## Cenário 12: Backup do Banco

### Backup Manual

```bash
# Backup completo
pg_dump impulso_chamados > backup.sql

# Backup apenas dados
pg_dump --data-only impulso_chamados > backup_data.sql

# Backup com compressão
pg_dump impulso_chamados | gzip > backup.sql.gz
```

### Restaurar

```bash
# Restaurar backup
psql impulso_chamados < backup.sql

# Restaurar compactado
gunzip -c backup.sql.gz | psql impulso_chamados
```

## Dicas Úteis

### 1. Visualizar Banco de Dados
```bash
npm run prisma:studio
# Acesse: http://localhost:5555
```

### 2. Resetar Banco
```bash
cd packages/backend
npx prisma migrate reset
npm run seed
```

### 3. Ver Logs em Tempo Real
```bash
# Backend
cd packages/backend && npm run dev

# Bot
cd packages/telegram-bot && npm run dev
```

### 4. Testar API Rapidamente
Use o arquivo `test.http` com extensão REST Client do VS Code:

```http
### Login
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "admin@impulso.com",
  "password": "admin123"
}

### Listar Clientes
GET http://localhost:3001/api/clients
Authorization: Bearer seu-token-aqui
```

### 5. Debug do Bot
```typescript
// Adicione logs no index.ts do bot
console.log('Mensagem recebida:', msg);
console.log('Session:', userSessions.get(userId));
```
