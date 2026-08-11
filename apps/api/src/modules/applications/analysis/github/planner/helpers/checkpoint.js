"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markPlanningStarted = markPlanningStarted;
exports.checkpointPlannerLLM = checkpointPlannerLLM;
exports.storePlannerResult = storePlannerResult;
exports.markPlanningFailed = markPlanningFailed;
exports.getPlannerCheckpoint = getPlannerCheckpoint;
async function markPlanningStarted(client, taskId) {
    await client.query(`
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
    `, [taskId]);
}
async function checkpointPlannerLLM(client, taskId, plannerModel, plannerPromptVersion, plannerInputHash, rawPlannerOutput) {
    const result = await client.query(`
    UPDATE application_repository_analyses
    SET
      planner_model = $2,
      planner_prompt_version = $3,
      planner_input_hash = $4,
      planner_raw_output = $5,
      planning_status = 'LLM_COMPLETED',
      updated_at = NOW()
    WHERE application_task_id = $1
    `, [
        taskId,
        plannerModel,
        plannerPromptVersion,
        plannerInputHash,
        JSON.stringify(rawPlannerOutput),
    ]);
    if (result.rowCount !== 1) {
        throw new Error("Failed to checkpoint planner LLM output.");
    }
}
async function storePlannerResult(client, taskId, validatedPlannerOutput) {
    const result = await client.query(`
    UPDATE application_repository_analyses
    SET
      planner_output = $2,
      planning_completed_at = NOW(),
      planning_status = 'COMPLETED',
      updated_at = NOW()
    WHERE application_task_id = $1
    RETURNING id
    `, [
        taskId,
        JSON.stringify(validatedPlannerOutput),
    ]);
    if (result.rowCount !== 1 || !result.rows[0]) {
        throw new Error("Failed to store planner result.");
    }
    return result.rows[0].id;
}
async function markPlanningFailed(client, taskId, error) {
    await client.query(`
    UPDATE application_repository_analyses
    SET
      planning_status = 'FAILED',
      planning_error = LEFT($2, 4000),
      updated_at = NOW()
    WHERE application_task_id = $1
    `, [taskId, error]);
}
async function getPlannerCheckpoint(client, taskId) {
    const result = await client.query(`
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
    `, [taskId]);
    if (result.rowCount !== 1 || !result.rows[0]) {
        return null;
    }
    return result.rows[0];
}
//# sourceMappingURL=checkpoint.js.map