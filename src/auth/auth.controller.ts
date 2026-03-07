import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { CreateStaffDto } from "./dto/create-staff.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { Roles } from "./decorators/roles.decorator";
import { UserRole } from "@prisma/client";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("register-staff")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TENANT, UserRole.ADMIN, UserRole.SUPERADMIN)
  async registerStaff(@Body() createStaffDto: CreateStaffDto, @Request() req) {
    return this.authService.createStaff(createStaffDto, req.user.tenantId);
  }

  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.sub);
  }
}
