# RAG with NestJS

A Retrieval-Augmented Generation (RAG) system for client information, built with NestJS, Prisma, pgvector, and OpenAI.

Clients are stored in PostgreSQL with vector embeddings of their profile data. A `/chat` endpoint provides a complete RAG pipeline — it receives a natural language question, retrieves relevant clients via semantic search, and returns an LLM-generated answer grounded in real data.

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- OpenAI API key

## Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment:**

```bash
cp .env.example .env
```

Edit `.env` and set your `OPENAI_API_KEY` and `ADMIN_API_KEY`.

3. **Start the database:**

```bash
docker compose up -d
```

4. **Run migrations:**

```bash
npm run prisma:migrate
```

5. **Start the server:**

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`.

## Environment Variables

| Variable       | Description                              |
|----------------|------------------------------------------|
| DATABASE_URL   | PostgreSQL connection string             |
| PORT           | Server port (default: 3000)              |
| OPENAI_API_KEY | OpenAI API key for embeddings and chat   |
| ADMIN_API_KEY  | API key to protect admin routes          |

## API Endpoints

### Public

| Method | Route               | Description                                |
|--------|---------------------|--------------------------------------------|
| POST   | /api/chat           | Chat with the LLM about client information |
| GET    | /api/clients/search | Semantic search for clients                |

### Protected (requires `x-api-key` header)

| Method | Route               | Description                        |
|--------|---------------------|------------------------------------|
| POST   | /api/clients        | Create a new client                |
| DELETE | /api/clients/:id    | Delete a client                    |

### Chat

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{ "message": "Who are the senior engineers in California?" }'
```

```json
{ "answer": "I found 2 clients matching your query..." }
```

### Search Clients

```
GET /api/clients/search?query=senior engineer in California&limit=5
```

The `query` parameter accepts natural language. The system converts it into a vector embedding and finds the most similar client profiles using cosine distance (pgvector `<=>`).

### Create Client

```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-admin-api-key-here" \
  -d '{
    "name": "John Doe",
    "shortBio": "Software engineer with 10 years of experience",
    "email": "john@example.com",
    "age": 30,
    "gender": "male",
    "job": "Software Engineer",
    "companies": ["Google", "Microsoft"],
    "address": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94105",
      "country": "USA"
    }'
```

### Delete Client

```bash
curl -X DELETE http://localhost:3000/api/clients/<id> \
  -H "x-api-key: your-admin-api-key-here"
```

## How It Works

1. **Create**: When a client is created, all profile fields are concatenated into a text representation and sent to OpenAI's `text-embedding-3-small` model to generate a 1536-dimensional vector embedding, stored in PostgreSQL via pgvector.
2. **Search**: When a search query arrives, it is embedded using the same model and compared against all stored client embeddings using cosine distance. The top N most similar clients are returned.
3. **Chat**: The `/chat` endpoint sends the user's message to OpenAI `gpt-4o-mini` with a `search_clients` tool definition. The LLM decides whether to search, the API executes the vector search, and the LLM generates a final answer grounded in the retrieved data.

## Project Structure

```
src/
├── main.ts                          # Application entry point
├── app.module.ts                    # Root module
├── common/
│   ├── guards/                      # API key auth guard
│   └── repositories/                # Abstract base repository
├── prisma/                          # Prisma service & module
├── embedding/                       # OpenAI client & embedding service
├── chat/                            # Chat module (RAG pipeline)
│   ├── chat.controller.ts           # POST /chat endpoint
│   └── chat.service.ts              # OpenAI function calling orchestration
└── client/                          # Client module
    ├── client.controller.ts         # CRUD + search endpoints
    ├── client.service.ts            # Business logic
    ├── dto/                         # Validation DTOs
    ├── repositories/                # Abstract + Prisma implementation
    └── types/                       # TypeScript types
```

## Tech Stack

- **NestJS** - Framework
- **Prisma** - ORM
- **PostgreSQL + pgvector** - Database with vector similarity search
- **OpenAI** - Embeddings (text-embedding-3-small) and chat (gpt-4o-mini)
- **class-validator** - Request validation
- **Docker Compose** - Database infrastructure
