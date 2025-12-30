import { DynamicModule, Module, OnModuleDestroy, Inject, Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis, { Cluster, RedisOptions } from 'ioredis';
import { REDIS_CLIENT, REDIS_MODE, REDIS_MODULE_CLEANUP } from './redis.constants';
import { RedisService } from './redis.service';
import { IRedisModuleAsyncOptions, TRedisModuleOptions } from './redis.interfaces';

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
      inject: options?.inject || [ConfigService],
    };

    const cleanupProvider = {
      provide: REDIS_MODULE_CLEANUP,
      useClass: RedisModuleCleanup,
    };

    return {
      module: RedisModule,
      imports: options?.imports || [ConfigModule],
      providers: [redisProvider, cleanupProvider, RedisService],
      exports: [REDIS_CLIENT, RedisService],
    };
  }

  private static createClient(config: TRedisModuleOptions): Redis | Cluster {
    if (config.mode === REDIS_MODE.CLUSTER) {
      if (!config.clusterNodes || config.clusterNodes.length === 0) {
        throw new Error(
          'clusterNodes is required for cluster mode. Provide an array of host:port strings.',
        );
      }

      const nodes = config.clusterNodes.map((node) => {
        const parts = node.split(':');
        const host = parts[0];
        const port = parts[1] ? parseInt(parts[1], 10) : 6379;

        if (!host || isNaN(port) || port <= 0 || port > 65535) {
          throw new Error(
            `Invalid cluster node format: ${node}. Expected format: host:port or host (defaults to port 6379)`,
          );
        }

        return { host, port };
      });

      const redisOptions = RedisModule.buildRedisOptions(undefined, config.redisOptions);

      return new Cluster(nodes, {
        ...config.clusterOptions,
        redisOptions,
      });
    }

    if (!config.url) {
      throw new Error('url is required for single mode.');
    }

    const redisOptions = RedisModule.buildRedisOptions(config.url, config.redisOptions);
    return new Redis(config.url, redisOptions);
  }

  private static buildRedisOptions(url?: string, userOptions?: RedisOptions): RedisOptions {
    const options: RedisOptions = { ...userOptions };

    if (url && url.startsWith('rediss://')) {
      if (!options.tls) {
        const urlObj = new URL(url);
        options.tls = { servername: urlObj.hostname };
      }
    }

    if (!options.retryStrategy) {
      options.retryStrategy = (times: number): number => Math.min(times * 50, 2000);
    }

    if (options.maxRetriesPerRequest === undefined) {
      options.maxRetriesPerRequest = null;
    }

    return options;
  }
}
