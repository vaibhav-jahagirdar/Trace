"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApplicationConcepts = getApplicationConcepts;
async function getApplicationConcepts(client, applicationId) {
    const result = await client.query(`
      SELECT
        c.name,
        c.category
      FROM application_concepts ac
      JOIN concepts c ON ac.concept_id = c.id
      WHERE ac.job_application_id = $1
      ORDER BY c.name
    `, [applicationId]);
    return result.rows;
}
//# sourceMappingURL=getApplicationConcepts.js.map