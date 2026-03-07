import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("messages")
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    return this.messagesService.findAll(
      req.user.tenantId,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get(":id")
  async findOne(@Request() req, @Param("id") id: string) {
    return this.messagesService.findOne(req.user.tenantId, id);
  }
}
