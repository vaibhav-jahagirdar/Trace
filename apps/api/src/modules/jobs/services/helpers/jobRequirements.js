"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJobRequirementRecord = createJobRequirementRecord;
const errorHandler_1 = require("../../../../middleware/errorHandler");
async function createJobRequirementRecord(requirements, jobId, client) {
    if (requirements.length === 0) {
        throw new errorHandler_1.AppError("At least one job requirement is required.", 400, "INVALID_JOB_REQUIREMENTS");
    }
    const values = [];
    const placeholders = [];
    requirements.forEach((requirement, index) => {
        const offset = index * 6;
        placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`);
        values.push(jobId, requirement.requirement_type === "TECHNOLOGY"
            ? requirement.technology_id
            : null, requirement.requirement_type === "CONCEPT"
            ? requirement.concept_id
            : null, requirement.requirement_type, requirement.priority_type, requirement.weight);
    });
    const result = await client.query(`
      INSERT INTO job_requirements (
        job_id,
        technology_id,
        concept_id,
        requirement_type,
        priority_type,
        weight
      )
      VALUES
      ${placeholders.join(",")}
      RETURNING id
    `, values);
    if (result.rowCount !== requirements.length) {
        throw new errorHandler_1.AppError("Failed to create job requirements.", 500, "JOB_REQUIREMENTS_CREATION_FAILED");
    }
    return result.rows.map((row) => row.id);
}
//# sourceMappingURL=jobRequirements.js.map