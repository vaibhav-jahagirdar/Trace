"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJobSubmissionRequirementsRecord = createJobSubmissionRequirementsRecord;
const errorHandler_1 = require("../../../../middleware/errorHandler");
async function createJobSubmissionRequirementsRecord(submissionRequirementsData, jobId, client) {
    const { resume_required, github_required, portfolio_required, problem_solving_profile_required, linkedin_required, project_explanation_required, feature_explanation_required, zip_upload_allowed } = submissionRequirementsData;
    const submissionRequirementsResult = await client.query(`INSERT INTO job_submission_requirements
         (job_id, resume_required, github_required, portfolio_required, problem_solving_profile_required, linkedin_required, project_explanation_required, feature_explanation_required, zip_upload_allowed)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id `, [jobId, resume_required, github_required, portfolio_required, problem_solving_profile_required, linkedin_required, project_explanation_required, feature_explanation_required, zip_upload_allowed]);
    if (submissionRequirementsResult.rowCount === 0) {
        throw new errorHandler_1.AppError("Failed to create job submission requirements record", 500);
    }
    return submissionRequirementsResult.rows[0].id;
}
//# sourceMappingURL=submissionRequirements.js.map