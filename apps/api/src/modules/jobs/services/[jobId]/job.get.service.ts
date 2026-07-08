import { withTransaction } from "../../../../config/transaction";
import { NotFoundError } from "../../../../middleware/errorHandler";

export async function getJob(jobId: string) {
  return withTransaction(async (client) => {
    const jobResult = await client.query(
      `SELECT j.id, j.title, j.department, j.employement_type, j.work_mode, j.country, j.state, j.city, j.organization_id, j.open_positions, j.description, j.published_at,
            j_e.currency, j_e.salary_min, j_e.salary_max, j_e.experience_min_years, j_e.experience_max_years, j_e.notice_period_max_days, j_e.relocation_supported, j_e.visa_sponsorship, j_e.work_authorization_required, j_e.minimum_education_level,
            j_s_r.resume_required, j_s_r.github_required, j_s_r.problem_solving_profile_required, j_s_r.linkedin_required, j_s_r.project_explanation_required, j_s_r.feature_explanation_required
            FROM jobs j
            LEFT JOIN job_eligibility_criteria j_e ON j.id = j_e.job_id
            LEFT JOIN job_submission_requirements j_s_r ON j.id = j_s_r.job_id
            WHERE j.id = $1
            `,
      [jobId],
    );
    if (jobResult.rowCount === 0) {
      throw new NotFoundError("Job not found");
    }
    const row = jobResult.rows[0];
    return {
      id: row.id,
      title: row.title,
      department: row.department,
      employement_type: row.employement_type,
      work_mode: row.work_mode,
      country: row.country,
      state: row.state,
      city: row.city,
      organization_id: row.organization_id,
      open_positions: row.open_positions,
      description: row.description,
      published_at: row.published_at,
      eligibility: {
        currency: row.currency,
        salary_min: row.salary_min,
        salary_max: row.salary_max,
        experience_min_years: row.experience_min_years,
        experience_max_years: row.experience_max_years,
        notice_period_max_days: row.notice_period_max_days,
        relocation_supported: row.relocation_supported,
        visa_sponsorship: row.visa_sponsorship,
        work_authorization_required: row.work_authorization_required,
        minimum_education_level: row.minimum_education_level,
      },
      submission_requirements: {
        resume_required: row.resume_required,
        github_required: row.github_required,
        problem_solving_profile_required: row.problem_solving_profile_required,
        linkedin_required: row.linkedin_required,
        project_explanation_required: row.project_explanation_required,
        feature_explanation_required: row.feature_explanation_required,
      },
    };
  });
}
