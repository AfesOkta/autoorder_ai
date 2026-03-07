import { Module } from "@nestjs/common";
import { AiParserService } from "./ai-parser.service";
import { AiParserWorker } from "./ai-parser.worker";

@Module({
  providers: [AiParserService, AiParserWorker],
  exports: [AiParserService],
})
export class AiParserModule {}
