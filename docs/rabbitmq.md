# RabbitMQ Integration

## Purpose

RabbitMQ is used for event-driven architecture and background job processing in this platform.

**What RabbitMQ IS used for:**

- Publishing domain events (e.g., "user created", "order placed")
- Async background job processing with retries
- Dead Letter Queue (DLQ) handling for failed messages
- Fan-out patterns (one event to multiple consumers)

**What RabbitMQ is NOT used for:**

- RPC-style request/response communication
- Replacing HTTP orchestration in api-gateway
- Synchronous service-to-service calls

## Architecture

```
HTTP Client
    |
api-gateway (HTTP orchestration)
    | HTTP
users-service
    | publishes event to RabbitMQ
RabbitMQ (events exchange)
    | routes to queues
auth-service (consumer logs event)
```

## Local Development

### Start RabbitMQ

```bash
docker compose up -d
```

This starts Postgres, Redis, and RabbitMQ.

Verify RabbitMQ is running:

```bash
docker compose ps rabbitmq
```

### Management UI

Access at: http://localhost:15672

**Default credentials:**

- Username: `guest`
- Password: `guest`

### Environment Variables

Required in `.env`:

```bash
RABBITMQ_AMQP_PORT=5672
RABBITMQ_MANAGEMENT_PORT=15672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_HOST=localhost
RABBITMQ_VHOST=/
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

## Event Contracts

All events use a standardized envelope (defined in `libs/rabbitmq`):

```typescript
interface IRabbitEventEnvelope<T> {
  id: string; // UUID
  type: string; // e.g., "user.created.v1"
  version: number; // Schema version
  occurredAt: string; // ISO timestamp
  correlationId?: string; // Optional correlation ID
  payload: T; // Event-specific data
}
```

Event type constants are defined in `libs/common/src/constants/rabbitmq.ts` (e.g., `USER_EVENTS_KEYS`).

## Demo: Test Publish/Consume

This demo shows how users-service publishes events to RabbitMQ, and auth-service processes them.

### 1. Start Services

```bash
# Terminal 1: Start infrastructure (Postgres, Redis, RabbitMQ)
docker compose up -d

# Terminal 2: Start auth-service (consumer)
pnpm dev:auth

# Terminal 3: Start users-service (publisher)
pnpm dev:users
```

### 2. Publish Demo Event

Demo endpoint is in `apps/users-service/src/app/app.controller.ts` and available at:

```bash
curl -X POST http://localhost:3001/api/demo-publish
```

**Expected response:**

```json
{
  "success": true,
  "message": "Event published"
}
```

### 3. Verify

- **Check auth-service terminal** - should see:
  ```
  [auth-service] Received USERS_USER_CREATED_V1 event: { id: '...', type: 'user.created.v1', ... }
  ```
- **Open RabbitMQ Management UI** at http://localhost:15672 (guest/guest):
  - Go to Exchanges → `events` → see message rate
  - Go to Queues → `auth-service.events` → see messages
  - Go to Queues → `auth-service.events` → Get messages to inspect

### Where Consumers Live

Consumers are located inside services:

- **auth-service**: `apps/auth-service/src/app/events.consumer.ts`
  - Listens to `user.created.v1`
  - Logs event to console (in production this would have business logic)

**Adding new consumers:**

1. Create file `*.consumer.ts` in the appropriate service
2. Add `@Injectable()` decorator
3. Use `@RabbitSubscribe` to subscribe to events
4. Register in `providers[]` of the module

## Publishing Events

Example from `users-service`:

```typescript
import { RabbitmqPublisher } from '@nx-microservices/rabbitmq';
import { IRabbitEventEnvelope } from '@nx-microservices/rabbitmq';
import { USER_EVENTS_KEYS } from '@nx-microservices/common';

const envelope: IRabbitEventEnvelope<{
  userId: string;
  email: string;
}> = {
  id: crypto.randomUUID(),
  type: USER_EVENTS_KEYS.USER_CREATED,
  version: 1,
  occurredAt: new Date().toISOString(),
  correlationId: crypto.randomUUID(),
  payload: { userId: '123', email: 'user@example.com' },
};

await this.rabbitmqPublisher.publishEvent(envelope);
```

## Consuming Events

Example from `auth-service`:

```typescript
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { IRabbitEventEnvelope } from '@nx-microservices/rabbitmq';
import { AUTH_EVENTS_QUEUE, USER_EVENTS_KEYS } from '@nx-microservices/common';

@RabbitSubscribe({
  routingKey: USER_EVENTS_KEYS.USER_CREATED,
  queue: AUTH_EVENTS_QUEUE,
  queueOptions: {
    durable: true,
  },
})
async handleUserCreated(
  envelope: IRabbitEventEnvelope<{
    userId: string;
    email: string;
  }>,
) {
  console.log('User created:', envelope.payload);
  // Process event
}
```

## Error Handling and DLQ

**Current behavior:**

- On consumer error: message is nack'd without requeue
- This prevents infinite retry loops
- Messages go to Dead Letter Queue if configured, otherwise dropped

**To configure DLQ (optional):**

```typescript
@RabbitSubscribe({
  routingKey: USER_EVENTS_KEYS.USER_CREATED,
  queue: AUTH_EVENTS_QUEUE,
  queueOptions: {
    durable: true,
    deadLetterExchange: 'dlx',
    deadLetterRoutingKey: 'auth-service.events.dlq',
  },
})
```

## Best Practices

1. **Event Naming**: Use `<domain>.<event>.<version>` pattern
2. **Versioning**: Increment version for breaking changes
3. **Idempotency**: Consumers should handle duplicate events gracefully
4. **Correlation IDs**: Use for distributed tracing
5. **Error Logging**: Always log errors before nack
6. **Schema Evolution**: Add optional fields, never remove required fields

## Troubleshooting

**Connection refused:**

```bash
docker compose logs rabbitmq
docker compose restart rabbitmq
```

**Messages not consumed:**

- Check queue bindings in management UI (Exchanges → events → Bindings)
- Verify routing key matches between publisher and consumer
- Check consumer is running (check logs)

**Port conflicts:**

Change ports in `.env`:

```bash
RABBITMQ_AMQP_PORT=5673
RABBITMQ_MANAGEMENT_PORT=15673
RABBITMQ_URL=amqp://guest:guest@localhost:5673
```

Restart:

```bash
docker compose down
docker compose up -d
```

## Production (AWS)

**Amazon MQ for RabbitMQ:**

```bash
RABBITMQ_URL=amqps://username:password@b-xxx.mq.us-east-1.amazonaws.com:5671
```

Note: Use `amqps://` for TLS.

**CloudAMQP:**

```bash
RABBITMQ_URL=amqps://user:pass@your-instance.cloudamqp.com/vhost
```

The module handles TLS automatically when using `amqps://` scheme.
