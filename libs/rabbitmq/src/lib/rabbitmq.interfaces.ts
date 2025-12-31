import { InjectionToken, ModuleMetadata } from '@nestjs/common';
import { RABBITMQ_EXCHANGE_TYPE } from './rabbitmq.constants';

export type TRabbitExchangeType = typeof RABBITMQ_EXCHANGE_TYPE;

export interface IRabbitModuleOptions {
  url: string;
  exchange?: string;
  prefetchCount?: number;
}

export interface IRabbitEventEnvelope<T> {
  id: string;
  type: string;
  version: number;
  occurredAt: string;
  correlationId?: string;
  payload: T;
}

export interface IRabbitModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: InjectionToken[];
  useFactory?: (...args: unknown[]) => IRabbitModuleOptions | Promise<IRabbitModuleOptions>;
}
