import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'node:path';
import { RedisModule } from '@nx-microservices/redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RefreshToken } from '../entities/refresh-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [join(process.cwd(), '.env')],
      isGlobal: true,
    }),
    RedisModule.forRootAsync(),
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
          host: required('AUTH_DB_HOST'),
          port: parseInt(required('AUTH_DB_PORT'), 10),
          username: required('AUTH_DB_USER'),
          password: required('AUTH_DB_PASSWORD'),
          database: required('AUTH_DB_NAME'),
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
    TypeOrmModule.forFeature([RefreshToken]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
