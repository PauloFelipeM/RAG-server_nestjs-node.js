import { Global, Module } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { OPENAI_CLIENT, OpenAIProvider } from './openai.provider';

@Global()
@Module({
  providers: [OpenAIProvider, EmbeddingService],
  exports: [EmbeddingService, OPENAI_CLIENT],
})
export class EmbeddingModule {}
