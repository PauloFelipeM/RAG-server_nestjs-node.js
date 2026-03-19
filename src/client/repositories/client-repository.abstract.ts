import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../../common/repositories/base-repository.abstract";
import { CreateClientDto } from "../dto/create-client.dto";
import { ClientWithRelations } from "../types/client-with-relations.type";

@Injectable()
export abstract class ClientRepository extends BaseRepository<
  ClientWithRelations,
  CreateClientDto
> {
  abstract findByEmail(email: string): Promise<ClientWithRelations | null>;

  abstract searchBySimilarity(
    embedding: number[],
    limit: number,
  ): Promise<ClientWithRelations[]>;

  abstract updateEmbedding(id: string, embedding: number[]): Promise<void>;
}
