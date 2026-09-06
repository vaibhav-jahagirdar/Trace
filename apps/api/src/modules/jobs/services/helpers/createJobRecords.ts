
import type { CreateJobInput } from "../../validators/create/jobs.validator";
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
    remote_scope
  } = jobData;
  const baseSlug = String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "job";
  const slugResult = await client.query(`SELECT COUNT(*)::int AS count FROM jobs WHERE organization_id = $1 AND (slug = $2 OR slug LIKE $2 || '-%')`, [orgId, baseSlug]);
  const suffix = Number(slugResult.rows[0]?.count ?? 0);
  const slug = suffix === 0 ? baseSlug : `${baseSlug}-${suffix + 1}`;

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
      slug,
      status,
      remote_scope

    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'DRAFT',$14
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
      slug,
      remote_scope
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

  return {jobId, roleCategoryId};
}
