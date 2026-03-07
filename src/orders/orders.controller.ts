import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("orders")
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    return this.ordersService.findAll(
      req.user.tenantId,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get(":id")
  async findOne(@Request() req, @Param("id") id: string) {
    return this.ordersService.findOne(req.user.tenantId, id);
  }

  @Put(":id/status")
  async updateStatus(
    @Request() req,
    @Param("id") id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(
      req.user.tenantId,
      id,
      updateOrderStatusDto,
    );
  }
}
