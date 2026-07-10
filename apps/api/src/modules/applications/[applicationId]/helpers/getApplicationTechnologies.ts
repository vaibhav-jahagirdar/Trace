import { PoolClient } from "pg";

export interface ApplicationTechnologyRow {
  name: string;
  category: string | null;
}

export async function getApplicationTechnologies(
  client: PoolClient,
  applicationId: string,
): Promise<ApplicationTechnologyRow[]> {
  const result = await client.query<ApplicationTechnologyRow>(
    `
      SELECT
        t.name,
        t.category
      FROM application_technologies at
      JOIN technologies t ON at.technology_id = t.id
      WHERE at.job_application_id = $1
      ORDER BY t.name
    `,
    [applicationId],
  );

  return result.rows;
}