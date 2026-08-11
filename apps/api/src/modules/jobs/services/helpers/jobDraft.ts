import { PoolClient } from "pg";
import { getDb } from "../../../../config/db";
import { AppError, NotFoundError } from "../../../../middleware/errorHandler";

const pool = getDb();

export interface JobDraftRow {
  id: string;
  user_id: string;
  org_id: string;
  form_data: Record<string, unknown>;
  current_step: number;
  status: "DRAFT" | "COMPLETED";
  job_id: string | null;
  created_at: string;
  updated_at: string;
}


export async function getActiveDraft(
  userId: string,
  orgId: string,
): Promise<JobDraftRow | null> {
  const result = await pool.query<JobDraftRow>(
    `SELECT * FROM job_drafts WHERE user_id = $1 AND org_id = $2 AND status = 'DRAFT'`,
    [userId, orgId],
  );
  return result.rows[0] ?? null;
}


export async function upsertDraft(
  userId: string,
  orgId: string,
  formData: Record<string, unknown>,
  currentStep: number,
): Promise<JobDraftRow> {
  const result = await pool.query<JobDraftRow>(
    `INSERT INTO job_drafts (user_id, org_id, form_data, current_step, status)
     VALUES ($1, $2, $3, $4, 'DRAFT')
     ON CONFLICT (user_id, org_id) WHERE status = 'DRAFT'
     DO UPDATE SET form_data = job_drafts.form_data || EXCLUDED.form_data, current_step = $4, updated_at = now()
     RETURNING *`,
    [userId, orgId, formData, currentStep],
  );

  if (result.rowCount === 0) {
    throw new AppError("Failed to save draft", 500, "DRAFT_SAVE_FAILED");
  }

  return result.rows[0]!;
}


export async function getDraftById(
  draftId: string,
  userId: string,
  orgId: string,
  client: PoolClient,
): Promise<JobDraftRow> {
  const result = await client.query<JobDraftRow>(
    `SELECT * FROM job_drafts WHERE id = $1 AND user_id = $2 AND org_id = $3 FOR UPDATE`,
    [draftId, userId, orgId],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError(`Draft ${draftId} not found`);
  }

  return result.rows[0]!;
}

export async function markDraftCompleted(
  draftId: string,
  jobId: string,
  client: PoolClient,
): Promise<void> {
  await client.query(
    `UPDATE job_drafts SET status = 'COMPLETED', job_id = $1, updated_at = now() WHERE id = $2`,
    [jobId, draftId],
  );
}
