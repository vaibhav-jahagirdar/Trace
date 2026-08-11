"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJobEvaluationPriorityRecords = createJobEvaluationPriorityRecords;
const errorHandler_1 = require("../../../../middleware/errorHandler");
async function createJobEvaluationPriorityRecords(evaluationPriorities, jobId, client) {
    if (evaluationPriorities.length === 0) {
        throw new errorHandler_1.ValidationError("At least one evaluation priority must be provided.");
    }
    const values = [];
    const placeholders = [];
    evaluationPriorities.forEach((priority, index) => {
        const offset = index * 3;
        values.push(jobId, priority.evaluation_dimension_id, priority.weight);
        placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3})`);
    });
    const result = await client.query(`INSERT INTO job_evaluation_priorities  (
         job_id, 
         evaluation_dimension_id,
         weight
        ) VALUES ${placeholders.join(",")}
        RETURNING id`, values);
    if (result.rowCount !== evaluationPriorities.length) {
        throw new errorHandler_1.AppError("Failed to create job evaluation priority records", 500, "FAILED_TO_CREATE_JOB_EVALUATION_PRIORITIES");
    }
    return result.rows.map((row) => row.id);
}
//# sourceMappingURL=evaluationRecord.js.map