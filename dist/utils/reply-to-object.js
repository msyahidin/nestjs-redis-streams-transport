"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyToObject = void 0;
const parse_json_1 = require("./parse-json");
exports.replyToObject = (reply) => {
    if (reply.length === 0 || !(reply instanceof Array)) {
        return null;
    }
    const obj = {};
    for (let i = 0; i < reply.length; i += 2) {
        const parsed = parse_json_1.parseJson(reply[i + 1]);
        obj[reply[i].toString('binary')] = parsed !== false ? parsed : reply[i + 1];
    }
    return obj;
};
