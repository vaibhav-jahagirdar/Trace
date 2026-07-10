import { PoolClient } from "pg";

export interface ApplicationConceptRow {
  name: string;
  category: string | null;
}

export async function getApplicationConcepts(
  client: PoolClient,
  applicationId: string,
): Promise<ApplicationConceptRow[]> {
  const result = await client.query<ApplicationConceptRow>(
    `
      SELECT
        c.name,
        c.category
      FROM application_concepts ac
      JOIN concepts c ON ac.concept_id = c.id
      WHERE ac.job_application_id = $1
      ORDER BY c.name
    `,
    [applicationId],
  );

  return result.rows;
}