# Database Setup

## Local Development

### Environment Configuration

Copy `.env.example` to `.env` (if not already present) and configure:

```bash
# If port 5432 is already in use, change POSTGRES_EXPOSED_PORT
POSTGRES_EXPOSED_PORT=5432

# Ensure all DB connection vars match the exposed port
USERS_DB_PORT=5432
AUTH_DB_PORT=5432
```

### Start Database

```bash
docker compose up -d
```

The docker-compose setup will:

- Expose Postgres on port `${POSTGRES_EXPOSED_PORT}` (default: 5432)
- Auto-create service databases based on `*_DB_NAME` env vars (idempotent)
- No tables are created - use migrations instead

### Initialize Service Databases

The `docker/init-db.sh` script automatically creates databases for all services by:

1. Reading all environment variables matching `*_DB_NAME` from `.env`
2. Creating each database if it doesn't exist (idempotent)

**Current databases:** `users_db`, `auth_db`

**Adding a new service database:**

1. Add `<SERVICE>_DB_NAME=<dbname>` to `.env`
2. Run `pnpm db:init` or restart containers
3. No script changes needed

### Check Status

```bash
docker compose ps
```

Expected output: postgres container is healthy

### Stop Database

```bash
docker compose down
```

### Reset Database (WARNING: destroys all data)

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

## Convenience Scripts

For better developer UX, the root `package.json` provides convenient aliases:

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
# Run migrations for specific service
pnpm migrate:users:run
pnpm migrate:auth:run

# Run all migrations (users then auth)
pnpm migrate:run

# Revert migrations
pnpm migrate:users:revert
pnpm migrate:auth:revert
pnpm migrate:revert  # Reverts auth then users

# Generate migrations (requires -- to pass args)
pnpm migrate:users:generate -- --name=InitUsers
pnpm migrate:auth:generate -- --name=InitAuth
```

**Note:** When using `generate` scripts, you must pass the `--name` argument with `--` separator:

```bash
pnpm migrate:users:generate -- --name=AddUserEmail
```
