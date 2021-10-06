"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisStreamStrategy = void 0;
const microservices_1 = require("@nestjs/microservices");
const redis_1 = require("redis");
const redis_stream_context_1 = require("./redis.stream.context");
const reply_to_object_1 = require("./utils/reply-to-object");
const lodash_1 = require("lodash");
const constants_1 = require("@nestjs/microservices/constants");
const crypto_1 = require("crypto");
class RedisStreamStrategy extends microservices_1.Server {
    constructor(options) {
        super();
        this.options = options;
        this.isExplicitlyTerminated = false;
        this.initializeSerializer(options);
        this.initializeDeserializer(options);
    }
    listen(callback) {
        this.client = this.createRedisClient();
        this.handleError(this.client);
        this.start(callback);
    }
    close() {
        this.isExplicitlyTerminated = true;
        this.client && this.client.quit();
    }
    createRedisClient() {
        return redis_1.createClient(Object.assign({}, this.getClientOptions()));
    }
    start(callback) {
        this.client.on(constants_1.CONNECT_EVENT, callback);
        this.client.on('ready', () => {
            const clientName = lodash_1.get(this.options, 'consumer', crypto_1.randomBytes(16).toString('hex'));
            this.client.send_command('CLIENT', ['SETNAME', clientName], (err, res) => {
                this.logger.warn('Redis connection is established with name: ' + clientName);
            });
            this.bindHandlers();
        });
    }
    bindHandlers() {
        const patterns = [...this.messageHandlers.keys()];
        this.xread(patterns, async (pattern, stream) => {
            const [id, payload] = stream;
            const streamContext = new redis_stream_context_1.RedisStreamContext([pattern, id]);
            const handler = this.messageHandlers.get(pattern);
            if (handler) {
                let reply = reply_to_object_1.replyToObject(payload);
                if (reply &&
                    reply.hasOwnProperty('message') &&
                    Object.keys(reply).length === 1) {
                    reply = reply.message;
                }
                const response$ = this.transformToObservable(await handler(reply, streamContext));
                response$ && this.send(response$, () => undefined);
            }
        });
    }
    createConsumerGroupIfNotExists(stream, consumerGroup) {
        return new Promise((res, rej) => {
            this.client.xgroup('CREATE', stream, consumerGroup, '$', 'MKSTREAM', (err) => {
                if (err && !err.message.includes('BUSYGROUP')) {
                    rej(err);
                    this.logger.error(err);
                }
                else if (err === null || err === void 0 ? void 0 : err.message.includes('BUSYGROUP')) {
                    res();
                }
                else {
                    this.logger.log(`Creating consumer group ${consumerGroup} for stream ${stream}`);
                    res();
                }
            });
        });
    }
    async xreadGroup(streams, consumerGroup, consumer, cb) {
        this.client.xreadgroup('GROUP', consumerGroup, consumer, 'BLOCK', 0, 'NOACK', 'STREAMS', ...streams, ...streams.map((_) => '>'), (err, str) => {
            if (err)
                return this.logger.warn(err, 'Error reading from stream: ');
            if (str) {
                str[0][1].forEach((message) => {
                    cb(str[0][0], message);
                });
            }
            this.xread(streams, cb);
        });
    }
    async xread(stream, cb) {
        var _a;
        if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.consumerGroup) {
            const { consumerGroup, consumer } = this.options;
            stream.forEach(async (stream) => {
                await this.createConsumerGroupIfNotExists(stream, consumerGroup);
            });
            this.xreadGroup(stream, consumerGroup, consumer, cb);
            return;
        }
        throw new Error('Method not yes implemented');
    }
    getClientOptions() {
        const retry_strategy = (options) => this.createRetryStrategy(options);
        return Object.assign(Object.assign({}, (this.options || {})), { retry_strategy });
    }
    handleError(stream) {
        stream.on(constants_1.ERROR_EVENT, (err) => this.logger.error(err));
    }
    createRetryStrategy(options) {
        this.logger.warn('Retrying connection');
        if (options.error && options.error.code === 'ECONNREFUSED') {
            this.logger.error(`Error ECONNREFUSED: ${this.url}`);
        }
        const retryAttempts = lodash_1.get(this.options, 'retryAttempts');
        if (this.isExplicitlyTerminated) {
            return undefined;
        }
        this.logger.warn(`Retrying attempt: ${options.attempt} of ${retryAttempts}`);
        if (!retryAttempts || options.attempt > retryAttempts) {
            this.logger.error(`Retry time exhausted: ${this.url}`);
            throw new Error('Retry time exhausted');
        }
        return lodash_1.get(this.options, 'retryDelay') || 0;
    }
}
exports.RedisStreamStrategy = RedisStreamStrategy;
