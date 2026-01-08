import { Injectable, Logger } from '@nestjs/common';

import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

import { AUTH_EVENTS_QUEUE, USER_EVENTS_KEYS } from '@nx-microservices/common';
import { createSubscribeConfig, IRabbitEventEnvelope } from '@nx-microservices/rabbitmq';

@Injectable()
export class EventsConsumer {
  private readonly logger = new Logger(EventsConsumer.name);

  @RabbitSubscribe(createSubscribeConfig(USER_EVENTS_KEYS.USER_CREATED, AUTH_EVENTS_QUEUE))
  async handleUserCreated(
    envelope: IRabbitEventEnvelope<{
      userId: string;
      email: string;
    }>,
  ): Promise<void> {
    try {
      this.logger.log(`Processing USER_CREATED event: ${envelope.id}`);

      // Business logic here
      this.logger.debug('Event details:', {
        id: envelope.id,
        type: envelope.type,
        version: envelope.version,
        occurredAt: envelope.occurredAt,
        correlationId: envelope.correlationId,
        payload: envelope.payload,
      });

      this.logger.log(`Successfully processed event: ${envelope.id}`);
    } catch (error) {
      this.logger.error(`Failed to process USER_CREATED event: ${envelope.id}`, error);
      // Re-throw to trigger NACK and send to DLQ after retries
      throw error;
    }
  }
}
