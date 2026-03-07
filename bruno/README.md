# Bruno Collection for AutoOrder AI API

This directory contains a Bruno collection for testing the AutoOrder AI API endpoints.

## Prerequisites

- [Bruno](https://www.usebruno.com/) - Download and install Bruno from the official website

## Getting Started

### 1. Open the Collection

1. Open Bruno application
2. Click on "Open Collection" or use `Ctrl+O` / `Cmd+O`
3. Navigate to this `bruno` folder and select it

### 2. Configure Environment

1. In Bruno, click on the environment dropdown (top right corner)
2. Select "Development" for local testing or "Production" for live API
3. Edit the environment variables:
   - `baseUrl` - Your API base URL
   - `email` - Your test user email
   - `password` - Your test user password

### 3. Authentication Flow

For protected endpoints, you need to obtain a JWT token:

1. Run **Register** request (first time only) - This creates a new user and auto-saves the JWT token
2. Run **Login** request - This saves the JWT token for subsequent requests
3. Run **Get Profile** to verify authentication works

The JWT token is automatically saved to the `jwtToken` environment variable using post-response scripts.

## API Endpoints

### Auth (No Authentication Required)

| Request                               | Method | Description              |
| ------------------------------------- | ------ | ------------------------ |
| [Register](auth/Register.bru)         | POST   | Register a new user      |
| [Login](auth/Login.bru)               | POST   | Login and get JWT token  |
| [Get Profile](auth/Get%20Profile.bru) | GET    | Get current user profile |

### Orders (JWT Required)

| Request                                                   | Method | Description         |
| --------------------------------------------------------- | ------ | ------------------- |
| [Get All Orders](orders/Get%20All%20Orders.bru)           | GET    | List all orders     |
| [Get Order by ID](orders/Get%20Order%20by%20ID.bru)       | GET    | Get specific order  |
| [Update Order Status](orders/Update%20Order%20Status.bru) | PUT    | Update order status |

### Products (JWT Required)

| Request                                                   | Method | Description          |
| --------------------------------------------------------- | ------ | -------------------- |
| [Create Product](products/Create%20Product.bru)           | POST   | Create new product   |
| [Get All Products](products/Get%20All%20Products.bru)     | GET    | List all products    |
| [Get Product by ID](products/Get%20Product%20by%20ID.bru) | GET    | Get specific product |
| [Update Product](products/Update%20Product.bru)           | PUT    | Update product       |
| [Delete Product](products/Delete%20Product.bru)           | DELETE | Delete product       |

### Messages (JWT Required)

| Request                                                   | Method | Description          |
| --------------------------------------------------------- | ------ | -------------------- |
| [Get All Messages](messages/Get%20All%20Messages.bru)     | GET    | List all messages    |
| [Get Message by ID](messages/Get%20Message%20by%20ID.bru) | GET    | Get specific message |

### Tenants (JWT Required)

| Request                                                | Method | Description         |
| ------------------------------------------------------ | ------ | ------------------- |
| [Get All Tenants](tenants/Get%20All%20Tenants.bru)     | GET    | List all tenants    |
| [Get Tenant by ID](tenants/Get%20Tenant%20by%20ID.bru) | GET    | Get specific tenant |

### Webhooks (No Authentication Required)

| Request                                            | Method | Description               |
| -------------------------------------------------- | ------ | ------------------------- |
| [WhatsApp Webhook](webhook/WhatsApp%20Webhook.bru) | POST   | Receive WhatsApp messages |

## Environment Variables

### Development Environment

```env
baseUrl: http://localhost:3000
jwtToken: (auto-filled after login)
email: user@example.com
password: yourpassword
name: John Doe
tenantName: My Tenant
```

### Production Environment

```env
baseUrl: https://your-production-url.com
jwtToken: (auto-filled after login)
email: user@example.com
password: yourpassword
name: John Doe
tenantName: My Tenant
```

## Running the API Locally

Before testing with Bruno, make sure the API is running:

```bash
# Install dependencies
npm install

# Run database migrations
npm run prisma:migrate

# Start the development server
npm run start:dev
```

The API should be available at `http://localhost:3000`

## Notes

- Protected endpoints require a valid JWT token in the `Authorization` header
- The JWT token is automatically saved after successful Register or Login
- Some requests automatically save IDs (e.g., productId, orderId) for use in subsequent requests
- Use the environment variables to customize requests without modifying the .bru files directly
