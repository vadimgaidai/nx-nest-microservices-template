# Database Setup

## Quick Setup

```bash
pnpm db:setup
```

This command does three things:
1. Starts Docker containers (Postgres, Redis, RabbitMQ)
2. Creates databases for all services
3. Runs database migrations

## Manual Setup Steps

```bash
# 1. Start Docker containers
pnpm db:up

# 2. Initialize databases
pnpm db:init

# 3. Run migrations
pnpm migrate:run
```

## Database Management Commands

```bash
pnpm db:up          # Start Docker containers
pnpm db:down        # Stop Docker containers
pnpm db:reset       # Reset databases (destroys all data)
pnpm db:init        # Initialize databases (idempotent)
pnpm db:setup       # Complete setup: up + init + migrate
```

## Migrations

### Run Migrations

```bash
# Run migrations for all services (automatically discovers services)
pnpm migrate:run

# Revert migrations for all services
pnpm migrate:revert

# Generate migration for specific service
pnpm migrate:users:generate -- --name=MigrationName
pnpm migrate:auth:generate -- --name=MigrationName
```

**Note:** The `migrate:run` and `migrate:revert` commands automatically discover all services with `migration:run` target in their `project.json`. When you add a new service with migrations, you don't need to update these commands.

### Adding New Service Database

1. Add `<SERVICE>_DB_NAME=<dbname>` to `.env`
2. Run `pnpm db:init` or restart containers
3. Add migration targets to service's `project.json`

## Environment Configuration

Each service needs database connection variables:

```bash
USERS_DB_HOST=localhost
USERS_DB_PORT=5432
USERS_DB_USER=postgres
USERS_DB_PASSWORD=postgres
USERS_DB_NAME=users_db

AUTH_DB_HOST=localhost
AUTH_DB_PORT=5432
AUTH_DB_USER=postgres
AUTH_DB_PASSWORD=postgres
AUTH_DB_NAME=auth_db
```

## Port Conflicts

If port 5432 is in use, change `POSTGRES_EXPOSED_PORT` in `.env`:

```bash
POSTGRES_EXPOSED_PORT=5433
```

Update all service connection ports accordingly, then restart containers.
