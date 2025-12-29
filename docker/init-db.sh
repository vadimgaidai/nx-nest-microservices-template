#!/bin/bash
set -e

# Collect all database names from *_DB_NAME environment variables
DB_NAMES=$(printenv | grep '_DB_NAME=' | cut -d= -f2 | sort -u)

if [ -z "$DB_NAMES" ]; then
  echo "⚠ No *_DB_NAME environment variables found"
  exit 0
fi

# Build SQL commands for each database
SQL_COMMANDS=""
for DB_NAME in $DB_NAMES; do
  SQL_COMMANDS+="SELECT 'CREATE DATABASE ${DB_NAME}' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec\n"
done

# Execute all CREATE DATABASE commands
echo -e "$SQL_COMMANDS" | psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB"

# Print summary
DB_LIST=$(echo "$DB_NAMES" | tr '\n' ', ' | sed 's/, $//')
echo "✓ Databases initialized: $DB_LIST"
