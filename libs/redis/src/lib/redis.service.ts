import { Inject, Injectable } from '@nestjs/common';

import { Redis, Cluster } from 'ioredis';

import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis | Cluster) {}

  getClient(): Redis | Cluster {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(...keys: string[]): Promise<number> {
    return this.client.del(...keys);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result > 0;
  }

  /**
   * Returns -1 if key exists but has no TTL, -2 if key does not exist.
   */
  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.client.expire(key, ttlSeconds);
    return result > 0;
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async setJson(key: string, obj: unknown, ttlSeconds?: number): Promise<void> {
    const value = JSON.stringify(obj);
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }
}
