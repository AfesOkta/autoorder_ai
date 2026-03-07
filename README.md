# AutoOrder AI Backend

Production-ready MVP backend for AutoOrder AI - a SaaS platform that converts WhatsApp messages from customers into structured orders using AI.

## Features

- **Multi-tenant SaaS Architecture** - Each UMKM (small business) is a tenant
- **WhatsApp Webhook Integration** - Receive messages from WhatsApp gateway (Fonnte)
- **AI Order Parsing** - Uses OpenAI GPT-4o-mini to parse customer messages
- **Product Menu Management** - CRUD operations for products
- **Order Management** - Track and manage orders
- **JWT Authentication** - Secure API access
- **Queue System** - BullMQ + Redis for async processing
- **Docker Support** - Easy deployment with Docker Compose
- **CI/CD** - GitHub Actions workflow included

## Tech Stack

- **Backend**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Queue**: Redis + BullMQ
- **AI**: OpenAI API (GPT-4o-mini)
- **Auth**: JWT

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- OpenAI API Key

### Local Setup

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Copy environment file:**

```bash
cp .env.example .env
```

3. **Configure environment variables:**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/autoorder_ai"
REDIS_HOST="localhost"
REDIS_PORT="6379"
JWT_SECRET="your-secret-key"
OPENAI_API_KEY="sk-your-api-key"
PORT=3000
```

4. **Generate Prisma Client:**

```bash
npx prisma generate
```

5. **Run database migrations:**

```bash
npx prisma migrate dev
```

6. **Start development server:**

```bash
npm run start:dev
```

### Docker Setup

1. **Create .env file:**

```bash
cp .env.example .env
```

2. **Edit .env with your values:**

```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/autoorder_ai"
REDIS_HOST="redis"
REDIS_PORT="6379"
JWT_SECRET="your-secret-key"
OPENAI_API_KEY="sk-your-api-key"
```

3. **Start services:**

```bash
docker-compose up -d
```

## API Endpoints

### Auth

- `POST /auth/register` - Register new tenant and admin user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user profile

### Products (Protected)

- `GET /products` - List products
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Soft delete product

### Orders (Protected)

- `GET /orders` - List orders
- `GET /orders/:id` - Get order details
- `PUT /orders/:id/status` - Update order status

### Messages (Protected)

- `GET /messages` - List messages
- `GET /messages/:id` - Get message details

### Webhook (Public)

- `POST /webhook/whatsapp` - Receive WhatsApp messages

## WhatsApp Webhook Payload

```json
{
  "sender": "62812345678",
  "message": "2 ayam geprek 1 es teh"
}
```

## Example Usage

1. **Register a new tenant:**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Kedai Ayam Goreng",
    "tenantPhone": "62812345678",
    "email": "admin@kedai.com",
    "password": "password123"
  }'
```

2. **Login:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kedai.com",
    "password": "password123"
  }'
```

3. **Create a product:**

```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ayam Geprek",
    "price": 15000
  }'
```

4. **Receive WhatsApp order:**

```bash
curl -X POST http://localhost:3000/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "628987654321",
    "message": "2 ayam geprek 1 es teh"
  }'
```

## Project Structure

```
src/
├── auth/           # Authentication module
├── tenant/         # Tenant management
├── products/       # Product CRUD
├── messages/       # Message storage
├── orders/         # Order management
├── webhook/        # WhatsApp webhook
├── queue/          # BullMQ queue
├── ai-parser/      # AI message parser
└── config/         # Configuration
```

## License

MIT
