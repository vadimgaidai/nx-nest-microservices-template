import { join } from 'node:path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RabbitmqModule } from '@nx-microservices/rabbitmq';
import { RedisModule } from '@nx-microservices/redis';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [join(process.cwd(), '.env')],
      isGlobal: true,
    }),
    RedisModule.forRootAsync(),
    RabbitmqModule.forRootAsync(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const required = (key: string): string => {
          const value = configService.get<string>(key);
          if (!value) {
            throw new Error(`Missing required environment variable: ${key}`);
          }
          return value;
        };

        return {
          type: 'postgres',
          host: required('USERS_DB_HOST'),
          port: parseInt(required('USERS_DB_PORT'), 10),
          username: required('USERS_DB_USER'),
          password: required('USERS_DB_PASSWORD'),
          database: required('USERS_DB_NAME'),
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
