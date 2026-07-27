import { PoolClient } from "pg";
import {
  assertMinimumRole,
  getActiveMembership,
} from "../../../../../../helpers/membershipCheck";
import {
  NotFoundError,
  UnauthorizedError,
} from "../../../../../../middleware/errorHandler";


export async function authorizeResumeAnalysisRequest(
  client: PoolClient,
  userId: string,
  organizationId: string,
): Promise<void> {
  const membership = await getActiveMembership(
    userId,
    organizationId,
    client,
  );

  if (!membership) {
    throw new UnauthorizedError("No active membership found.");
  }

  assertMinimumRole(membership.role, "RECRUITER");
}


export async function claimResumeParseTask(
  client: PoolClient,
  taskId: string,
): Promise<{ applicationId: string | undefined }> {
  const result = await client.query<{
    job_application_id: string;
  }>(
    `
    UPDATE application_tasks
    SET
      status = 'RUNNING',
      started_at = NOW(),
      updated_at = NOW()
    WHERE
      id = $1
      AND task_type = 'RESUME_PARSE'
      AND status = 'PENDING'
      AND attempt_count < max_attempts
      AND human_intervention_required = FALSE
      AND checkpoint IS NULL
    RETURNING job_application_id;
    `,
    [taskId],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError(
      "Resume parse task is invalid or cannot be processed.",
    );
  }

  return {
    applicationId: result.rows[0]?.job_application_id,
  };
}


export async function validateResumeAnalysisRequest(
  client: PoolClient,
  userId: string,
  organizationId: string,
  jobId: string,
  applicationId: string,
  taskId: string,
): Promise<void> {
  await authorizeResumeAnalysisRequest(
    client,
    userId,
    organizationId,
  );

  const result = await client.query(
    `
    SELECT 1
    FROM application_tasks t
    JOIN job_applications a
      ON a.id = t.job_application_id
    JOIN jobs j
      ON j.id = a.job_id
    WHERE
      t.id = $1
      AND t.job_application_id = $2
      AND a.job_id = $3
      AND j.organization_id = $4
      AND t.task_type = 'RESUME_PARSE'
      AND t.status = 'PENDING'
      AND t.attempt_count < t.max_attempts
      AND t.human_intervention_required = FALSE
      AND t.checkpoint IS NULL
    LIMIT 1;
    `,
    [taskId, applicationId, jobId, organizationId],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError(
      "Resume analysis request is invalid or cannot be processed.",
    );
  }
}