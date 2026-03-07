# AutoOrder AI - Application Tutorial

This step-by-step tutorial explains how to use AutoOrder AI, from registering a new tenant to simulating a WhatsApp order. We will use the **Bruno** API client (included in the `bruno/` directory) and **Prisma Studio**. This tutorial assumes your Docker containers (`docker compose up -d`) are running and the database is fully migrated.

---

### Step 1: Register a New Tenant (Admin Onboarding)
First, a new restaurant or business owner (the "Tenant") needs to create an account. This creates their Tenant profile and an Admin user.
1. Open **Bruno**.
2. Navigate to `auth -> Register`.
3. Set the `body:json` payload to:
   ```json
   {
     "tenantName": "Warung Makan Berkah",
     "tenantPhone": "081234567890",
     "email": "admin@warungberkah.com",
     "password": "password123"
   }
   ```
4. Click **Run** / **Send**.
5. You should receive a `201 Created` response containing an access token. The backend automatically registered the Tenant and the user.

### Step 2: Login as the Admin
To perform actions like adding products, the Admin needs to log in to get their JWT (JSON Web Token).
1. In Bruno, navigate to `auth -> Login`.
2. Check the body:
   ```json
   {
     "email": "admin@warungberkah.com",
     "password": "password123"
   }
   ```
3. Click **Run** / **Send**.
4. **Important**: Copy the `access_token` string from the JSON response.

### Step 3: Add the JWT Token to Bruno Environments
To make authenticated requests to `products` or `orders`, Bruno needs to send your JWT in the headers. Let's configure the Bruno environment.
1. In the top-right corner of Bruno, make sure the Environment is set to **Local**.
2. Click the Environment dropdown and select **Configure**.
3. In the Variables list, find `token` and paste the `access_token` you just copied.
4. Save the environment settings. Now, all secured requests will automatically use this token!

### Step 4: Add a WhatsApp Device to the Tenant
Because we updated the schema to support multiple WhatsApp numbers per Tenant, we need to register a Fonnte device for the tenant. Currently, there is no HTTP endpoint built for this yet in `/src/tenant`, so we have to use **Prisma Studio** for this step.
1. Open your terminal and start Prisma Studio inside your Docker app container:
   ```bash
   docker compose exec app npx prisma studio
   ```
2. Open your web browser and go to `http://localhost:5555`.
3. Open the **Tenant** table and copy the `id` of "Warung Makan Berkah".
4. Open the **WhatsappDevice** table and click **Add new record**:
   - `tenantId`: (Paste the Tenant ID you just copied)
   - `deviceNumber`: "081234567890" *(This is crucial, it's the number Fonnte uses to receive messages)*
   - `fonnteToken`: "your-fonnte-token-here"
   - `status`: CONNECTED
5. Save the record in Prisma Studio.

### Step 5: Create Products (The Menu)
Now let's add some items to the Tenant's menu.
1. In Bruno, navigate to `products -> Create Product`.
2. Look at the JSON body, for example:
   ```json
   {
     "name": "Nasi Goreng Spesial",
     "price": 25000,
     "isActive": true
   }
   ```
3. Click **Send** to add the product.
4. Repeat this request to create a few more products, like "Es Teh Manis" or "Ayam Geprek".

### Step 6: Simulate an Incoming WhatsApp Order (Fonnte)
Now we act as the Customer who is chatting with the Tenant's registered WhatsApp number via Fonnte.
1. In Bruno, navigate to `webhook -> WhatsApp Webhook`.
2. Ensure the JSON body looks exactly like the snippet below. The `"device"` must exactly match the `deviceNumber` you registered in Step 4. Let's act as a customer wanting to order from the menu:
   ```json
   {
     "device": "081234567890",
     "sender": "089876543210",
     "message": "Halo, pesen dong. Nasi goreng spesialnya 2, sama es teh manis 2"
   }
   ```
3. Click **Run** / **Send**.
4. You should receive a successful HTTP response:
   ```json
   {
     "success": true,
     "message": "Message received and queued for processing",
     "messageId": "some-uuid..."
   }
   ```

### What happens in the background?
*   The system found "Warung Makan Berkah" by looking up the device `081234567890` in the database.
*   It saved the customer's raw text message (`Halo, pesen dong...`) to the database.
*   It pushed a job to the Redis queue (`message_parse_queue`).
*   The `AI Parser Worker` picked up the job, fetched the tenant's product menu (Nasi Goreng, Es Teh), and sent the customer's text to OpenAI.
*   OpenAI AI extracted the structured order items (prices, quantities).
*   The system creates a formal `Order` with `status: PENDING`.

### Step 7: View the Final Order
Assuming the AI Worker processed the queue successfully, the Admin can view the new order.
1. In Bruno, navigate to `orders -> Get Orders`.
2. Click **Run** / **Send**.
3. You should see a JSON list of orders showing how the AI parsed the customer's natural language (`"Nasi goreng spesialnya 2, sama es teh manis 2"`) into a structured JSON order with the correct `price`, `qty`, and calculated totals!
