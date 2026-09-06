import { PoolClient } from "pg";
import { NotFoundError } from "../../../../middleware/errorHandler";

export async function getPublishedJob(
  client: PoolClient,
  jobId: string,
  organizationId?: string,
) {
  const result = await client.query(
    `
      SELECT
        j.id,
        j.title,
        j.slug,
        j.department,
        j.employment_type,
        j.work_mode,
        j.remote_scope,
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
        j_e.relocation_assistance,
        j_e.visa_sponsorship,
        j_e.work_authorization_required,
        j_e.minimum_education_level,

        j_s_r.resume_required,
        j_s_r.github_required,
        j_s_r.portfolio_required,
        j_s_r.problem_solving_profile_required,
        j_s_r.linkedin_required,
        j_s_r.project_explanation_required,
        j_s_r.feature_explanation_required,
        j_s_r.zip_upload_allowed

      FROM jobs j
      LEFT JOIN job_eligibility_criteria j_e
        ON j.id = j_e.job_id
      LEFT JOIN job_submission_requirements j_s_r
        ON j.id = j_s_r.job_id

      WHERE j.id = $1
        AND ($2::uuid IS NULL OR j.organization_id = $2)
        AND j.status = 'PUBLISHED'
        AND j.closed_at IS NULL
        AND j.deleted_at IS NULL
    `,
    [jobId, organizationId ?? null],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Job");
  }

  return result.rows[0];
}

/** Resolve a published role without exposing database identifiers in the public URL. */
export async function getPublishedJobByPublicSlug(
  client: PoolClient,
  orgSlug: string,
  jobSlug: string,
) {
  const result = await client.query(
    `
      SELECT
        j.id,
        j.title,
        j.department,
        j.employment_type,
        j.work_mode,
        j.remote_scope,
        j.country,
        j.state,
        j.city,
        j.organization_id,
        o.slug AS organization_slug,
        o.name AS organization_name,
        j.open_positions,
        j.description,
        j.published_at,
        j_e.currency,
        j_e.salary_min,
        j_e.salary_max,
        j_e.experience_min_years,
        j_e.experience_max_years,
        j_e.notice_period_max_days,
        j_e.relocation_assistance,
        j_e.visa_sponsorship,
        j_e.work_authorization_required,
        j_e.minimum_education_level,
        j_s_r.resume_required,
        j_s_r.github_required,
        j_s_r.portfolio_required,
        j_s_r.problem_solving_profile_required,
        j_s_r.linkedin_required,
        j_s_r.project_explanation_required,
        j_s_r.feature_explanation_required,
        j_s_r.zip_upload_allowed,
        jrc.name AS role_category_name
      FROM jobs j
      JOIN organizations o ON o.id = j.organization_id
      LEFT JOIN job_role_categories jrc ON jrc.id = j.role_category_id
      LEFT JOIN job_eligibility_criteria j_e ON j.id = j_e.job_id
      LEFT JOIN job_submission_requirements j_s_r ON j.id = j_s_r.job_id
      WHERE lower(o.slug::text) = lower($1)
        AND j.slug = lower($2)
        AND o.deleted_at IS NULL
        AND j.status = 'PUBLISHED'
        AND j.closed_at IS NULL
        AND j.deleted_at IS NULL
      ORDER BY j.published_at DESC
    `,
    [orgSlug, jobSlug],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Job");
  }

  if ((result.rowCount ?? 0) > 1) {
    throw new NotFoundError("This public job URL is ambiguous");
  }

  return result.rows[0];
}
