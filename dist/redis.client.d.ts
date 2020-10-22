import { ClientProxy, ReadPacket, RedisOptions, WritePacket } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { RedisClient, ClientOpts, RetryStrategyOptions } from 'redis';
import { Subject } from 'rxjs';
export declare class RedisStreamClient extends ClientProxy {
    protected readonly logger: Logger;
    protected readonly subscriptionsCount: Map<string, number>;
    protected readonly url?: string;
    protected client: RedisClient;
    protected options: RedisOptions['options'];
    protected connection: Promise<any>;
    protected isExplicitlyTerminated: boolean;
    constructor(options?: RedisOptions['options']);
    connect(): Promise<any>;
    private createConnection;
    handleError(client: RedisClient): void;
    createClient(error$: Subject<Error>): RedisClient;
    getClientOptions(error$: Subject<Error>): Partial<ClientOpts>;
    createRetryStrategy(options: RetryStrategyOptions, error$: Subject<Error>): undefined | number | Error;
    close(): void;
    protected publish(packet: ReadPacket<any>, callback: (packet: WritePacket<any>) => void): () => any;
    protected dispatchEvent<T = any>(packet: ReadPacket<any>): Promise<T>;
}
