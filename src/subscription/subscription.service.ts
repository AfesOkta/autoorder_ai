import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    return (this.prisma as any).subscription.create({
      data: {
        ...createSubscriptionDto,
        features: createSubscriptionDto.features || {},
      },
    });
  }

  async findAll() {
    return (this.prisma as any).subscription.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const subscription = await (this.prisma as any).subscription.findUnique({
      where: { id },
    });
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return subscription;
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    await this.findOne(id);
    return (this.prisma as any).subscription.update({
      where: { id },
      data: updateSubscriptionDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return (this.prisma as any).subscription.delete({
      where: { id },
    });
  }
}
