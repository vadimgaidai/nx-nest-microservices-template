import { DynamicModule, Module, OnModuleDestroy, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';

import Redis, { Cluster, RedisOptions } from 'ioredis';

import { RedisHealthIndicator } from './redis-health.indicator';
import {
  REDIS_CLIENT,
  REDIS_MODE,
  REDIS_MODULE_CLEANUP,
  DEFAULT_REDIS_PORT,
  DEFAULT_MAX_RETRIES,
  DEFAULT_MAX_DELAY_MS,
  DEFAULT_MAX_RETRIES_PER_REQUEST,
} from './redis.constants';
import { IRedisModuleAsyncOptions, TRedisModuleOptions } from './redis.interfaces';
import { RedisService } from './redis.service';

@Injectable()
class RedisModuleCleanup implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis | Cluster) {}

  async onModuleDestroy(): Promise<void> {
    try {
      await this.client.quit();
    } catch {
      this.client.disconnect();
    }
  }
}

@Module({})
export class RedisModule {
  static forRootAsync(options?: IRedisModuleAsyncOptions): DynamicModule {
    const redisProvider = {
      provide: REDIS_CLIENT,
      useFactory: async (...args: unknown[]): Promise<Redis | Cluster> => {
        let config: TRedisModuleOptions;

        if (options?.useFactory) {
          config = await options.useFactory(...args);
        } else {
          const configService = args[0] as ConfigService;
          const redisUrl = configService.get<string>('REDIS_URL');

          if (!redisUrl) {
            throw new Error(
              'REDIS_URL is not defined. Please set REDIS_URL in your environment variables.',
            );
          }

          config = { mode: REDIS_MODE.SINGLE, url: redisUrl };
        }

        return RedisModule.createClient(config);
      },
      inject: options?.inject ?? [ConfigService],
    };

    const cleanupProvider = {
      provide: REDIS_MODULE_CLEANUP,
      useClass: RedisModuleCleanup,
    };

    return {
      module: RedisModule,
      imports: [TerminusModule, ...(options?.imports ?? [ConfigModule])],
      providers: [redisProvider, cleanupProvider, RedisService, RedisHealthIndicator],
      exports: [REDIS_CLIENT, RedisService, RedisHealthIndicator],
    };
  }

  private static createClient(config: TRedisModuleOptions): Redis | Cluster {
    const logger = new Logger('RedisModule');
    let client: Redis | Cluster;

    if (config.mode === REDIS_MODE.CLUSTER) {
      if (!config.clusterNodes || config.clusterNodes.length === 0) {
        throw new Error(
          'clusterNodes is required for cluster mode. Provide an array of host:port strings.',
        );
      }

      const nodes = config.clusterNodes.map((node) => {
        const parts = node.split(':');
        const host = parts[0];
        const port = parts[1] ? parseInt(parts[1], 10) : DEFAULT_REDIS_PORT;

        if (!host || isNaN(port) || port <= 0) {
          throw new Error(
            `Invalid cluster node format: ${node}. Expected format: host:port or host (defaults to port ${DEFAULT_REDIS_PORT})`,
          );
        }

        return { host, port };
      });

      const redisOptions = RedisModule.buildRedisOptions(undefined, config.redisOptions);

      client = new Cluster(nodes, {
        ...config.clusterOptions,
        redisOptions,
      });
    } else {
      if (!config.url) {
        throw new Error('url is required for single mode.');
      }

      const redisOptions = RedisModule.buildRedisOptions(config.url, config.redisOptions);
      client = new Redis(config.url, redisOptions);
    }

    client.on('error', (err) => {
      logger.error(`Redis connection error: ${err.message}`);
    });

    client.on('connect', () => {
      logger.log('Redis connected');
    });

    client.on('ready', () => {
      logger.log('Redis ready to accept commands');
    });

    client.on('reconnecting', (delay?: number) => {
      logger.warn(`Redis reconnecting${delay ? ` in ${delay}ms` : ''}...`);
    });

    client.on('close', () => {
      logger.warn('Redis connection closed');
    });

    client.on('end', () => {
      logger.warn('Redis connection ended');
    });

    return client;
  }

  private static buildRedisOptions(url?: string, userOptions?: RedisOptions): RedisOptions {
    const options: RedisOptions = { ...userOptions };

    if (url?.startsWith('rediss://')) {
      if (!options.tls) {
        const urlObj = new URL(url);
        options.tls = { servername: urlObj.hostname };
      }
    }

    options.retryStrategy ??= (times: number): number | null => {
      if (times > DEFAULT_MAX_RETRIES) {
        return null;
      }
      return Math.min(100 * Math.pow(2, times - 1), DEFAULT_MAX_DELAY_MS);
    };

    options.maxRetriesPerRequest ??= DEFAULT_MAX_RETRIES_PER_REQUEST;

    return options;
  }
}
