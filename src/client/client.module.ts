import { Module } from '@nestjs/common';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { ClientRepository } from './repositories/client-repository.abstract';
import { PrismaClientRepository } from './repositories/prisma-client.repository';

@Module({
  controllers: [ClientController],
  providers: [
    ClientService,
    {
      provide: ClientRepository,
      useClass: PrismaClientRepository,
    },
  ],
  exports: [ClientService],
})
export class ClientModule {}
