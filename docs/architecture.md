# Architecture

## Overview

This is a microservices architecture template built with Nx monorepo and NestJS. It implements a hybrid pattern combining API Gateway orchestration with event-driven communication.

## Architecture Pattern

### Hybrid Approach

The system uses two communication patterns:

1. **Synchronous HTTP Orchestration** (via API Gateway)
   - For requests requiring immediate responses
   - API Gateway orchestrates calls to microservices
   - Used for READ and WRITE operations

2. **Asynchronous Event-Driven** (via RabbitMQ)
   - For async processing and eventual consistency
   - Services publish domain events
   - Other services consume events they need
   - Used for data synchronization and background jobs

## Communication Model

### HTTP - Synchronous Operations

```
HTTP Client
    |
API Gateway (orchestrator)
    | HTTP
Microservices (users-service, auth-service, etc.)
    | response
API Gateway
    |
HTTP Client
```

**When to use HTTP:**

- All READ requests (GET)
- All WRITE requests (POST, PUT, PATCH, DELETE)
- Operations requiring immediate response
- Request/response patterns

**When NOT to use HTTP:**

- Async processing
- Fire-and-forget operations
- Event propagation

### RabbitMQ - Asynchronous Events

```
Microservice (publisher)
    | publishes event
RabbitMQ (exchange: "events")
    | routes to queues
Microservice (consumer)
```

**When to use RabbitMQ:**

- Publishing domain events (e.g., "user created", "order placed")
- Async background job processing
- Eventual consistency between services
- Fan-out patterns (one event to multiple consumers)

**When NOT to use RabbitMQ:**

- RPC-style request/response
- Synchronous operations
- Replacing HTTP orchestration

## Technology Stack

- **Nx** - Monorepo tool for managing dependencies, build caching, and task execution
- **NestJS** - Framework for building microservices
- **TypeScript** - Type-safe programming language
- **TypeORM** - ORM for PostgreSQL
- **PostgreSQL** - Relational database (one database per service)
- **Redis** - Caching, idempotency keys, and shared data store
- **RabbitMQ** - Message broker for async events
- **Docker Compose** - Local infrastructure

## Data Ownership

### One Service - One Database

Each microservice owns its own database:

- Service-specific databases (e.g., `users_db`, `auth_db`)
- No shared tables between services
- Direct database access only from owning service

### Communication Rules

**Allowed:**

- HTTP requests between services (via API Gateway or directly)
- Events via RabbitMQ for data synchronization
- Shared data via Redis

**Not allowed:**

- Direct SQL queries from one service to another service's database
- Shared tables between services

## Project Structure

```
apps/
  <service-name>/      - Individual microservices
    src/
      entities/        - TypeORM entities (service-specific)
      migrations/      - Database migrations
libs/
  contracts/           - Shared types, DTOs, interfaces
  common/              - Shared utilities, constants, configs
    constants/         - Redis keys, RabbitMQ events
    configs/           - ESLint, TypeScript configs
  redis/               - RedisModule (dynamic module)
  rabbitmq/            - RabbitmqModule (dynamic module)
```

## Shared Libraries

### Constants Location

All global constants are in `libs/common/src/constants/`:

- **Redis keys**: `redis-keys.ts`
  - Service-specific prefixes: `USER_REDIS_KEYS`, `AUTH_REDIS_KEYS`, etc.
- **RabbitMQ events**: `rabbitmq.ts`
  - Event type constants: `USER_EVENTS_KEYS`, `AUTH_EVENTS_KEYS`
  - Queue names: `AUTH_EVENTS_QUEUE`, `USERS_EVENTS_QUEUE`

### Configuration Files

- **ESLint**: `libs/common/configs/eslint/`
  - `base.js` - Base rules for all TypeScript files
  - `nest.js` - NestJS-specific rules with import ordering and Prettier
- **TypeScript**: `libs/common/configs/tsconfig/`
  - `base.json`, `nest.json`, `node.json`

### Integration Modules

- **Redis**: `libs/redis/` - Provides `RedisModule` and `RedisService`
- **RabbitMQ**: `libs/rabbitmq/` - Provides `RabbitmqModule` and `RabbitmqPublisher`

## Development Rules

### PATCH ONLY Principle

Minimal changes to achieve the goal:

1. Make only necessary changes
2. No env constants: Use `ConfigService` directly, no wrappers
3. ConfigService everywhere: All env variables via `ConfigService`
4. Minimal file changes: Change only files necessary for the task
5. Do not add "improvements": No docstrings, comments, refactoring unless required
