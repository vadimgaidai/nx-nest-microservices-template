/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { join } from 'path';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { config } from 'dotenv';

import { AppModule } from './app/app.module';

config({ path: join(process.cwd(), '.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = process.env.API_GLOBAL_PREFIX || 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = Number(process.env.API_GATEWAY_PORT || 3000);
  await app.listen(port);
  Logger.log(`🚀 Application is running on http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
