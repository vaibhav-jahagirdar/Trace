import { PoolClient } from "pg";

export async function markPlanningStarted(
  client: PoolClient,
  taskId: string,
): Promise<void> {
  await client.query(
    `
    INSERT INTO application_repository_analyses (
      application_task_id,
      planning_status,
      planning_started_at
    )
    VALUES (
      $1,
      'RUNNING',
      NOW()
    )
    ON CONFLICT (application_task_id)
    DO UPDATE SET
      planning_status = 'RUNNING',
      planning_started_at = COALESCE(
        application_repository_analyses.planning_started_at,
        NOW()
      ),
      updated_at = NOW()
    `,
    [taskId],
  );
}

export async function markPlannerLlmCompleted(
  client: PoolClient,
  taskId: string,
  plannerModel: string,
  plannerPromptVersion: string,
  plannerInputHash: string,
  plannerRawOutput: object,
): Promise<void> {
  const result = await client.query(
    `
    UPDATE application_repository_analyses
    SET
      planner_model = $2,
      planner_prompt_version = $3,
      planner_input_hash = $4,
      planner_raw_output = $5,
      planning_status = 'LLM_COMPLETED',
      updated_at = NOW()
    WHERE application_task_id = $1
    `,
    [
      taskId,
      plannerModel,
      plannerPromptVersion,
      plannerInputHash,
      JSON.stringify(plannerRawOutput),
    ],
  );

  if (result.rowCount !== 1) {
    throw new Error("Failed to checkpoint planner LLM output.");
  }
}

export async function markPlanningCompleted(
  client: PoolClient,
  taskId: string,
  plannerOutput: object,
): Promise<void> {
  const result = await client.query(
    `
    UPDATE application_repository_analyses
    SET
      planner_output = $2,
      planning_status = 'COMPLETED',
      planning_completed_at = NOW(),
      updated_at = NOW()
    WHERE application_task_id = $1
    `,
    [
      taskId,
      JSON.stringify(plannerOutput),
    ],
  );

  if (result.rowCount !== 1) {
    throw new Error("Failed to store planner result.");
  }
}

export async function markPlanningFailed(
  client: PoolClient,
  taskId: string,
  error: unknown,
): Promise<void> {
  await client.query(
    `
    UPDATE application_repository_analyses
    SET
      planning_status = 'FAILED',
      planning_error = $2,
      updated_at = NOW()
    WHERE application_task_id = $1
    `,
    [
      taskId,
      error instanceof Error ? error.message : String(error),
    ],
  );
}

export async function getPlannerCheckpoint(
  client: PoolClient,
  taskId: string,
): Promise<{
  planning_status:
    | "PENDING"
    | "RUNNING"
    | "LLM_COMPLETED"
    | "COMPLETED"
    | "FAILED";
  planner_input_hash: string | null;
  planner_raw_output: object | null;
  planner_output: object | null;
} | null> {
  const result = await client.query<{
    planning_status:
      | "PENDING"
      | "RUNNING"
      | "LLM_COMPLETED"
      | "COMPLETED"
      | "FAILED";
    planner_input_hash: string | null;
    planner_raw_output: object | null;
    planner_output: object | null;
  }>(
    `
    SELECT
      planning_status,
      planner_input_hash,
      planner_raw_output,
      planner_output
    FROM application_repository_analyses
    WHERE application_task_id = $1
    `,
    [taskId],
  );

  if (result.rowCount !== 1 || !result.rows[0]) {
    return null;
  }

  return result.rows[0];
}