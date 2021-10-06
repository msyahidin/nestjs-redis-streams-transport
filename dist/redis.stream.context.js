"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisStreamContext = void 0;
const base_rpc_context_1 = require("@nestjs/microservices/ctx-host/base-rpc.context");
class RedisStreamContext extends base_rpc_context_1.BaseRpcContext {
    constructor(args) {
        super(args);
    }
    getStream() {
        return this.args[0];
    }
    getId() {
        return this.args[1];
    }
}
exports.RedisStreamContext = RedisStreamContext;
