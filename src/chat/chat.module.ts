import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ClientModule } from '../client/client.module';

@Module({
  imports: [ClientModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
