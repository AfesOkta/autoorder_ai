import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("products")
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  async create(@Request() req, @Body() createProductDto: CreateProductDto) {
    return this.productsService.create(req.user.tenantId, createProductDto);
  }

  @Get()
  async findAll(
    @Request() req,
    @Query("includeInactive") includeInactive?: string,
  ) {
    return this.productsService.findAll(
      req.user.tenantId,
      includeInactive === "true",
    );
  }

  @Get(":id")
  async findOne(@Request() req, @Param("id") id: string) {
    return this.productsService.findOne(req.user.tenantId, id);
  }

  @Put(":id")
  async update(
    @Request() req,
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(req.user.tenantId, id, updateProductDto);
  }

  @Delete(":id")
  async remove(@Request() req, @Param("id") id: string) {
    return this.productsService.remove(req.user.tenantId, id);
  }
}
