import { randomUUID } from "crypto";
import { getDb } from "../../../../../../config/db";
import { enqueueRepositoryVerifier } from "../../../../../../queues/producer";

const TASK_TYPE = "REPOSITORY_VERIFY";

interface VerifierTaskRow {
  id: string;
  status: string;
  human_intervention_required: boolean;
}

async function ensureVerifierEnqueued(
  jobId: string,
  applicationId: string,
): Promise<string | null> {
  const db = getDb();
  const existing = await db.query<VerifierTaskRow>(
    `
    SELECT id, status, human_intervention_required
    FROM application_tasks
    WHERE job_application_id = $1
      AND task_type = $2
    ORDER BY created_at DESC NULLS LAST
    LIMIT 1
    `,
    [applicationId, TASK_TYPE],
  );

  const current = existing.rows[0];

  if (current?.status === "COMPLETED") return null;
  if (current?.status === "RUNNING") return current.id;
  if (current?.status === "FAILED" || current?.human_intervention_required) {
    return null;
  }

  const taskId = current?.id ?? randomUUID();

  if (!current) {
    await db.query(
      `
      INSERT INTO application_tasks (
        id,
        job_application_id,
        task_type,
        status,
        attempt_count,
        max_attempts,
        human_intervention_required
      ) VALUES ($1, $2, $3, 'PENDING', 0, 3, false)
      `,
      [taskId, applicationId, TASK_TYPE],
    );
  }

  // The BullMQ job ID is the database task ID. Re-adding an existing pending
  // task is idempotent when the original queue message still exists, while
  // also repairing a task whose queue message was lost.
  await enqueueRepositoryVerifier({
    taskId,
    applicationId,
    jobId,
  });

  return taskId;
}

export async function enqueueRepositoryVerifierAfterPlanning(
  jobId: string,
  applicationId: string,
): Promise<string | null> {
  return ensureVerifierEnqueued(jobId, applicationId);
}

/**
 * Repairs the temporal gap between planner completion and verifier rollout.
 * Every completed Stage 2A plan is considered, regardless of when it finished.
 */
export async function reconcileCompletedRepositoryPlans(): Promise<number> {
  const db = getDb();
  const result = await db.query<{
    job_id: string;
    application_id: string;
  }>(
    `
    SELECT DISTINCT ON (ja.id)
      ja.job_id,
      ja.id AS application_id
    FROM application_repository_analyses ara
    JOIN application_tasks planner_task
      ON planner_task.id = ara.application_task_id
    JOIN job_applications ja
      ON ja.id = planner_task.job_application_id
    WHERE planner_task.task_type = 'REPOSITORY_PLAN'
      AND planner_task.status = 'COMPLETED'
      AND ara.planning_status = 'COMPLETED'
    ORDER BY ja.id, ara.created_at DESC
    `,
  );

  let enqueued = 0;
  for (const row of result.rows) {
    if (await ensureVerifierEnqueued(row.job_id, row.application_id)) {
      enqueued += 1;
    }
  }

  return enqueued;
}
