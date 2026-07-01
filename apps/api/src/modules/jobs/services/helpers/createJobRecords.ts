
import type { CreateJobInput } from "../../jobs.validator";
import { PoolClient } from "pg";
import { AppError } from "../../../../middleware/errorHandler";

export async function createJobRecord(
  membershipId: string,
  orgId: string,
  jobData: CreateJobInput,
  client: PoolClient
) {
  const {
    role_category_id,
    title,
    department,
    employment_type,
    work_mode,
    country,
    state,
    city,
    open_positions,
    description,
  } = jobData;

  const result = await client.query(
    `
    INSERT INTO jobs (
      organization_id,
      created_by_membership_id,
      role_category_id,
      title,
      department,
      employment_type,
      work_mode,
      country,
      state,
      city,
      open_positions,
      description,
      status
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'DRAFT'
    )
    RETURNING id, role_category_id
    `,
    [
      orgId,
      membershipId,
      role_category_id,
      title,
      department ?? null,
      employment_type,
      work_mode,
      country,
      state ?? null,
      city ?? null,
      open_positions,
      description ?? null,
    ]
  );

  const jobId = result.rows[0]?.id;
  const roleCategoryId = result.rows[0]?.role_category_id;

  if (!jobId || !roleCategoryId) {
    throw new AppError(
      "Failed to create job",
      500,
      "JOB_CREATION_FAILED"
    );
  }

  return jobId;
}