import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, customerPhone: string) {
    return this.prisma.order.create({
      data: {
        tenantId,
        customerPhone,
        status: "PENDING",
      },
      include: {
        orderItems: true,
      },
    });
  }

  async findAll(tenantId: string, limit = 50, offset = 0) {
    return this.prisma.order.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, tenantId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }

  async updateStatus(
    tenantId: string,
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    // Check if order exists
    await this.findOne(tenantId, id);

    return this.prisma.order.update({
      where: { id },
      data: { status: updateOrderStatusDto.status },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async addOrderItem(
    orderId: string,
    productId: string,
    qty: number,
    price: number,
  ) {
    return this.prisma.orderItem.create({
      data: {
        orderId,
        productId,
        qty,
        price,
      },
    });
  }
}
