"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertApplicationConcepts = insertApplicationConcepts;
exports.insertApplicationTechnologies = insertApplicationTechnologies;
async function insertRelations(client, applicationId, names, lookupTable, junctionTable, foreignKey) {
    const normalizedNames = [
        ...new Set(names
            .map((name) => name.trim().toLowerCase())
            .filter(Boolean)),
    ];
    if (normalizedNames.length === 0) {
        return;
    }
    const { rows } = await client.query(`
      SELECT id, name
      FROM ${lookupTable}
      WHERE name = ANY($1::citext[])
    `, [normalizedNames]);
    if (rows.length === 0) {
        return;
    }
    const idMap = new Map();
    for (const row of rows) {
        idMap.set(row.name.toLowerCase(), row.id);
    }
    const values = [];
    const params = [];
    let parameterIndex = 1;
    for (const name of normalizedNames) {
        const id = idMap.get(name);
        if (!id) {
            continue;
        }
        values.push(`($${parameterIndex++}, $${parameterIndex++})`);
        params.push(applicationId, id);
    }
    if (values.length === 0) {
        return;
    }
    await client.query(`
      INSERT INTO ${junctionTable} (
        job_application_id,
        ${foreignKey}
      )
      VALUES ${values.join(",")}
      ON CONFLICT DO NOTHING
    `, params);
}
async function insertApplicationConcepts(client, applicationId, concepts) {
    await insertRelations(client, applicationId, concepts, "concepts", "application_concepts", "concept_id");
}
async function insertApplicationTechnologies(client, applicationId, technologies) {
    await insertRelations(client, applicationId, technologies, "technologies", "application_technologies", "technology_id");
}
//# sourceMappingURL=createTechAndConcepts.js.map