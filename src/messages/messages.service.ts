import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, sender: string, message: string) {
    return this.prisma.message.create({
      data: {
        tenantId,
        sender,
        message,
      },
    });
  }

  async findAll(tenantId: string, limit = 50, offset = 0) {
    return this.prisma.message.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  async findOne(tenantId: string, id: string) {
    const message = await this.prisma.message.findFirst({
      where: { id, tenantId },
    });

    if (!message) {
      throw new NotFoundException("Message not found");
    }

    return message;
  }
}
