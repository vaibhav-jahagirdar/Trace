"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApplicationForEvaluation = getApplicationForEvaluation;
const errorHandler_1 = require("../../../../middleware/errorHandler");
async function getApplicationForEvaluation(client, applicationId) {
    const result = await client.query(`
      SELECT
        ja.id,
        ja.job_id,

        ae.years_of_professional_experience,
        ae.highest_education_level,

        asub.github_url,
        asub.portfolio_url,
        asub.linkedin_url,
        asub.problem_solving_profile_url,
        asub.featured_project_name,
        asub.featured_project_url,
        asub.project_description,
        asub.feature_description,
        asub.engineering_highlight,
        asub.best_evidence_note,
        asub.why_you_are_a_good_fit,
        asub.resume_object_key

      FROM job_applications ja
      LEFT JOIN application_eligibility ae
        ON ja.id = ae.job_application_id
      LEFT JOIN application_submissions asub
        ON ja.id = asub.job_application_id

      WHERE ja.id = $1
    `, [applicationId]);
    if (result.rowCount === 0) {
        throw new errorHandler_1.NotFoundError("Application not found");
    }
    return result.rows[0];
}
//# sourceMappingURL=getApplicationForEvaluation.js.map