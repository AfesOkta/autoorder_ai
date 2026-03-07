import { IsString, IsNotEmpty } from "class-validator";

export class WebhookDto {
  @IsString()
  @IsNotEmpty()
  device: string;

  @IsString()
  @IsNotEmpty()
  sender: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
