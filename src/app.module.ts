import { FirestoreModule } from '@common/db/firestore.module';
import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import { AuthModule } from './auth';
import { BaseModule } from './base';
import { CommonModule, ExceptionsFilter } from './common';
import { configuration, loggerOptions } from './config';
import { GqlModule } from './gql';

@Module({
  imports: [
    LoggerModule.forRoot(loggerOptions),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    // Service Modules
    FirestoreModule.forRoot({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        keyFilename: configService.get<string>('SA_KEY'),
      }),
      inject: [ConfigService],
    }),
    AuthModule, // Global for Middleware
    CommonModule, // Global
    BaseModule,
    GqlModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: ExceptionsFilter },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {}
