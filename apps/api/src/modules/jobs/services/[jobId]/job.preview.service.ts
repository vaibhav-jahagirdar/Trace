import { withTransaction } from "../../../../config/transaction";
import { getActiveMembership, assertMinimumRole } from "../../../../helpers/membershipCheck";
import { NotFoundError } from "../../../../middleware/errorHandler";
import type { PoolClient } from "pg";
import { getJobRequirements } from "../helpers/getJobRequirement";
import { getJobEvaluationPriorities } from "../helpers/getJobEvaluationPriorities";
import { getJobEvidencePriorities } from "../helpers/getJobEvidencePriorities";
import { getJobSuccessSignals } from "../helpers/getJobSuccessSignals";

export async function getJobPreview(jobId: string, orgId: string, userId: string) {
  return withTransaction(async (client) => {
    const membership = await getActiveMembership(userId, orgId, client);
    assertMinimumRole(membership.role, "RECRUITER");
    return getJobPreviewForClient(jobId, orgId, client);
  });
}

export async function getJobPreviewForClient(jobId: string, orgId: string, client: PoolClient) {
  const result = await client.query(`
    SELECT
      j.id, j.title, j.department, j.employment_type AS employment_type,
      j.work_mode, j.remote_scope, j.country, j.country_code, j.state, j.state_code, j.city,
      j.organization_id, j.open_positions, j.description, j.status,
      j.published_at, j.role_category_id,
      jrc.code AS role_category_code, jrc.name AS role_category_name,
      jrc.description AS role_category_description,
      je.currency, je.salary_min, je.salary_max,
      je.experience_min_years, je.experience_ideal_years, je.experience_max_years,
      je.notice_period_ideal_days, je.notice_period_max_days,
      je.relocation_assistance, je.visa_sponsorship,
      je.work_authorization_required, je.minimum_education_level,
      jsr.resume_required, jsr.github_required, jsr.portfolio_required,
      jsr.problem_solving_profile_required, jsr.linkedin_required,
      jsr.project_explanation_required, jsr.feature_explanation_required,
      jsr.zip_upload_allowed
    FROM jobs j
    LEFT JOIN job_role_categories jrc ON jrc.id = j.role_category_id
    LEFT JOIN job_eligibility_criteria je ON je.job_id = j.id
    LEFT JOIN job_submission_requirements jsr ON jsr.job_id = j.id
    WHERE j.id = $1 AND j.organization_id = $2 AND j.deleted_at IS NULL
  `, [jobId, orgId]);

  if (result.rowCount === 0) throw new NotFoundError("Job not found.");
  const job = result.rows[0];

  const [requirements, evaluationPriorities, evidencePriorities, successSignals] = await Promise.all([
    getJobRequirements(client, jobId),
    getJobEvaluationPriorities(client, jobId),
    getJobEvidencePriorities(client, jobId),
    getJobSuccessSignals(client, jobId),
  ]);

  return {
    ...job,
    eligibility: {
      currency: job.currency, salary_min: job.salary_min, salary_max: job.salary_max,
      experience_min_years: job.experience_min_years, experience_ideal_years: job.experience_ideal_years,
      experience_max_years: job.experience_max_years, notice_period_ideal_days: job.notice_period_ideal_days,
      notice_period_max_days: job.notice_period_max_days, relocation_assistance: job.relocation_assistance,
      visa_sponsorship: job.visa_sponsorship, work_authorization_required: job.work_authorization_required,
      minimum_education_level: job.minimum_education_level,
    },
    submission_requirements: {
      resume_required: job.resume_required, github_required: job.github_required,
      portfolio_required: job.portfolio_required, problem_solving_profile_required: job.problem_solving_profile_required,
      linkedin_required: job.linkedin_required, project_explanation_required: job.project_explanation_required,
      feature_explanation_required: job.feature_explanation_required, zip_upload_allowed: job.zip_upload_allowed,
    },
    requirements,
    evaluation_priorities: evaluationPriorities,
    evidence_priorities: evidencePriorities,
    success_signals: successSignals,
  };
}
