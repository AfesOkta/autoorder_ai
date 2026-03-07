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
    const { device, sender, message } = webhookDto;

    // Normalize phone numbers (e.g., removing leading 0 or 62 and ensuring standard format)
    // For now we will rely on exact match or implement a simple util if needed.
    
    // Find the device and include the tenant
    const whatsappDevice = await this.prisma.whatsappDevice.findFirst({
      where: { deviceNumber: device },
      include: { tenant: true },
    });

    if (!whatsappDevice || !whatsappDevice.tenant) {
      throw new BadRequestException(`Device ${device} is not registered to any tenant`);
    }

    const tenant = whatsappDevice.tenant;

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
