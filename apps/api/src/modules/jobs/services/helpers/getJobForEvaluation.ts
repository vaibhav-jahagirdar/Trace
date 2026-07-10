import { PoolClient } from "pg";
import { NotFoundError } from "../../../../middleware/errorHandler";

export interface JobForEvaluationRow {
  id: string;
  title: string;
  department: string | null;
  description: string;
  role_category_code: string | null;
  role_category_name: string | null;
  role_category_description: string | null;
  experience_min_years: number | null;
  experience_max_years: number | null;
  minimum_education_level: string | null;
  resume_required: boolean | null;
  github_required: boolean | null;
  problem_solving_profile_required: boolean | null;
  linkedin_required: boolean | null;
  project_explanation_required: boolean | null;
  feature_explanation_required: boolean | null;
}

export async function getJobForEvaluation(
  client: PoolClient,
  jobId: string,
): Promise<JobForEvaluationRow> {
  const result = await client.query<JobForEvaluationRow>(
    `
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
    `,
    [jobId],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Job not found");
  }

  return result.rows[0]!;
}