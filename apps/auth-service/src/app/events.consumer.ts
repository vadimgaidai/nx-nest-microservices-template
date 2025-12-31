import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { AUTH_EVENTS_QUEUE, USER_EVENTS_KEYS } from '@nx-microservices/common';
import { IRabbitEventEnvelope } from '@nx-microservices/rabbitmq';

@Injectable()
export class EventsConsumer {
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
    console.log('[auth-service] Received USERS_USER_CREATED_V1 event:', {
      id: envelope.id,
      type: envelope.type,
      version: envelope.version,
      occurredAt: envelope.occurredAt,
      correlationId: envelope.correlationId,
      payload: envelope.payload,
    });
  }
}
