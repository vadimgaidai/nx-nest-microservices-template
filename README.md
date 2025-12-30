# NX Nest Microservices

A microservices architecture built with Nx and NestJS.

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 10+
- Docker & Docker Compose

### Installation

```bash
pnpm install
```

### Environment Setup

1. Copy `.env.example` to `.env` (already exists in repo)
2. If port 5432 or 6379 is already in use, update `.env`:

```bash
# Example: Use port 5433 for Postgres
POSTGRES_EXPOSED_PORT=5433
USERS_DB_PORT=5433
AUTH_DB_PORT=5433

# Example: Use port 6380 for Redis
REDIS_EXPOSED_PORT=6380
REDIS_URL=redis://localhost:6380
```

### Start Services and Run Migrations

```bash
# Complete setup (start DB + Redis + initialize + run migrations)
pnpm db:setup

# Or step by step:
pnpm db:up              # Start Postgres and Redis
pnpm db:init            # Initialize databases (users_db, auth_db)
pnpm migrate:run        # Run all migrations
```

Services will be exposed on the ports specified in `.env`:

- Postgres: `POSTGRES_EXPOSED_PORT` (default: 5432)
- Redis: `REDIS_EXPOSED_PORT` (default: 6379)

Verify database is running:

```bash
docker compose ps
```

### Individual Migration Commands

```bash
# Run migrations per service
pnpm migrate:users:run
pnpm migrate:auth:run

# Or run all migrations
pnpm migrate:run

# Generate migrations
pnpm migrate:users:generate -- --name=MigrationName
pnpm migrate:auth:generate -- --name=MigrationName

# Revert migrations
pnpm migrate:users:revert
pnpm migrate:auth:revert
```

## Development

### Build Services

```bash
# Build all services
nx run-many -t build --projects=api-gateway,users-service,auth-service

# Build specific service
nx build users-service
```

### Lint

```bash
# Lint all services
nx run-many -t lint --projects=api-gateway,users-service,auth-service

# Lint specific service
nx lint users-service
```

### Format

```bash
# Check formatting
pnpm format:check

# Fix formatting
pnpm format
```

### Serve (Development Mode)

```bash
# Using convenience scripts
pnpm dev:gateway    # Start API Gateway
pnpm dev:users      # Start Users Service
pnpm dev:auth       # Start Auth Service

# Or using Nx directly
nx serve api-gateway
nx serve users-service
nx serve auth-service
```

**Default Endpoints:**

- API Gateway: `http://localhost:3000/api`
- Users Service: `http://localhost:3001/api`
- Auth Service: `http://localhost:3002/api`

**Configuration:**

- Ports: Customize via `API_GATEWAY_PORT`, `USERS_SERVICE_PORT`, `AUTH_SERVICE_PORT` in `.env`
- Global prefix: Customize via `API_GLOBAL_PREFIX` in `.env` (default: `api`)

## Available Scripts

### Database Management

```bash
pnpm db:up          # Start database
pnpm db:down        # Stop database
pnpm db:reset       # Reset database (destroys data)
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

# Generate migrations (requires DB connection)
pnpm migrate:users:generate -- --name=MigrationName
pnpm migrate:auth:generate -- --name=MigrationName

# Or using Nx directly
nx run users-service:migration:generate --name=MigrationName
nx run users-service:migration:run
nx run users-service:migration:revert
```

### Development

```bash
pnpm dev:gateway    # Start API Gateway
pnpm dev:users      # Start Users Service
pnpm dev:auth       # Start Auth Service
```

## Project Structure

```
apps/
  api-gateway/         - HTTP API Gateway
  users-service/       - Users microservice with Postgres
  auth-service/        - Auth microservice with Postgres
libs/
  contracts/           - Shared types and DTOs
  common/              - Shared helpers and configs
  redis/               - Redis integration module
docker/
  init-db.sh          - Database initialization script
docs/
  db.md               - Database documentation
  redis.md            - Redis documentation
```

## Environment Variables

See `.env.example` and `.env` for configuration:

**Service Configuration:**

- `API_GLOBAL_PREFIX` - Global API prefix for all services (default: `api`)
- `API_GATEWAY_PORT` - API Gateway HTTP port (default: 3000)
- `USERS_SERVICE_PORT` - Users Service HTTP port (default: 3001)
- `AUTH_SERVICE_PORT` - Auth Service HTTP port (default: 3002)

**Database Configuration:**

- `POSTGRES_EXPOSED_PORT` - Docker Postgres port (default: 5432)
- `USERS_DB_*` - Users service database connection
- `AUTH_DB_*` - Auth service database connection

**Redis Configuration:**

- `REDIS_EXPOSED_PORT` - Docker Redis port (default: 6379)
- `REDIS_URL` - Redis connection URL (default: redis://localhost:6379)

## Stage 1 - Complete ✅

- Nx workspace with pnpm
- Prettier and ESLint configured
- 3 minimal Nest applications

## Stage 2 - Complete ✅

- Docker Compose with Postgres (2 databases)
- TypeORM integration per service
- Migration commands runnable from repo root
- Entities and migrations per service

## Additional Documentation

- [Database Setup](docs/db.md)
- [Redis Integration](docs/redis.md)
