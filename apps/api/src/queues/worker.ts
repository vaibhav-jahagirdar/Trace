import { withTransaction } from "../config/transaction";
import { env } from "../config/env";
import { resumeAnalysis } from "../modules/applications/analysis/resume/services/resumeAnalysis.service";
import { repoPlanner } from "../modules/applications/analysis/github/planner/services/repoPlanner.service";
import { repoVerifier } from "../modules/applications/analysis/github/verifier/services/repoVerifier.service";
import { enqueueRepositoryVerifierAfterPlanning, reconcileCompletedRepositoryPlans } from "../modules/applications/analysis/github/verifier/services/repoVerifierTrigger.service";
import { maybeFinalizeRepositoryShortlist } from "../modules/applications/analysis/github/verifier/services/repositoryShortlistFinalize.service";
import { markTaskCompleted, markTaskFailed, markTaskInProgress } from "../modules/applications/analysis/resume/services/helpers/updateApplicationStatus";
import type { PostgresQueueJob } from "./postgres";
import { PostgresTaskQueue } from "./postgres";
import type { RepositoryPlannerJobData, RepositoryVerifierJobData, ResumeAnalysisJobData } from "./producer";

export class PostgresWorker<T extends { taskId: string; applicationId: string; jobId: string }> {
  private stopping = false;
  private readonly loops: Promise<void>[];

  constructor(
    private readonly name: string,
    private readonly queue: PostgresTaskQueue<T>,
    private readonly handler: (job: PostgresQueueJob<T>) => Promise<void>,
    concurrency: number,
  ) {
    this.loops = Array.from({ length: concurrency }, (_, index) => this.loop(index));
    console.log("[PostgresWorker][ready]", { worker: name, concurrency });
  }

  private async loop(index: number): Promise<void> {
    while (!this.stopping) {
      try {
        const job = await this.queue.claim();
        if (!job) {
          await new Promise((resolve) => setTimeout(resolve, PostgresTaskQueue.pollInterval()));
          continue;
        }
        console.log("[PostgresWorker][start]", { worker: this.name, slot: index, taskId: job.id, attempt: job.attemptsMade });
        const heartbeat = setInterval(() => {
          void this.queue.heartbeat(job.id).catch((error) =>
            console.error("[PostgresWorker][heartbeat-error]", { worker: this.name, taskId: job.id, error }),
          );
        }, PostgresTaskQueue.heartbeatInterval());
        try {
          try {
            await this.handler(job);
          } catch (error) {
            await withTransaction((client) => markTaskFailed(client, job.data.taskId, error, job.attemptsMade, job.opts.attempts, this.queue.owner));
            await this.queue.release(job.id, true, job.attemptsMade);
            console.error("[PostgresWorker][failed]", { worker: this.name, taskId: job.id, attempt: job.attemptsMade, error });
            continue;
          }
          try {
            await this.queue.acknowledge(job.id);
            console.log("[PostgresWorker][completed]", { worker: this.name, taskId: job.id });
          } catch (error) {
            // The handler has already committed its result. Leave task state
            // untouched; lease expiry/reconciliation can recover a lost ack.
            console.error("[PostgresWorker][ack-error]", { worker: this.name, taskId: job.id, error });
          }
        } finally {
          clearInterval(heartbeat);
        }
      } catch (error) {
        console.error("[PostgresWorker][poll-error]", { worker: this.name, slot: index, error });
        await new Promise((resolve) => setTimeout(resolve, Math.max(PostgresTaskQueue.pollInterval(), 1000)));
      }
    }
  }

  async close(): Promise<void> {
    this.stopping = true;
    await Promise.all(this.loops);
    console.log("[PostgresWorker][closed]", { worker: this.name });
  }
}

const workerId = PostgresTaskQueue.workerId("worker");
const resumeQueue = new PostgresTaskQueue<ResumeAnalysisJobData>(env.BULLMQ_RESUME_QUEUE, "RESUME_PARSE", workerId);
const plannerQueue = new PostgresTaskQueue<RepositoryPlannerJobData>(env.BULLMQ_REPO_PLANNER_QUEUE, "REPOSITORY_PLAN", workerId);
const verifierQueue = new PostgresTaskQueue<RepositoryVerifierJobData>(env.BULLMQ_REPO_VERIFIER_QUEUE, "REPOSITORY_VERIFY", workerId);

export const resumeAnalysisWorker = new PostgresWorker("resume-analysis", resumeQueue, async (job) => {
  await withTransaction((client) => markTaskInProgress(client, job.data.taskId));
  await resumeAnalysis(job.data.jobId, job.data.applicationId, job.data.taskId);
}, 10);

export const repositoryPlannerWorker = new PostgresWorker("repository-planner", plannerQueue, async (job) => {
  await withTransaction((client) => markTaskInProgress(client, job.data.taskId));
  await repoPlanner(job.data.jobId, job.data.applicationId, job.data.taskId);
  await withTransaction((client) => markTaskCompleted(client, job.data.taskId));
  try {
    await enqueueRepositoryVerifierAfterPlanning(job.data.jobId, job.data.applicationId);
  } catch (error) {
    console.error("[PostgresWorker][verifier-enqueue-error]", { applicationId: job.data.applicationId, error });
  }
}, 5);

export const repositoryVerifierWorker = new PostgresWorker("repository-verifier", verifierQueue, async (job) => {
  await withTransaction((client) => markTaskInProgress(client, job.data.taskId));
  await repoVerifier(job.data.jobId, job.data.applicationId, job.data.taskId);
  await withTransaction((client) => markTaskCompleted(client, job.data.taskId));
  try {
    await maybeFinalizeRepositoryShortlist(job.data.jobId);
  } catch (error) {
    console.error("[PostgresWorker][shortlist-finalization-error]", { jobId: job.data.jobId, error });
  }
}, 3);

void reconcileCompletedRepositoryPlans()
  .then((enqueued) => console.log("[PostgresWorker][reconciliation-complete]", { verifierJobsEnqueued: enqueued }))
  .catch((error) => console.error("[PostgresWorker][reconciliation-failed]", { error }));
