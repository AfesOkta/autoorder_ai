import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { TenantService } from "./tenant.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("tenants")
@UseGuards(JwtAuthGuard)
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Get()
  async findAll() {
    return this.tenantService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.tenantService.findOne(id);
  }
}
