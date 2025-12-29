/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { join } from 'path';
import { AppModule } from './app/app.module';

config({ path: join(process.cwd(), '.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = process.env.API_GLOBAL_PREFIX;
  app.setGlobalPrefix(globalPrefix);
  const port = Number(process.env.AUTH_SERVICE_PORT || 3002);
  await app.listen(port);
  Logger.log(`🚀 Application is running on http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
