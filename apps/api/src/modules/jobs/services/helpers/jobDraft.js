"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveDraft = getActiveDraft;
exports.upsertDraft = upsertDraft;
exports.getDraftById = getDraftById;
exports.markDraftCompleted = markDraftCompleted;
const db_1 = require("../../../../config/db");
const errorHandler_1 = require("../../../../middleware/errorHandler");
const pool = (0, db_1.getDb)();
async function getActiveDraft(userId, orgId) {
    const result = await pool.query(`SELECT * FROM job_drafts WHERE user_id = $1 AND org_id = $2 AND status = 'DRAFT'`, [userId, orgId]);
    return result.rows[0] ?? null;
}
async function upsertDraft(userId, orgId, formData, currentStep) {
    const result = await pool.query(`INSERT INTO job_drafts (user_id, org_id, form_data, current_step, status)
     VALUES ($1, $2, $3, $4, 'DRAFT')
     ON CONFLICT (user_id, org_id) WHERE status = 'DRAFT'
     DO UPDATE SET form_data = job_drafts.form_data || EXCLUDED.form_data, current_step = $4, updated_at = now()
     RETURNING *`, [userId, orgId, formData, currentStep]);
    if (result.rowCount === 0) {
        throw new errorHandler_1.AppError("Failed to save draft", 500, "DRAFT_SAVE_FAILED");
    }
    return result.rows[0];
}
async function getDraftById(draftId, userId, orgId, client) {
    const result = await client.query(`SELECT * FROM job_drafts WHERE id = $1 AND user_id = $2 AND org_id = $3 FOR UPDATE`, [draftId, userId, orgId]);
    if (result.rowCount === 0) {
        throw new errorHandler_1.NotFoundError(`Draft ${draftId} not found`);
    }
    return result.rows[0];
}
async function markDraftCompleted(draftId, jobId, client) {
    await client.query(`UPDATE job_drafts SET status = 'COMPLETED', job_id = $1, updated_at = now() WHERE id = $2`, [jobId, draftId]);
}
//# sourceMappingURL=jobDraft.js.map