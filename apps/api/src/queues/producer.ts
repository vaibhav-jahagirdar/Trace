import type { JobsOptions } from "bullmq";

import { env } from "../config/env";
import { PostgresTaskQueue } from "./postgres";

export interface ResumeAnalysisJobData { jobId: string; applicationId: string; taskId: string }
export interface RepositoryPlannerJobData { jobId: string; applicationId: string; taskId: string }
export interface RepositoryVerifierJobData { jobId: string; applicationId: string; taskId: string }

const producerId = PostgresTaskQueue.workerId("producer");
const resumeAnalysisQueue = new PostgresTaskQueue<ResumeAnalysisJobData>(env.BULLMQ_RESUME_QUEUE, "RESUME_PARSE", producerId);
const repositoryPlannerQueue = new PostgresTaskQueue<RepositoryPlannerJobData>(env.BULLMQ_REPO_PLANNER_QUEUE, "REPOSITORY_PLAN", producerId);
const repositoryVerifierQueue = new PostgresTaskQueue<RepositoryVerifierJobData>(env.BULLMQ_REPO_VERIFIER_QUEUE, "REPOSITORY_VERIFY", producerId);

export async function enqueueResumeAnalysis(data: ResumeAnalysisJobData, options?: JobsOptions) {
  return resumeAnalysisQueue.enqueue(data, options);
}

export async function enqueueRepositoryPlanner(data: RepositoryPlannerJobData, options?: JobsOptions) {
  return repositoryPlannerQueue.enqueue(data, options);
}

export async function enqueueRepositoryVerifier(data: RepositoryVerifierJobData, options?: JobsOptions) {
  return repositoryVerifierQueue.enqueue(data, options);
}
