import { getDb } from "../../../config/db";
import { NotFoundError } from "../../../middleware/errorHandler";
import { getResumeObject } from "../../../storage/r2.service";

export async function getJobApplicationResumeObject(organizationId: string, jobId: string, applicationId: string) {
  const result = await getDb().query<{ resume_object_key: string | null }>(
    `SELECT asub.resume_object_key
     FROM job_applications ja
     JOIN jobs j ON j.id = ja.job_id AND j.organization_id = $1 AND j.deleted_at IS NULL
     LEFT JOIN application_submissions asub ON asub.job_application_id = ja.id
     WHERE ja.id = $2 AND ja.job_id = $3
     LIMIT 1`,
    [organizationId, applicationId, jobId],
  );
  const key = result.rows[0]?.resume_object_key;
  if (!key) throw new NotFoundError("Resume not found");
  return getResumeObject(key);
}

export async function getJobApplicationAnalysisReports(
  organizationId: string,
  jobId: string,
  applicationId: string,
) {
  const db = getDb();
  const result = await db.query<{
    application_id: string;
    candidate_name: string;
    candidate_email: string | null;
    github_url: string | null;
    resume_available: boolean;
    job_title: string;
    stage1: unknown;
    stage2a: unknown;
    stage2c_report: unknown;
    score_audit: unknown;
  }>(
    `
    SELECT
      ja.id AS application_id,
      CONCAT(ja.first_name, ' ', ja.last_name) AS candidate_name,
      ja.email AS candidate_email,
      asub.github_url,
      (asub.resume_object_key IS NOT NULL) AS resume_available,
      j.title AS job_title,
      resume.cleaned_response AS stage1,
      plan.planner_output AS stage2a,
      verifier.cleaned_report AS stage2c_report,
      score.score_audit
    FROM job_applications ja
    LEFT JOIN application_submissions asub ON asub.job_application_id = ja.id
    JOIN jobs j ON j.id = ja.job_id
      AND j.organization_id = $1
      AND j.deleted_at IS NULL
    LEFT JOIN LATERAL (
      SELECT rar.cleaned_response
      FROM resume_analysis_results rar
      JOIN application_tasks at ON at.id = rar.application_task_id
      WHERE at.job_application_id = ja.id
      ORDER BY rar.created_at DESC
      LIMIT 1
    ) resume ON TRUE
    LEFT JOIN LATERAL (
      SELECT ara.planner_output
      FROM application_repository_analyses ara
      JOIN application_tasks at ON at.id = ara.application_task_id
      WHERE at.job_application_id = ja.id
      ORDER BY ara.updated_at DESC
      LIMIT 1
    ) plan ON TRUE
    LEFT JOIN LATERAL (
      SELECT vr.cleaned_report
      FROM application_repository_verifier_runs vr
      JOIN application_repository_analyses ara ON ara.id = vr.application_repository_analysis_id
      JOIN application_tasks at ON at.id = ara.application_task_id
      WHERE at.job_application_id = ja.id
      ORDER BY vr.created_at DESC
      LIMIT 1
    ) verifier ON TRUE
    LEFT JOIN LATERAL (
      SELECT jsonb_build_object(
        'id', sr.id,
        'policy_version', sr.policy_version,
        'scoring_mode', sr.scoring_mode,
        'stage1_score', sr.stage1_score,
        'repository_evidence_score', sr.repository_evidence_score,
        'repository_coverage_score', sr.repository_coverage_score,
        'repository_adjustment', sr.repository_adjustment,
        'combined_score', sr.combined_score,
        'requirement_contributions', sr.requirement_contributions,
        'audit_notes', sr.audit_notes,
        'created_at', sr.created_at
      ) AS score_audit
      FROM application_repository_score_runs sr
      JOIN application_repository_verifier_runs vr ON vr.id = sr.verifier_run_id
      JOIN application_repository_analyses ara ON ara.id = sr.application_repository_analysis_id
      JOIN application_tasks at ON at.id = ara.application_task_id
      WHERE at.job_application_id = ja.id
      ORDER BY sr.created_at DESC
      LIMIT 1
    ) score ON TRUE
    WHERE ja.id = $2 AND ja.job_id = $3
    LIMIT 1
    `,
    [organizationId, applicationId, jobId],
  );

  const row = result.rows[0];
  if (!row) throw new NotFoundError("Application not found");

  return {
    application: {
      id: row.application_id,
      candidateName: row.candidate_name,
      email: row.candidate_email,
      githubUrl: row.github_url,
      resumeAvailable: row.resume_available,
      jobTitle: row.job_title,
    },
    stage1: row.stage1,
    stage2a: row.stage2a,
    stage2c: row.stage2c_report,
    scoreAudit: row.score_audit,
  };
}
