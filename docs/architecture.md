# Architecture

## Overview

This project is a microservices architecture built with Nx monorepo and NestJS.

## Technology Stack

- **Nx** - Monorepo tool for managing dependencies, build caching, and task execution
- **NestJS** - Framework for building microservices
- **TypeScript** - Type-safe programming language
- **TypeORM** - ORM for working with PostgreSQL
- **PostgreSQL** - Relational database (separate database for each service)
- **Redis** - Caching, idempotency keys, and backpressure control
- **RabbitMQ** - Async event processing and background jobs
- **Docker Compose** - Local infrastructure (Postgres, Redis, RabbitMQ)

## Services

### api-gateway

HTTP gateway for client requests.

- Accepts all HTTP requests from clients
- Orchestrates calls to other microservices via HTTP
- Handles both READ and WRITE operations via HTTP
- No own database
- Default port: 3000
- Endpoint: http://localhost:3000/api

### users-service

User management service.

- Owns `users_db` database
- Entities: `User`
- Migrations: `apps/users-service/migrations/`
- Publishes events to RabbitMQ (e.g., `user.created.v1`)
- Default port: 3001
- Endpoint: http://localhost:3001/api

### auth-service

Authentication and authorization service.

- Owns `auth_db` database
- Entities: `RefreshToken`
- Migrations: `apps/auth-service/migrations/`
- Subscribes to events from RabbitMQ (e.g., listens to `user.created.v1`)
- Default port: 3002
- Endpoint: http://localhost:3002/api

## Communication Model

### HTTP - Primary Transport for Synchronous Operations

```
HTTP Client
    |
api-gateway (HTTP)
    | HTTP
users-service / auth-service
    | response
api-gateway
    |
HTTP Client
```

**HTTP is used for:**

- All READ requests (GET)
- All WRITE requests (POST, PUT, PATCH, DELETE)
- Synchronous orchestration between services
- Immediate client responses

### RabbitMQ - For Async Events and Background Jobs

```
users-service
    | publishes event
RabbitMQ (exchange: events)
    | routes to queues
auth-service (consumer)
```

**RabbitMQ is used for:**

- Publishing domain events (e.g., `user.created.v1`, `order.placed.v2`)
- Async processing of heavy tasks (sending emails, generating reports)
- Retry mechanisms with Dead Letter Queue (DLQ)
- Fan-out pattern (one event to multiple consumers)

**RabbitMQ is NOT used for:**

- RPC-style request/response between services
- Replacing HTTP in api-gateway
- Synchronous calls

### Redis - For Caching and Helper Tasks

**Redis is used for:**

- Caching frequently requested data
- Idempotency keys to prevent duplicate requests
- Rate limiting and backpressure control
- Session storage (optional)

**Configuration:**

- Supports AWS ElastiCache (cluster mode and single node)
- Configured via `ConfigService` (`REDIS_URL`)

## Data Ownership Rules

### One Service - One Database

Each microservice owns its own database:

| Service       | Database | Entities     |
| ------------- | -------- | ------------ |
| users-service | users_db | User         |
| auth-service  | auth_db  | RefreshToken |

**Not allowed:**

- Direct SQL queries from one service to another service's database
- Shared tables between services

**Allowed:**

- HTTP requests between services (via api-gateway or directly)
- Events via RabbitMQ for data synchronization

### Entities Inside Services

Entities live inside service modules, not in a global library:

```
apps/users-service/src/
  entities/
    user.entity.ts
  modules/
    profile/
      profile.entity.ts
```

**Rule:** If an entity is used only in one service, it must be inside that service.

**Do not create:** `libs/entities` or `libs/shared-entities`.

### Libraries (libs/) - Only for Reusable Code

```
libs/
  contracts/       - Shared types, DTOs, event contracts
  common/          - Shared helpers, configs, utilities, constants
  redis/           - RedisModule (dynamic module for Redis)
  rabbitmq/        - RabbitmqModule (dynamic module for RabbitMQ)
```

**What should NOT be in libs/:**

- Entities
- "Shared-nest" layers
- Business logic specific to a service

## TypeORM Migrations

### Approach: per-service data-source.ts

Each service has its own `data-source.ts`:

```
apps/users-service/data-source.ts
apps/auth-service/data-source.ts
```

Migrations are stored inside each service:

```
apps/users-service/migrations/
apps/auth-service/migrations/
```

### Running Migrations from Repository Root

Migrations are executed via Nx targets:

```bash
# Run migrations for a specific service
pnpm nx run users-service:migration:run

# Run all migrations
pnpm migrate:run
```

### Why tsconfig.typeorm.json Exists

TypeORM CLI requires stable configuration for:

- Correct work with `__dirname` in ESM/CommonJS
- Path resolution via `tsconfig-paths`
- Avoiding conflicts with Nx and Webpack

The `tsconfig.typeorm.json` file in the repository root provides CLI stability.

## Development Rules

### PATCH ONLY Principle

This project follows the "PATCH ONLY" principle - minimal changes to achieve the goal.

**Key rules:**

1. Make only necessary changes. Do not refactor code unless required for the task.
2. Follow CLAUDE.md if it exists in the root.
3. No env constants: Do not create `env.ts`, `ENV_KEYS`, `zod` schemas, or `joi` validation for env variables. Use `ConfigService` directly.
4. ConfigService everywhere: All env variables are read via `ConfigService`, without wrappers and constants.
5. Minimal file changes: Change only files necessary for the task.
6. Do not add "improvements": Do not add docstrings, comments, refactoring, type annotations unless required for code to work.

### Pre-commit Checks

Before submitting changes, always check:

```bash
# 1. Formatting
pnpm format:check

# 2. Linting all services
pnpm nx run-many -t lint --projects=api-gateway,users-service,auth-service

# 3. Building all services
pnpm nx run-many -t build --projects=api-gateway,users-service,auth-service
```

All three commands must complete successfully before submitting a pull request.

## Additional Documentation

- [Database Setup](./db.md)
- [Redis Integration](./redis.md)
- [RabbitMQ Integration](./rabbitmq.md)
