import { InjectionToken, ModuleMetadata } from '@nestjs/common';

import { RedisOptions, ClusterOptions } from 'ioredis';

import { REDIS_MODE } from './redis.constants';

export type TRedisMode = (typeof REDIS_MODE)[keyof typeof REDIS_MODE];

export interface IRedisSingleConfig {
  mode?: typeof REDIS_MODE.SINGLE;
  url: string;
  redisOptions?: RedisOptions;
}

export interface IRedisClusterConfig {
  mode: typeof REDIS_MODE.CLUSTER;
  clusterNodes: string[];
  redisOptions?: RedisOptions;
  clusterOptions?: ClusterOptions;
}

export type TRedisModuleOptions = IRedisSingleConfig | IRedisClusterConfig;

export interface IRedisModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: InjectionToken[];
  useFactory?: (...args: unknown[]) => TRedisModuleOptions | Promise<TRedisModuleOptions>;
}
