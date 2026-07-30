import { Job, Worker } from "bullmq";

import { getDb } from "../config/db";
import { env } from "../config/env";

import { redisConnection } from "./connection";

import { resumeAnalysis } from "../modules/applications/analysis/resume/services/resumeAnalysis.service";

import { markTaskCompleted, markTaskFailed, markTaskInProgress } from "../modules/applications/analysis/resume/services/helpers/updateApplicationStatus";

interface ResumeAnalysisJobData {
  jobId: string;
  applicationId: string;
  taskId: string;
}

export const resumeAnalysisWorker = new Worker<ResumeAnalysisJobData>(
  env.BULLMQ_RESUME_QUEUE,
  async (job: Job<ResumeAnalysisJobData>) => {
    const { jobId, applicationId, taskId } = job.data;

    const client = await getDb().connect();

    try {
      await client.query("BEGIN");
      await markTaskInProgress(client, taskId);
      await resumeAnalysis(
        jobId,
        applicationId,
        taskId,
        client,
      );

      await markTaskCompleted(
        client,
        taskId,
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");

      try {
        await markTaskFailed(
          client,
          taskId,
          error,
          job.attemptsMade,
          job.opts.attempts ?? 1,
        );
      } catch (updateError) {
        console.error(
          "[BullMQ] Failed to update task status",
          updateError,
        );
      }

      throw error;
    } finally {
      client.release();
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  },
);

resumeAnalysisWorker.on("ready", () => {
  console.log("[BullMQ] Resume Analysis Worker Ready");
});

resumeAnalysisWorker.on("completed", (job) => {
  console.log("[BullMQ] Resume Analysis Completed", {
    jobId: job.id,
  });
});

resumeAnalysisWorker.on("failed", (job, error) => {
  console.error("[BullMQ] Resume Analysis Failed", {
    jobId: job?.id,
    attempts: job?.attemptsMade,
    error,
  });
});

resumeAnalysisWorker.on("error", (error) => {
  console.error("[BullMQ] Worker Error", error);
});