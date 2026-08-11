"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markTaskInProgress = markTaskInProgress;
exports.markTaskCompleted = markTaskCompleted;
exports.markTaskFailed = markTaskFailed;
async function markTaskInProgress(client, taskId) {
    await client.query(`UPDATE application_tasks
        SET status = 'IN_PROGRESS',
            started_at = NOW(),
            updated_at = NOW()
      WHERE id = $1`, [taskId]);
}
async function markTaskCompleted(client, taskId) {
    await client.query(`UPDATE application_tasks
        SET status = 'COMPLETED',
            completed_at = NOW(),
            updated_at = NOW()
      WHERE id = $1`, [taskId]);
}
async function markTaskFailed(client, taskId, error, attemptsMade, maxAttempts) {
    const attempts = attemptsMade + 1;
    const permanentlyFailed = attempts >= maxAttempts;
    await client.query(`UPDATE application_tasks
        SET status = $2,
            attempt_count = $3,
            last_error_message = $4,
            human_intervention_required = $5,
            updated_at = NOW()
      WHERE id = $1`, [
        taskId,
        permanentlyFailed ? "FAILED" : "PENDING",
        attempts,
        error instanceof Error ? error.message : String(error),
        permanentlyFailed,
    ]);
}
//# sourceMappingURL=updateApplicationStatus.js.map