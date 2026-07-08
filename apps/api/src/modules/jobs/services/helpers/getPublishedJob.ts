import { PoolClient } from "pg";
import { NotFoundError } from "../../../../middleware/errorHandler";

export async function getPublishedJob(
  client: PoolClient,
  jobId: string,
) {
  const result = await client.query(
    `
      SELECT
        j.id,
        j.title,
        j.department,
        j.employement_type,
        j.work_mode,
        j.country,
        j.state,
        j.city,
        j.organization_id,
        j.open_positions,
        j.description,
        j.published_at,

        j_e.currency,
        j_e.salary_min,
        j_e.salary_max,
        j_e.experience_min_years,
        j_e.experience_max_years,
        j_e.notice_period_max_days,
        j_e.relocation_supported,
        j_e.visa_sponsorship,
        j_e.work_authorization_required,
        j_e.minimum_education_level,

        j_s_r.resume_required,
        j_s_r.github_required,
        j_s_r.problem_solving_profile_required,
        j_s_r.linkedin_required,
        j_s_r.project_explanation_required,
        j_s_r.feature_explanation_required

      FROM jobs j
      LEFT JOIN job_eligibility_criteria j_e
        ON j.id = j_e.job_id
      LEFT JOIN job_submission_requirements j_s_r
        ON j.id = j_s_r.job_id

      WHERE j.id = $1
        AND j.status = 'PUBLISHED'
        AND j.closed_at IS NULL
        AND j.deleted_at IS NULL
    `,
    [jobId],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Job not found");
  }

  return result.rows[0];
}