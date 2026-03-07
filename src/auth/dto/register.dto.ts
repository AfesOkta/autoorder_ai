import { IsString, IsEmail, MinLength, IsNotEmpty } from "class-validator";

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  tenantName: string;

  @IsString()
  @IsNotEmpty()
  tenantPhone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  subscriptionId: string;
}
