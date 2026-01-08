import { MessageHandlerOptions } from '@golevelup/nestjs-rabbitmq';

import { DEAD_LETTER_EXCHANGE } from './rabbitmq.constants';

/**
 * Creates RabbitMQ subscribe configuration with Dead Letter Queue support
 *
 * @param routingKey - Event routing key (e.g., 'user.created')
 * @param queue - Queue name (e.g., 'auth-service.events')
 * @returns MessageHandlerOptions with DLQ configured
 *
 * @example
 * ```typescript
 * @RabbitSubscribe(createSubscribeConfig(USER_EVENTS_KEYS.USER_CREATED, AUTH_EVENTS_QUEUE))
 * async handleUserCreated(envelope: IRabbitEventEnvelope<...>) {
 *   // handler code
 * }
 * ```
 */
export function createSubscribeConfig(
  routingKey: string,
  queue: string,
): Pick<MessageHandlerOptions, 'routingKey' | 'queue' | 'queueOptions'> {
  return {
    routingKey,
    queue,
    queueOptions: {
      durable: true,
      deadLetterExchange: DEAD_LETTER_EXCHANGE,
      // DLQ routing pattern: dlq.{queue-name}.{routing-key}
      deadLetterRoutingKey: `dlq.${queue}.${routingKey}`,
    },
  };
}
