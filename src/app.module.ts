import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { EmbeddingModule } from './embedding/embedding.module';
import { ClientModule } from './client/client.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    EmbeddingModule,
    ClientModule,
    ChatModule,
  ],
})
export class AppModule {}
