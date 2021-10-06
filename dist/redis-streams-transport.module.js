"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RedisStreamsClientModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisStreamsClientModule = void 0;
const common_1 = require("@nestjs/common");
const redis_streams_client_providers_1 = require("./redis-streams-client.providers");
const constants_1 = require("./constants");
const redis_client_1 = require("./redis.client");
const microservices_1 = require("@nestjs/microservices");
let RedisStreamsClientModule = RedisStreamsClientModule_1 = class RedisStreamsClientModule {
    static register(options) {
        return {
            module: RedisStreamsClientModule_1,
            providers: redis_streams_client_providers_1.createRedisStreamsClientProvider(options),
        };
    }
    static registerAsync(options) {
        return {
            module: RedisStreamsClientModule_1,
            imports: options.imports || [],
            providers: this.createAsyncProviders(options),
        };
    }
    static createAsyncProviders(options) {
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
    static createFactoryProvider(injectable) {
        return {
            provide: constants_1.REDIS_STREAMS_CLIENT_MODULE_OPTIONS,
            useFactory: async (optionsFactory) => await optionsFactory.createRedisStreamsClientOptions(),
            inject: [injectable],
        };
    }
    static createAsyncOptionsProvider(options) {
        if (options.useFactory) {
            return {
                provide: constants_1.REDIS_STREAMS_CLIENT_MODULE_OPTIONS,
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
            provide: constants_1.REDIS_STREAMS_CLIENT_MODULE_OPTIONS,
            useValue: {},
        };
    }
};
RedisStreamsClientModule = RedisStreamsClientModule_1 = __decorate([
    common_1.Module({
        providers: [{ provide: microservices_1.ClientProxy, useClass: redis_client_1.RedisStreamClient }],
        exports: [{ provide: microservices_1.ClientProxy, useExisting: redis_client_1.RedisStreamClient }],
    })
], RedisStreamsClientModule);
exports.RedisStreamsClientModule = RedisStreamsClientModule;
