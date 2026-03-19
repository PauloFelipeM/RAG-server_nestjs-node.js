import { Inject, Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { OPENAI_CLIENT } from './openai.provider';

@Injectable()
export class EmbeddingService {
  constructor(@Inject(OPENAI_CLIENT) private readonly openai: OpenAI) {}

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  }

  buildClientText(client: {
    name: string;
    shortBio: string;
    email: string;
    age: number;
    gender: string;
    job: string;
    companies: string[];
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }): string {
    const companiesList = client.companies.join(', ');
    const address = `${client.address.street}, ${client.address.city}, ${client.address.state} ${client.address.zipCode}, ${client.address.country}`;

    return [
      `Name: ${client.name}`,
      `Bio: ${client.shortBio}`,
      `Email: ${client.email}`,
      `Age: ${client.age}`,
      `Gender: ${client.gender}`,
      `Job: ${client.job}`,
      `Companies: ${companiesList}`,
      `Address: ${address}`,
    ].join('. ');
  }
}
