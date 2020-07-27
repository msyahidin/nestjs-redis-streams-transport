import { BaseRpcContext } from '@nestjs/microservices/ctx-host/base-rpc.context';

declare type RedisStreamContextArgs = [string, string];
export class RedisStreamContext extends BaseRpcContext<RedisStreamContextArgs> {
  constructor(args: RedisStreamContextArgs) {
    super(args);
  }

  getStream(): string {
    return this.args[0];
  }

  getId(): string {
    return this.args[1];
  }
}
