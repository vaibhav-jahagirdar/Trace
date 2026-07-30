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
  return resumeAnalysisQueue.add(
    "resume-analysis",
    data,
    {
      jobId: data.taskId, 
      ...options,
    },
  );
}