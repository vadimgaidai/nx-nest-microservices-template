# RabbitMQ Integration

## Overview

RabbitMQ is used for event-driven architecture and async processing. The RabbitMQ module is located in `libs/rabbitmq/` and provides publishing and consuming capabilities.

## Module Location

- **Module**: `libs/rabbitmq/src/lib/rabbitmq.module.ts`
- **Publisher**: `libs/rabbitmq/src/lib/rabbitmq.publisher.ts`
- **Helpers**: `libs/rabbitmq/src/lib/rabbitmq.helpers.ts`
- **Interfaces**: `libs/rabbitmq/src/lib/rabbitmq.interfaces.ts`
- **Constants**: `libs/rabbitmq/src/lib/rabbitmq.constants.ts`

## Event Type Constants

**Location**: `libs/common/src/constants/rabbitmq.ts`

```typescript
export const USER_EVENTS_KEYS = {
  USER_CREATED: 'user.created.v1',
};

export const AUTH_EVENTS_KEYS = {};

export const AUTH_EVENTS_QUEUE = 'auth-service.events';
export const USERS_EVENTS_QUEUE = 'users-service.events';
```

**Usage:**

```typescript
import { USER_EVENTS_KEYS, AUTH_EVENTS_QUEUE } from '@nx-microservices/common';
import { createSubscribeConfig } from '@nx-microservices/rabbitmq';

// Publishing
await publisher.publishEvent({
  type: USER_EVENTS_KEYS.USER_CREATED,
  // ...
});

// Consuming (with helper)
@RabbitSubscribe(createSubscribeConfig(USER_EVENTS_KEYS.USER_CREATED, AUTH_EVENTS_QUEUE))
```

## Configuration

### Environment Variables

```bash
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

For production with TLS:

```bash
RABBITMQ_URL=amqps://username:password@b-xxx.mq.us-east-1.amazonaws.com:5671
```

### Module Setup

```typescript
import { RabbitmqModule } from '@nx-microservices/rabbitmq';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RabbitmqModule.forRootAsync(), // Uses RABBITMQ_URL from ConfigService
  ],
})
export class AppModule {}
```

## Publishing Events

```typescript
import { RabbitmqPublisher } from '@nx-microservices/rabbitmq';
import { IRabbitEventEnvelope } from '@nx-microservices/rabbitmq';
import { USER_EVENTS_KEYS } from '@nx-microservices/common';

@Injectable()
export class UserService {
  constructor(private readonly publisher: RabbitmqPublisher) {}

  async createUser(userData: any) {
    // ... create user logic ...

    const envelope: IRabbitEventEnvelope<{ userId: string; email: string }> = {
      id: crypto.randomUUID(),
      type: USER_EVENTS_KEYS.USER_CREATED,
      version: 1,
      occurredAt: new Date().toISOString(),
      correlationId: crypto.randomUUID(),
      payload: { userId: user.id, email: user.email },
    };

    await this.publisher.publishEvent(envelope);
  }
}
```

## Consuming Events

### Using createSubscribeConfig Helper (Recommended)

The `createSubscribeConfig` helper automatically configures Dead Letter Queue (DLQ) and durable queues:

```typescript
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { IRabbitEventEnvelope, createSubscribeConfig } from '@nx-microservices/rabbitmq';
import { AUTH_EVENTS_QUEUE, USER_EVENTS_KEYS } from '@nx-microservices/common';

@Injectable()
export class EventsConsumer {
  @RabbitSubscribe(createSubscribeConfig(USER_EVENTS_KEYS.USER_CREATED, AUTH_EVENTS_QUEUE))
  async handleUserCreated(
    envelope: IRabbitEventEnvelope<{ userId: string; email: string }>,
  ): Promise<void> {
    try {
      // Process event
      console.log('User created:', envelope.payload);
    } catch (error) {
      // Re-throw to trigger NACK and send to DLQ after retries
      throw error;
    }
  }
}
```

**What `createSubscribeConfig` does:**

- Configures durable queue
- Sets up Dead Letter Exchange (DLQ)
- Sets DLQ routing key pattern: `dlq.{queue-name}.{routing-key}`
- Returns proper configuration for `@RabbitSubscribe`

### Manual Configuration (Alternative)

If you need custom queue options:

```typescript
@RabbitSubscribe({
  routingKey: USER_EVENTS_KEYS.USER_CREATED,
  queue: AUTH_EVENTS_QUEUE,
  queueOptions: {
    durable: true,
    deadLetterExchange: 'dlx.events',
    deadLetterRoutingKey: 'dlq.auth-service.events.user.created.v1',
  },
})
async handleUserCreated(envelope: IRabbitEventEnvelope<...>) {
  // ...
}
```

**Adding consumers:**

1. Create `*.consumer.ts` file in your service
2. Add `@Injectable()` decorator
3. Use `@RabbitSubscribe` with `createSubscribeConfig` helper
4. Register in module `providers[]`
5. Always wrap handler logic in try-catch and re-throw errors for DLQ

## Event Envelope Structure

```typescript
interface IRabbitEventEnvelope<T> {
  id: string; // UUID
  type: string; // Event type from constants
  version: number; // Schema version
  occurredAt: string; // ISO timestamp
  correlationId?: string; // Optional correlation ID
  payload: T; // Event-specific data
}
```

## Best Practices

1. **Event Naming**: Use `<domain>.<event>.<version>` pattern
2. **Versioning**: Increment version for breaking changes
3. **Idempotency**: Consumers should handle duplicate events
4. **Error Handling**: Always wrap consumer logic in try-catch
5. **Schema Evolution**: Add optional fields, never remove required fields

## Management UI

Access at: http://localhost:15672 (guest/guest)

- View exchanges, queues, and bindings
- Monitor message rates
- Inspect messages

## Troubleshooting

**Connection errors:**

- Verify `RABBITMQ_URL` is set in `.env`
- Check RabbitMQ is running: `docker compose ps rabbitmq`

**Messages not consumed:**

- Verify routing key matches between publisher and consumer
- Check queue bindings in management UI
- Ensure consumer is running and registered in module
