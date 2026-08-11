"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJobRecord = createJobRecord;
const errorHandler_1 = require("../../../../middleware/errorHandler");
async function createJobRecord(membershipId, orgId, jobData, client) {
    const { role_category_id, title, department, employment_type, work_mode, country, state, city, open_positions, description, remote_scope } = jobData;
    const result = await client.query(`
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
      status,
      remote_scope

    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'DRAFT',$13
    )
    RETURNING id, role_category_id
    `, [
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
        remote_scope
    ]);
    const jobId = result.rows[0]?.id;
    const roleCategoryId = result.rows[0]?.role_category_id;
    if (!jobId || !roleCategoryId) {
        throw new errorHandler_1.AppError("Failed to create job", 500, "JOB_CREATION_FAILED");
    }
    return { jobId, roleCategoryId };
}
//# sourceMappingURL=createJobRecords.js.map