import { Module } from "@nestjs/common";
import { WebhookService } from "./webhook.service";
import { WebhookController } from "./webhook.controller";
import { QueueModule } from "../queue/queue.module";

@Module({
  imports: [QueueModule],
  providers: [WebhookService],
  controllers: [WebhookController],
})
export class WebhookModule {}
