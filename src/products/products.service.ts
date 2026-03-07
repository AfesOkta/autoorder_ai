import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createProductDto: CreateProductDto) {
    const { name, price, isActive } = createProductDto;

    // Check if product with same name exists in tenant
    const existingProduct = await this.prisma.product.findFirst({
      where: { tenantId, name },
    });

    if (existingProduct) {
      throw new ConflictException("Product with this name already exists");
    }

    return this.prisma.product.create({
      data: {
        tenantId,
        name,
        price,
        isActive: isActive ?? true,
      },
    });
  }

  async findAll(tenantId: string, includeInactive = false) {
    const where = includeInactive ? { tenantId } : { tenantId, isActive: true };

    return this.prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return product;
  }

  async update(
    tenantId: string,
    id: string,
    updateProductDto: UpdateProductDto,
  ) {
    // Check if product exists
    await this.findOne(tenantId, id);

    // Check if name is being changed and if new name already exists
    if (updateProductDto.name) {
      const existingProduct = await this.prisma.product.findFirst({
        where: { tenantId, name: updateProductDto.name, NOT: { id } },
      });

      if (existingProduct) {
        throw new ConflictException("Product with this name already exists");
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(tenantId: string, id: string) {
    // Check if product exists
    await this.findOne(tenantId, id);

    // Soft delete - set isActive to false
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getActiveProducts(tenantId: string) {
    return this.prisma.product.findMany({
      where: { tenantId, isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
      },
    });
  }
}
