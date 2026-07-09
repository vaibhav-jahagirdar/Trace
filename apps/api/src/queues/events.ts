// src/queues/events.ts

import { QueueEvents } from "bullmq";

import { env } from "../config/env";
import { redisConnection } from "./connection";

export const resumeAnalysisQueueEvents = new QueueEvents(
  env.BULLMQ_RESUME_QUEUE,
  {
    connection: redisConnection,
  },
);

resumeAnalysisQueueEvents.on("completed", ({ jobId }) => {
  console.log("[BullMQ] Job completed:", jobId);
});

resumeAnalysisQueueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error("[BullMQ] Job failed:", {
    jobId,
    failedReason,
  });
});

resumeAnalysisQueueEvents.on("stalled", ({ jobId }) => {
  console.warn("[BullMQ] Job stalled:", jobId);
});

resumeAnalysisQueueEvents.on("error", (error) => {
  console.error("[BullMQ] QueueEvents error:", error);
});