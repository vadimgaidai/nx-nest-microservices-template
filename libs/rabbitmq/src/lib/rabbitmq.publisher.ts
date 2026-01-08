import { Injectable, Logger } from '@nestjs/common';

import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

import { EVENTS_EXCHANGE } from './rabbitmq.constants';
import { IRabbitEventEnvelope } from './rabbitmq.interfaces';

@Injectable()
export class RabbitmqPublisher {
  private readonly logger = new Logger(RabbitmqPublisher.name);

  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishEvent<T>(envelope: IRabbitEventEnvelope<T>): Promise<void> {
    try {
      this.logger.debug(`Publishing event: ${envelope.type} (id: ${envelope.id})`);

      await this.amqpConnection.publish(EVENTS_EXCHANGE, envelope.type, envelope, {
        persistent: true,
      });

      this.logger.log(`Successfully published event: ${envelope.type} (id: ${envelope.id})`);
    } catch (error) {
      this.logger.error(`Failed to publish event: ${envelope.type} (id: ${envelope.id})`, error);
      throw error;
    }
  }
}
