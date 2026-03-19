import { Injectable, NotFoundException } from "@nestjs/common";
import { ClientRepository } from "./repositories/client-repository.abstract";
import { EmbeddingService } from "../embedding/embedding.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { ClientWithRelations } from "./types/client-with-relations.type";

@Injectable()
export class ClientService {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async create(data: CreateClientDto): Promise<ClientWithRelations> {
    const client = await this.clientRepository.create(data);

    const text = this.embeddingService.buildClientText({
      ...data,
      companies: data.companies,
      address: data.address,
    });

    const embedding = await this.embeddingService.generateEmbedding(text);
    await this.clientRepository.updateEmbedding(client.id, embedding);

    return client;
  }

  async search(query: string, limit: number): Promise<ClientWithRelations[]> {
    const embedding = await this.embeddingService.generateEmbedding(query);
    return this.clientRepository.searchBySimilarity(embedding, limit);
  }

  async delete(id: string): Promise<void> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new NotFoundException(`Client with id "${id}" not found`);
    }
    await this.clientRepository.delete(id);
  }
}
