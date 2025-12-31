# Redis Integration

This platform uses Redis as a shared caching and data store available to all microservices. The integration supports both single-node and cluster deployments, including AWS ElastiCache and Valkey.

## Configuration

### Local Development

Add the following to your `.env` file:

```bash
# Redis Docker Container
REDIS_EXPOSED_PORT=6379

# Redis Connection
REDIS_URL=redis://localhost:6379
```

Start Redis with Docker Compose:

```bash
docker compose up -d redis
```

### AWS ElastiCache / Valkey with TLS

For production environments with TLS (AWS ElastiCache, Valkey, etc.):

```bash
# Use rediss:// scheme for TLS
REDIS_URL=rediss://your-elasticache-endpoint.cache.amazonaws.com:6379
```

The module automatically detects `rediss://` URLs and configures TLS with the correct servername. No additional configuration needed.

### Cluster Mode

For Redis Cluster (AWS ElastiCache Cluster Mode Enabled):

```typescript
// In your app.module.ts
RedisModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    mode: 'cluster',
    clusterNodes: [
      'node1.cache.amazonaws.com:6379',
      'node2.cache.amazonaws.com:6379',
      'node3.cache.amazonaws.com:6379',
    ],
    options: {
      // Optional cluster options
      dnsLookup: (address, callback) => callback(null, address),
      redisOptions: {
        tls: config.get('REDIS_TLS_ENABLED') === 'true' ? {} : undefined,
      },
    },
  }),
});
```

Or use environment variables:

```bash
REDIS_CLUSTER_NODES=node1.cache.amazonaws.com:6379,node2.cache.amazonaws.com:6379
```

### Environment Variables in AWS

Environment variables are injected differently based on your deployment:

**AWS ECS (Fargate/EC2):**
- Define in Task Definition → Container Definitions → Environment
- Or use AWS Systems Manager Parameter Store / Secrets Manager

**AWS EKS (Kubernetes):**
- ConfigMaps for non-sensitive values
- Secrets for sensitive values
- Reference in pod spec: `env` or `envFrom`

**Example ECS Task Definition:**

```json
{
  "environment": [{ "name": "REDIS_URL", "value": "rediss://..." }]
}
```

**Example Kubernetes ConfigMap:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  REDIS_URL: 'rediss://...'
```

## Usage

### Import RedisModule

In your NestJS application module:

```typescript
import { RedisModule } from '@nx-microservices/redis';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule.forRootAsync(), // Uses REDIS_URL from ConfigService
    // ... other imports
  ],
})
export class AppModule {}
```

### Using RedisService

The `RedisService` provides convenient methods for common operations:

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from '@nx-microservices/redis';
import { REDIS_KEYS } from '@nx-microservices/common';

@Injectable()
export class CacheService {
  constructor(private readonly redis: RedisService) {}

  async cacheUser(userId: string, user: any): Promise<void> {
    const key = `${REDIS_KEYS.CACHE}user:${userId}`;
    await this.redis.setJson(key, user, 3600); // 1 hour TTL
  }

  async getUser(userId: string): Promise<any> {
    const key = `${REDIS_KEYS.CACHE}user:${userId}`;
    return this.redis.getJson(key);
  }

  async invalidateUser(userId: string): Promise<void> {
    const key = `${REDIS_KEYS.CACHE}user:${userId}`;
    await this.redis.del(key);
  }

  async incrementCounter(key: string): Promise<number> {
    return this.redis.incr(`${REDIS_KEYS.RATE_LIMIT}${key}`);
  }
}
```

### Available Methods

**Basic Operations:**
- `get(key)` - Get string value
- `set(key, value, ttlSeconds?)` - Set string value with optional TTL
- `del(...keys)` - Delete one or more keys
- `exists(key)` - Check if key exists
- `ttl(key)` - Get time to live in seconds
- `expire(key, ttlSeconds)` - Set expiration
- `incr(key)` - Increment by 1

**JSON Operations:**
- `getJson<T>(key)` - Get and parse JSON
- `setJson(key, obj, ttlSeconds?)` - Stringify and set JSON

**Advanced:**
- `getClient()` - Get raw ioredis client for complex operations

### Shared Key Prefixes

Use `REDIS_KEYS` constants to namespace keys and avoid collisions:

```typescript
import { REDIS_KEYS } from '@nx-microservices/common';

// Available prefixes:
REDIS_KEYS.SESSION; // 'session:'
REDIS_KEYS.CACHE; // 'cache:'
REDIS_KEYS.RATE_LIMIT; // 'ratelimit:'
REDIS_KEYS.LOCK; // 'lock:'
```

### Direct Client Access

For advanced operations not covered by RedisService:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { REDIS_CLIENT } from '@nx-microservices/redis';
import { Redis } from 'ioredis';

@Injectable()
export class AdvancedService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async usePipeline(): Promise<void> {
    const pipeline = this.redis.pipeline();
    pipeline.set('key1', 'value1');
    pipeline.set('key2', 'value2');
    await pipeline.exec();
  }

  async usePubSub(): Promise<void> {
    await this.redis.publish('channel', 'message');
  }
}
```

## Advanced Configuration

### Custom Options

Override default behavior with custom options:

```typescript
RedisModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    mode: 'single',
    url: config.get('REDIS_URL'),
    options: {
      // Override defaults
      retryStrategy: (times) => Math.min(times * 100, 3000),
      maxRetriesPerRequest: 3,
      // Enable offline queue
      enableOfflineQueue: false,
      // Custom reconnect behavior
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    },
  }),
});
```

### Default Reconnect Strategy

The module uses safe defaults for production:
- **Retry strategy**: Exponential backoff up to 2 seconds
- **Max retries per request**: `null` (wait indefinitely for reconnect)
- **TLS auto-detection**: Enabled for `rediss://` URLs

## Troubleshooting

### Connection Errors

**Error: REDIS_URL is not defined**

1. Ensure `.env` file exists in project root
2. Verify `REDIS_URL` is set
3. Restart the application

**Error: Connection timeout**

1. Check Redis is running: `docker compose ps redis`
2. Verify network connectivity
3. Check firewall rules (AWS security groups)

### AWS ElastiCache Issues

**TLS handshake errors:**
- Ensure using `rediss://` (not `redis://`)
- Verify security group allows inbound traffic on port 6379
- Check VPC configuration

**Cluster discovery issues:**
- Ensure all cluster nodes are specified
- Use Configuration Endpoint for auto-discovery
- Enable DNS lookup if using private DNS

### Performance

**Slow responses:**
- Check network latency to Redis
- Monitor Redis CPU/memory
- Consider using connection pooling for cluster mode
- Review slow log: `redis-cli slowlog get 10`

**Connection pool exhausted:**
- Increase `maxRetriesPerRequest` if needed
- Review application connection patterns
- Check for connection leaks

### Local Development

**Port conflict:**

```bash
# Check if port is in use
lsof -i :6379

# Use different port in .env
REDIS_EXPOSED_PORT=6380
REDIS_URL=redis://localhost:6380

# Restart
docker compose down
docker compose up -d redis
```

**Redis not starting:**

```bash
# View logs
docker compose logs redis

# Restart service
docker compose restart redis
```

## Migration from Direct ioredis

If migrating from direct ioredis usage:

**Before:**

```typescript
import Redis from 'ioredis';

const redis = new Redis('redis://localhost:6379');
await redis.set('key', 'value');
```

**After:**

```typescript
import { RedisService } from '@nx-microservices/redis';

constructor(private readonly redis: RedisService) {}

await this.redis.set('key', 'value');
```

## Best Practices

1. **Use key prefixes**: Always use `REDIS_KEYS` constants to namespace keys
2. **Set TTLs**: Always set expiration for cache entries to prevent memory issues
3. **Handle nulls**: Redis returns `null` for missing keys, handle appropriately
4. **Connection lifecycle**: Module handles connection cleanup on shutdown
5. **Error handling**: Wrap Redis calls in try-catch for resilience
6. **Monitoring**: Monitor Redis metrics (memory, CPU, connections) in production
7. **Security**: Use TLS in production, rotate credentials regularly
