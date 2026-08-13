import { PoolClient } from "pg";

export async function markTaskInProgress(
  client: PoolClient,
  taskId: string,
) {
  await client.query(
    `UPDATE application_tasks
        SET status = 'RUNNING',
            started_at = NOW(),
            updated_at = NOW()
      WHERE id = $1`,
    [taskId],
  );
}

export async function markTaskCompleted(
  client: PoolClient,
  taskId: string,
) {
  await client.query(
    `UPDATE application_tasks
        SET status = 'COMPLETED',
            completed_at = NOW(),
            updated_at = NOW()
      WHERE id = $1`,
    [taskId],
  );
}

export async function markTaskFailed(
  client: PoolClient,
  taskId: string,
  error: unknown,
  attemptsMade: number,
  maxAttempts: number,
) {
  const attempts = attemptsMade + 1;
  const permanentlyFailed = attempts >= maxAttempts;

  await client.query(
    `UPDATE application_tasks
        SET status = $2,
            attempt_count = $3,
            last_error_message = $4,
            human_intervention_required = $5,
            updated_at = NOW()
      WHERE id = $1`,
    [
      taskId,
      permanentlyFailed ? "FAILED" : "PENDING",
      attempts,
      error instanceof Error ? error.message : String(error),
      permanentlyFailed,
    ],
  );
}
