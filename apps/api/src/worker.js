"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_1 = require("./queues/worker");
console.log("[Worker] Resume Analysis Worker Started");
async function shutdown(signal) {
    console.log(`[Worker] Received ${signal}. Shutting down...`);
    try {
        await worker_1.resumeAnalysisWorker.close();
        console.log("[Worker] Shutdown complete");
        process.exit(0);
    }
    catch (error) {
        console.error("[Worker] Shutdown failed", error);
        process.exit(1);
    }
}
process.on("SIGINT", () => {
    void shutdown("SIGINT");
});
process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
});
process.on("uncaughtException", (error) => {
    console.error("[Worker] Uncaught Exception", error);
    process.exit(1);
});
process.on("unhandledRejection", (reason) => {
    console.error("[Worker] Unhandled Rejection", reason);
    process.exit(1);
});
//# sourceMappingURL=worker.js.map