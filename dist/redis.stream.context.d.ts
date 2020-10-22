import { BaseRpcContext } from '@nestjs/microservices/ctx-host/base-rpc.context';
declare type RedisStreamContextArgs = [string, string];
export declare class RedisStreamContext extends BaseRpcContext<RedisStreamContextArgs> {
    constructor(args: RedisStreamContextArgs);
    getStream(): string;
    getId(): string;
}
export {};
