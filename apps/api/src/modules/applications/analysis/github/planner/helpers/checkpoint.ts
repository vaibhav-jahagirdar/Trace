import { PoolClient } from "pg";

export type PlanningStatus =
  | "PENDING"
  | "RUNNING"
  | "LLM_COMPLETED"
  | "COMPLETED"
  | "FAILED";

export interface PlannerCheckpoint {
  id: string;
  planning_status: PlanningStatus;
  planner_input_hash: string | null;
  planner_model: string | null;
  planner_prompt_version: string | null;
  planner_raw_output: object | null;
  planner_output: object | null;
}

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
    DO UPDATE
    SET
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

export async function checkpointPlannerLLM(
  client: PoolClient,
  taskId: string,
  plannerModel: string,
  plannerPromptVersion: string,
  plannerInputHash: string,
  rawPlannerOutput: object,
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
      JSON.stringify(rawPlannerOutput),
    ],
  );

  if (result.rowCount !== 1) {
    throw new Error("Failed to checkpoint planner LLM output.");
  }
}

export async function storePlannerResult(
  client: PoolClient,
  taskId: string,
  validatedPlannerOutput: object,
): Promise<string> {
  const result = await client.query<{ id: string }>(
    `
    UPDATE application_repository_analyses
    SET
      planner_output = $2,
      planning_completed_at = NOW(),
      planning_status = 'COMPLETED',
      updated_at = NOW()
    WHERE application_task_id = $1
    RETURNING id
    `,
    [
      taskId,
      JSON.stringify(validatedPlannerOutput),
    ],
  );

  if (result.rowCount !== 1 || !result.rows[0]) {
    throw new Error("Failed to store planner result.");
  }

  return result.rows[0].id;
}

export async function markPlanningFailed(
  client: PoolClient,
  taskId: string,
  error: string,
): Promise<void> {
  await client.query(
    `
    UPDATE application_repository_analyses
    SET
      planning_status = 'FAILED',
      planning_error = LEFT($2, 4000),
      updated_at = NOW()
    WHERE application_task_id = $1
    `,
    [taskId, error],
  );
}

export async function getPlannerCheckpoint(
  client: PoolClient,
  taskId: string,
): Promise<PlannerCheckpoint | null> {
  const result = await client.query<PlannerCheckpoint>(
    `
    SELECT
      id,
      planning_status,
      planner_input_hash,
      planner_model,
      planner_prompt_version,
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