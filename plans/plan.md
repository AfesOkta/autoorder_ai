# AutoOrder AI - Backend Architecture Plan

## Project Overview

- **Project Name**: AutoOrder AI
- **Type**: Multi-tenant SaaS Backend
- **Core Functionality**: Convert WhatsApp messages from customers into structured orders using AI
- **Target Users**: Indonesian UMKM (small food businesses, drink stalls, online sellers)

---

## System Architecture

### Flow Diagram

```
WhatsApp Customer
       ↓
WhatsApp Gateway (Fonnte)
       ↓
Webhook Endpoint (/webhook/whatsapp)
       ↓
Message Service (store message)
       ↓
Redis Queue (BullMQ - message_parse_queue)
       ↓
AI Parser Worker
       ↓
Order Service (match products, create order)
       ↓
PostgreSQL Database
```

### Technology Stack

- **Backend Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Queue System**: Redis + BullMQ
- **AI Integration**: OpenAI API (GPT-4o-mini)
- **Authentication**: JWT

---

## Database Schema (Prisma)

### Tables Structure

#### tenants

| Column     | Type     | Description           |
| ---------- | -------- | --------------------- |
| id         | UUID     | Primary key           |
| name       | String   | Tenant name           |
| phone      | String   | WhatsApp phone number |
| created_at | DateTime | Creation timestamp    |

#### users

| Column     | Type     | Description                    |
| ---------- | -------- | ------------------------------ |
| id         | UUID     | Primary key                    |
| tenant_id  | UUID     | Foreign key to tenants         |
| email      | String   | User email (unique per tenant) |
| password   | String   | Hashed password                |
| role       | Enum     | ADMIN, STAFF                   |
| created_at | DateTime | Creation timestamp             |

#### products

| Column     | Type     | Description            |
| ---------- | -------- | ---------------------- |
| id         | UUID     | Primary key            |
| tenant_id  | UUID     | Foreign key to tenants |
| name       | String   | Product name           |
| price      | Decimal  | Product price          |
| is_active  | Boolean  | Active status          |
| created_at | DateTime | Creation timestamp     |

#### messages

| Column     | Type     | Description            |
| ---------- | -------- | ---------------------- |
| id         | UUID     | Primary key            |
| tenant_id  | UUID     | Foreign key to tenants |
| sender     | String   | Customer phone number  |
| message    | Text     | Raw message content    |
| created_at | DateTime | Creation timestamp     |

#### orders

| Column         | Type     | Description                                                  |
| -------------- | -------- | ------------------------------------------------------------ |
| id             | UUID     | Primary key                                                  |
| tenant_id      | UUID     | Foreign key to tenants                                       |
| customer_phone | String   | Customer phone                                               |
| status         | Enum     | pending, processing, completed, cancelled, need_confirmation |
| source         | String   | Message source (whatsapp)                                    |
| created_at     | DateTime | Creation timestamp                                           |

#### order_items

| Column     | Type    | Description             |
| ---------- | ------- | ----------------------- |
| id         | UUID    | Primary key             |
| order_id   | UUID    | Foreign key to orders   |
| product_id | UUID    | Foreign key to products |
| qty        | Integer | Quantity                |
| price      | Decimal | Price at time of order  |

#### ai_logs

| Column     | Type     | Description             |
| ---------- | -------- | ----------------------- |
| id         | UUID     | Primary key             |
| message_id | UUID     | Foreign key to messages |
| prompt     | Text     | Prompt sent to AI       |
| response   | Text     | AI response             |
| confidence | Float    | Confidence score        |
| created_at | DateTime | Creation timestamp      |

---

## NestJS Modules

### 1. Auth Module

**Endpoints:**

- `POST /auth/register` - Register new tenant + admin user
- `POST /auth/login` - User login, returns JWT
- `GET /auth/me` - Get current user info

**Features:**

- JWT authentication
- Password hashing with bcrypt
- Role-based access (ADMIN, STAFF)

### 2. Tenant Module

**Endpoints:**

- `GET /tenants` - List tenants (admin only)
- `GET /tenants/:id` - Get tenant details

### 3. Products Module

**Endpoints:**

- `GET /products` - List products (with pagination)
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Soft delete product

### 4. Messages Module

**Endpoints:**

- `GET /messages` - List messages
- `GET /messages/:id` - Get message details

### 5. Orders Module

**Endpoints:**

- `GET /orders` - List orders
- `GET /orders/:id` - Get order details
- `PUT /orders/:id/status` - Update order status

### 6. Webhook Module

**Endpoint:**

- `POST /webhook/whatsapp` - Receive WhatsApp messages

**Features:**

- Identify tenant by phone number
- Store incoming message
- Push job to BullMQ queue

---

## Queue System

### Queue Name

`message_parse_queue`

### Job Data

```typescript
{
  messageId: string,
  tenantId: string,
  message: string
}
```

---

## AI Parser Worker

### Process Flow

1. Receive job from queue
2. Fetch tenant's active products
3. Build prompt with product menu
4. Send to OpenAI API
5. Parse AI response into structured JSON
6. Fuzzy match items with products
7. Create order with order_items
8. Store AI logs

### AI Prompt Format

**System Prompt:**

```
You are an order parser for Indonesian food ordering.
Convert customer WhatsApp messages into JSON order items.
Only return JSON.
```

**User Prompt:**

```
MENU:
{product_list}

MESSAGE:
{customer_message}
```

### Expected AI Response Format

```json
{
  "items": [
    { "name": "ayam geprek", "qty": 2 },
    { "name": "es teh", "qty": 1 }
  ]
}
```

---

## Order Status Flow

```
pending → processing → completed
    ↓         ↓
  cancelled   need_confirmation
```

---

## Project Structure

```
src/
├── main.ts
├── app.module.ts
├── config/
│   └── configuration.ts
├── prisma/
│   └── prisma.module.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.strategy.ts
│   ├── dto/
│   │   ├── register.dto.ts
│   │   └── login.dto.ts
│   └── guards/
│       └── jwt.auth.guard.ts
├── tenant/
│   ├── tenant.module.ts
│   ├── tenant.service.ts
│   └── tenant.controller.ts
├── products/
│   ├── products.module.ts
│   ├── products.service.ts
│   ├── products.controller.ts
│   └── dto/
│       ├── create-product.dto.ts
│       └── update-product.dto.ts
├── messages/
│   ├── messages.module.ts
│   ├── messages.service.ts
│   └── messages.controller.ts
├── orders/
│   ├── orders.module.ts
│   ├── orders.service.ts
│   ├── orders.controller.ts
│   └── dto/
│       └── update-order-status.dto.ts
├── webhook/
│   ├── webhook.module.ts
│   ├── webhook.controller.ts
│   └── webhook.service.ts
├── queue/
│   ├── queue.module.ts
│   └── queue.service.ts
└── ai-parser/
    ├── ai-parser.module.ts
    ├── ai-parser.service.ts
    └── ai-parser.worker.ts
```

---

## Environment Variables

### Local PostgreSQL Setup

If using local PostgreSQL, ensure PostgreSQL is running and create a database:

```sql
CREATE DATABASE autoorder_ai;
```

```env
# Database - Local PostgreSQL
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/autoorder_ai"

# Database - Docker PostgreSQL (alternative)
# DATABASE_URL="postgresql://user:password@localhost:5432/autoorder_ai"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# App
PORT=3000
NODE_ENV="development"
```

---

## Implementation Priority

1. **Phase 1**: Project setup, Prisma schema, basic configuration
2. **Phase 2**: Auth module with JWT
3. **Phase 3**: Tenant and Products modules
4. **Phase 4**: Messages and Orders modules
5. **Phase 5**: Webhook endpoint
6. **Phase 6**: Queue system with BullMQ
7. **Phase 7**: AI Parser worker with OpenAI integration
8. **Phase 8**: Testing and verification

---

## Security Considerations

- All endpoints (except webhook) require JWT authentication
- Tenant data isolation at database query level
- Input validation using class-validator DTOs
- Password hashing with bcrypt
- Rate limiting on webhook endpoint
- Error handling with proper HTTP status codes

---

## Docker Setup

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY prisma ./prisma

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/main"]
```

### docker-compose.yml

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/autoorder_ai
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=autoorder_ai
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## CI/CD Pipeline (GitHub Actions)

### .github/workflows/ci.yml

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run build
      - run: npm run test

  docker:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: autoorder-ai/backend:latest
```

---

## Next Steps

1. Initialize NestJS project
2. Install dependencies (Prisma, BullMQ, OpenAI, etc.)
3. Create Prisma schema and run migrations
4. Implement each module following the plan
5. Set up Docker and docker-compose
6. Configure CI/CD pipeline
7. Test the complete flow end-to-end
