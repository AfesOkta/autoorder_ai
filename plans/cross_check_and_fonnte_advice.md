# Cross-Check & Fonnte Integration Advice

## 1. Cross-Check: Existing Application vs `plan.md`
I have reviewed the `plans/plan.md` and cross-checked it against the current state of the application. Here are the findings:

### ✅ What is successfully matched:
- **Database Schema**: The `prisma/schema.prisma` file accurately implements the schema outlined in the plan. The models `Tenant`, `User`, `Product`, `Message`, `Order`, `OrderItem`, and `AiLog` match the specifications perfectly, including relational mappings.
- **Module Structure**: The `src/` directory contains all the required NestJS modules as planned: `auth`, `tenant`, `products`, `messages`, `orders`, `webhook`, `queue`, and `ai-parser`.
- **Infrastructure**: The Docker configuration (`Dockerfile` and `docker-compose.yml`) is correctly set up. A GitHub actions (`.github`) workflow is also present and corresponds with the CI/CD pipeline planned.

### 📝 Next Steps from `plan.md`:
Since Phase 1 (Project Setup, Prisma Schema, Module Structure) is already accurately implemented, the next priorities are ensuring the module logic (Providers, Controllers, Services) fully implemented the planned endpoints, specifically the JWT authentication flows, tenant isolation in database queries, and the BullMQ integrations.

---

## 2. Advice for Integrating Fonnte

Fonnte is an unofficial WhatsApp API provider widely used in Indonesia. Based on the system architecture (multi-tenant SaaS), here is step-by-step advice to properly integrate Fonnte:

### A. Database Modifications (Prisma)
Since this is a multi-tenant system, a single Tenant might operate multiple WhatsApp numbers (e.g., Sales 1, Sales 2, Support). Therefore, Fonnte API Tokens and Device configurations need to be stored in a separate table linked to the Tenant.
We've added a new `WhatsappDevice` model in `prisma/schema.prisma` to handle this 1-to-many relationship:
```prisma
enum DeviceStatus {
  CONNECTED
  DISCONNECTED
  PENDING
}

model WhatsappDevice {
  id             String       @id @default(uuid())
  tenantId       String
  deviceNumber   String       // The WhatsApp number
  fonnteToken    String       // API Token for Fonnte
  status         DeviceStatus @default(PENDING)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  // Relations
  tenant         Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, deviceNumber])
  @@map("whatsapp_devices")
}
```

### B. Handling Incoming Webhooks (Fonnte → AutoOrder AI)
Fonnte will send `POST` requests to your webhook URL (`/webhook/whatsapp`).
The standard Fonnte webhook payload includes:
- `device`: The Fonnte device number receiving the message (This corresponds to your Tenant's phone number).
- `sender`: The Customer's WhatsApp number.
- `message`: The actual text of the message.

**Advice for Webhook Controller:**
Inside `src/webhook/webhook.controller.ts`, your logic should:
1. Read the `device` field from the webhook payload to identify which `Tenant` is receiving the message (`where: { phone: body.device }`).
2. Read the `sender` to identify the customer.
3. Store the message in the `messages` table and push the parsing job (`{ messageId, tenantId, message }`) to the BullMQ `message_parse_queue`.

**Fonnte Webhook URL Configuration:**
Each tenant should configure their webhook URL in the Fonnte dashboard to route to: `https://your-domain.com/webhook/whatsapp`. 

### C. Sending Replies (AutoOrder AI → Fonnte)
When the AI parser successfully creates an order, or when an order status changes (e.g., from `PENDING` to `PROCESSING`), you will need to notify the customer.
Create a unified `FonnteService` or `NotificationService` that handles outgoing REST API calls to Fonnte.

**API Call Example Strategy:**
```typescript
async sendMessage(tenantId: string, deviceNumber: string, targetPhone: string, text: string) {
  // Find the specific device for the tenant to get its Fonnte token
  const device = await this.prisma.whatsappDevice.findUnique({ 
    where: { 
      tenantId_deviceNumber: {
        tenantId,
        deviceNumber
      }
    } 
  });

  if (!device || !device.fonnteToken) {
    throw new Error(`Device ${deviceNumber} for Tenant is not configured`);
  }

  // Send request to Fonnte API
  await axios.post('https://api.fonnte.com/send', {
    target: targetPhone,
    message: text
  }, {
    headers: {
      Authorization: device.fonnteToken // Use the device-specific token from DB
    }
  });
}
```

### D. Fonnte Auto-Reply Loop Protection
Fonnte will sometimes trigger webhooks for outgoing messages as well (depending on user configuration or plan). Make sure your webhook controller explicitly ignores webhook payloads where the sender is identical to the device, or where the specific fields in the Fonnte payload indicate it's an outbound message. This prevents your AI from endlessly replying to itself.
