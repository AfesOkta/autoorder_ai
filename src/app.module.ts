import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { TenantModule } from "./tenant/tenant.module";
import { ProductsModule } from "./products/products.module";
import { MessagesModule } from "./messages/messages.module";
import { OrdersModule } from "./orders/orders.module";
import { WebhookModule } from "./webhook/webhook.module";
import { QueueModule } from "./queue/queue.module";
import { AiParserModule } from "./ai-parser/ai-parser.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    AuthModule,
    TenantModule,
    ProductsModule,
    MessagesModule,
    OrdersModule,
    QueueModule,
    WebhookModule,
    AiParserModule,
  ],
})
export class AppModule {}
