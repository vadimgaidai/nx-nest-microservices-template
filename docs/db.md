# Database Setup

## Local Development: Step by Step

Database initialization in this project is done manually in three steps:

```bash
# 1. Start Docker containers (Postgres, Redis, RabbitMQ)
pnpm db:up

# 2. Initialize databases for services (users_db, auth_db)
pnpm db:init

# 3. Apply migrations for all services
pnpm migrate:run
```

**Or run all steps at once:**

```bash
pnpm db:setup
```

### Why db:init Exists Separately

Docker Compose supports auto-running scripts via `docker-entrypoint-initdb.d`, but we run db:init manually because:

1. **Healthcheck timing**: Postgres container is marked as "healthy" before init scripts complete, which can cause race conditions when starting services.
2. **Developer experience**: Explicit `pnpm db:init` step gives control over when databases are created.
3. **Idempotent by design**: The `docker/init-db.sh` script can be run multiple times - it does not recreate existing databases.

### Port Conflicts

If port 5432 is already in use on your host, change `POSTGRES_EXPOSED_PORT` in `.env`:

```bash
# Example: use port 5433
POSTGRES_EXPOSED_PORT=5433

# Update connection ports for all services
USERS_DB_PORT=5433
AUTH_DB_PORT=5433
```

After changing ports, restart containers:

```bash
pnpm db:down
pnpm db:up
```

## Environment Configuration

Copy `.env.example` to `.env` (if not already present) and configure:

```bash
# If port 5432 is already in use, change POSTGRES_EXPOSED_PORT
POSTGRES_EXPOSED_PORT=5432

# Ensure all DB connection vars match the exposed port
USERS_DB_PORT=5432
AUTH_DB_PORT=5432
```

## Start Database

```bash
docker compose up -d
```

The docker-compose setup will:

- Expose Postgres on port `${POSTGRES_EXPOSED_PORT}` (default: 5432)
- Auto-create service databases based on `*_DB_NAME` env vars (idempotent)
- No tables are created - use migrations instead

## Initialize Service Databases

The `docker/init-db.sh` script automatically creates databases for all services by:

1. Reading all environment variables matching `*_DB_NAME` from `.env`
2. Creating each database if it does not exist (idempotent)

**Current databases:** `users_db`, `auth_db`

**Adding a new service database:**

1. Add `<SERVICE>_DB_NAME=<dbname>` to `.env`
2. Run `pnpm db:init` or restart containers
3. No script changes needed

## Check Status

```bash
docker compose ps
```

Expected output: postgres container is healthy

## Stop Database

```bash
docker compose down
```

## Reset Database (WARNING: destroys all data)

```bash
docker compose down -v
docker compose up -d
```

## Service Databases

Databases are automatically discovered and created from environment variables:

- **users_db**: Used by users-service (via `USERS_DB_NAME`)
- **auth_db**: Used by auth-service (via `AUTH_DB_NAME`)

All databases matching `*_DB_NAME` in `.env` are created automatically on first startup or when running `pnpm db:init`.

## Running Migrations

### All Services

```bash
# Run migrations for all services (automatically discovers services with migration:run target)
pnpm migrate:run

# Revert migrations for all services
pnpm migrate:revert
```

### Individual Services

You can run migrations for a specific service:

```bash
# Users Service
pnpm nx run users-service:migration:generate --name=MigrationName
pnpm nx run users-service:migration:run
pnpm nx run users-service:migration:revert

# Auth Service
pnpm nx run auth-service:migration:generate --name=MigrationName
pnpm nx run auth-service:migration:run
pnpm nx run auth-service:migration:revert
```

**Adding a new service:** When you create a new service with migrations, add the `migration:run`, `migration:revert`, and `migration:generate` targets to its `project.json`. The `migrate:run` and `migrate:revert` commands will automatically include the new service.

## Convenience Scripts

For better developer experience, the root `package.json` provides convenient aliases:

### Database Management

```bash
# Start database
pnpm db:up

# Stop database
pnpm db:down

# Reset database (WARNING: destroys all data)
pnpm db:reset

# Initialize databases (idempotent)
pnpm db:init

# Complete setup: up + init + migrate
pnpm db:setup
```

### Run Services

```bash
# Run individual services
pnpm dev:gateway
pnpm dev:users
pnpm dev:auth
```

### Migrations

```bash
# Run migrations for all services (automatically finds all services with migration:run target)
pnpm migrate:run

# Revert migrations for all services
pnpm migrate:revert

# Run migrations for specific service
pnpm migrate:users:run
pnpm migrate:auth:run

# Revert migrations for specific service
pnpm migrate:users:revert
pnpm migrate:auth:revert

# Generate migrations (requires -- to pass args)
pnpm migrate:users:generate -- --name=InitUsers
pnpm migrate:auth:generate -- --name=InitAuth
```

**Note:** The `migrate:run` and `migrate:revert` commands automatically discover and run migrations for all services that have the `migration:run` target configured. When you add a new service with migrations, you don't need to update these commands - they will automatically include the new service.

**Note:** When using `generate` scripts, you must pass the `--name` argument with `--` separator:

```bash
pnpm migrate:users:generate -- --name=AddUserEmail
```
