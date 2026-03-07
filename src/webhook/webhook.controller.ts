import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  Inject,
} from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { WebhookService } from "./webhook.service";
import { WebhookDto } from "./dto/webhook.dto";
import configuration from "../config/configuration";
import { timingSafeEqual } from "crypto";

@Controller("webhook")
export class WebhookController {
  constructor(
    private webhookService: WebhookService,
    @Inject(configuration) private config: ConfigType<typeof configuration>,
  ) {}

  private isValidApiKey(apiKey: string, configuredApiKey: string): boolean {
    if (!apiKey || !configuredApiKey) {
      return false;
    }
    // Use constant-time comparison to prevent timing attacks
    const bufferA = Buffer.from(apiKey);
    const bufferB = Buffer.from(configuredApiKey);
    // If lengths differ, still do comparison but return false
    if (bufferA.length !== bufferB.length) {
      // Perform comparison anyway to maintain constant time
      timingSafeEqual(Buffer.alloc(0), Buffer.alloc(0));
      return false;
    }
    return timingSafeEqual(bufferA, bufferB);
  }

  @Post("whatsapp")
  async handleWhatsAppWebhook(
    @Body() webhookDto: WebhookDto,
    @Headers("x-api-key") apiKey: string,
    @Headers("x-whatsapp-phone") tenantPhone?: string,
  ) {
    // Validate webhook API key
    const configuredApiKey = this.config.webhook?.apiKey;

    if (!configuredApiKey) {
      throw new UnauthorizedException("Webhook not configured properly");
    }

    if (!this.isValidApiKey(apiKey, configuredApiKey)) {
      throw new UnauthorizedException("Invalid API key");
    }

    // For Fonnte or similar WhatsApp gateways, the tenant phone might be in the header
    // or we might need to authenticate the webhook differently

    if (!tenantPhone) {
      // If no tenant phone in header, try the simple approach
      return this.webhookService.handleIncomingMessage(webhookDto);
    }

    return this.webhookService.handleIncomingMessageWithTenant(
      webhookDto,
      tenantPhone,
    );
  }
}
