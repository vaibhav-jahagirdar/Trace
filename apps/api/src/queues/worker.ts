import { Job, Worker } from "bullmq";
import { env } from "../config/env";
import { redisConnection } from "./connection";

interface ResumeAnalysisJobData {
  applicationId: string;
  taskId: string;
}

export const resumeAnalysisWorker = new Worker<ResumeAnalysisJobData>(
  env.BULLMQ_RESUME_QUEUE,
  async (job: Job<ResumeAnalysisJobData>) => {
    const { applicationId, taskId } = job.data;

    console.log("[ResumeAnalysisWorker]", {
      applicationId,
      taskId,
    });

    // TODO:
    // 1. Mark application_task RUNNING
    // 2. Call Python resume service
    // 3. Update application_task
    // 4. Queue next stage (GitHub analysis)
  },
  {
    connection: redisConnection,

    concurrency: 5,
  },
);

resumeAnalysisWorker.on("ready", () => {
  console.log("[BullMQ] Resume Analysis Worker Ready");
});

resumeAnalysisWorker.on("error", (error) => {
  console.error("[BullMQ] Worker Error", error);
});