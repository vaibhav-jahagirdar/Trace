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
        ac.concept AS name,
        NULL::text AS category
      FROM application_concepts ac
      WHERE ac.job_application_id = $1
      ORDER BY ac.concept
    `,
    [applicationId],
  );

  return result.rows;
}
