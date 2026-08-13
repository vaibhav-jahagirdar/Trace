import { JobsOptions, Queue } from "bullmq";

import { env } from "../config/env";
import { redisConnection } from "./connection";

export interface ResumeAnalysisJobData {
  jobId: string;
  applicationId: string;
  taskId: string;
}

export const resumeAnalysisQueue = new Queue<ResumeAnalysisJobData>(
  env.BULLMQ_RESUME_QUEUE,
  {
    connection: redisConnection,

    defaultJobOptions: {
      attempts: 3,

      backoff: {
        type: "exponential",
        delay: 5000,
      },

      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  },
);

export async function enqueueResumeAnalysis(
  data: ResumeAnalysisJobData,
  options?: JobsOptions,
) {
  console.log("[Queue][enqueue] Adding resume job", { taskId: data.taskId, applicationId: data.applicationId, jobId: data.jobId });
  const job = await resumeAnalysisQueue.add(
    "resume-analysis",
    data,
    {
      jobId: data.taskId, 
      ...options,
    },
  );
  console.log("[Queue][enqueue] Added resume job", { taskId: data.taskId, queueJobId: job.id });
  return job;
}
