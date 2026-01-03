import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { EVENTS_EXCHANGE } from './rabbitmq.constants';
import { IRabbitModuleAsyncOptions, IRabbitModuleOptions } from './rabbitmq.interfaces';
import { RabbitmqPublisher } from './rabbitmq.publisher';

@Module({})
export class RabbitmqModule {
  static forRootAsync(options?: IRabbitModuleAsyncOptions): DynamicModule {
    const configProvider = options?.useFactory
      ? {
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        }
      : {
          useFactory: (configService: ConfigService): IRabbitModuleOptions => {
            const url = configService.get<string>('RABBITMQ_URL');

            if (!url) {
              throw new Error(
                'RABBITMQ_URL is not defined. Please set RABBITMQ_URL in your environment variables.',
              );
            }

            return { url };
          },
          inject: [ConfigService],
        };

    return {
      module: RabbitmqModule,
      imports: [
        ...(options?.imports || [ConfigModule]),
        RabbitMQModule.forRootAsync({
          imports: options?.imports || [ConfigModule],
          inject: configProvider.inject,
          useFactory: async (...args: any[]) => {
            const config = await configProvider.useFactory(...(args as [ConfigService]));
            const exchange = config.exchange || EVENTS_EXCHANGE;
            const prefetchCount = config.prefetchCount || 10;

            return {
              uri: config.url,
              exchanges: [
                {
                  name: exchange,
                  type: 'topic',
                  options: {
                    durable: true,
                  },
                },
              ],
              connectionInitOptions: {
                wait: true,
                timeout: 10000,
              },
              prefetchCount,
            };
          },
        }),
      ],
      providers: [RabbitmqPublisher],
      exports: [RabbitmqPublisher, RabbitMQModule],
    };
  }
}
