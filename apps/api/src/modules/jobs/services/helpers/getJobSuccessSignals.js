"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobSuccessSignals = getJobSuccessSignals;
async function getJobSuccessSignals(client, jobId) {
    const result = await client.query(`
      SELECT
        ss.code,
        ss.name,
        ss.description,
        jss.weight
      FROM job_success_signals jss
      JOIN success_signals ss ON jss.success_signal_id = ss.id
      WHERE jss.job_id = $1
      ORDER BY jss.weight DESC
    `, [jobId]);
    return result.rows;
}
//# sourceMappingURL=getJobSuccessSignals.js.map