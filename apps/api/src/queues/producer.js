"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeAnalysisQueue = void 0;
exports.enqueueResumeAnalysis = enqueueResumeAnalysis;
const bullmq_1 = require("bullmq");
const env_1 = require("../config/env");
const connection_1 = require("./connection");
exports.resumeAnalysisQueue = new bullmq_1.Queue(env_1.env.BULLMQ_RESUME_QUEUE, {
    connection: connection_1.redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
        removeOnComplete: 1000,
        removeOnFail: 5000,
    },
});
async function enqueueResumeAnalysis(data, options) {
    return exports.resumeAnalysisQueue.add("resume-analysis", data, {
        jobId: data.taskId,
        ...options,
    });
}
//# sourceMappingURL=producer.js.map