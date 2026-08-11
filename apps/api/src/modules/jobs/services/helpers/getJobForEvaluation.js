"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobForEvaluation = getJobForEvaluation;
const errorHandler_1 = require("../../../../middleware/errorHandler");
async function getJobForEvaluation(client, jobId) {
    const result = await client.query(`
      SELECT
        j.id,
        j.title,
        j.department,
        j.description,

        jrc.code AS role_category_code,
        jrc.name AS role_category_name,
        jrc.description AS role_category_description,

        j_e.experience_min_years,
        j_e.experience_max_years,
        j_e.minimum_education_level,

        j_s_r.resume_required,
        j_s_r.github_required,
        j_s_r.problem_solving_profile_required,
        j_s_r.linkedin_required,
        j_s_r.project_explanation_required,
        j_s_r.feature_explanation_required

      FROM jobs j
      LEFT JOIN job_role_categories jrc
        ON j.role_category_id = jrc.id
      LEFT JOIN job_eligibility_criteria j_e
        ON j.id = j_e.job_id
      LEFT JOIN job_submission_requirements j_s_r
        ON j.id = j_s_r.job_id

      WHERE j.id = $1
        AND j.deleted_at IS NULL
    `, [jobId]);
    if (result.rowCount === 0) {
        throw new errorHandler_1.NotFoundError("Job not found");
    }
    return result.rows[0];
}
//# sourceMappingURL=getJobForEvaluation.js.map