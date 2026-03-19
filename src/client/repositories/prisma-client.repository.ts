import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ClientRepository } from "./client-repository.abstract";
import { CreateClientDto } from "../dto/create-client.dto";
import { ClientWithRelations } from "../types/client-with-relations.type";

const CLIENT_INCLUDE = {
  address: true,
  companies: { include: { company: true } },
} as const;

@Injectable()
export class PrismaClientRepository extends ClientRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(): Promise<ClientWithRelations[]> {
    return this.prisma.client.findMany({ include: CLIENT_INCLUDE });
  }

  async findById(id: string): Promise<ClientWithRelations | null> {
    return this.prisma.client.findUnique({
      where: { id },
      include: CLIENT_INCLUDE,
    });
  }

  async findByEmail(email: string): Promise<ClientWithRelations | null> {
    return this.prisma.client.findUnique({
      where: { email },
      include: CLIENT_INCLUDE,
    });
  }

  async create(data: CreateClientDto): Promise<ClientWithRelations> {
    return this.prisma.client.create({
      data: {
        name: data.name,
        shortBio: data.shortBio,
        email: data.email,
        age: data.age,
        gender: data.gender,
        job: data.job,
        address: {
          create: {
            street: data.address.street,
            city: data.address.city,
            state: data.address.state,
            zipCode: data.address.zipCode,
            country: data.address.country,
          },
        },
        companies: {
          create: data.companies.map((companyName) => ({
            company: {
              connectOrCreate: {
                where: { name: companyName },
                create: { name: companyName },
              },
            },
          })),
        },
      },
      include: CLIENT_INCLUDE,
    });
  }

  async updateEmbedding(id: string, embedding: number[]): Promise<void> {
    const vector = `[${embedding.join(",")}]`;
    await this.prisma.$executeRawUnsafe(
      `UPDATE clients SET embedding = $1::vector WHERE id = $2`,
      vector,
      id,
    );
  }

  async searchBySimilarity(
    embedding: number[],
    limit: number,
  ): Promise<ClientWithRelations[]> {
    const vector = `[${embedding.join(",")}]`;

    const results: { id: string }[] = await this.prisma.$queryRawUnsafe(
      `SELECT id FROM clients ORDER BY embedding <=> $1::vector LIMIT $2`,
      vector,
      limit,
    );

    if (results.length === 0) return [];

    const ids = results.map((r) => r.id);
    const clients = await this.prisma.client.findMany({
      where: { id: { in: ids } },
      include: CLIENT_INCLUDE,
    });

    return ids.map((id) => clients.find((c) => c.id === id)!);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.client.delete({ where: { id } });
  }
}
