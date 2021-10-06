import { DynamicModule } from '@nestjs/common';
import { RedisStreamModuleOptions, RedisStreamsModuleAsyncOptions } from './interfaces';
export declare class RedisStreamsClientModule {
    static register(options: RedisStreamModuleOptions['options']): DynamicModule;
    static registerAsync(options: RedisStreamsModuleAsyncOptions): DynamicModule;
    private static createAsyncProviders;
    private static createFactoryProvider;
    private static createAsyncOptionsProvider;
}
