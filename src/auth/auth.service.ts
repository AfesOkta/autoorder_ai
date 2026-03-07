import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

// Rate limiting configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface LoginAttempt {
  count: number;
  lockedUntil?: number;
}

@Injectable()
export class AuthService {
  // In-memory store for tracking failed login attempts
  private loginAttempts: Map<string, LoginAttempt> = new Map();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private getLoginAttemptKey(email: string): string {
    return email.toLowerCase();
  }

  private checkAccountLock(email: string): void {
    const key = this.getLoginAttemptKey(email);
    const attempt = this.loginAttempts.get(key);

    if (attempt && attempt.lockedUntil) {
      if (Date.now() < attempt.lockedUntil) {
        const remainingMinutes = Math.ceil(
          (attempt.lockedUntil - Date.now()) / 60000,
        );
        throw new UnauthorizedException(
          `Account is locked. Try again in ${remainingMinutes} minutes`,
        );
      } else {
        // Lockout expired, reset the attempts
        this.loginAttempts.delete(key);
      }
    }
  }

  private recordFailedAttempt(email: string): void {
    const key = this.getLoginAttemptKey(email);
    const attempt = this.loginAttempts.get(key) || { count: 0 };

    attempt.count += 1;

    if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
      attempt.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      this.loginAttempts.set(key, attempt);
    } else {
      this.loginAttempts.set(key, attempt);
    }
  }

  private resetLoginAttempts(email: string): void {
    const key = this.getLoginAttemptKey(email);
    this.loginAttempts.delete(key);
  }

  async register(registerDto: RegisterDto) {
    const { tenantName, tenantPhone, email, password } = registerDto;

    // Check if tenant with phone already exists
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { phone: tenantPhone },
    });

    if (existingTenant) {
      throw new ConflictException(
        "Tenant with this phone number already exists",
      );
    }

    // Check if user with email already exists in this tenant
    const existingUser = await this.prisma.user.findFirst({
      where: { tenant: { phone: tenantPhone }, email },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create tenant and user in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          phone: tenantPhone,
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email,
          password: hashedPassword,
          role: "ADMIN",
        },
      });

      return { tenant, user };
    });

    // Generate JWT token
    const token = this.generateToken(
      result.user.id,
      result.user.tenantId,
      result.user.role,
    );

    return {
      tenant: result.tenant,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
      accessToken: token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Check if account is locked due to too many failed attempts
    this.checkAccountLock(email);

    // Find user by email
    const user = await this.prisma.user.findFirst({
      where: { email },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Record failed login attempt
      this.recordFailedAttempt(email);
      throw new UnauthorizedException("Invalid credentials");
    }

    // Reset failed attempts on successful login
    this.resetLoginAttempts(email);

    // Generate JWT token
    const token = this.generateToken(user.id, user.tenantId, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant.name,
      },
      accessToken: token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenantName: user.tenant.name,
      tenantPhone: user.tenant.phone,
    };
  }

  private generateToken(
    userId: string,
    tenantId: string,
    role: string,
  ): string {
    const payload = { sub: userId, tenantId, role };
    return this.jwtService.sign(payload);
  }
}
