import { Controller, Get, Post } from '@nestjs/common';
import { type ApiResponse } from '@nx-microservices/contracts';
import { RabbitmqPublisher } from '@nx-microservices/rabbitmq';
import { AppService } from './app.service';
import { USER_EVENTS_KEYS } from '@nx-microservices/common';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly rabbitmqPublisher: RabbitmqPublisher,
  ) {}

  @Get()
  getData() {
    // ApiResponse type available for future use
    type _Proof = ApiResponse<{ message: string }>;
    return this.appService.getData();
  }

  @Post('demo-publish')
  async demoPublish() {
    const payload: {
      userId: string;
      email: string;
    } = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      email: 'demo@example.com',
    };

    await this.rabbitmqPublisher.publishEvent<{
      userId: string;
      email: string;
    }>({
      id: crypto.randomUUID(),
      type: USER_EVENTS_KEYS.USER_CREATED,
      version: 1,
      occurredAt: new Date().toISOString(),
      correlationId: crypto.randomUUID(),
      payload,
    });

    return { success: true, message: 'Event published' };
  }
}
