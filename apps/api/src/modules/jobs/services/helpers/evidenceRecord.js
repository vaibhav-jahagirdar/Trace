"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJobEvidencePriorityRecords = createJobEvidencePriorityRecords;
const errorHandler_1 = require("../../../../middleware/errorHandler");
async function createJobEvidencePriorityRecords(evidencePriorities, jobId, client) {
    if (evidencePriorities.length === 0) {
        throw new errorHandler_1.ValidationError("At least one evidence priority must be provided.");
    }
    const values = [];
    const placeholders = [];
    evidencePriorities.forEach((priority, index) => {
        const offset = index * 3;
        values.push(jobId, priority.evidence_category_id, priority.weight);
        placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3})`);
    });
    const result = await client.query(`INSERT INTO job_evidence_priorities  (
         job_id, 
         evidence_category_id,
         weight
        ) VALUES ${placeholders.join(",")}
        RETURNING id`, values);
    if (result.rowCount !== evidencePriorities.length) {
        throw new errorHandler_1.AppError("Failed to create job evidenece priority records", 500, "FAILED_TO_CREATE_JOB_EVIDENCE_PRIORITIES");
    }
    return result.rows.map((row) => row.id);
}
//# sourceMappingURL=evidenceRecord.js.map