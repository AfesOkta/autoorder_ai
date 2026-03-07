# AutoOrder AI Backend

Production-ready MVP backend for AutoOrder AI - a SaaS platform that converts WhatsApp messages from customers into structured orders using AI.

## 📖 Documentation
- **[Step-by-Step Tutorial](plans/tutorial.md)** - Learn how to use the system from setup to order.

## 🌟 Features

- **Multi-tenant SaaS Architecture** - Each UMKM (small business) is a tenant.
- **Subscription Management** - Create and manage different subscription plans.
- **Role-Based Access Control (RBAC)** - Secure endpoints with `SUPERADMIN`, `ADMIN`, and `STAFF` roles.
- **System Configuration** - Global settings for LLM providers (OpenAI, Gemini).
- **WhatsApp Webhook Integration** - Receive messages from WhatsApp gateway (Fonnte).
- **AI Order Parsing** - Uses OpenAI GPT-4o-mini to parse customer messages.
- **Product Menu Management** - CRUD operations for products.
- **Order Management** - Track and manage orders.
- **JWT Authentication** - Secure API access with automated token handling.
- **Queue System** - BullMQ + Redis for async processing.
- **Docker Support** - Easy deployment with Docker Compose.

## 🛠️ Tech Stack

- **Backend**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Queue**: Redis + BullMQ
- **AI**: OpenAI API (GPT-4o-mini)
- **Auth**: JWT + RBAC

## 🚀 Quick Start

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
   Edit `.env` with your `DATABASE_URL`, `REDIS_HOST`, `JWT_SECRET`, and `OPENAI_API_KEY`.
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

## 📡 API Endpoints

### Auth
- `POST /auth/register` - Register new tenant and admin user
- `POST /auth/login` - Login and get JWT token (saves Superadmin key if applicable)
- `GET /auth/me` - Get current user profile

### Subscription Plans (Superadmin/Admin only)
- `GET /subscriptions` - List all plans
- `POST /subscriptions` - Create a plan
- `PATCH /subscriptions/:id` - Update a plan
- `DELETE /subscriptions/:id` - Delete a plan

### System Config (Superadmin only)
- `GET /system-config/llm` - Get global LLM config
- `PUT /system-config/llm` - Set global LLM config

### Products (Tenant Protected)
- `GET /products` - List products
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Soft delete product

### Orders (Tenant Protected)
- `GET /orders` - List orders
- `GET /orders/:id` - Get order details
- `PUT /orders/:id/status` - Update order status

### Webhook (Public)
- `POST /webhook/whatsapp` - Receive WhatsApp messages from Fonnte

## 📂 Project Structure
```
src/
├── auth/           # Auth, Roles Guard, JWT Strategy
├── subscription/   # Subscription Plans
├── system-config/  # Global Settings
├── tenant/         # Tenant management
├── products/       # Product CRUD
├── messages/       # Message storage
├── orders/         # Order management
├── webhook/        # WhatsApp webhook
├── queue/          # BullMQ queue
├── ai-parser/      # AI message parser
└── prisma/         # Prisma Service & Module
```

## 🧪 Testing with Bruno
A comprehensive Bruno collection is available in the `bruno/` directory, organized by module.

---
License: MIT
