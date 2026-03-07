import { Controller, Post, Body } from "@nestjs/common";
import { WebhookService } from "./webhook.service";
import { WebhookDto } from "./dto/webhook.dto";

@Controller("webhook")
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  @Post("whatsapp")
  async handleWhatsAppWebhook(@Body() webhookDto: WebhookDto) {
    // Fonnte does not use x-api-key headers, they just POST to the URL directly.
    // However, we need to protect against Fonnte auto-reply loops where
    // Fonnte triggers a webhook for an OUTGOING message.
    if (webhookDto.sender === webhookDto.device) {
      return {
        success: true,
        message: "Ignored outgoing message to prevent auto-reply loop",
      };
    }

    return this.webhookService.handleIncomingMessage(webhookDto);
  }
}
