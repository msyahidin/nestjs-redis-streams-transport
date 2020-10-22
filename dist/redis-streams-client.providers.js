"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRedisStreamsClientProvider = void 0;
const constants_1 = require("./constants");
function createRedisStreamsClientProvider(options) {
    return [
        { provide: constants_1.REDIS_STREAMS_CLIENT_MODULE_OPTIONS, useValue: options || {} },
    ];
}
exports.createRedisStreamsClientProvider = createRedisStreamsClientProvider;
