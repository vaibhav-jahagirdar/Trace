"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeAnalysisWorker = void 0;
const bullmq_1 = require("bullmq");
const db_1 = require("../config/db");
const env_1 = require("../config/env");
const connection_1 = require("./connection");
const resumeAnalysis_service_1 = require("../modules/applications/analysis/resume/services/resumeAnalysis.service");
const updateApplicationStatus_1 = require("../modules/applications/analysis/resume/services/helpers/updateApplicationStatus");
exports.resumeAnalysisWorker = new bullmq_1.Worker(env_1.env.BULLMQ_RESUME_QUEUE, async (job) => {
    const { jobId, applicationId, taskId } = job.data;
    const client = await (0, db_1.getDb)().connect();
    try {
        await client.query("BEGIN");
        await (0, updateApplicationStatus_1.markTaskInProgress)(client, taskId);
        await (0, resumeAnalysis_service_1.resumeAnalysis)(jobId, applicationId, taskId, client);
        await (0, updateApplicationStatus_1.markTaskCompleted)(client, taskId);
        await client.query("COMMIT");
    }
    catch (error) {
        await client.query("ROLLBACK");
        try {
            await (0, updateApplicationStatus_1.markTaskFailed)(client, taskId, error, job.attemptsMade, job.opts.attempts ?? 1);
        }
        catch (updateError) {
            console.error("[BullMQ] Failed to update task status", updateError);
        }
        throw error;
    }
    finally {
        client.release();
    }
}, {
    connection: connection_1.redisConnection,
    concurrency: 5,
});
exports.resumeAnalysisWorker.on("ready", () => {
    console.log("[BullMQ] Resume Analysis Worker Ready");
});
exports.resumeAnalysisWorker.on("completed", (job) => {
    console.log("[BullMQ] Resume Analysis Completed", {
        jobId: job.id,
    });
});
exports.resumeAnalysisWorker.on("failed", (job, error) => {
    console.error("[BullMQ] Resume Analysis Failed", {
        jobId: job?.id,
        attempts: job?.attemptsMade,
        error,
    });
});
exports.resumeAnalysisWorker.on("error", (error) => {
    console.error("[BullMQ] Worker Error", error);
});
//# sourceMappingURL=worker.js.map