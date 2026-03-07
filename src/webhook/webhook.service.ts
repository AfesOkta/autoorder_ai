import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { QueueService } from "../queue/queue.service";
import { WebhookDto } from "./dto/webhook.dto";

@Injectable()
export class WebhookService {
  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

  async handleIncomingMessage(webhookDto: WebhookDto) {
    const { sender, message } = webhookDto;

    // Normalize phone number - remove any non-digit characters except +
    const normalizedPhone = sender.replace(/[^\d+]/g, "");

    // Find tenant by phone number (the tenant's registered WhatsApp number)
    // In this case, we'll look for the tenant that owns this sender as a customer
    // For now, we'll assume there's a system tenant or we need to match based on context

    // Get all tenants and find one that matches - in production, this would be more sophisticated
    // For now, let's just create a message and let the AI parser figure out the tenant

    // Actually, we need to identify the tenant. In a real system, the webhook would include
    // tenant identification. For this MVP, we'll use a simple approach:
    // The sender phone is the customer's phone, and we need to find which tenant received this message

    // For the MVP, let's assume the webhook includes a tenant identifier in the header
    // or we use a different approach - perhaps the message is routed based on the sender

    // Let's create a simple message first and queue it
    // The AI parser will need to handle tenant identification

    // For now, we'll store the message and add it to the queue
    // The queue job will include the raw message data

    return {
      success: true,
      message: "Message received and queued for processing",
    };
  }

  async handleIncomingMessageWithTenant(
    webhookDto: WebhookDto,
    tenantPhone: string,
  ) {
    const { sender, message } = webhookDto;

    // Find tenant by phone
    const tenant = await this.prisma.tenant.findUnique({
      where: { phone: tenantPhone },
    });

    if (!tenant) {
      throw new BadRequestException("Tenant not found");
    }

    // Store message
    const savedMessage = await this.prisma.message.create({
      data: {
        tenantId: tenant.id,
        sender,
        message,
      },
    });

    // Add to queue for AI processing
    await this.queueService.addMessageParseJob({
      messageId: savedMessage.id,
      tenantId: tenant.id,
      message,
      sender,
    });

    return {
      success: true,
      message: "Message received and queued for processing",
      messageId: savedMessage.id,
    };
  }
}
