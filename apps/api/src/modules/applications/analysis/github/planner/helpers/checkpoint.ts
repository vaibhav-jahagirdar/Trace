import { PoolClient } from "pg";

export async function storePlannerResult(
  client: PoolClient,
  taskId: string,
  plannerModel: string,
  plannerPromptVersion: string,
  plannerInputHash: string,
  plannerOutput: object,
): Promise<string> {
  const query = `
    INSERT INTO application_repository_analyses (
      application_task_id,
      planner_model,
      planner_prompt_version,
      planner_input_hash,
      planner_output,
      planning_started_at,
      planning_completed_at
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      COALESCE(
        (
          SELECT planning_started_at
          FROM application_repository_analyses
          WHERE application_task_id = $1
        ),
        NOW()
      ),
      NOW()
    )
    ON CONFLICT (application_task_id)
    DO UPDATE SET
      planner_model = EXCLUDED.planner_model,
      planner_prompt_version = EXCLUDED.planner_prompt_version,
      planner_input_hash = EXCLUDED.planner_input_hash,
      planner_output = EXCLUDED.planner_output,
      planning_completed_at = NOW(),
      updated_at = NOW()
    RETURNING id;
  `;

  const result = await client.query<{ id: string }>(query, [
    taskId,
    plannerModel,
    plannerPromptVersion,
    plannerInputHash,
    JSON.stringify(plannerOutput),
  ]);

  if (result.rowCount === 0 || !result.rows[0]) {
    throw new Error("Failed to store planner result");
  }

  return result.rows[0].id;
}

export async function getPlannerResult(
  client: PoolClient,
  taskId: string,
): Promise<{
  planner_input_hash: string;
  planner_output: object;
} | null> {
  const query = `
    SELECT
      planner_input_hash,
      planner_output
    FROM application_repository_analyses
    WHERE application_task_id = $1
  `;

  const result = await client.query<{
    planner_input_hash: string;
    planner_output: object;
  }>(query, [taskId]);

  if (result.rowCount === 0 || !result.rows[0]) {
    return null;
  }

  return result.rows[0];
}

export async function markPlanningStarted(
  client: PoolClient,
  taskId: string,
): Promise<void> {
  await client.query(
    `
    INSERT INTO application_repository_analyses (
      application_task_id,
      planner_model,
      planner_prompt_version,
      planner_input_hash,
      planner_output,
      planning_started_at
    )
    VALUES (
      $1,
      '',
      '',
      '',
      '{}'::jsonb,
      NOW()
    )
    ON CONFLICT (application_task_id)
    DO UPDATE SET
      planning_started_at = COALESCE(
        application_repository_analyses.planning_started_at,
        NOW()
      ),
      updated_at = NOW()
    `,
    [taskId],
  );
}