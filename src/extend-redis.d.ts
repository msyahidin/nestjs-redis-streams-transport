import * as redis from 'redis';

declare module 'redis' {
  interface RedisClient {
    xgroup(
      command: string,
      arg1: string,
      arg2: string,
      arg3?: string,
      arg4?: string,
      cb?: Callback<void>
    ): boolean;
    XGROUP(
      command: string,
      arg1: string,
      arg2: string,
      arg3?: string,
      arg4?: string,
      cb?: Callback<void>
    ): boolean;

    xtest(
      key: string,
      id: string,
      field: string,
      value: string,
      ...args: Array<string | Callback<void>>
    ): boolean;

    xadd: OverloadedKeyCommand<string | number, [number, number], boolean>;
    XADD: OverloadedKeyCommand<string | number, [number, number], boolean>;

    /**
     * Get the score associated with the given member in a sorted set.
     */
    xreadgroup: OverloadedKeyCommand<
      string | number,
      [number, number],
      boolean
    >;
    XREADGROUP: redis.OverloadedKeyCommand<
      string | number,
      [number, number],
      boolean
    >;
  }
}
