// scripts/test-logger.ts
import { logger } from "../src/lib/logger";

logger.info("plain message works");
logger.warn({ foo: "bar" }, "structured message works");
logger.error(new Error("test error"), "error logging works");

// test redaction
logger.info({ req: { headers: { authorization: "Bearer secret123" } } }, "should redact authorization");
logger.info({ user: { password: "hunter2", accessToken: "abc" } }, "should redact password/token");