import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { EVENTS_EXCHANGE } from './rabbitmq.constants';
import { IRabbitEventEnvelope } from './rabbitmq.interfaces';

@Injectable()
export class RabbitmqPublisher {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishEvent<T>(envelope: IRabbitEventEnvelope<T>): Promise<void> {
    await this.amqpConnection.publish(EVENTS_EXCHANGE, envelope.type, envelope, {
      persistent: true,
    });
  }
}
