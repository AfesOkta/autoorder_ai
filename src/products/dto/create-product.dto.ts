import {
  IsString,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
  Min,
} from "class-validator";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsBoolean()
  isActive?: boolean = true;
}
