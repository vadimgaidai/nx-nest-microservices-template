# NX Nest Microservices

Microservices architecture built with Nx monorepo and NestJS.

## Quick Start

### Prerequisites

- Node.js 18 or higher
- pnpm 10 or higher
- Docker and Docker Compose

### Setup

1. Install dependencies:

```bash
pnpm install
```

2. Start infrastructure and initialize databases:

```bash
pnpm db:setup
```

This command does three things:

- Starts Docker containers (Postgres, Redis, RabbitMQ)
- Creates databases for all services
- Runs database migrations

3. Start services:

```bash
# Terminal 1: API Gateway
pnpm dev:gateway

# Terminal 2: Users Service
pnpm dev:users

# Terminal 3: Auth Service
pnpm dev:auth
```

### Service Endpoints

- API Gateway: http://localhost:3000/api
- Users Service: http://localhost:3001/api
- Auth Service: http://localhost:3002/api

### Management UIs

- RabbitMQ Management: http://localhost:15672 (guest/guest)

## Project Structure

```
apps/
  api-gateway/         - HTTP API Gateway
  users-service/       - Users microservice with Postgres
  auth-service/        - Auth microservice with Postgres
libs/
  contracts/           - Shared types, DTOs, event contracts
  common/              - Shared helpers and constants
  redis/               - Redis integration module
  rabbitmq/            - RabbitMQ integration module
docs/
  architecture.md      - Architecture overview
  db.md                - Database setup and migrations
  redis.md             - Redis integration guide
  rabbitmq.md          - RabbitMQ integration guide
```

## Available Scripts

### Database Management

```bash
pnpm db:up          # Start Docker containers
pnpm db:down        # Stop Docker containers
pnpm db:reset       # Reset databases (destroys all data)
pnpm db:init        # Initialize databases (idempotent)
pnpm db:setup       # Complete setup: up + init + migrate
```

### Migration Management

```bash
# Run migrations
pnpm migrate:run              # All services
pnpm migrate:users:run        # Users service only
pnpm migrate:auth:run         # Auth service only

# Revert migrations
pnpm migrate:revert           # All services (reverse order)
pnpm migrate:users:revert     # Users service only
pnpm migrate:auth:revert      # Auth service only

# Generate migrations
pnpm migrate:users:generate -- --name=MigrationName
pnpm migrate:auth:generate -- --name=MigrationName
```

### Development

```bash
pnpm dev:gateway    # Start API Gateway
pnpm dev:users      # Start Users Service
pnpm dev:auth       # Start Auth Service
```

### Code Quality

```bash
pnpm format:check   # Check code formatting
pnpm format         # Fix code formatting
```

## Environment Variables

Create `.env` file in the project root. See `.env.example` for reference.

Key variables:

- `API_GATEWAY_PORT` - API Gateway port (default: 3000)
- `USERS_SERVICE_PORT` - Users service port (default: 3001)
- `AUTH_SERVICE_PORT` - Auth service port (default: 3002)
- `POSTGRES_EXPOSED_PORT` - Postgres port (default: 5432)
- `REDIS_URL` - Redis connection URL
- `RABBITMQ_URL` - RabbitMQ connection URL

## Documentation

- [Architecture](./docs/architecture.md) - System architecture and design decisions
- [Database Setup](./docs/db.md) - Database setup and migration guide
- [Redis Integration](./docs/redis.md) - How to use Redis in services
- [RabbitMQ Integration](./docs/rabbitmq.md) - How to use RabbitMQ for events

## Technology Stack

- **Nx** - Monorepo tool for managing dependencies and builds
- **NestJS** - Framework for building microservices
- **TypeScript** - Programming language
- **TypeORM** - ORM for PostgreSQL
- **PostgreSQL** - Relational database (one database per service)
- **Redis** - Caching and shared data store
- **RabbitMQ** - Message broker for async events
- **Docker Compose** - Local infrastructure
