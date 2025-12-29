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
- Auto-create `users_db` and `auth_db` databases (idempotent)
- No tables are created - use migrations instead

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

## Databases

- **users_db**: Used by users-service
- **auth_db**: Used by auth-service

Both databases are automatically created on first startup via `docker/init-db.sh` (idempotent)

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
