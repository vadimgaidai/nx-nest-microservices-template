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
2. If port 5432 is already in use, change `POSTGRES_EXPOSED_PORT` in `.env`:

```bash
# Example: Use port 5433 instead
POSTGRES_EXPOSED_PORT=5433
USERS_DB_PORT=5433
AUTH_DB_PORT=5433
```

### Start Database

```bash
docker compose up -d
```

The database will be exposed on the port specified by `POSTGRES_EXPOSED_PORT` (default: 5432).

Verify database is running:

```bash
docker compose ps
```

### Run Migrations

```bash
# Users Service
nx run users-service:migration:run

# Auth Service
nx run auth-service:migration:run
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

### Serve

```bash
# Start api-gateway
nx serve api-gateway

# Start users-service
nx serve users-service

# Start auth-service
nx serve auth-service
```

## Database Migrations

### Users Service

```bash
# Generate migration
nx run users-service:migration:generate --name=MigrationName

# Run migrations
nx run users-service:migration:run

# Revert last migration
nx run users-service:migration:revert
```

### Auth Service

```bash
# Generate migration
nx run auth-service:migration:generate --name=MigrationName

# Run migrations
nx run auth-service:migration:run

# Revert last migration
nx run auth-service:migration:revert
```

## Project Structure

```
apps/
  api-gateway/         - HTTP API Gateway
  users-service/       - Users microservice with Postgres
  auth-service/        - Auth microservice with Postgres
docker/
  init-db.sh          - Database initialization script
docs/
  db.md               - Database documentation
```

## Environment Variables

See `.env` file for database configuration:

- `USERS_DB_*` - Users service database config
- `AUTH_DB_*` - Auth service database config

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
