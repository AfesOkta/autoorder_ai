import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { ConfigService } from "@nestjs/config";

export interface MessageParseJobData {
  messageId: string;
  tenantId: string;
  message: string;
  sender: string;
}

@Injectable()
export class QueueService implements OnModuleDestroy {
  constructor(
    @InjectQueue("message_parse_queue") private messageParseQueue: Queue,
    private configService: ConfigService,
  ) {}

  async onModuleDestroy() {
    // Close queue connections
    await this.messageParseQueue.close();
  }

  async addMessageParseJob(data: MessageParseJobData) {
    const job = await this.messageParseQueue.add("parse-message", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    });

    return job;
  }
}
