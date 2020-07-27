import { RedisOptions } from '@nestjs/microservices';
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

type groupType =
  | {
      consumerGroup: undefined;
      consumer: never;
    }
  | {
      consumerGroup: string;
      consumer: string;
    };

export interface RedisStreamTransportOptions extends RedisOptions {
  options?: RedisOptions['options'] & groupType;
}

export interface RedisStreamModuleOptions extends RedisOptions {
  options?: RedisOptions['options'];
}

export interface RedisStreamsOptionsFactory {
  createRedisStreamsClientOptions():
    | Promise<RedisStreamModuleOptions>
    | RedisStreamModuleOptions;
}

export interface RedisStreamsModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<RedisStreamsOptionsFactory>;
  useClass?: Type<RedisStreamsOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) =>
    | Promise<RedisStreamModuleOptions['options']>
    | RedisStreamModuleOptions['options'];
  inject?: any[];
}
