"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobRequirements = getJobRequirements;
async function getJobRequirements(client, jobId) {
    const result = await client.query(`
      SELECT
        jr.requirement_type,
        jr.priority_type,
        jr.weight,
        COALESCE(t.name, c.name) AS name,
        COALESCE(t.category, c.category) AS category
      FROM job_requirements jr
      LEFT JOIN technologies t ON jr.technology_id = t.id
      LEFT JOIN concepts c ON jr.concept_id = c.id
      WHERE jr.job_id = $1
      ORDER BY jr.priority_type, jr.weight DESC
    `, [jobId]);
    return result.rows;
}
//# sourceMappingURL=getJobRequirement.js.map