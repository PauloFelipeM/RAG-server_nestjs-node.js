import { Inject, Injectable } from "@nestjs/common";
import OpenAI from "openai";
import { OPENAI_CLIENT } from "../embedding/openai.provider";
import { ClientService } from "../client/client.service";
import { ClientWithRelations } from "../client/types/client-with-relations.type";

const SEARCH_CLIENTS_TOOL: OpenAI.ChatCompletionTool = {
  type: "function",
  function: {
    name: "search_clients",
    description:
      "Search for clients by natural language query. Returns the most relevant client profiles based on semantic similarity.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            'Natural language search query to find relevant clients (e.g. "senior engineers in California")',
        },
        limit: {
          type: "number",
          description: "Maximum number of clients to return (default: 5)",
        },
      },
      required: ["query"],
    },
  },
};

const SYSTEM_PROMPT = `You are a helpful assistant that provides information about clients.
You have access to a client database that you can search using natural language queries.
When the user asks about clients, use the search_clients tool to find relevant information.
Always base your answers on the data returned by the tool. If no clients match, say so clearly.
Format your responses in a readable way.`;

@Injectable()
export class ChatService {
  constructor(
    @Inject(OPENAI_CLIENT) private readonly openai: OpenAI,
    private readonly clientService: ClientService,
  ) {}

  async chat(message: string): Promise<string> {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: message },
    ];

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools: [SEARCH_CLIENTS_TOOL],
    });

    const choice = response.choices[0];

    if (choice.finish_reason === "tool_calls" && choice.message.tool_calls) {
      messages.push(choice.message);

      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.type !== "function") continue;

        const args = JSON.parse(toolCall.function.arguments);
        const clients = await this.clientService.search(
          args.query,
          args.limit ?? 5,
        );

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(this.formatClients(clients)),
        });
      }

      const finalResponse = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
      });

      return finalResponse.choices[0].message.content ?? "";
    }

    return choice.message.content ?? "";
  }

  private formatClients(
    clients: ClientWithRelations[],
  ): Record<string, unknown>[] {
    return clients.map((client) => ({
      name: client.name,
      email: client.email,
      bio: client.shortBio,
      age: client.age,
      gender: client.gender,
      job: client.job,
      companies: client.companies.map((c) => c.company.name),
      address: client.address
        ? {
            street: client.address.street,
            city: client.address.city,
            state: client.address.state,
            zipCode: client.address.zipCode,
            country: client.address.country,
          }
        : null,
    }));
  }
}
