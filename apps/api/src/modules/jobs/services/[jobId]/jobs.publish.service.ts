import { withTransaction } from "../../../../config/transaction";
import {
  assertMinimumRole,
  getActiveMembership,
} from "../../../../helpers/membershipCheck";
import {
  AppError,
  NotFoundError,
  ValidationError,
} from "../../../../middleware/errorHandler";
import type { PoolClient } from "pg";

export async function publishJob(
  jobId: string,
  orgId: string,
  userId: string,
) {
  return withTransaction(async (client: PoolClient) => {
    const membership = await getActiveMembership(
      userId,
      orgId,
      client,
    );

    assertMinimumRole(
      membership.role,
      "RECRUITER",
    );

    const jobResult = await client.query<{
      id: string;
      status: string;
    }>(
      `
      SELECT id, status
      FROM jobs
      WHERE id = $1
        AND organization_id = $2
        AND deleted_at IS NULL
      FOR UPDATE
      `,
      [jobId, orgId],
    );

    if (jobResult.rowCount === 0) {
      throw new NotFoundError("Job not found.");
    }

    const job = jobResult.rows[0]!;

    if (job.status !== "DRAFT") {
      throw new ValidationError(
        "Only draft jobs can be published.",
      );
    }

    const publishStateResult = await client.query<{
      has_eligibility_criteria: boolean;
      has_submission_requirements: boolean;
      has_job_requirements: boolean;
      has_evaluation_priorities: boolean;
      has_evidence_priorities: boolean;
    }>(
      `
      SELECT
        EXISTS (
          SELECT 1
          FROM job_eligibility_criteria
          WHERE job_id = $1
        ) AS has_eligibility_criteria,

        EXISTS (
          SELECT 1
          FROM job_submission_requirements
          WHERE job_id = $1
        ) AS has_submission_requirements,

        EXISTS (
          SELECT 1
          FROM job_requirements
          WHERE job_id = $1
        ) AS has_job_requirements,

        EXISTS (
          SELECT 1
          FROM job_evaluation_priorities
          WHERE job_id = $1
        ) AS has_evaluation_priorities,

        EXISTS (
          SELECT 1
          FROM job_evidence_priorities
          WHERE job_id = $1
        ) AS has_evidence_priorities
      `,
      [jobId],
    );

    const publishState =
      publishStateResult.rows[0]!;

    const missing: string[] = [];

    if (!publishState.has_eligibility_criteria) {
      missing.push("eligibility criteria");
    }

    if (!publishState.has_submission_requirements) {
      missing.push(
        "submission requirements",
      );
    }

    if (!publishState.has_job_requirements) {
      missing.push("job requirements");
    }

    if (
      !publishState.has_evaluation_priorities
    ) {
      missing.push(
        "evaluation priorities",
      );
    }

    if (
      !publishState.has_evidence_priorities
    ) {
      missing.push(
        "evidence priorities",
      );
    }

    if (missing.length > 0) {
      throw new ValidationError(
        `Cannot publish job. Missing: ${missing.join(", ")}.`,
      );
    }

    const publishResult = await client.query<{
      id: string;
      status: string;
      published_at: Date;
    }>(
      `
      UPDATE jobs
      SET
        status = 'PUBLISHED',
        published_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
        AND organization_id = $2
      RETURNING
        id,
        status,
        published_at
      `,
      [jobId, orgId],
    );

    if (publishResult.rowCount === 0) {
      throw new AppError(
        "Failed to publish job.",
        500,
        "JOB_PUBLISH_FAILED",
      );
    }

    return publishResult.rows[0];
  });
}