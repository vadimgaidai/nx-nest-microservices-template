# NX Nest Microservices

Microservices architecture template built with Nx monorepo and NestJS.

## Architecture

This template implements a hybrid microservices architecture:

### API Gateway Orchestration Pattern

The API Gateway acts as an orchestrator for synchronous operations:

- All HTTP requests from clients go through the API Gateway
- API Gateway orchestrates calls to microservices via HTTP
- Used for READ and WRITE operations requiring immediate responses

### Event-Driven Architecture

Services communicate asynchronously via RabbitMQ:

- Services publish domain events to RabbitMQ
- Other services consume events they're interested in
- Used for async processing, data synchronization, and background jobs
- Enables eventual consistency between services

**Architecture Flow:**

```
HTTP Client
    |
API Gateway (orchestrator) → HTTP → Microservice → Publishes Event → RabbitMQ
                                                                          ↓
                                                                    Consumer Service
```

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

2. Setup database:

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

# Terminal 2: Microservice 1
pnpm dev:users

# Terminal 3: Microservice 2
pnpm dev:auth
```

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
# Run migrations for all services (automatically discovers services with migration:run target)
pnpm migrate:run

# Revert migrations for all services
pnpm migrate:revert

# Generate migration for specific service
pnpm migrate:users:generate -- --name=MigrationName
pnpm migrate:auth:generate -- --name=MigrationName
```

**Note:** The `migrate:run` and `migrate:revert` commands automatically discover all services with `migration:run` target. When you add a new service with migrations, you don't need to update these commands.

### Development

```bash
pnpm dev:gateway    # Start API Gateway
pnpm dev:users      # Start Users Service
pnpm dev:auth       # Start Auth Service
```

### Code Quality

```bash
pnpm lint           # Lint all services and libraries
pnpm lint:fix       # Fix linting issues automatically
pnpm format:check   # Check code formatting
pnpm format         # Fix code formatting
```

### Git Hooks

This project uses Husky for git hooks:

- **pre-commit**: Runs lint-staged to lint and format only changed files
- **commit-msg**: Validates commit messages using commitlint (Conventional Commits format)

**Commit Message Format:**

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

Examples:

- `feat(users): add user creation endpoint`
- `fix(auth): resolve token expiration issue`
- `docs: update README with setup instructions`

## Environment Variables

Create `.env` file in the project root. See `.env.example` for reference.

Key variables:

- `API_GATEWAY_PORT` - API Gateway port (default: 3000)
- `USERS_SERVICE_PORT` - Users service port (default: 3001)
- `AUTH_SERVICE_PORT` - Auth service port (default: 3002)
- `POSTGRES_EXPOSED_PORT` - Postgres port (default: 5432)
- `REDIS_URL` - Redis connection URL
- `RABBITMQ_URL` - RabbitMQ connection URL

## Shared Libraries

### Constants

Global constants are in `libs/common/src/constants/`:

- **Redis keys**: `libs/common/src/constants/redis-keys.ts`
  - Service-specific key prefixes: `USER_REDIS_KEYS`, `AUTH_REDIS_KEYS`, `GATEWAY_REDIS_KEYS`
- **RabbitMQ events**: `libs/common/src/constants/rabbitmq.ts`
  - Event type constants: `USER_EVENTS_KEYS`, `AUTH_EVENTS_KEYS`
  - Queue names: `AUTH_EVENTS_QUEUE`, `USERS_EVENTS_QUEUE`

### Configurations

- **ESLint configs**: `libs/common/configs/eslint/`
  - `base.js` - Base rules for all TypeScript files
  - `nest.js` - NestJS-specific rules (import ordering, Prettier integration)
- **TypeScript configs**: `libs/common/configs/tsconfig/`
  - `base.json` - Base TypeScript configuration
  - `nest.json` - NestJS-specific configuration
  - `node.json` - Node.js-specific configuration

### Integration Modules

- **Redis**: `libs/redis/` - RedisModule with RedisService
- **RabbitMQ**: `libs/rabbitmq/` - RabbitmqModule with RabbitmqPublisher

## Documentation

- [Architecture](./docs/architecture.md) - Architecture overview and communication patterns
- [Database Setup](./docs/db.md) - Database setup and migrations
- [Redis Integration](./docs/redis.md) - Redis module usage and configuration
- [RabbitMQ Integration](./docs/rabbitmq.md) - RabbitMQ events and consumers

## Technology Stack

- **Nx** - Monorepo tool for managing dependencies and builds
- **NestJS** - Framework for building microservices
- **TypeScript** - Programming language
- **TypeORM** - ORM for PostgreSQL
- **PostgreSQL** - Relational database (one database per service)
- **Redis** - Caching and shared data store
- **RabbitMQ** - Message broker for async events
- **Docker Compose** - Local infrastructure
