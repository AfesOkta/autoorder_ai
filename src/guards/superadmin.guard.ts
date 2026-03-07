import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SuperadminGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const superadminKey = request.headers['x-superadmin-key'];
    const expectedKey = this.configService.get<string>('superadmin.apiKey');

    if (!superadminKey || !expectedKey || superadminKey !== expectedKey) {
      throw new UnauthorizedException('Invalid or missing Superadmin API Key');
    }

    return true;
  }
}
