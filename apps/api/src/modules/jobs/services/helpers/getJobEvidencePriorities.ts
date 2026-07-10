import { PoolClient } from "pg";

export interface JobEvidencePriorityRow {
  code: string;
  name: string;
  description: string | null;
  weight: number;
}

export async function getJobEvidencePriorities(
  client: PoolClient,
  jobId: string,
): Promise<JobEvidencePriorityRow[]> {
  const result = await client.query<JobEvidencePriorityRow>(
    `
      SELECT
        ec.code,
        ec.name,
        ec.description,
        jevp.weight
      FROM job_evidence_priorities jevp
      JOIN evidence_categories ec ON jevp.evidence_category_id = ec.id
      WHERE jevp.job_id = $1
      ORDER BY jevp.weight DESC
    `,
    [jobId],
  );

  return result.rows;
}