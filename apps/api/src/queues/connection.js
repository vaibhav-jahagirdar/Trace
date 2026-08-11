"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = void 0;
const env_1 = require("../config/env");
exports.redisConnection = {
    host: env_1.env.REDIS_HOST,
    port: env_1.env.REDIS_PORT,
    password: env_1.env.REDIS_PASSWORD || undefined,
    db: env_1.env.REDIS_DB,
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
};
//# sourceMappingURL=connection.js.map