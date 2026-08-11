"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuccessSignalRecord = createSuccessSignalRecord;
const errorHandler_1 = require("../../../../middleware/errorHandler");
async function createSuccessSignalRecord(jobId, successSignals, client) {
    const values = [];
    const placeholders = [];
    successSignals.forEach((signal, index) => {
        const offset = index * 3;
        values.push(jobId, signal.success_signal_id, signal.weight);
        placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3})`);
    });
    const result = await client.query(`INSERT INTO job_success_signals (
                job_id,
                success_signal_id,
                weight)
                VALUES ${placeholders.join(",")}
                RETURNING id`, values);
    if (result.rowCount !== successSignals.length) {
        throw new errorHandler_1.AppError("Failed to create job success signal records", 500, "FAILED_TO_CREATE_JOB_SUCCESS_SIGNALS");
    }
    return result.rows.map((row) => row.id);
}
//# sourceMappingURL=successRecord.js.map