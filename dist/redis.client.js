"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisStreamClient = void 0;
const microservices_1 = require("@nestjs/microservices");
const common_1 = require("@nestjs/common");
const redis_1 = require("redis");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const constants_1 = require("@nestjs/microservices/constants");
const lodash_1 = require("lodash");
const constants_2 = require("./constants");
let RedisStreamClient = class RedisStreamClient extends microservices_1.ClientProxy {
    constructor(options) {
        super();
        this.logger = new common_1.Logger(microservices_1.ClientProxy.name);
        this.subscriptionsCount = new Map();
        this.isExplicitlyTerminated = false;
        this.options = options !== null && options !== void 0 ? options : {};
        this.url = lodash_1.get(this.options, 'url');
        this.initializeSerializer(options);
        this.initializeDeserializer(options);
    }
    connect() {
        var _a;
        return (_a = this.connection) !== null && _a !== void 0 ? _a : this.createConnection();
    }
    createConnection() {
        const error$ = new rxjs_1.Subject();
        this.client = this.createClient(error$);
        this.handleError(this.client);
        const connect$ = rxjs_1.fromEvent(this.client, constants_1.CONNECT_EVENT);
        this.connection = rxjs_1.merge(error$, connect$)
            .pipe(operators_1.take(1), operators_1.share())
            .toPromise();
        return this.connection;
    }
    handleError(client) {
        client.addListener(constants_1.ERROR_EVENT, (err) => this.logger.error(err));
    }
    createClient(error$) {
        var _a;
        return redis_1.createClient(Object.assign(Object.assign({}, this.getClientOptions(error$)), { password: (_a = this.options) === null || _a === void 0 ? void 0 : _a.password, url: this.url }));
    }
    getClientOptions(error$) {
        const retry_strategy = (options) => this.createRetryStrategy(options, error$);
        const options = this.options;
        return Object.assign(Object.assign({}, options), { retry_strategy });
    }
    createRetryStrategy(options, error$) {
        if (options.error && options.error.code === constants_2.ECONNREFUSED) {
            error$.error(options.error);
        }
        if (this.isExplicitlyTerminated) {
            return undefined;
        }
        if (!lodash_1.get(this.options, 'retryAttempts', options.attempt) ||
            options.attempt > lodash_1.get(this.options, 'retryAttempts', 0)) {
            return new Error('Retry time exhausted');
        }
        return lodash_1.get(this.options, 'retryDelay', 0);
    }
    close() {
        this.isExplicitlyTerminated = true;
        this.client && this.client.quit();
    }
    publish(packet, callback) {
        throw new Error('Method not implemented.');
    }
    async dispatchEvent(packet) {
        const pattern = this.normalizePattern(packet.pattern);
        const serializedPacket = this.serializer.serialize(packet);
        const payload = serializedPacket.data;
        const canBeSerialized = (arg) => typeof arg === 'object' && arg !== null;
        if (this === null || this === void 0 ? void 0 : this.options.interceptor) {
            await this.options.interceptor(payload);
        }
        if (canBeSerialized(payload) && !Array.isArray(payload)) {
            const redisArgs = Object.entries(payload).flatMap(([property, value]) => [
                property,
                canBeSerialized(value) ? JSON.stringify(value) : value,
            ]);
            return new Promise((resolve, reject) => this.client.xadd(pattern, '*', ...redisArgs, (err) => {
                err ? reject(err) : resolve();
            }));
        }
        return new Promise((resolve, reject) => this.client.xadd(pattern, '*', 'message', Array.isArray(payload) ? JSON.stringify(payload) : payload, (err) => {
            err ? reject(err) : resolve();
        }));
    }
};
RedisStreamClient = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject(constants_2.REDIS_STREAMS_CLIENT_MODULE_OPTIONS)),
    __metadata("design:paramtypes", [Object])
], RedisStreamClient);
exports.RedisStreamClient = RedisStreamClient;
