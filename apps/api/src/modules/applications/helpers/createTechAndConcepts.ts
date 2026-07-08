import { PoolClient } from "pg";

async function insertRelations(
  client: PoolClient,
  applicationId: string,
  names: string[],
  lookupTable: "concepts" | "technologies",
  junctionTable: "application_concepts" | "application_technologies",
  foreignKey: "concept_id" | "technology_id",
) {
  const normalizedNames = [
    ...new Set(
      names
        .map((name) => name.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];

  if (normalizedNames.length === 0) {
    return;
  }

  const { rows } = await client.query(
    `
      SELECT id, name
      FROM ${lookupTable}
      WHERE name = ANY($1::citext[])
    `,
    [normalizedNames],
  );

  if (rows.length === 0) {
    return;
  }

  const idMap = new Map<string, string>();

  for (const row of rows) {
    idMap.set(row.name.toLowerCase(), row.id);
  }

  const values: string[] = [];
  const params: unknown[] = [];

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

  await client.query(
    `
      INSERT INTO ${junctionTable} (
        job_application_id,
        ${foreignKey}
      )
      VALUES ${values.join(",")}
      ON CONFLICT DO NOTHING
    `,
    params,
  );
}

export async function insertApplicationConcepts(
  client: PoolClient,
  applicationId: string,
  concepts: string[],
) {
  await insertRelations(
    client,
    applicationId,
    concepts,
    "concepts",
    "application_concepts",
    "concept_id",
  );
}

export async function insertApplicationTechnologies(
  client: PoolClient,
  applicationId: string,
  technologies: string[],
) {
  await insertRelations(
    client,
    applicationId,
    technologies,
    "technologies",
    "application_technologies",
    "technology_id",
  );
}