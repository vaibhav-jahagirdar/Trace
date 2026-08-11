"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApplicationTechnologies = getApplicationTechnologies;
async function getApplicationTechnologies(client, applicationId) {
    const result = await client.query(`
      SELECT
        t.name,
        t.category
      FROM application_technologies at
      JOIN technologies t ON at.technology_id = t.id
      WHERE at.job_application_id = $1
      ORDER BY t.name
    `, [applicationId]);
    return result.rows;
}
//# sourceMappingURL=getApplicationTechnologies.js.map