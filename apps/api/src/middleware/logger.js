"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = void 0;
const pino_http_1 = __importDefault(require("pino-http"));
const crypto_1 = require("crypto");
const logger_1 = require("../lib/logger");
exports.httpLogger = (0, pino_http_1.default)({
    logger: logger_1.logger,
    genReqId: (req) => {
        const requestId = req.headers["x-request-id"];
        return Array.isArray(requestId) ? (requestId[0] ?? (0, crypto_1.randomUUID)()) : (requestId ?? (0, crypto_1.randomUUID)());
    },
    customProps: (req) => ({
        userId: req.user?.id,
    }),
});
//# sourceMappingURL=logger.js.map