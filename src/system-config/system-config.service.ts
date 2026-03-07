import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SystemConfigService {
  constructor(private prisma: PrismaService) {}

  async getLlmProvider() {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key: 'LLM_PROVIDER' },
    });
    
    // If not set, it defaults to OPENAI conceptually
    return { provider: config ? config.value : 'OPENAI' };
  }

  async setLlmProvider(provider: string) {
    // Only accept OPENAI or GEMINI
    if (provider !== 'OPENAI' && provider !== 'GEMINI') {
      throw new Error('Invalid provider. Must be OPENAI or GEMINI');
    }

    const config = await this.prisma.systemConfig.upsert({
      where: { key: 'LLM_PROVIDER' },
      update: { value: provider },
      create: { key: 'LLM_PROVIDER', value: provider },
    });

    return { provider: config.value };
  }
}
