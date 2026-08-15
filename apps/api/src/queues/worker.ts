import { Job, Worker } from "bullmq";

import { withTransaction } from "../config/transaction";
import { env } from "../config/env";

import { redisConnection } from "./connection";

import { resumeAnalysis } from "../modules/applications/analysis/resume/services/resumeAnalysis.service";
import { repoPlanner } from "../modules/applications/analysis/github/planner/services/repoPlanner.service";
import { repoVerifier } from "../modules/applications/analysis/github/verifier/services/repoVerifier.service";
import {
  enqueueRepositoryVerifierAfterPlanning,
  reconcileCompletedRepositoryPlans,
} from "../modules/applications/analysis/github/verifier/services/repoVerifierTrigger.service";
import { maybeFinalizeRepositoryShortlist } from "../modules/applications/analysis/github/verifier/services/repositoryShortlistFinalize.service";

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
      try {
        await enqueueRepositoryVerifierAfterPlanning(
          job.data.jobId,
          job.data.applicationId,
        );
      } catch (enqueueError) {
        // Planning is complete; a verifier enqueue failure should be retried
        // by the operational trigger without corrupting planner task state.
        console.error("[RepoWorker][verifier-enqueue-error]", {
          applicationId: job.data.applicationId,
          error: enqueueError,
        });
      }
      console.log("[RepoWorker][2] Repository plan completed", { taskId: job.data.taskId, elapsedMs: Date.now() - startedAt });
    } catch (error) {
      console.error("[RepoWorker][error] Repository planner failed", { taskId: job.data.taskId, error });
      await withTransaction((client) => markTaskFailed(client, job.data.taskId, error, job.attemptsMade, job.opts.attempts ?? 1));
      throw error;
    }
  },
  { connection: redisConnection, concurrency: 5 },
);

interface RepositoryVerifierJobData {
  jobId: string;
  applicationId: string;
  taskId: string;
}

export const repositoryVerifierWorker = new Worker<RepositoryVerifierJobData>(
  env.BULLMQ_REPO_VERIFIER_QUEUE,
  async (job: Job<RepositoryVerifierJobData>) => {
    const startedAt = Date.now();
    console.log("[RepoVerifierWorker][1] Picked repository verification", {
      queueJobId: job.id,
      ...job.data,
      attempt: job.attemptsMade + 1,
    });

    try {
      await withTransaction((client) => markTaskInProgress(client, job.data.taskId));
      await repoVerifier(job.data.jobId, job.data.applicationId, job.data.taskId);
      await withTransaction((client) => markTaskCompleted(client, job.data.taskId));
      try {
        await maybeFinalizeRepositoryShortlist(job.data.jobId);
      } catch (finalizationError) {
        // Scoring remains complete; finalization can be retried operationally.
        console.error("[RepoVerifierWorker][shortlist-finalization-error]", {
          jobId: job.data.jobId,
          error: finalizationError,
        });
      }
      console.log("[RepoVerifierWorker][2] Repository verification completed", {
        taskId: job.data.taskId,
        elapsedMs: Date.now() - startedAt,
      });
    } catch (error) {
      console.error("[RepoVerifierWorker][error] Repository verification failed", {
        taskId: job.data.taskId,
        attempt: job.attemptsMade + 1,
        error,
      });
      await withTransaction((client) =>
        markTaskFailed(
          client,
          job.data.taskId,
          error,
          job.attemptsMade,
          job.opts.attempts ?? 1,
        ),
      );
      throw error;
    }
  },
  { connection: redisConnection, concurrency: 3 },
);

repositoryPlannerWorker.on("ready", () => console.log("[BullMQ] Repository Planner Worker Ready"));
repositoryPlannerWorker.on("completed", (job) => console.log("[BullMQ] Repository Planner Completed", { jobId: job.id }));

repositoryVerifierWorker.on("ready", () => console.log("[BullMQ] Repository Verifier Worker Ready"));
repositoryVerifierWorker.on("completed", (job) => console.log("[BullMQ] Repository Verifier Completed", { jobId: job.id }));
repositoryVerifierWorker.on("failed", (job, error) => console.error("[BullMQ] Repository Verifier Failed", { jobId: job?.id, attempts: job?.attemptsMade, error }));

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

void reconcileCompletedRepositoryPlans()
  .then((enqueued) => {
    console.log("[RepoWorker] Completed Stage 2A reconciliation", {
      verifierJobsEnqueued: enqueued,
    });
  })
  .catch((error) => {
    // The workers remain available; the reconciliation can be retried by the
    // next worker restart or an operational reconciliation command.
    console.error("[RepoWorker] Stage 2A reconciliation failed", { error });
  });
