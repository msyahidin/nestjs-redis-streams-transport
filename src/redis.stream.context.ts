import { BaseRpcContext } from '@nestjs/microservices/ctx-host/base-rpc.context';

declare type RedisStreamContextArgs = [string, string];
export class RedisStreamContext extends BaseRpcContext<RedisStreamContextArgs> {
  constructor(args: RedisStreamContextArgs) {
    super(args);
  }

  getStream() {
    return this.args[0];
  }

  getId() {
    return this.args[1];
  }
}
