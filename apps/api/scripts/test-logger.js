"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/test-logger.ts
const logger_1 = require("../src/lib/logger");
logger_1.logger.info("plain message works");
logger_1.logger.warn({ foo: "bar" }, "structured message works");
logger_1.logger.error(new Error("test error"), "error logging works");
// test redaction
logger_1.logger.info({ req: { headers: { authorization: "Bearer secret123" } } }, "should redact authorization");
logger_1.logger.info({ user: { password: "hunter2", accessToken: "abc" } }, "should redact password/token");
//# sourceMappingURL=test-logger.js.map