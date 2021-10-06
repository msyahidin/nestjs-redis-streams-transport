import { Server, CustomTransportStrategy } from '@nestjs/microservices';
import { RetryStrategyOptions, ClientOpts } from 'redis';
export declare class RedisStreamStrategy extends Server implements CustomTransportStrategy {
    private readonly options?;
    private readonly url;
    private client;
    private isExplicitlyTerminated;
    constructor(options?: ({
        url?: string | undefined;
        retryAttempts?: number | undefined;
        retryDelay?: number | undefined;
        serializer?: import("@nestjs/microservices").Serializer<any, any> | undefined;
        deserializer?: import("@nestjs/microservices").Deserializer<any, any> | undefined;
    } & import("@nestjs/microservices/external/redis.interface").ClientOpts & {
        consumerGroup: undefined;
        consumer: never;
    }) | ({
        url?: string | undefined;
        retryAttempts?: number | undefined;
        retryDelay?: number | undefined;
        serializer?: import("@nestjs/microservices").Serializer<any, any> | undefined;
        deserializer?: import("@nestjs/microservices").Deserializer<any, any> | undefined;
    } & import("@nestjs/microservices/external/redis.interface").ClientOpts & {
        consumerGroup: string;
        consumer: string;
    }) | undefined);
    listen(callback: () => void): void;
    close(): void;
    private createRedisClient;
    start(callback: () => void): void;
    bindHandlers(): void;
    private createConsumerGroupIfNotExists;
    private xreadGroup;
    private xread;
    getClientOptions(): Partial<ClientOpts>;
    handleError(stream: any): void;
    createRetryStrategy(options: RetryStrategyOptions): undefined | number | void;
}
