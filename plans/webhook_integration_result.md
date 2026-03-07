# Fonnte Webhook Integration Walkthrough

We have successfully updated the application to support the specific payload structure coming from Fonnte and integrate it with our newly created `WhatsappDevice` multi-device architecture.

Here is a breakdown of what was accomplished:

## 1. Webhook DTO Updates
We updated the Data Transfer Object (`WebhookDto`) to accept the exact fields Fonnte sends out when it receives a new WhatsApp message:
*   `device`: The WhatsApp number bound to the Fonnte device (used to look up the `Tenant`).
*   `sender`: The phone number of the customer who sent the message.
*   `message`: The text content of their message.

```typescript
export class WebhookDto {
  @IsString()
  @IsNotEmpty()
  device: string;

  @IsString()
  @IsNotEmpty()
  sender: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
```

## 2. Controller Refactoring
Fonnte does not use API keys via HTTP headers, instead it simply makes a direct POST request to the webhook URL. 
- We removed the `x-api-key` and `x-whatsapp-phone` header requirements.
- We implemented **Auto-Reply Loop Protection**: Fonnte occasionally sends webhooks for outgoing messages too. We intercept this by checking if the `sender` is equal to the `device` and explicitly ignore the message.

## 3. Service Processing
When a new webhook is received:
1. The service looks up the Fonnte `deviceNumber` in the `WhatsappDevice` database table.
2. If found, it extracts the associated `Tenant`.
3. The message is successfully saved into the database and pushed into your BullMQ `message_parse_queue` for the AI parser to handle.
