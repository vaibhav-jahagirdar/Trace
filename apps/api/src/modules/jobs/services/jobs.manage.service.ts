import { withTransaction } from "../../../config/transaction";
import { assertMinimumRole, getActiveMembership } from "../../../helpers/membershipCheck";
import { AppError, NotFoundError, ValidationError } from "../../../middleware/errorHandler";
import type { PoolClient } from "pg";

export type UpdateJobInput = {
  slug?: string | undefined;
  title?: string | undefined;
  department?: string | null | undefined;
  description?: string | null | undefined;
  open_positions?: number | undefined;
  work_mode?: string | undefined;
  country?: string | undefined;
  state?: string | null | undefined;
  city?: string | null | undefined;
};

async function authorize(client: PoolClient, userId: string, orgId: string, jobId: string) {
  const membership = await getActiveMembership(userId, orgId, client);
  assertMinimumRole(membership.role, "RECRUITER");
  const job = await client.query(`SELECT id, status FROM jobs WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL FOR UPDATE`, [jobId, orgId]);
  if (!job.rows[0]) throw new NotFoundError("Job");
  return job.rows[0] as { id: string; status: string };
}

export async function updateJob(jobId: string, orgId: string, userId: string, input: UpdateJobInput) {
  return withTransaction(async (client) => {
    await authorize(client, userId, orgId, jobId);
    const allowed: Record<string, unknown> = {};
    for (const key of ["title", "slug", "department", "description", "open_positions", "work_mode", "country", "state", "city"] as const) {
      if (input[key] !== undefined) allowed[key] = input[key];
    }
    if (!Object.keys(allowed).length) throw new ValidationError("No job changes supplied");
    const values = Object.values(allowed);
    const sets = Object.keys(allowed).map((key, index) => `${key} = $${index + 1}`);
    values.push(jobId, orgId);
    const result = await client.query(`UPDATE jobs SET ${sets.join(", ")}, updated_at = NOW() WHERE id = $${values.length - 1} AND organization_id = $${values.length} AND deleted_at IS NULL RETURNING id, title, department, description, open_positions, work_mode, country, state, city, status, updated_at`, values);
    return result.rows[0];
  });
}

export async function transitionJob(jobId: string, orgId: string, userId: string, status: "PAUSED" | "PUBLISHED" | "CLOSED") {
  return withTransaction(async (client) => {
    const job = await authorize(client, userId, orgId, jobId);
    if (status === "PUBLISHED" && job.status !== "PAUSED") throw new ValidationError("Only paused jobs can be resumed");
    if (status === "PAUSED" && job.status !== "PUBLISHED") throw new ValidationError("Only published jobs can be paused");
    if (status === "CLOSED" && !["PUBLISHED", "PAUSED"].includes(job.status)) throw new ValidationError("Only active jobs can be closed");
    const result = await client.query(`UPDATE jobs SET status = $3, closed_at = CASE WHEN $3 = 'CLOSED' THEN NOW() ELSE NULL END, updated_at = NOW() WHERE id = $1 AND organization_id = $2 RETURNING id, status, closed_at`, [jobId, orgId, status]);
    return result.rows[0];
  });
}

export async function deleteJob(jobId: string, orgId: string, userId: string) {
  return withTransaction(async (client) => {
    await authorize(client, userId, orgId, jobId);
    const result = await client.query(`UPDATE jobs SET status = 'ARCHIVED', deleted_at = NOW(), closed_at = COALESCE(closed_at, NOW()), updated_at = NOW() WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL RETURNING id, status`, [jobId, orgId]);
    if (!result.rows[0]) throw new AppError("Job has already been removed", 409, "JOB_ALREADY_DELETED");
    return result.rows[0];
  });
}
