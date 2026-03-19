import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/chat-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() chatMessageDto: ChatMessageDto) {
    const answer = await this.chatService.chat(chatMessageDto.message);
    return { answer };
  }
}
