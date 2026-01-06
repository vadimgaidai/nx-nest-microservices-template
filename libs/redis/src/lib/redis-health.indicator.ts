import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';

import { RedisService } from './redis.service';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly redisService: RedisService,
    private readonly health: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const client = this.redisService.getClient();
      await client.ping();

      return this.health.check(key).up({
        status: client.status,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.health.check(key).down({ message });
    }
  }
}
