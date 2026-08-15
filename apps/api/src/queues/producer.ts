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

export interface RepositoryPlannerJobData {
  jobId: string;
  applicationId: string;
  taskId: string;
}

export const repositoryPlannerQueue = new Queue<RepositoryPlannerJobData>(
  env.BULLMQ_REPO_PLANNER_QUEUE,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  },
);

export async function enqueueRepositoryPlanner(
  data: RepositoryPlannerJobData,
  options?: JobsOptions,
) {
  console.log("[Queue][repo-planner] Adding job", data);
  return repositoryPlannerQueue.add("repository-plan", data, { jobId: data.taskId, ...options });
}

export interface RepositoryVerifierJobData {
  jobId: string;
  applicationId: string;
  taskId: string;
}

export const repositoryVerifierQueue = new Queue<RepositoryVerifierJobData>(
  env.BULLMQ_REPO_VERIFIER_QUEUE,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  },
);

export async function enqueueRepositoryVerifier(
  data: RepositoryVerifierJobData,
  options?: JobsOptions,
) {
  console.log("[Queue][repo-verifier] Adding job", data);
  return repositoryVerifierQueue.add("repository-verify", data, {
    jobId: data.taskId,
    ...options,
  });
}
