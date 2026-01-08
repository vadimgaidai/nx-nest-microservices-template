# Redis Integration

## Overview

Redis is used as a shared caching and data store available to all microservices. The Redis module is located in `libs/redis/` and supports both single-node and cluster deployments.

## Module Location

- **Module**: `libs/redis/src/lib/redis.module.ts`
- **Service**: `libs/redis/src/lib/redis.service.ts`
- **Interfaces**: `libs/redis/src/lib/redis.interfaces.ts`
- **Constants**: `libs/redis/src/lib/redis.constants.ts`

## Redis Key Constants

**Location**: `libs/common/src/constants/redis-keys.ts`

Service-specific key prefixes:

```typescript
export const USER_REDIS_KEYS = {};
export const AUTH_REDIS_KEYS = {};
export const GATEWAY_REDIS_KEYS = {};
```

**Usage:**

```typescript
import { USER_REDIS_KEYS } from '@nx-microservices/common';

const key = `${USER_REDIS_KEYS.PROFILE}${userId}`;
await redisService.set(key, data);
```

**Note:** The RedisService automatically prefixes all keys with the service name (from `APP_NAME` env variable) to prevent collisions between services.

## Configuration

### Environment Variables

```bash
REDIS_URL=redis://localhost:6379
```

For TLS (AWS ElastiCache, Valkey):

```bash
REDIS_URL=rediss://your-elasticache-endpoint.cache.amazonaws.com:6379
```

### Module Setup

```typescript
import { RedisModule } from '@nx-microservices/redis';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule.forRootAsync(), // Uses REDIS_URL from ConfigService
  ],
})
export class AppModule {}
```

## Usage

### Basic Operations

```typescript
import { RedisService } from '@nx-microservices/redis';

@Injectable()
export class CacheService {
  constructor(private readonly redis: RedisService) {}

  async cacheData(key: string, value: any, ttlSeconds?: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), ttlSeconds);
  }

  async getData(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async deleteData(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
```

### Available Methods

**Basic:**

- `get(key)` - Get string value
- `set(key, value, ttlSeconds?)` - Set string with optional TTL
- `del(...keys)` - Delete keys
- `exists(key)` - Check if key exists
- `ttl(key)` - Get time to live
- `expire(key, ttlSeconds)` - Set expiration
- `incr(key)` - Increment counter

**JSON:**

- `getJson<T>(key)` - Get and parse JSON
- `setJson(key, obj, ttlSeconds?)` - Stringify and set JSON

**Advanced:**

- `getClient()` - Get raw ioredis client
- `getWithTimeout(key, timeoutMs)` - Get with timeout
- `setWithTimeout(key, value, ttlSeconds?, timeoutMs)` - Set with timeout

## Health Checks

The module provides a health indicator:

```typescript
import { RedisHealthIndicator } from '@nx-microservices/redis';

@Module({
  imports: [RedisModule.forRootAsync()],
  controllers: [HealthController],
})
export class AppModule {
  constructor(
    private health: HealthCheckService,
    private redis: RedisHealthIndicator,
  ) {}

  @Get('health')
  check() {
    return this.health.check([() => this.redis.isHealthy('redis')]);
  }
}
```

## Cluster Mode

For Redis Cluster:

```typescript
RedisModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    mode: 'cluster',
    clusterNodes: ['node1.cache.amazonaws.com:6379', 'node2.cache.amazonaws.com:6379'],
    redisOptions: {
      tls: config.get('REDIS_TLS_ENABLED') === 'true' ? {} : undefined,
    },
  }),
});
```

## Troubleshooting

**Connection errors:**

- Verify `REDIS_URL` is set in `.env`
- Check Redis is running: `docker compose ps redis`
- For AWS: Verify security groups allow inbound traffic

**Key collisions:**

- Ensure `APP_NAME` env variable is set per service
- Use service-specific constants from `libs/common/src/constants/redis-keys.ts`
