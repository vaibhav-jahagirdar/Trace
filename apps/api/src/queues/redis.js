"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("../config/env");
exports.redis = new ioredis_1.default({
    host: env_1.env.REDIS_HOST,
    port: env_1.env.REDIS_PORT,
    password: env_1.env.REDIS_PASSWORD || undefined,
    db: env_1.env.REDIS_DB,
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: false,
});
exports.redis.on("connect", () => {
    console.log("[Redis] Connected");
});
exports.redis.on("error", (error) => {
    console.error("[Redis] Connection error:", error);
});
//# sourceMappingURL=redis.js.map