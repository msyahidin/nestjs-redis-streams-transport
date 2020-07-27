import { Module, DynamicModule, Provider, Type } from '@nestjs/common';
import {
  RedisStreamModuleOptions,
  RedisStreamsModuleAsyncOptions,
  RedisStreamsOptionsFactory,
} from './interfaces';
import { createRedisStreamsClientProvider } from './redis-streams-client.providers';
import { REDIS_STREAMS_CLIENT_MODULE_OPTIONS } from './constants';
import { RedisStreamClient } from './redis.client';
import { ClientProxy } from '@nestjs/microservices';

@Module({
  providers: [{ provide: ClientProxy, useClass: RedisStreamClient }],
  exports: [{ provide: ClientProxy, useExisting: RedisStreamClient }],
})
export class RedisStreamsClientModule {
  static register(options: RedisStreamModuleOptions): DynamicModule {
    return {
      module: RedisStreamsClientModule,
      providers: createRedisStreamsClientProvider(options),
    };
  }

  static registerAsync(options: RedisStreamsModuleAsyncOptions): DynamicModule {
    return {
      module: RedisStreamsClientModule,
      imports: options.imports || [],
      providers: this.createAsyncProviders(options),
    };
  }

  private static createAsyncProviders(
    options: RedisStreamsModuleAsyncOptions
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const returnProvider = [this.createAsyncOptionsProvider(options)];
    if (options.useClass) {
      returnProvider.push({
        provide: options.useClass,
        useClass: options.useClass,
      });
    }
    return returnProvider;
  }

  private static createFactoryProvider(
    injectable: Type<RedisStreamsOptionsFactory>
  ): Provider {
    return {
      provide: REDIS_STREAMS_CLIENT_MODULE_OPTIONS,
      useFactory: async (optionsFactory: RedisStreamsOptionsFactory) =>
        await optionsFactory.createRedisStreamsClientOptions(),
      inject: [injectable],
    };
  }

  private static createAsyncOptionsProvider(
    options: RedisStreamsModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: REDIS_STREAMS_CLIENT_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    if (options.useExisting) {
      return this.createFactoryProvider(options.useExisting);
    }
    if (options.useClass) {
      return this.createFactoryProvider(options.useClass);
    }

    return {
      provide: REDIS_STREAMS_CLIENT_MODULE_OPTIONS,
      useValue: {},
    };
  }
}
