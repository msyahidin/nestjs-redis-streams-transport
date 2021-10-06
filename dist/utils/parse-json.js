"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJson = void 0;
exports.parseJson = (text) => {
    if (typeof text !== 'string') {
        return false;
    }
    try {
        return JSON.parse(text);
    }
    catch (error) {
        return false;
    }
};
