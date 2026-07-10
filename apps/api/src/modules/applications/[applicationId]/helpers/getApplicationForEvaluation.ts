import { PoolClient } from "pg";
import { NotFoundError } from "../../../../middleware/errorHandler";

/**
 * Candidate-side fields relevant to *evaluation*, not the application
 * workflow record. Deliberately excludes: first_name, last_name, email,
 * phone (PII — see toApplicationContextDto for rationale), status,
 * rejection_source/reason/rejected_at (outcome/workflow state, not
 * evaluation input), and every hard-gate-only eligibility field
 * (notice_period_days, willing_to_relocate_for_this_job,
 * requires_visa_sponsorship, work_authorized, current_country/state/city)
 * — those already gated the candidate before this ever runs, so they
 * carry no remaining evaluation signal. resume_object_key/file_name/
 * mime_type/file_size/sha256 are storage plumbing for the separate resume
 * parsing pipeline, not prompt content.
 */
export interface ApplicationForEvaluationRow {
  id: string;
  job_id: string;
  years_of_professional_experience: string; // numeric(4,1) comes back as string
  highest_education_level: string;
  github_url: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  problem_solving_profile_url: string | null;
  featured_project_name: string | null;
  featured_project_url: string | null;
  project_description: string | null;
  feature_description: string | null;
  engineering_highlight: string | null;
  best_evidence_note: string | null;
  why_you_are_a_good_fit: string | null;
  resume_object_key: string | null;
}

export async function getApplicationForEvaluation(
  client: PoolClient,
  applicationId: string,
): Promise<ApplicationForEvaluationRow> {
  const result = await client.query<ApplicationForEvaluationRow>(
    `
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
    `,
    [applicationId],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Application not found");
  }

  return result.rows[0]!;
}