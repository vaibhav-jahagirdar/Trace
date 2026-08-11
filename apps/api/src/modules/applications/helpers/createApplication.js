"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApplicationRecord = createApplicationRecord;
const errorHandler_1 = require("../../../middleware/errorHandler");
async function createApplicationRecord(client, applicationId, jobId, applicationData) {
    const { firstName, lastName, email, phone } = applicationData;
    const applicationRecordResult = await client.query(`INSERT INTO job_applications
         (id, job_id, first_name, last_name, email, phone)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`, [applicationId, jobId, firstName, lastName, email, phone]);
    if (applicationRecordResult.rowCount === 0) {
        throw new errorHandler_1.AppError("Failed to create application record");
    }
    return applicationRecordResult.rows[0];
}
//# sourceMappingURL=createApplication.js.map