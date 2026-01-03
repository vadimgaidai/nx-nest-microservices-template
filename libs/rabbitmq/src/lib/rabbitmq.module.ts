import { DynamicModule, InjectionToken, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { EVENTS_EXCHANGE, RABBITMQ_EXCHANGE_TYPE } from './rabbitmq.constants';
import { IRabbitModuleAsyncOptions, IRabbitModuleOptions } from './rabbitmq.interfaces';
import { RabbitmqPublisher } from './rabbitmq.publisher';

@Module({})
export class RabbitmqModule {
  static forRootAsync(options?: IRabbitModuleAsyncOptions): DynamicModule {
    let configProvider: {
      useFactory: (...args: unknown[]) => IRabbitModuleOptions | Promise<IRabbitModuleOptions>;
      inject: InjectionToken[];
    };

    if (options?.useFactory) {
      configProvider = {
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      };
    } else {
      configProvider = {
        useFactory: (...args: unknown[]): IRabbitModuleOptions => {
          const configService = args[0] as ConfigService;
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
    }

    const moduleImports = options?.imports ?? [ConfigModule];

    return {
      module: RabbitmqModule,
      imports: [
        ...moduleImports,
        RabbitMQModule.forRootAsync({
          imports: moduleImports,
          inject: configProvider.inject,
          useFactory: async (...args: unknown[]) => {
            const factoryResult = configProvider.useFactory(...args);
            const config = await factoryResult;
            const exchange = config.exchange ?? EVENTS_EXCHANGE;
            const prefetchCount = config.prefetchCount ?? 10;

            return {
              uri: config.url,
              exchanges: [
                {
                  name: exchange,
                  type: RABBITMQ_EXCHANGE_TYPE,
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
