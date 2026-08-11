"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobEvaluationPriorities = getJobEvaluationPriorities;
async function getJobEvaluationPriorities(client, jobId) {
    const result = await client.query(`
      SELECT
        ed.code,
        ed.name,
        ed.description,
        jep.weight
      FROM job_evaluation_priorities jep
      JOIN evaluation_dimensions ed ON jep.evaluation_dimension_id = ed.id
      WHERE jep.job_id = $1
      ORDER BY jep.weight DESC
    `, [jobId]);
    return result.rows;
}
//# sourceMappingURL=getJobEvaluationPriorities.js.map