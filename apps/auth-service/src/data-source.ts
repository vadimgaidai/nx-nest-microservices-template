import { join } from 'path';

import { ConfigService } from '@nestjs/config';

import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config({ path: join(process.cwd(), '.env') });

const configService = new ConfigService();

function required(key: string): string {
  const value = configService.get<string>(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const AuthDataSource = new DataSource({
  type: 'postgres',
  host: required('AUTH_DB_HOST'),
  port: parseInt(required('AUTH_DB_PORT'), 10),
  username: required('AUTH_DB_USER'),
  password: required('AUTH_DB_PASSWORD'),
  database: required('AUTH_DB_NAME'),
  entities: [join(__dirname, '**', 'entities', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: false,
});
