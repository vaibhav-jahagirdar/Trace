import { Job, Worker } from "bullmq";

import { withTransaction } from "../config/transaction";
import { env } from "../config/env";

import { redisConnection } from "./connection";

import { resumeAnalysis } from "../modules/applications/analysis/resume/services/resumeAnalysis.service";
import { repoPlanner } from "../modules/applications/analysis/github/planner/services/repoPlanner.service";

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
    const startedAt = Date.now();
    console.log("[Worker][1] Picked resume job", { queueJobId: job.id, jobId, applicationId, taskId, attempt: job.attemptsMade + 1 });

    try {
      await withTransaction((client) => markTaskInProgress(client, taskId));
      console.log("[Worker][2] Task marked in progress", { taskId });
      await resumeAnalysis(jobId, applicationId, taskId);
      console.log("[Worker][3] Analysis persisted and task completed", { taskId, elapsedMs: Date.now() - startedAt });
    } catch (error) {
      console.error("[Worker][error] Resume analysis failed", { queueJobId: job.id, taskId, attempt: job.attemptsMade + 1, error });
      try {
        await withTransaction((client) => markTaskFailed(client, taskId, error, job.attemptsMade, job.opts.attempts ?? 1));
      } catch (updateError) {
        console.error(
          "[BullMQ] Failed to update task status",
          updateError,
        );
      }

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 10,
  },
);

interface RepositoryPlannerJobData { jobId: string; applicationId: string; taskId: string }

export const repositoryPlannerWorker = new Worker<RepositoryPlannerJobData>(
  env.BULLMQ_REPO_PLANNER_QUEUE,
  async (job: Job<RepositoryPlannerJobData>) => {
    const startedAt = Date.now();
    console.log("[RepoWorker][1] Picked repository plan", { queueJobId: job.id, ...job.data, attempt: job.attemptsMade + 1 });
    try {
      await withTransaction((client) => markTaskInProgress(client, job.data.taskId));
      await repoPlanner(job.data.jobId, job.data.applicationId, job.data.taskId);
      await withTransaction((client) => markTaskCompleted(client, job.data.taskId));
      console.log("[RepoWorker][2] Repository plan completed", { taskId: job.data.taskId, elapsedMs: Date.now() - startedAt });
    } catch (error) {
      console.error("[RepoWorker][error] Repository planner failed", { taskId: job.data.taskId, error });
      await withTransaction((client) => markTaskFailed(client, job.data.taskId, error, job.attemptsMade, job.opts.attempts ?? 1));
      throw error;
    }
  },
  { connection: redisConnection, concurrency: 5 },
);

repositoryPlannerWorker.on("ready", () => console.log("[BullMQ] Repository Planner Worker Ready"));
repositoryPlannerWorker.on("completed", (job) => console.log("[BullMQ] Repository Planner Completed", { jobId: job.id }));

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
