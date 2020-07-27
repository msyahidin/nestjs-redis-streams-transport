import { RedisStreamModuleOptions } from './interfaces';
import { REDIS_STREAMS_CLIENT_MODULE_OPTIONS } from './constants';

export function createRedisStreamsClientProvider(
  options: RedisStreamModuleOptions
): any[] {
  return [
    { provide: REDIS_STREAMS_CLIENT_MODULE_OPTIONS, useValue: options || {} },
  ];
}
