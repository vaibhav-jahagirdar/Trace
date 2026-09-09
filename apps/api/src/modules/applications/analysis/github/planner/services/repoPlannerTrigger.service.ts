import { randomUUID } from "crypto";
import { getDb } from "../../../../../../config/db";
import { enqueueRepositoryPlanner } from "../../../../../../queues/producer";

const TASK_TYPE = "REPOSITORY_PLAN";

async function enqueueForRow(row: {
  job_id: string;
  application_id: string;
}): Promise<string | null> {
  const db = getDb();
  const existing = await db.query<{
    id: string;
    status: string;
    lease_expires_at: Date | null;
  }>(
    `SELECT id, status, lease_expires_at FROM application_tasks WHERE job_application_id = $1 AND task_type = $2`,
    [row.application_id, TASK_TYPE],
  );
  if (existing.rows[0]) {
    const current = existing.rows[0];
    if (current.status === "COMPLETED") return null;
    if (current.status === "RUNNING" && current.lease_expires_at && current.lease_expires_at > new Date()) return current.id;
    // PENDING tasks and expired RUNNING tasks must be re-enqueued. The
    // database task is the idempotency key, so this repairs lost messages.
    await enqueueRepositoryPlanner({ taskId: current.id, applicationId: row.application_id, jobId: row.job_id });
    return current.id;
  }
  const taskId = randomUUID();
  await db.query(
    `INSERT INTO application_tasks (id, job_application_id, task_type)
     VALUES ($1, $2, $3)`,
    [taskId, row.application_id, TASK_TYPE],
  );
  await enqueueRepositoryPlanner({
    taskId,
    applicationId: row.application_id,
    jobId: row.job_id,
  });
  return taskId;
}

export async function maybeEnqueueRepositoryPlanner(
  applicationId: string,
): Promise<string | null> {
  const result = await getDb().query<{
    job_id: string;
    application_id: string;
    score: number;
  }>(
    `SELECT ja.job_id, ja.id AS application_id, ara.final_alignment_score AS score
     FROM job_applications ja
     JOIN application_resume_analyses ara ON ara.job_application_id = ja.id AND ara.is_current = true
     JOIN application_tasks t ON t.id = ara.application_task_id AND t.status = 'COMPLETED'
     WHERE ja.id = $1`,
    [applicationId],
  );
  const row = result.rows[0];
  if (!row) return null;
  return enqueueForRow(row);
}

export async function manuallyEnqueueRepositoryPlanner(
  applicationId: string,
): Promise<string | null> {
  const result = await getDb().query<{
    job_id: string;
    application_id: string;
  }>(
    `SELECT job_id, id AS application_id FROM job_applications WHERE id = $1`,
    [applicationId],
  );
  if (!result.rows[0]) throw new Error("Application not found");
  return enqueueForRow(result.rows[0]);
}

export async function enqueueClosedJobTopCandidates(
  jobId: string,
): Promise<number> {
  const result = await getDb().query<{
    job_id: string;
    application_id: string;
  }>(
    `WITH completed AS (
       SELECT ja.job_id, ja.id AS application_id,
              ROW_NUMBER() OVER (ORDER BY ara.final_alignment_score DESC, ara.created_at ASC, ja.id ASC) AS rank,
              COUNT(*) OVER () AS total
       FROM job_applications ja
       JOIN application_resume_analyses ara ON ara.job_application_id = ja.id AND ara.is_current = true
       JOIN application_tasks st ON st.id = ara.application_task_id AND st.status = 'COMPLETED' AND st.task_type = 'RESUME_PARSE'
       JOIN jobs j ON j.id = ja.job_id AND j.closed_at IS NOT NULL
       WHERE ja.job_id = $1
     )
     SELECT c.job_id, c.application_id FROM completed c
     LEFT JOIN application_tasks rpt ON rpt.job_application_id = c.application_id AND rpt.task_type = $2
     WHERE c.rank <= CEIL(c.total * 0.375) AND rpt.id IS NULL`,
    [jobId, TASK_TYPE],
  );
  let queued = 0;
  for (const row of result.rows) {
    if (await enqueueForRow(row)) queued++;
  }
  return queued;
}
