import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { AiParserService } from "./ai-parser.service";
import { MessageParseJobData } from "../queue/queue.service";

interface ParseResult {
  order: {
    id: string;
  };
  parsedItems: Array<{
    name: string;
    qty: number;
  }>;
}

@Processor("message_parse_queue")
export class AiParserWorker {
  constructor(private aiParserService: AiParserService) {}

  @Process("parse-message")
  async handleParseMessage(
    job: Job<MessageParseJobData>,
  ): Promise<ParseResult> {
    const { messageId, tenantId, message, sender } = job.data;

    console.log(`Processing message ${messageId} for tenant ${tenantId}`);
    console.log(`Message: ${message}`);

    try {
      const result = await this.aiParserService.parseMessage(
        messageId,
        tenantId,
        message,
        sender,
      );

      console.log(`Order created: ${result.order.id}`);
      console.log(`Parsed items:`, result.parsedItems);

      return result;
    } catch (error) {
      console.error(`Error processing message ${messageId}:`, error);
      throw error;
    }
  }
}
