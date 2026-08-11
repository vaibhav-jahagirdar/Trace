"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markPlanningStarted = markPlanningStarted;
exports.markPlannerLlmCompleted = markPlannerLlmCompleted;
exports.markPlanningCompleted = markPlanningCompleted;
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
    DO UPDATE SET
      planning_status = 'RUNNING',
      planning_started_at = COALESCE(
        application_repository_analyses.planning_started_at,
        NOW()
      ),
      updated_at = NOW()
    `, [taskId]);
}
async function markPlannerLlmCompleted(client, taskId, plannerModel, plannerPromptVersion, plannerInputHash, plannerRawOutput) {
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
        JSON.stringify(plannerRawOutput),
    ]);
    if (result.rowCount !== 1) {
        throw new Error("Failed to checkpoint planner LLM output.");
    }
}
async function markPlanningCompleted(client, taskId, plannerOutput) {
    const result = await client.query(`
    UPDATE application_repository_analyses
    SET
      planner_output = $2,
      planning_status = 'COMPLETED',
      planning_completed_at = NOW(),
      updated_at = NOW()
    WHERE application_task_id = $1
    `, [
        taskId,
        JSON.stringify(plannerOutput),
    ]);
    if (result.rowCount !== 1) {
        throw new Error("Failed to store planner result.");
    }
}
async function markPlanningFailed(client, taskId, error) {
    await client.query(`
    UPDATE application_repository_analyses
    SET
      planning_status = 'FAILED',
      planning_error = $2,
      updated_at = NOW()
    WHERE application_task_id = $1
    `, [
        taskId,
        error instanceof Error ? error.message : String(error),
    ]);
}
async function getPlannerCheckpoint(client, taskId) {
    const result = await client.query(`
    SELECT
      planning_status,
      planner_input_hash,
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
//# sourceMappingURL=updatePlannerStatus.js.map