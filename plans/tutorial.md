# AutoOrder AI - Step-by-Step Tutorial

This guide walks you through the complete flow of **AutoOrder AI**, from setting up subscription plans to processing an automated WhatsApp order.

---

## 🚀 Prerequisites
- Backend is running (locally or via Docker).
- **Bruno** is installed and the `bruno/` folder is loaded.
- Environment variables (like `baseUrl`) are configured in Bruno.

---

## 1️⃣ Phase 1: Superadmin Setup (Subscription Plans)

Before tenants can register, you need to have subscription plans available.

1.  **Login as Superadmin**: Use `auth -> Login` in Bruno. (Default: `superadmin@autoorder-ai.com`).
2.  **Verify Superadmin Key**: Successful login automatically saves your `superadminKey`.
3.  **Create a Subscription Plan**:
    - Go to `subscription-plans -> Create Subscription Plan`.
    - Run the request. This will save a `tempSubscriptionId` to your environment.
    - *Example Plan: "PROFESIONAL", Price: 100000.*

---

## 2️⃣ Phase 2: Tenant Onboarding

Now, a business owner (Tenant) can register using the plan you just created.

1.  **Register Tenant**:
    - Go to `auth -> Register`.
    - Use the `{{tempSubscriptionId}}` (or a fixed ID) in the request body.
    - Run the request. This creates the Tenant and an Admin user.
2.  **Login as Tenant Admin**:
    - Go to `auth -> Login` using the tenant's email/password.
    - This saves the `jwtToken` for all subsequent requests.

---

## 3️⃣ Phase 3: Setup Menu (Products)

The Tenant needs to list what they are selling so the AI can recognize items in messages.

1.  **Create Products**:
    - Go to `products -> Create Product`.
    - Add items like "Nasi Goreng Pete" or "Es Teh Manis".
    - Run multiple times to build a small menu.

---

## 4️⃣ Phase 4: Simulating the WhatsApp Order

This mimics a customer sending a message to your WhatsApp bot (via Fonnte).

1.  **Send Webhook Message**:
    - Go to `webhook -> WhatsApp Webhook`.
    - `sender`: Any phone number (e.g., "089876543210").
    - `message`: "Halo, saya mau pesan Nasi Goreng Pete 2 porsi dan Es Teh 1."
    - Run the request.
2.  **Processing**: The AI Parser picks this up from the queue, matches it against your products, and creates a structured order.

---

## 5️⃣ Phase 5: Managing Orders

1.  **View Orders**:
    - Go to `orders -> Get All Orders`.
    - You should see a NEW order with `status: PENDING`.
    - Inside `orderItems`, you'll see the AI correctly extracted the quantities and calculated the prices!
2.  **Update Status**:
    - Use `orders -> Update Order Status` to move the order to `PROCESSING` or `COMPLETED`.

---

## 🛠️ Pro Tips
- **Prisma Studio**: Run `npx prisma studio` to view all raw data in the database.
- **Auto-Tokens**: Most Bruno requests in this collection automatically save tokens to environment variables. You shouldn't need to copy-paste passwords often!
