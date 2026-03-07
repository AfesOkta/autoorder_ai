import { Controller, Get, Put, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';
import { SuperadminGuard } from '../guards/superadmin.guard';

@Controller('system-config')
@UseGuards(SuperadminGuard)
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Get('llm')
  async getLlmProvider() {
    return this.systemConfigService.getLlmProvider();
  }

  @Put('llm')
  async setLlmProvider(@Body('provider') provider: string) {
    if (!provider) {
      throw new BadRequestException('Provider is required in body');
    }
    try {
      return await this.systemConfigService.setLlmProvider(provider.toUpperCase());
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
