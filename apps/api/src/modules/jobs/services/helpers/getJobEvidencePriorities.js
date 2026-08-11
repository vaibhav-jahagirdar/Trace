"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobEvidencePriorities = getJobEvidencePriorities;
async function getJobEvidencePriorities(client, jobId) {
    const result = await client.query(`
      SELECT
        ec.code,
        ec.name,
        ec.description,
        jevp.weight
      FROM job_evidence_priorities jevp
      JOIN evidence_categories ec ON jevp.evidence_category_id = ec.id
      WHERE jevp.job_id = $1
      ORDER BY jevp.weight DESC
    `, [jobId]);
    return result.rows;
}
//# sourceMappingURL=getJobEvidencePriorities.js.map