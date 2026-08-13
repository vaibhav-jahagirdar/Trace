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
        j_e.minimum_education_level

      FROM jobs j

      LEFT JOIN job_role_categories jrc
        ON j.role_category_id = jrc.id

      LEFT JOIN job_eligibility_criteria j_e
        ON j.id = j_e.job_id

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